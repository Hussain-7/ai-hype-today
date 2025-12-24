"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

interface Company {
  id: string;
  name: string;
  slug: string;
  category: string[];
}

interface CompanySelectorModalProps {
  companies: Company[];
  onConfirm: (selectedSlugs: string[]) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function CompanySelectorModal({
  companies,
  onConfirm,
  onCancel,
  isOpen,
}: CompanySelectorModalProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleCompany = (slug: string) => {
    const newSelected = new Set(selectedSlugs);
    if (newSelected.has(slug)) {
      newSelected.delete(slug);
    } else {
      newSelected.add(slug);
    }
    setSelectedSlugs(newSelected);
  };

  const toggleAll = () => {
    if (selectedSlugs.size === companies.length) {
      setSelectedSlugs(new Set());
    } else {
      setSelectedSlugs(new Set(companies.map((c) => c.slug)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">
              Select Companies
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Choose which companies to process ({selectedSlugs.size} selected)
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Select All */}
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <input
            type="checkbox"
            checked={selectedSlugs.size === companies.length}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
          />
          <span className="text-sm font-medium text-white">Select All</span>
        </div>

        {/* Company List */}
        <div className="mb-6 max-h-96 space-y-2 overflow-y-auto">
          {companies.map((company) => (
            <button
              key={company.slug}
              type="button"
              onClick={() => toggleCompany(company.slug)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                selectedSlugs.has(company.slug)
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSlugs.has(company.slug)}
                onChange={() => toggleCompany(company.slug)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="flex-1">
                <div className="font-medium text-white">{company.name}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {company.category.slice(0, 3).map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-gray-400"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              {selectedSlugs.has(company.slug) && (
                <Check className="h-5 w-5 text-blue-400" />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(Array.from(selectedSlugs))}
            disabled={selectedSlugs.size === 0}
            className="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trigger {selectedSlugs.size > 0 && `(${selectedSlugs.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
