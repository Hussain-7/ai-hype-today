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

// Export all functions
export const inngestFunctions = [processPipeline];
