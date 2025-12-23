import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await prisma.pipelineJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Calculate progress percentage
    const progressPercentage =
      job.totalCompanies > 0
        ? Math.round((job.processedCompanies / job.totalCompanies) * 100)
        : 0;

    // Calculate estimated time remaining (if running)
    let estimatedTimeRemaining: string | null = null;
    if (job.status === 'RUNNING' && job.startedAt) {
      const elapsed = Date.now() - job.startedAt.getTime();
      const avgTimePerCompany = elapsed / job.processedCompanies;
      const remainingCompanies = job.totalCompanies - job.processedCompanies;
      const remainingMs = avgTimePerCompany * remainingCompanies;
      estimatedTimeRemaining = `${Math.round(remainingMs / 1000 / 60)} minutes`;
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: {
        percentage: progressPercentage,
        processedCompanies: job.processedCompanies,
        totalCompanies: job.totalCompanies,
        successfulCompanies: job.successfulCompanies,
        failedCompanies: job.failedCompanies,
      },
      articles: {
        found: job.totalArticlesFound,
        saved: job.totalArticlesSaved,
        duplicatesSkipped: job.duplicatesSkipped,
      },
      timing: {
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        estimatedTimeRemaining,
      },
      errors: job.errors,
    });
  } catch (error) {
    console.error('Failed to fetch job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status', details: String(error) },
      { status: 500 }
    );
  }
}
