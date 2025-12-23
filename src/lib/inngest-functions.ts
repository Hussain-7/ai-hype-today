import { inngest } from './inngest';
import { PipelineService } from '@/services/pipeline/pipeline.service';

// Define the pipeline function
export const processPipeline = inngest.createFunction(
  {
    id: 'process-pipeline',
    name: 'Process Article Aggregation Pipeline',
  },
  { event: 'pipeline/trigger' },
  async ({ event, step }) => {
    const { jobId } = event.data;

    console.log(`Starting pipeline processing for job ${jobId}`);

    // Run the pipeline in a step for better observability
    await step.run('run-pipeline', async () => {
      const pipelineService = new PipelineService();
      await pipelineService.runPipeline(jobId);
      return { jobId, status: 'completed' };
    });

    return { jobId, message: 'Pipeline completed successfully' };
  }
);

// Export all functions
export const inngestFunctions = [processPipeline];
