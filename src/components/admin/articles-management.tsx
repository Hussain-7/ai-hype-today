"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  type ArticleSortField,
  useAdminArticles,
} from "@/hooks/useAdminArticles";
import { SortableTableHeader } from "./sortable-table-header";

export function ArticlesManagement() {
  const {
    articles,
    pagination,
    isLoading,
    isDeleting,
    error,
    currentPage,
    sortBy,
    sortOrder,
    deleteArticles,
    goToPage,
    handleSort,
  } = useAdminArticles();

  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set(),
  );

  const toggleArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const toggleAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map((a) => a.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedArticles.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedArticles.size} article${selectedArticles.size === 1 ? "" : "s"}?`,
    );

    if (confirmed) {
      const success = await deleteArticles(Array.from(selectedArticles));
      if (success) {
        setSelectedArticles(new Set());
      }
    }
  };

  const truncate = (str: string, maxLength: number) => {
    if (str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-blue-500/30 border-t-blue-500" />
        <p className="text-sm text-gray-400">Loading articles...</p>
      </div>
    );
  }

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  return (
    <div>
      {/* Header with Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Articles Management
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {pagination?.total || 0} total articles
          </p>
        </div>
        {selectedArticles.size > 0 && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting
              ? "Deleting..."
              : `Delete ${selectedArticles.size} Selected`}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Articles Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="min-w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-sm">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    articles.length > 0 &&
                    selectedArticles.size === articles.length
                  }
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </th>
              <SortableTableHeader<ArticleSortField>
                field="company"
                label="Company"
                currentField={sortBy}
                direction={sortOrder}
                onSort={handleSort}
              />
              <SortableTableHeader<ArticleSortField>
                field="source"
                label="Source"
                currentField={sortBy}
                direction={sortOrder}
                onSort={handleSort}
              />
              <SortableTableHeader<ArticleSortField>
                field="title"
                label="Title"
                currentField={sortBy}
                direction={sortOrder}
                onSort={handleSort}
              />
              <SortableTableHeader<ArticleSortField>
                field="publishedAt"
                label="Published"
                currentField={sortBy}
                direction={sortOrder}
                onSort={handleSort}
              />
              <th className="w-24 px-4 py-3 font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {articles.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  No articles found
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr
                  key={article.id}
                  className="text-sm transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(article.id)}
                      onChange={() => toggleArticle(article.id)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    />
                  </td>
                  <td className="px-4 py-3 text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {article.company.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs">
                      {truncate(article.sourceLabel || "Unknown", 20)}
                    </span>
                  </td>
                  <td className="max-w-md px-4 py-3 text-white">
                    {truncate(article.title, 60)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                    {format(new Date(article.publishedAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                        title="View article"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          const confirmed = confirm(
                            "Are you sure you want to delete this article?",
                          );
                          if (confirmed) {
                            await deleteArticles([article.id]);
                          }
                        }}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                        title="Delete article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!pagination.hasMore}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
