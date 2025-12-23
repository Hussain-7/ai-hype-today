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
   * Search for content from a specific source URL
   */
  async searchSourceContent(
    sourceUrl: string,
    companyName: string,
    dateRangeDays = 30,
  ): Promise<TavilyResult[]> {
    const cutoffDate = subDays(new Date(), dateRangeDays);

    try {
      const domain = new URL(sourceUrl).hostname;

      const results = await this.client.search({
        query: `site:${domain} ${companyName} articles blog posts news`,
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
          // If no published date, include it (will be filtered by AI later)
          return true;
        })
        .map((result: TavilyApiResult) => ({
          url: result.url,
          title: result.title,
          content: result.content,
          score: Number.parseFloat(result.score) || 0,
          published_date: result.published_date,
        }));

      return filteredResults;
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
