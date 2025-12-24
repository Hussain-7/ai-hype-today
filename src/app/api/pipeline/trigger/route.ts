import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";

const TriggerSchema = z.object({
  triggeredBy: z.string().optional(),
  companySlugs: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { triggeredBy, companySlugs } = TriggerSchema.parse(body);

    // Check if a pipeline is already running
    const runningJob = await prisma.pipelineJob.findFirst({
      where: {
        status: { in: ["PENDING", "RUNNING"] },
      },
    });

    if (runningJob) {
      return NextResponse.json(
        {
          error: "A pipeline job is already running",
          jobId: runningJob.id,
        },
        { status: 409 },
      );
    }

    // Get total companies count (filtered if specific companies selected)
    const totalCompanies = companySlugs
      ? await prisma.company.count({
          where: { slug: { in: companySlugs } },
        })
      : await prisma.company.count();

    if (totalCompanies === 0) {
      return NextResponse.json(
        { error: "No companies found matching the selection" },
        { status: 400 },
      );
    }

    // Create job record
    const job = await prisma.pipelineJob.create({
      data: {
        status: "PENDING",
        totalCompanies,
        triggeredBy: triggeredBy || "api",
      },
    });

    // Trigger Inngest function
    await inngest.send({
      name: "pipeline/trigger",
      data: {
        jobId: job.id,
        companySlugs: companySlugs || null,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: "Pipeline job queued successfully",
      totalCompanies,
    });
  } catch (error) {
    console.error("Failed to trigger pipeline:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to trigger pipeline", details: String(error) },
      { status: 500 },
    );
  }
}
