"use client";

import { format } from "date-fns";
import {
  type JobStatus,
  usePipelineDashboard,
} from "@/hooks/usePipelineDashboard";

export function Dashboard() {
  const {
    recentJobs,
    currentJobDisplay,
    triggerPipeline,
    cancelPipeline,
    isPipelineTriggering,
    isCancelling,
    error,
  } = usePipelineDashboard();

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "RUNNING":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "FAILED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "CANCELLED":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-3 text-4xl font-bold text-white">
            Pipeline Dashboard
          </h1>
          <p className="text-lg text-gray-400">
            Manage and monitor your AI news aggregation pipeline
          </p>
        </div>

        {/* Pipeline Controls */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Pipeline Control
              </h2>
              <p className="mt-2 text-gray-400">
                Trigger the pipeline to fetch latest AI news from all sources
              </p>
            </div>
            <div className="flex gap-3">
              {currentJobDisplay && (
                <button
                  type="button"
                  onClick={() => cancelPipeline(currentJobDisplay.id)}
                  disabled={isCancelling}
                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-6 py-3 font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? "Cancelling..." : "Stop Pipeline"}
                </button>
              )}
              <button
                type="button"
                onClick={() => triggerPipeline()}
                disabled={isPipelineTriggering || !!currentJobDisplay}
                className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPipelineTriggering
                  ? "Triggering..."
                  : currentJobDisplay
                    ? "Pipeline Running..."
                    : "Trigger Pipeline"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Current Job Status */}
        {currentJobDisplay && (
          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Current Pipeline Status
              </h2>
              <span
                className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium ${getStatusColor(currentJobDisplay.status)}`}
              >
                {currentJobDisplay.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium text-white">
                  {Math.round(
                    (currentJobDisplay.processedCompanies /
                      currentJobDisplay.totalCompanies) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{
                    width: `${(currentJobDisplay.processedCompanies / currentJobDisplay.totalCompanies) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm text-gray-400">Processed</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {currentJobDisplay.processedCompanies}/
                  {currentJobDisplay.totalCompanies}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <p className="text-sm text-emerald-400">Successful</p>
                <p className="mt-2 text-3xl font-bold text-emerald-300">
                  {currentJobDisplay.successfulCompanies}
                </p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-6">
                <p className="text-sm text-blue-400">Articles Found</p>
                <p className="mt-2 text-3xl font-bold text-blue-300">
                  {currentJobDisplay.totalArticlesFound}
                </p>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-6">
                <p className="text-sm text-purple-400">Articles Saved</p>
                <p className="mt-2 text-3xl font-bold text-purple-300">
                  {currentJobDisplay.totalArticlesSaved}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Recent Pipeline Jobs
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-sm text-gray-400">
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Progress</th>
                  <th className="pb-4 font-medium">Articles</th>
                  <th className="pb-4 font-medium">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      No pipeline jobs yet. Trigger the pipeline to get started.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr key={job.id} className="text-sm">
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium ${getStatusColor(job.status)}`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-4 text-white">
                        {job.processedCompanies}/{job.totalCompanies}
                      </td>
                      <td className="py-4 text-white">
                        {job.totalArticlesSaved}
                      </td>
                      <td className="py-4 text-gray-400">
                        {job.startedAt
                          ? format(new Date(job.startedAt), "MMM d, h:mm a")
                          : "Not started"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
