import { subDays } from "date-fns";
import { TavilyClient } from "tavily";
import type { TavilyResult } from "@/types/pipeline.types";

interface TavilyApiResult {
  url: string;
  title: string;
  content: string;
  raw_content?: string;
  score: string;
  published_date?: string;
}

export class TavilySearchService {
  private client: TavilyClient;

  constructor(apiKey: string) {
    this.client = new TavilyClient({ apiKey });
  }

  /**
   * Search for content from a specific source URL with multiple passes for maximum coverage
   */
  async searchSourceContent(
    sourceUrl: string,
    companyName: string,
    dateRangeDays = 30,
    fetchContext?: string,
  ): Promise<TavilyResult[]> {
    const cutoffDate = subDays(new Date(), dateRangeDays);
    const isSubsequentFetch = fetchContext?.includes("subsequent fetch");

    try {
      const domain = new URL(sourceUrl).hostname;

      // Define multiple search query variations for comprehensive coverage
      const queryVariations = [
        // Pass 1: General content
        `site:${domain} ${companyName} articles blog posts news`,
        // Pass 2: Product/release focus
        `site:${domain} ${companyName} updates announcements releases`,
        // Pass 3: Technical content
        `site:${domain} ${companyName} research engineering`,
      ];

      const allResults: TavilyResult[] = [];

      // Run multiple search passes
      for (const baseQuery of queryVariations) {
        let query = baseQuery;

        // Add date context for subsequent fetches
        if (isSubsequentFetch) {
          const today = new Date();
          const yesterday = subDays(today, 1);
          query += ` (published:${
            yesterday.toISOString().split("T")[0]
          } OR published:${today.toISOString().split("T")[0]})`;
        }

        try {
          const results = await this.client.search({
            query,
            search_depth: "advanced",
            max_results: 20,
            include_answer: false,
            include_images: false,
          });

          // Filter by date manually if publishedDate is available
          const filteredResults = (results.results || [])
            .filter((result: TavilyApiResult) => {
              if (result.published_date) {
                const publishedDate = new Date(result.published_date);
                return publishedDate >= cutoffDate;
              }
              return true;
            })
            .map((result: TavilyApiResult) => ({
              url: result.url,
              title: result.title,
              content: result.content,
              score: Number.parseFloat(result.score) || 0,
              published_date: result.published_date,
            }));

          allResults.push(...filteredResults);
        } catch (error) {
          console.error(`Search pass failed for query "${query}":`, error);
          // Continue with other query variations
        }
      }

      // Deduplicate by URL (keep highest score if duplicates)
      const uniqueResults = Array.from(
        new Map(
          allResults
            .sort((a, b) => b.score - a.score) // Sort by score descending
            .map((item) => [item.url, item]),
        ).values(),
      );
      console.log(
        "All urls:",
        uniqueResults.map((item) => item.url),
      );
      console.log(
        `Multiple search passes: ${allResults.length} total → ${uniqueResults.length} unique results`,
      );

      return uniqueResults;
    } catch (error) {
      console.error(`Tavily search failed for ${sourceUrl}:`, error);
      throw new Error(`Failed to search ${sourceUrl}: ${error}`);
    }
  }

  /**
   * Search for recent content from multiple sources
   */
  async searchMultipleSources(
    sourceUrls: string[],
    companyName: string,
    dateRangeDays = 30,
  ): Promise<TavilyResult[]> {
    const allResults: TavilyResult[] = [];

    for (const sourceUrl of sourceUrls) {
      try {
        const results = await this.searchSourceContent(
          sourceUrl,
          companyName,
          dateRangeDays,
        );
        allResults.push(...results);
      } catch (error) {
        console.error(`Failed to search ${sourceUrl}:`, error);
        // Continue with other sources
      }
    }

    // Deduplicate by URL
    const uniqueResults = Array.from(
      new Map(allResults.map((item) => [item.url, item])).values(),
    );

    return uniqueResults;
  }
}
