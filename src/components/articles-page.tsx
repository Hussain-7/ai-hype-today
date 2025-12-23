"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  ExternalLink,
  FileText,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { type DateRangeType, useArticles } from "@/hooks/useArticles";

export function ArticlesPage() {
  const {
    articles,
    allArticles,
    companies,
    dominanceBuckets,
    searchQuery,
    setSearchQuery,
    selectedCompanies,
    setSelectedCompanies,
    selectedBuckets,
    setSelectedBuckets,
    dateRangeType,
    setDateRangeType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
  } = useArticles();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatesToday = allArticles.filter((article) => {
      const articleDate = new Date(article.publishedAt);
      articleDate.setHours(0, 0, 0, 0);
      return articleDate.getTime() === today.getTime();
    }).length;

    const activeProviders = new Set(allArticles.map((a) => a.company.slug))
      .size;

    const lastUpdate =
      allArticles.length > 0
        ? formatDistanceToNow(
            new Date(
              Math.max(
                ...allArticles.map((a) => new Date(a.publishedAt).getTime()),
              ),
            ),
            { addSuffix: true },
          )
        : "Never";

    return {
      updatesToday,
      totalArticles: allArticles.length,
      activeProviders,
      lastUpdate,
    };
  }, [allArticles]);

  const toggleCompany = (slug: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const toggleBucket = (bucket: string) => {
    setSelectedBuckets((prev) =>
      prev.includes(bucket)
        ? prev.filter((b) => b !== bucket)
        : [...prev, bucket],
    );
  };

  const clearFilters = () => {
    setSelectedCompanies([]);
    setSelectedBuckets([]);
    setSearchQuery("");
    setDateRangeType("all");
    setCustomStartDate(null);
    setCustomEndDate(null);
  };

  const getDateRangeLabel = (type: DateRangeType) => {
    switch (type) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "custom":
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  const getDominanceColor = (bucket: string) => {
    switch (bucket) {
      case "dominant":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "major":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "tooling":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "ecosystem":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getBucketLabel = (bucket: string) => {
    return bucket.charAt(0).toUpperCase() + bucket.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Page Header */}
      <div className="border-b border-white/5 bg-[#0A0A0A]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                AI News
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400">
                Latest news and updates from {stats.activeProviders} AI
                companies
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm backdrop-blur-sm">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-400 hidden sm:inline">
                  Last updated {stats.lastUpdate}
                </span>
                <span className="text-gray-400 sm:hidden">Updated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Clear Filters Button - Always present to prevent layout shift */}
              <button
                type="button"
                onClick={clearFilters}
                disabled={
                  !(
                    selectedCompanies.length > 0 ||
                    selectedBuckets.length > 0 ||
                    searchQuery ||
                    dateRangeType !== "all"
                  )
                }
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selectedCompanies.length > 0 ||
                  selectedBuckets.length > 0 ||
                  searchQuery ||
                  dateRangeType !== "all"
                    ? "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white opacity-100"
                    : "border border-transparent bg-transparent text-transparent cursor-default pointer-events-none opacity-0"
                }`}
              >
                Clear all filters
              </button>

              {/* Date Range Filter */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-start">
                  <Calendar className="inline h-3 w-3 mr-2" />
                  <span>Date Range</span>
                </h4>
                <div className="space-y-2">
                  {(["all", "today", "week", "month"] as DateRangeType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDateRangeType(type)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          dateRangeType === type
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        {getDateRangeLabel(type)}
                      </button>
                    ),
                  )}

                  {/* Custom Date Range */}
                  <div className="pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setDateRangeType("custom")}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        dateRangeType === "custom"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      {getDateRangeLabel("custom")}
                    </button>

                    {dateRangeType === "custom" && (
                      <div className="mt-3 space-y-2">
                        <label className="block">
                          <span className="text-xs text-gray-400">
                            Start Date
                          </span>
                          <input
                            type="date"
                            value={
                              customStartDate
                                ? format(customStartDate, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              setCustomStartDate(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : null,
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs text-gray-400">
                            End Date
                          </span>
                          <input
                            type="date"
                            value={
                              customEndDate
                                ? format(customEndDate, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              setCustomEndDate(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : null,
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Category
                </h4>
                <div className="space-y-1">
                  {dominanceBuckets.map((bucket) => (
                    <label
                      key={bucket}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBuckets.includes(bucket)}
                        onChange={() => toggleBucket(bucket)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-300">
                        {getBucketLabel(bucket)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Company Filter */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Companies
                </h4>
                <div className="scrollbar-hidden max-h-96 space-y-1 overflow-y-auto pr-2">
                  {companies.map((company) => (
                    <label
                      key={company.slug}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.slug)}
                        onChange={() => toggleCompany(company.slug)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-300">
                        {company.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Articles Grid */}
          <main className="w-full">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                  <Search className="h-5 w-5 mb-0.5 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search updates across all providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-6 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing{" "}
                <span className="font-medium text-white">
                  {articles.length}
                </span>{" "}
                updates
              </p>
            </div>

            {articles.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
                <FileText className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-4 text-lg font-medium text-white">
                  No updates found
                </h3>
                <p className="mt-2 text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium ${getDominanceColor(article.company.dominanceBucket)}`}
                          >
                            {article.company.name}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">
                            {format(new Date(article.publishedAt), "MMM d")}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h3>

                        {/* Description */}
                        {article.description && (
                          <p className="text-gray-400 line-clamp-2">
                            {article.description}
                          </p>
                        )}
                      </div>

                      {/* External Link Icon */}
                      <ExternalLink className="h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0A0A0A] border-l border-white/10 overflow-y-auto lg:hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-sm px-4 py-4">
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Clear Filters Button */}
              <button
                type="button"
                onClick={clearFilters}
                disabled={
                  !(
                    selectedCompanies.length > 0 ||
                    selectedBuckets.length > 0 ||
                    searchQuery ||
                    dateRangeType !== "all"
                  )
                }
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selectedCompanies.length > 0 ||
                  selectedBuckets.length > 0 ||
                  searchQuery ||
                  dateRangeType !== "all"
                    ? "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white opacity-100"
                    : "border border-transparent bg-transparent text-transparent cursor-default pointer-events-none opacity-0"
                }`}
              >
                Clear all filters
              </button>

              {/* Date Range Filter */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-start">
                  <Calendar className="inline h-3 w-3 mr-2" />
                  <span>Date Range</span>
                </h4>
                <div className="space-y-2">
                  {(["all", "today", "week", "month"] as DateRangeType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDateRangeType(type)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          dateRangeType === type
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        {getDateRangeLabel(type)}
                      </button>
                    ),
                  )}

                  <div className="pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setDateRangeType("custom")}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        dateRangeType === "custom"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      {getDateRangeLabel("custom")}
                    </button>

                    {dateRangeType === "custom" && (
                      <div className="mt-3 space-y-2">
                        <label className="block">
                          <span className="text-xs text-gray-400">
                            Start Date
                          </span>
                          <input
                            type="date"
                            value={
                              customStartDate
                                ? format(customStartDate, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              setCustomStartDate(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : null,
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs text-gray-400">
                            End Date
                          </span>
                          <input
                            type="date"
                            value={
                              customEndDate
                                ? format(customEndDate, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              setCustomEndDate(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : null,
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Category
                </h4>
                <div className="space-y-1">
                  {dominanceBuckets.map((bucket) => (
                    <label
                      key={bucket}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBuckets.includes(bucket)}
                        onChange={() => toggleBucket(bucket)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-300">
                        {getBucketLabel(bucket)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Company Filter */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Companies
                </h4>
                <div className="scrollbar-hidden max-h-96 space-y-1 overflow-y-auto pr-2">
                  {companies.map((company) => (
                    <label
                      key={company.slug}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.slug)}
                        onChange={() => toggleCompany(company.slug)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-300">
                        {company.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
