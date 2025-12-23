import { useQuery } from "@tanstack/react-query";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo, useState } from "react";

type Article = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  company: {
    name: string;
    slug: string;
    dominanceBucket: string;
    category: string[];
  };
};

export type DateRangeType = "all" | "today" | "week" | "month" | "custom";

export function useArticles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("all");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Fetch all articles
  const { data: articlesData, refetch: refetchArticles } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const res = await fetch("/api/articles?limit=1000");
      if (!res.ok) {
        throw new Error(`Failed to fetch articles: ${res.status}`);
      }
      const data = await res.json();
      return { articles: (data.articles || []) as Article[] };
    },
  });

  const allArticles = articlesData?.articles || [];

  // Get unique companies and buckets for filters
  const companies = useMemo(() => {
    const uniqueCompanies = new Map<string, string>();
    for (const article of allArticles) {
      uniqueCompanies.set(article.company.slug, article.company.name);
    }
    return Array.from(uniqueCompanies.entries()).map(([slug, name]) => ({
      slug,
      name,
    }));
  }, [allArticles]);

  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    for (const article of allArticles) {
      for (const category of article.company.category) {
        categorySet.add(category);
      }
    }
    return Array.from(categorySet).sort();
  }, [allArticles]);

  // Calculate date range based on selected type
  const dateRange = useMemo(() => {
    const now = new Date();

    switch (dateRangeType) {
      case "today":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };
      case "week":
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "custom":
        return {
          start: customStartDate || null,
          end: customEndDate || null,
        };
      default:
        return { start: null, end: null };
    }
  }, [dateRangeType, customStartDate, customEndDate]);

  // Filter articles based on search and filters
  const filteredArticles = useMemo(() => {
    let filtered = allArticles;

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((article) => {
        const articleDate = new Date(article.publishedAt);

        if (dateRange.start && articleDate < dateRange.start) {
          return false;
        }

        if (dateRange.end && articleDate > dateRange.end) {
          return false;
        }

        return true;
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query) ||
          article.company.name.toLowerCase().includes(query),
      );
    }

    // Apply company filter
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter((article) =>
        selectedCompanies.includes(article.company.slug),
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((article) =>
        article.company.category.some((cat) =>
          selectedCategories.includes(cat),
        ),
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }, [allArticles, searchQuery, selectedCompanies, selectedCategories, dateRange]);

  return {
    articles: filteredArticles,
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
    refetchArticles,
  };
}

export type { Article };
