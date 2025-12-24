"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Calendar, ExternalLink, FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { type DateRangeType, useArticles } from "@/hooks/useArticles";
import type { Article } from "@/lib/get-articles";

interface ArticlesPageProps {
  allArticles: Article[];
}

export function ArticlesPage({
  allArticles: initialArticles,
}: ArticlesPageProps) {
  const {
    articles,
    allArticles,
    companies,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCompanies,
    setSelectedCompanies,
    selectedCategories,
    setSelectedCategories,
    dateRangeType,
    setDateRangeType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
  } = useArticles(initialArticles);

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const articlesToday = allArticles.filter((article) => {
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
      articlesToday,
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

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const clearFilters = () => {
    setSelectedCompanies([]);
    setSelectedCategories([]);
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

  const getCategoryColor = (category: string) => {
    // Hash the category string to get a consistent color
    const colors = [
      "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
      "bg-pink-500/10 text-pink-400 border-pink-500/20",
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      "bg-rose-500/10 text-rose-400 border-rose-500/20",
      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    ];
    const hash = category
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatCategoryLabel = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Page Header */}
      <div className="">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                AI News
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400">
                Latest news and articles from {stats.activeProviders} AI
                companies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm backdrop-blur-sm">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-400 hidden sm:inline">
                  Last updated {stats.lastUpdate}
                </span>
                <span className="text-gray-400 sm:hidden">Updated</span>
              </div>
            </div>
          </div>
          <main className="w-full">
            {/* Sticky Search Bar & Filters */}
            <div className="sticky top-16 z-30 -mx-4 bg-[#0A0A0A]/95 px-4 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              {/* Search Bar & Filters */}
              <div className="py-4">
                <div className="flex flex-wrap gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-full sm:min-w-[300px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
                      <Search className="h-5 w-5 mb-0.5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search articles across all providers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-6 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setCategoryDropdownOpen(!categoryDropdownOpen)
                      }
                      className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
                    >
                      <span>Category</span>
                      {selectedCategories.length > 0 && (
                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {selectedCategories.length}
                        </span>
                      )}
                    </button>

                    {categoryDropdownOpen && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-40"
                          onClick={() => setCategoryDropdownOpen(false)}
                          aria-label="Close dropdown"
                          tabIndex={-1}
                        />
                        <div className="absolute left-0 sm:right-0 sm:left-auto top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#0A0A0A] p-3 shadow-xl">
                          <div className="scrollbar-hidden max-h-96 space-y-1 overflow-y-auto">
                            {categories.map((category) => (
                              <label
                                key={category}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(
                                    category,
                                  )}
                                  onChange={() => toggleCategory(category)}
                                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <span className="text-sm text-gray-300">
                                  {formatCategoryLabel(category)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Company Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setCompanyDropdownOpen(!companyDropdownOpen)
                      }
                      className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
                    >
                      <span>Companies</span>
                      {selectedCompanies.length > 0 && (
                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                          {selectedCompanies.length}
                        </span>
                      )}
                    </button>

                    {companyDropdownOpen && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-40"
                          onClick={() => setCompanyDropdownOpen(false)}
                          aria-label="Close dropdown"
                          tabIndex={-1}
                        />
                        <div className="absolute left-0 sm:right-0 sm:left-auto top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#0A0A0A] p-3 shadow-xl">
                          <div className="scrollbar-hidden max-h-96 space-y-1 overflow-y-auto">
                            {companies.map((company) => (
                              <label
                                key={company.slug}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCompanies.includes(
                                    company.slug,
                                  )}
                                  onChange={() => toggleCompany(company.slug)}
                                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <span className="text-sm text-gray-300">
                                  {company.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Date Range Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                      className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {getDateRangeLabel(dateRangeType)}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {dateDropdownOpen && (
                      <>
                        {/* Backdrop */}
                        <button
                          type="button"
                          className="fixed inset-0 z-40"
                          onClick={() => setDateDropdownOpen(false)}
                          aria-label="Close dropdown"
                          tabIndex={-1}
                        />
                        <div className="absolute left-0 sm:right-0 sm:left-auto top-full z-50 mt-2 w-64 rounded-xl border border-white/10 bg-[#0A0A0A] p-3 shadow-xl backdrop-blur-sm">
                          <div className="space-y-1">
                            {(
                              [
                                "all",
                                "today",
                                "week",
                                "month",
                              ] as DateRangeType[]
                            ).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  setDateRangeType(type);
                                  setDateDropdownOpen(false);
                                }}
                                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                  dateRangeType === type
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "text-gray-300 hover:bg-white/5"
                                }`}
                              >
                                {getDateRangeLabel(type)}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setDateRangeType("custom")}
                              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                dateRangeType === "custom"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "text-gray-300 hover:bg-white/5"
                              }`}
                            >
                              Custom Range
                            </button>
                          </div>

                          {dateRangeType === "custom" && (
                            <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing{" "}
                <span className="font-medium text-white">
                  {articles.length}
                </span>{" "}
                articles
              </p>

              {/* Clear Filters Button */}
              {(selectedCompanies.length > 0 ||
                selectedCategories.length > 0 ||
                searchQuery ||
                dateRangeType !== "all") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg flex items-center gap-2 border-none text-sm font-medium px-2 text-gray-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>

            {articles.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
                <FileText className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-4 text-lg font-medium text-white">
                  No articles found
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
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white">
                            {article.company.name}
                          </span>
                          {article.company.category
                            .slice(0, 2)
                            .map((category) => (
                              <span
                                key={category}
                                className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium ${getCategoryColor(category)}`}
                              >
                                {formatCategoryLabel(category)}
                              </span>
                            ))}
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
    </div>
  );
}
