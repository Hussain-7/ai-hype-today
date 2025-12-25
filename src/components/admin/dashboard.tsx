"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  type JobStatus,
  usePipelineDashboard,
} from "@/hooks/usePipelineDashboard";
import { ArticlesManagement } from "./articles-management";
import { CompaniesManagement } from "./companies-management";
import { CompanySelectorModal } from "./company-selector-modal";

type Tab = "pipeline" | "articles" | "companies";

interface Company {
  id: string;
  name: string;
  slug: string;
  category: string[];
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("pipeline");
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

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

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "pipeline", label: "Pipeline" },
    { id: "articles", label: "Articles" },
    { id: "companies", label: "Companies" },
  ];

  // Fetch companies for selection
  useEffect(() => {
    fetch("/api/companies?limit=100")
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies || []))
      .catch((err) => console.error("Failed to fetch companies:", err));
  }, []);

  const handleTriggerSelected = (selectedSlugs: string[]) => {
    setShowCompanySelector(false);
    triggerPipeline(selectedSlugs);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="mb-2 text-2xl font-bold text-white sm:mb-3 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400 sm:text-lg">
            Manage your AI news aggregation platform
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-white/10">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "articles" && <ArticlesManagement />}
        {activeTab === "companies" && <CompaniesManagement />}
        {activeTab === "pipeline" && <PipelineTab />}
      </div>
    </div>
  );

  function PipelineTab() {
    return (
      <div>
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
                onClick={() => setShowCompanySelector(true)}
                disabled={isPipelineTriggering || !!currentJobDisplay}
                className="w-full rounded-lg border border-blue-500/20 bg-blue-500/10 px-6 py-3 font-semibold text-blue-400 transition-all hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Trigger Selected
              </button>
              <button
                type="button"
                onClick={() => triggerPipeline(undefined)}
                disabled={isPipelineTriggering || !!currentJobDisplay}
                className="w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isPipelineTriggering
                  ? "Triggering..."
                  : currentJobDisplay
                    ? "Pipeline Running..."
                    : "Trigger All"}
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
                <p className="text-xs text-emerald-400 sm:text-sm">
                  Successful
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-300 sm:mt-2 sm:text-3xl">
                  {currentJobDisplay.successfulCompanies}
                </p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 sm:p-6">
                <p className="text-xs text-blue-400 sm:text-sm">
                  Articles Found
                </p>
                <p className="mt-1 text-xl font-bold text-blue-300 sm:mt-2 sm:text-3xl">
                  {currentJobDisplay.totalArticlesFound}
                </p>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 sm:p-6">
                <p className="text-xs text-purple-400 sm:text-sm">
                  Articles Saved
                </p>
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
                    <th className="whitespace-nowrap px-4 pb-3 font-medium sm:px-0 sm:pb-4">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-4 pb-3 font-medium sm:px-0 sm:pb-4">
                      Progress
                    </th>
                    <th className="whitespace-nowrap px-4 pb-3 font-medium sm:px-0 sm:pb-4">
                      Articles
                    </th>
                    <th className="whitespace-nowrap px-4 pb-3 font-medium sm:px-0 sm:pb-4">
                      Started
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentJobs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-gray-400 sm:py-12"
                      >
                        No pipeline jobs yet. Trigger the pipeline to get
                        started.
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

        {/* Company Selector Modal */}
        <CompanySelectorModal
          companies={companies}
          isOpen={showCompanySelector}
          onConfirm={handleTriggerSelected}
          onCancel={() => setShowCompanySelector(false)}
        />
      </div>
    );
  }
}
