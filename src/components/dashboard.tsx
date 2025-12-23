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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="mb-2 text-2xl font-bold text-white sm:mb-3 sm:text-4xl">
            Pipeline Dashboard
          </h1>
          <p className="text-sm text-gray-400 sm:text-lg">
            Manage and monitor your AI news aggregation pipeline
          </p>
        </div>

        {/* Pipeline Controls */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                Pipeline Control
              </h2>
              <p className="mt-1 text-sm text-gray-400 sm:mt-2 sm:text-base">
                Trigger the pipeline to fetch latest AI news from all sources
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              {currentJobDisplay && (
                <button
                  type="button"
                  onClick={() => cancelPipeline(currentJobDisplay.id)}
                  disabled={isCancelling}
                  className="w-full rounded-lg border border-red-500/20 bg-red-500/10 px-6 py-3 font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isCancelling ? "Cancelling..." : "Stop Pipeline"}
                </button>
              )}
              <button
                type="button"
                onClick={() => triggerPipeline()}
                disabled={isPipelineTriggering || !!currentJobDisplay}
                className="w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Current Pipeline Status
              </h2>
              <span
                className={`inline-flex w-fit items-center rounded-lg border px-4 py-2 text-sm font-medium ${getStatusColor(currentJobDisplay.status)}`}
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <p className="text-xs text-gray-400 sm:text-sm">Processed</p>
                <p className="mt-1 text-xl font-bold text-white sm:mt-2 sm:text-3xl">
                  {currentJobDisplay.processedCompanies}/
                  {currentJobDisplay.totalCompanies}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-6">
                <p className="text-xs text-emerald-400 sm:text-sm">Successful</p>
                <p className="mt-1 text-xl font-bold text-emerald-300 sm:mt-2 sm:text-3xl">
                  {currentJobDisplay.successfulCompanies}
                </p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 sm:p-6">
                <p className="text-xs text-blue-400 sm:text-sm">Articles Found</p>
                <p className="mt-1 text-xl font-bold text-blue-300 sm:mt-2 sm:text-3xl">
                  {currentJobDisplay.totalArticlesFound}
                </p>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 sm:p-6">
                <p className="text-xs text-purple-400 sm:text-sm">Articles Saved</p>
                <p className="mt-1 text-xl font-bold text-purple-300 sm:mt-2 sm:text-3xl">
                  {currentJobDisplay.totalArticlesSaved}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
          <h2 className="mb-4 text-lg font-semibold text-white sm:mb-6 sm:text-xl">
            Recent Pipeline Jobs
          </h2>
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-xs text-gray-400 sm:text-sm">
                    <th className="whitespace-nowrap px-4 pb-3 font-medium sm:px-0 sm:pb-4">Status</th>
                    <th className="whitespace-nowrap px-4 pb-3 font-medium sm:px-0 sm:pb-4">Progress</th>
                    <th className="whitespace-nowrap px-4 pb-3 font-medium sm:px-0 sm:pb-4">Articles</th>
                    <th className="whitespace-nowrap px-4 pb-3 font-medium sm:px-0 sm:pb-4">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentJobs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400 sm:py-12">
                        No pipeline jobs yet. Trigger the pipeline to get started.
                      </td>
                    </tr>
                  ) : (
                    recentJobs.map((job) => (
                      <tr key={job.id} className="text-xs sm:text-sm">
                        <td className="whitespace-nowrap px-4 py-3 sm:px-0 sm:py-4">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium sm:px-3 ${getStatusColor(job.status)}`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-white sm:px-0 sm:py-4">
                          {job.processedCompanies}/{job.totalCompanies}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-white sm:px-0 sm:py-4">
                          {job.totalArticlesSaved}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-400 sm:px-0 sm:py-4">
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
    </div>
  );
}
