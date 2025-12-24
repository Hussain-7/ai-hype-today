import { useCallback, useEffect, useState } from "react";

export type ArticleSortField = "company" | "source" | "title" | "publishedAt";

interface Article {
  id: string;
  url: string;
  title: string;
  description: string | null;
  publishedAt: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
  company: {
    name: string;
    slug: string;
  };
}

interface ArticlesPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function useAdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<ArticlesPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ArticleSortField>("publishedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 50;

  const fetchArticles = useCallback(
    async (page: number, sort?: ArticleSortField, order?: "asc" | "desc") => {
      try {
        setIsLoading(true);
        setError(null);

        const offset = (page - 1) * pageSize;
        const sortParam = sort || sortBy;
        const orderParam = order || sortOrder;

        const res = await fetch(
          `/api/articles?limit=${pageSize}&offset=${offset}&sortBy=${sortParam}&sortOrder=${orderParam}`,
        );

        if (!res.ok) {
          throw new Error("Failed to fetch articles");
        }

        const data = await res.json();
        setArticles(data.articles);
        setPagination(data.pagination);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch articles",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sortBy, sortOrder],
  );

  const deleteArticles = useCallback(
    async (articleIds: string[]) => {
      try {
        setIsDeleting(true);
        setError(null);

        const res = await fetch("/api/articles", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ articleIds }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete articles");
        }

        // Refresh articles after deletion
        await fetchArticles(currentPage);

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete articles",
        );
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [currentPage, fetchArticles],
  );

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchArticles(page);
    },
    [fetchArticles],
  );

  const handleSort = useCallback(
    (field: ArticleSortField) => {
      const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
      setSortBy(field);
      setSortOrder(newOrder);
      setCurrentPage(1);
      fetchArticles(1, field, newOrder);
    },
    [sortBy, sortOrder, fetchArticles],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Initial fetch only
  useEffect(() => {
    fetchArticles(currentPage);
  }, []);

  return {
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
    refreshArticles: () => fetchArticles(currentPage),
  };
}
