import { cache } from "react";
import "server-only";
import { prisma } from "@/lib/prisma";

export interface Article {
  id: string;
  url: string;
  title: string;
  description: string | null;
  publishedAt: string;
  sourceUrl: string | null;
  sourceLabel: string | null;
  domain: string;
  author: string | null;
  imageUrl: string | null;
  tags: string[];
  company: {
    name: string;
    slug: string;
    dominanceBucket: string;
    category: string[];
  };
}

/**
 * Fetch all articles from database (server-side)
 * Wrapped with React cache() for automatic request deduplication
 * Used by landing page and articles page for SSR
 */
export const getAllArticles = cache(async (): Promise<Article[]> => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        publishedAt: "desc",
      },
      include: {
        company: {
          select: {
            name: true,
            slug: true,
            dominanceBucket: true,
            category: true,
          },
        },
      },
    });

    // Convert dates to ISO strings for client compatibility
    return articles.map((article) => ({
      ...article,
      publishedAt: article.publishedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
});

/**
 * Preload articles for parallel fetching
 * Call this before awaiting to start the request early
 */
export const preloadArticles = () => {
  void getAllArticles();
};
