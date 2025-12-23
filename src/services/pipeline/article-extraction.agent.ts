import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { subDays } from "date-fns";
import { type Article, ArticleListSchema } from "@/schemas/article.schema";
import type { TavilyResult } from "@/types/pipeline.types";
import type { DomainFilter } from "@/types/sources.types";
import { DomainFilterService } from "./domain-filter.service";

export class ArticleExtractionAgent {
  private model: ReturnType<typeof google>;

  constructor() {
    // Use Gemini 1.5 Flash for fast, cost-effective extraction
    this.model = google("gemini-1.5-flash");
  }

  /**
   * Extract articles from search results using AI
   */
  async extractArticles(
    searchResults: TavilyResult[],
    company: {
      slug: string;
      name: string;
      domainFilter: DomainFilter;
    },
    sourceUrl: string,
    sourceLabel: string,
    dateRangeDays = 30,
  ): Promise<Article[]> {
    const cutoffDate = subDays(new Date(), dateRangeDays);

    // Pre-filter by domain
    const filteredResults = searchResults.filter((result) =>
      DomainFilterService.isUrlAllowed(result.url, company.domainFilter),
    );

    if (filteredResults.length === 0) {
      return [];
    }

    const prompt = `
You are an AI article extractor. Analyze the following search results and extract article metadata.

Company: ${company.name}
Source: ${sourceLabel} (${sourceUrl})
Whitelisted Domains: ${company.domainFilter.include.join(", ")}
Date Cutoff: Articles must be published after ${cutoffDate.toISOString()}

Search Results:
${JSON.stringify(filteredResults, null, 2)}

Extract articles that:
1. Are from the whitelisted domains ONLY
2. Published within the last ${dateRangeDays} days (after ${cutoffDate.toISOString()})
3. Are genuine articles, blog posts, or news items (NOT navigation pages, category pages, or generic landing pages)
4. Have meaningful titles and descriptions

For each valid article, extract:
- url: The direct article URL
- title: Article title (clean, without extra metadata)
- description: Brief article description or excerpt (if available in content)
- publishedAt: ISO 8601 date when published (use published_date if available, otherwise estimate from content or use current date)
- author: Author name if mentioned in content
- tags: Relevant tags or categories extracted from content

Return ONLY articles that meet ALL criteria. If unsure about publish date, use a recent date but within the last ${dateRangeDays} days.
`;

    try {
      const { object } = await generateObject({
        model: this.model,
        schema: ArticleListSchema,
        prompt,
        temperature: 0.3, // Lower temperature for more consistent extraction
      });

      return object.articles;
    } catch (error) {
      console.error("Article extraction failed:", error);
      throw new Error(`AI extraction failed: ${error}`);
    }
  }

  /**
   * Extract articles with retry logic
   */
  async extractArticlesWithRetry(
    searchResults: TavilyResult[],
    company: {
      slug: string;
      name: string;
      domainFilter: DomainFilter;
    },
    sourceUrl: string,
    sourceLabel: string,
    dateRangeDays = 30,
    maxRetries = 2,
  ): Promise<Article[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.extractArticles(
          searchResults,
          company,
          sourceUrl,
          sourceLabel,
          dateRangeDays,
        );
      } catch (error) {
        lastError = error as Error;
        console.error(`Extraction attempt ${attempt + 1} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 2 ** attempt * 1000),
          );
        }
      }
    }

    throw lastError || new Error("Article extraction failed after retries");
  }
}
