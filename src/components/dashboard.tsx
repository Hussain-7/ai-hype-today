'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface PipelineJob {
  id: string;
  status: JobStatus;
  totalCompanies: number;
  processedCompanies: number;
  successfulCompanies: number;
  failedCompanies: number;
  totalArticlesFound: number;
  totalArticlesSaved: number;
  duplicatesSkipped: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface Article {
  id: string;
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  company: {
    name: string;
    slug: string;
    dominanceBucket: string;
  };
}

export function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [currentJob, setCurrentJob] = useState<PipelineJob | null>(null);
  const [recentJobs, setRecentJobs] = useState<PipelineJob[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch recent jobs
  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs?limit=5');
      const data = await res.json();
      setRecentJobs(data.jobs);

      // Check for running job
      const runningJob = data.jobs.find((job: PipelineJob) =>
        job.status === 'PENDING' || job.status === 'RUNNING'
      );

      if (runningJob) {
        setCurrentJob(runningJob);
        startPolling(runningJob.id);
      } else {
        setCurrentJob(null);
        stopPolling();
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  // Fetch recent articles
  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles?limit=20');
      const data = await res.json();
      setRecentArticles(data.articles);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    }
  };

  // Trigger pipeline
  const triggerPipeline = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pipeline/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: 'dashboard' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to trigger pipeline');
        return;
      }

      // Fetch updated jobs
      await fetchJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Poll job status
  const pollJobStatus = async (jobId: string) => {
    try {
      const res = await fetch(`/api/pipeline/status/${jobId}`);
      const data = await res.json();

      setCurrentJob({
        id: data.jobId,
        status: data.status,
        totalCompanies: data.progress.totalCompanies,
        processedCompanies: data.progress.processedCompanies,
        successfulCompanies: data.progress.successfulCompanies,
        failedCompanies: data.progress.failedCompanies,
        totalArticlesFound: data.articles.found,
        totalArticlesSaved: data.articles.saved,
        duplicatesSkipped: data.articles.duplicatesSkipped,
        startedAt: data.timing.startedAt,
        completedAt: data.timing.completedAt,
        createdAt: '',
      });

      // Stop polling if job is complete
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        stopPolling();
        await fetchJobs();
        await fetchArticles();
      }
    } catch (err) {
      console.error('Failed to poll job status:', err);
    }
  };

  const startPolling = (jobId: string) => {
    stopPolling(); // Clear any existing interval
    const interval = setInterval(() => pollJobStatus(jobId), 2000);
    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobs();
    fetchArticles();

    return () => stopPolling();
  }, []);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'RUNNING': return 'text-blue-600 bg-blue-50';
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      case 'CANCELLED': return 'text-gray-600 bg-gray-50';
    }
  };

  const getDominanceColor = (bucket: string) => {
    switch (bucket) {
      case 'dominant': return 'text-purple-700 bg-purple-100';
      case 'major': return 'text-blue-700 bg-blue-100';
      case 'tooling': return 'text-green-700 bg-green-100';
      case 'ecosystem': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            AI Hype Today
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Automated AI News Aggregation Pipeline
          </p>
        </div>

        {/* Pipeline Controls */}
        <div className="mb-8 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Pipeline Control
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Trigger the pipeline to fetch latest AI news from all sources
              </p>
            </div>
            <button
              onClick={triggerPipeline}
              disabled={loading || !!currentJob}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Triggering...' : currentJob ? 'Pipeline Running...' : 'Trigger Pipeline'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Current Job Status */}
        {currentJob && (
          <div className="mb-8 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Pipeline Status
              </h2>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(currentJob.status)}`}>
                {currentJob.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progress</span>
                <span>{Math.round((currentJob.processedCompanies / currentJob.totalCompanies) * 100)}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(currentJob.processedCompanies / currentJob.totalCompanies) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Processed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentJob.processedCompanies}/{currentJob.totalCompanies}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                <p className="text-sm text-green-600 dark:text-green-400">Successful</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {currentJob.successfulCompanies}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">Articles Found</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {currentJob.totalArticlesFound}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
                <p className="text-sm text-purple-600 dark:text-purple-400">Articles Saved</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {currentJob.totalArticlesSaved}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        <div className="mb-8 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Recent Pipeline Jobs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr className="text-left text-sm text-gray-600 dark:text-gray-400">
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Progress</th>
                  <th className="pb-3 font-medium">Articles</th>
                  <th className="pb-3 font-medium">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="text-sm">
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-900 dark:text-white">
                      {job.processedCompanies}/{job.totalCompanies}
                    </td>
                    <td className="py-3 text-gray-900 dark:text-white">
                      {job.totalArticlesSaved}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">
                      {job.startedAt ? format(new Date(job.startedAt), 'MMM d, h:mm a') : 'Not started'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Latest AI News ({recentArticles.length})
          </h2>
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <div
                key={article.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {article.title}
                    </a>
                  </h3>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getDominanceColor(article.company.dominanceBucket)}`}>
                    {article.company.name}
                  </span>
                </div>
                {article.description && (
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {format(new Date(article.publishedAt), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
            {recentArticles.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No articles yet. Trigger the pipeline to fetch latest news.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
