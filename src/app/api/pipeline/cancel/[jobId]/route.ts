import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;

    // Find the job
    const job = await prisma.pipelineJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Only cancel if job is pending or running
    if (job.status !== "PENDING" && job.status !== "RUNNING") {
      return NextResponse.json(
        { error: "Job is not running" },
        { status: 400 },
      );
    }

    // Update job status to CANCELLED
    await prisma.pipelineJob.update({
      where: { id: jobId },
      data: {
        status: "CANCELLED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pipeline job cancelled successfully",
    });
  } catch (error) {
    console.error("Failed to cancel pipeline job:", error);
    return NextResponse.json(
      { error: "Failed to cancel job", details: String(error) },
      { status: 500 },
    );
  }
}
