import { useCallback, useEffect, useState } from "react";

export type CompanySortField = "name" | "slug" | "sources" | "articles";

interface Company {
  id: string;
  name: string;
  slug: string;
  category: string[];
  dominanceBucket: string;
  domainKey: string;
  domainFilter: {
    include: string[];
    exclude: string[];
  };
  sources: Array<{
    label: string;
    url: string;
  }>;
  _count: {
    articles: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface CompaniesPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function useAdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<CompaniesPagination | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<CompanySortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchCompanies = useCallback(
    async (sort?: CompanySortField, order?: "asc" | "desc") => {
      try {
        setIsLoading(true);
        setError(null);

        const sortParam = sort || sortBy;
        const orderParam = order || sortOrder;

        const res = await fetch(
          `/api/companies?limit=100&sortBy=${sortParam}&sortOrder=${orderParam}`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch companies");
        }

        const data = await res.json();
        setCompanies(data.companies);
        setPagination(data.pagination);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch companies",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sortBy, sortOrder],
  );

  const deleteCompanies = useCallback(
    async (companyIds: string[]) => {
      try {
        setIsDeleting(true);
        setError(null);

        const res = await fetch("/api/companies", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ companyIds }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete companies");
        }

        // Refresh companies after deletion
        await fetchCompanies();

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete companies",
        );
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [fetchCompanies],
  );

  const handleSort = useCallback(
    (field: CompanySortField) => {
      const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
      setSortBy(field);
      setSortOrder(newOrder);
      fetchCompanies(field, newOrder);
    },
    [sortBy, sortOrder, fetchCompanies],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Initial fetch only
  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    pagination,
    isLoading,
    isDeleting,
    error,
    sortBy,
    sortOrder,
    deleteCompanies,
    handleSort,
    refreshCompanies: fetchCompanies,
  };
}
