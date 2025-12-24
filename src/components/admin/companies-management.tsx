"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  type CompanySortField,
  useAdminCompanies,
} from "@/hooks/useAdminCompanies";
import { SortableTableHeader } from "./sortable-table-header";

export function CompaniesManagement() {
  const {
    companies,
    pagination,
    isLoading,
    isDeleting,
    error,
    sortBy,
    sortOrder,
    deleteCompanies,
    handleSort,
  } = useAdminCompanies();

  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(
    new Set(),
  );

  const toggleCompany = (companyId: string) => {
    const newSelected = new Set(selectedCompanies);
    if (newSelected.has(companyId)) {
      newSelected.delete(companyId);
    } else {
      newSelected.add(companyId);
    }
    setSelectedCompanies(newSelected);
  };

  const toggleAll = () => {
    if (selectedCompanies.size === companies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(companies.map((c) => c.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedCompanies.size === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedCompanies.size} compan${selectedCompanies.size === 1 ? "y" : "ies"}? This will also delete all their articles.`,
    );

    if (confirmed) {
      const success = await deleteCompanies(Array.from(selectedCompanies));
      if (success) {
        setSelectedCompanies(new Set());
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
          <p className="text-sm text-gray-400">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Companies Management
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {pagination?.total || 0} total companies
          </p>
        </div>
        {selectedCompanies.size > 0 && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 font-semibold text-red-400 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting
              ? "Deleting..."
              : `Delete ${selectedCompanies.size} Selected`}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Companies Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="min-w-full">
          <thead className="border-b border-white/10">
            <tr className="text-left text-sm">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    companies.length > 0 &&
                    selectedCompanies.size === companies.length
                  }
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </th>
              <SortableTableHeader<CompanySortField>
                field="name"
                label="Name"
                currentField={sortBy}
                direction={sortOrder}
                onSort={handleSort}
              />
              <SortableTableHeader<CompanySortField>
                field="slug"
                label="Slug"
                currentField={sortBy}
                direction={sortOrder}
                onSort={handleSort}
              />
              <th className="px-4 py-3 font-medium text-gray-400">
                Categories
              </th>
              <SortableTableHeader<CompanySortField>
                field="sources"
                label="Sources"
                currentField={sortBy}
                direction={sortOrder}
                onSort={handleSort}
              />
              <SortableTableHeader<CompanySortField>
                field="articles"
                label="Articles"
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
            {companies.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  No companies found
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr
                  key={company.id}
                  className="text-sm transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.has(company.id)}
                      onChange={() => toggleCompany(company.id)}
                      className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    />
                  </td>
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium">{company.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-mono">
                      {company.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {company.category.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-400"
                        >
                          {cat}
                        </span>
                      ))}
                      {company.category.length > 3 && (
                        <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-gray-400">
                          +{company.category.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {company.sources.length}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {company._count.articles}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmed = confirm(
                          `Are you sure you want to delete ${company.name}? This will also delete all ${company._count.articles} articles.`,
                        );
                        if (confirmed) {
                          await deleteCompanies([company.id]);
                        }
                      }}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                      title="Delete company"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
