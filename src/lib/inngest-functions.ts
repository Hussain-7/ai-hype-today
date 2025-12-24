import { PipelineService } from "@/services/pipeline/pipeline.service";
import { inngest } from "./inngest";

// Define the pipeline function
export const processPipeline = inngest.createFunction(
  {
    id: "process-pipeline",
    name: "Process Article Aggregation Pipeline",
  },
  { event: "pipeline/trigger" },
  async ({ event, step }) => {
    const { jobId, companySlugs } = event.data;

    console.log(
      `Starting pipeline processing for job ${jobId}${companySlugs ? ` (${companySlugs.length} selected companies)` : " (all companies)"}`,
    );

    // Run the pipeline in a step for better observability
    await step.run("run-pipeline", async () => {
      const pipelineService = new PipelineService();
      await pipelineService.runPipeline(jobId, companySlugs || undefined);
      return { jobId, status: "completed" };
    });

    return { jobId, message: "Pipeline completed successfully" };
  },
);

// Scheduled pipeline trigger at 12:00 AM and 12:00 PM daily
export const dailyPipelineTrigger = inngest.createFunction(
  {
    id: "daily-pipeline-trigger",
    name: "Daily Pipeline Trigger (12:00 AM & 12:00 PM)",
  },
  { cron: "0 0,12 * * *" }, // Every day at 12:00 AM and 12:00 PM
  async ({ step }) => {
    console.log("Daily scheduled pipeline trigger starting...");

    // Create and trigger a pipeline job
    await step.run("trigger-daily-pipeline", async () => {
      const { prisma } = await import("@/lib/prisma");

      // Check if a pipeline is already running
      const runningJob = await prisma.pipelineJob.findFirst({
        where: {
          status: { in: ["PENDING", "RUNNING"] },
        },
      });

      if (runningJob) {
        console.log("Pipeline already running, skipping scheduled trigger");
        return { skipped: true, reason: "Pipeline already running" };
      }

      // Get total companies count
      const totalCompanies = await prisma.company.count();

      // Create job record
      const job = await prisma.pipelineJob.create({
        data: {
          status: "PENDING",
          totalCompanies,
          triggeredBy: "cron:daily",
        },
      });

      // Trigger the pipeline
      await inngest.send({
        name: "pipeline/trigger",
        data: {
          jobId: job.id,
          companySlugs: null, // Process all companies
        },
      });

      console.log(`Daily pipeline triggered successfully. Job ID: ${job.id}`);
      return { jobId: job.id, totalCompanies };
    });

    return { message: "Daily pipeline triggered successfully" };
  },
);

// Export all functions
// Note: dailyPipelineTrigger is disabled - uncomment to enable cron schedule
export const inngestFunctions = [
  processPipeline,
  // dailyPipelineTrigger, // Disabled - uncomment to enable daily 12AM & 12PM triggers
];
