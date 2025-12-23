import { tavily } from 'tavily';
import { subDays } from 'date-fns';
import type { TavilyResult } from '@/types/pipeline.types';

export class TavilySearchService {
  private client: any;

  constructor(apiKey: string) {
    this.client = (tavily as any)({ apiKey });
  }

  /**
   * Search for content from a specific source URL
   */
  async searchSourceContent(
    sourceUrl: string,
    companyName: string,
    dateRangeDays = 30
  ): Promise<TavilyResult[]> {
    const cutoffDate = subDays(new Date(), dateRangeDays);

    try {
      const domain = new URL(sourceUrl).hostname;

      const results = await this.client.search(
        `site:${domain} ${companyName} articles blog posts news`,
        {
          searchDepth: 'advanced',
          maxResults: 20,
          includeAnswer: false,
          includeImages: false,
        }
      );

      // Filter by date manually if publishedDate is available
      const filteredResults = (results.results || [])
        .filter((result: any) => {
          if (result.published_date) {
            const publishedDate = new Date(result.published_date);
            return publishedDate >= cutoffDate;
          }
          // If no published date, include it (will be filtered by AI later)
          return true;
        })
        .map((result: any) => ({
          url: result.url,
          title: result.title || '',
          content: result.content || '',
          score: result.score || 0,
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
    dateRangeDays = 30
  ): Promise<TavilyResult[]> {
    const allResults: TavilyResult[] = [];

    for (const sourceUrl of sourceUrls) {
      try {
        const results = await this.searchSourceContent(
          sourceUrl,
          companyName,
          dateRangeDays
        );
        allResults.push(...results);
      } catch (error) {
        console.error(`Failed to search ${sourceUrl}:`, error);
        // Continue with other sources
      }
    }

    // Deduplicate by URL
    const uniqueResults = Array.from(
      new Map(allResults.map((item) => [item.url, item])).values()
    );

    return uniqueResults;
  }
}
