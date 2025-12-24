import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { subDays } from "date-fns";
import { type Article, ArticleListSchema } from "@/schemas/article.schema";
import type { TavilyResult } from "@/types/pipeline.types";
import type { DomainFilter } from "@/types/sources.types";

export class ArticleExtractionAgent {
  private model: ReturnType<typeof google>;

  constructor() {
    // Use Gemini 2.5 Flash for fast, cost-effective extraction with latest capabilities
    this.model = google("gemini-2.5-flash-lite");
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
    existingArticles: Array<{
      url: string;
      title: string;
      publishedAt: Date;
    }> = [],
    isFirstFetch = true,
    sourceUrls: string[] = [],
  ): Promise<Article[]> {
    const cutoffDate = subDays(new Date(), dateRangeDays);

    if (searchResults.length === 0) {
      return [];
    }

    // Build context about existing articles
    const existingArticlesContext =
      existingArticles.length > 0
        ? `
EXISTING ARTICLES IN DATABASE (${existingArticles.length} total):
We have already fetched articles from this source. Here are the existing articles to help you avoid duplicates:
${JSON.stringify(
  existingArticles.slice(0, 20).map((a) => ({
    url: a.url,
    title: a.title,
    publishedAt: a.publishedAt.toISOString(),
  })),
  null,
  2,
)}
${existingArticles.length > 20 ? `... and ${existingArticles.length - 20} more existing articles` : ""}

IMPORTANT: Only extract NEW articles that are NOT already in the database above. Focus on articles from yesterday and today.
`
        : `
FIRST FETCH: This is the first time we're fetching from this source. Extract all relevant recent articles within the date range.
`;

    const prompt = `
You are an AI article extractor for an AI news aggregation platform.

Company: ${company.name}
Source: ${sourceLabel} (${sourceUrl})

ALLOWED SOURCE URL PATHS (Articles MUST start with these URLs):
${sourceUrls.length > 0 ? sourceUrls.map((url) => `  - ${url}*`).join("\n") : `  - ${sourceUrl}*`}

🚫 NEVER extract the source URLs themselves (they are listing pages):
${sourceUrls.length > 0 ? sourceUrls.map((url) => `  ❌ ${url}`).join("\n") : `  ❌ ${sourceUrl}`}

Example:
  Source: https://openai.com/news/product-releases/
  ✅ https://openai.com/news/product-releases/gpt4-launch (valid article)
  ❌ https://openai.com/news/product-releases/ (listing page - reject!)

Date Cutoff: Articles must be published after ${cutoffDate.toISOString()}
${isFirstFetch ? "Fetch Type: FIRST FETCH - Get all recent articles" : "Fetch Type: SUBSEQUENT FETCH - Only articles from yesterday/today"}

${existingArticlesContext}

Search Results:
${JSON.stringify(searchResults, null, 2)}

EXTRACTION RULES:

1. URL Validation:
   - Article URL MUST start with one of the allowed source URL paths above
   - Article URL MUST NOT be exactly equal to any source URL (those are listing pages)

2. Date Requirements:
   - Published within the last ${dateRangeDays} days (after ${cutoffDate.toISOString()})
   ${!isFirstFetch ? "   - For SUBSEQUENT FETCH: ONLY articles from yesterday or today" : ""}

3. Duplicate Avoidance${existingArticles.length > 0 ? " (CRITICAL)" : ""}:
   ${existingArticles.length > 0 ? "   - DO NOT extract articles that already exist in the database (see URLs above)" : "   - This is the first fetch, no duplicates exist yet"}

4. Content Requirements:
   - Must have a meaningful, specific title
   - Must have substantive content
   - Should represent a single article

For each VALID article, extract:
- url: The direct article URL (must pass all filtering rules above)
- title: Article title (clean, without site name or extra metadata)
- description: Brief article description or excerpt (extract from content if available)
- publishedAt: ISO 8601 date when published
- author: Author name if mentioned in content
- tags: Relevant tags or categories extracted from content

IMPORTANT: Be conservative. When in doubt about whether a URL is a listing page or an article page, EXCLUDE it.
Only return articles where you are confident they are individual, substantive content pieces from official sources.

Return ONLY articles that meet ALL criteria above. Quality over quantity.
`;

    try {
      const { output } = await generateText({
        model: this.model,
        prompt,
        output: Output.object({
          schema: ArticleListSchema,
        }),
        temperature: 0.3, // Lower temperature for more consistent extraction
      });

      // SIMPLIFIED FILTERING: Only validate against source URLs
      // Source URLs contain the article URL as a prefix for valid articles
      const sourceUrlsToCheck =
        sourceUrls.length > 0 ? sourceUrls : [sourceUrl];

      const strictlyFilteredArticles = output.articles.filter((article) => {
        // Normalize URLs for comparison (remove trailing slashes and query params)
        const normalizeUrl = (url: string) => {
          try {
            const urlObj = new URL(url);
            return `${urlObj.origin}${urlObj.pathname}`.replace(/\/$/, "");
          } catch {
            return url;
          }
        };

        const normalizedArticleUrl = normalizeUrl(article.url);

        // Check if article URL starts with any source URL (but is not exactly the source URL)
        const isValid = sourceUrlsToCheck.some((srcUrl) => {
          const normalizedSource = normalizeUrl(srcUrl);
          return (
            normalizedArticleUrl.startsWith(normalizedSource) &&
            normalizedArticleUrl !== normalizedSource
          );
        });

        if (!isValid) {
          console.log(`[FILTER] Rejected: ${article.url}`);
          console.log(
            `  Must start with one of: ${sourceUrlsToCheck.join(", ")}`,
          );
        }

        return isValid;
      });

      console.log(
        `Filtered ${output.articles.length} → ${strictlyFilteredArticles.length} articles`,
      );

      return strictlyFilteredArticles;
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
    existingArticles: Array<{
      url: string;
      title: string;
      publishedAt: Date;
    }> = [],
    isFirstFetch = true,
    sourceUrls: string[] = [],
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
          existingArticles,
          isFirstFetch,
          sourceUrls,
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
