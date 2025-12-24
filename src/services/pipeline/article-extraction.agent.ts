import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { subDays } from "date-fns";
import { type Article, ArticleListSchema } from "@/schemas/article.schema";
import type { TavilyResult } from "@/types/pipeline.types";
import type { DomainFilter } from "@/types/sources.types";
import { isUrlAllowed } from "./domain-filter.service";

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
  ): Promise<Article[]> {
    const cutoffDate = subDays(new Date(), dateRangeDays);

    // Pre-filter by domain
    const filteredResults = searchResults.filter((result) =>
      isUrlAllowed(result.url, company.domainFilter),
    );

    if (filteredResults.length === 0) {
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
You are an AI article extractor for an AI news aggregation platform. Your job is to identify ONLY genuine, individual article pages from search results.

Company: ${company.name}
Source: ${sourceLabel} (${sourceUrl})
Whitelisted Domains: ${company.domainFilter.include.join(", ")}
Date Cutoff: Articles must be published after ${cutoffDate.toISOString()}
${isFirstFetch ? "Fetch Type: FIRST FETCH - Get all recent articles" : "Fetch Type: SUBSEQUENT FETCH - Only get articles from yesterday and today"}

${existingArticlesContext}

Search Results:
${JSON.stringify(filteredResults, null, 2)}

CRITICAL FILTERING RULES - Extract articles that meet ALL of these criteria:

1. ✅ VALID ARTICLE URLs (INCLUDE):
   - Individual blog posts with specific slugs: /blog/article-title-here
   - News articles with dates/slugs: /news/2024/01/article-name
   - Changelog entries with versions: /changelog/v2-release
   - Documentation updates with specific topics: /docs/updates/new-feature
   - Research papers or announcements: /research/paper-name

2. ❌ INVALID URLs (EXCLUDE - DO NOT EXTRACT):
   - Bare listing pages: /blog, /blog/, /news, /news/
   - Forum threads: forum.example.com/*, /forum/*, /t/*, /topic/*
   - Community discussions: community.example.com/*, /community/*, /discuss/*
   - Category/tag pages: /category/*, /tag/*, /tags/*
   - Pagination pages: /page/2, /blog/page/3
   - Generic landing pages: /, /about, /contact, /home
   - Documentation root pages: /docs, /docs/ (without specific article)

3. Domain Requirements:
   - MUST be from whitelisted domains: ${company.domainFilter.include.join(", ")}
   - MUST NOT be from forum or community subdomains (forum.*, community.*, discuss.*)
   - MUST be from official company sources, NOT third-party sites

4. Date Requirements:
   - Published within the last ${dateRangeDays} days (after ${cutoffDate.toISOString()})
   ${!isFirstFetch ? "   - For SUBSEQUENT FETCH: ONLY articles from yesterday or today" : ""}
   - Use published_date from search results if available
   - If no date provided, estimate from content or use recent date within range

5. Duplicate Avoidance${existingArticles.length > 0 ? " (CRITICAL)" : ""}:
   ${existingArticles.length > 0 ? "   - DO NOT extract articles that already exist in the database (see URLs above)\n   - Check both URL and title to avoid duplicates\n   - Skip any article that appears to be the same as an existing one" : "   - This is the first fetch, so no duplicates exist yet"}

6. Content Requirements:
   - Must have a meaningful, specific title (not generic like "Blog" or "News")
   - Must have substantive content (not just navigation menus)
   - Should represent a single, discrete piece of content

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

      // Post-process: Apply additional URL validation
      const validArticles = output.articles.filter((article) => {
        // Double-check each URL passes domain filter (redundant but safe)
        if (!isUrlAllowed(article.url, company.domainFilter)) {
          console.log(`Filtered out invalid URL: ${article.url}`);
          return false;
        }

        // Validate URL format
        try {
          const urlObj = new URL(article.url);

          // Reject if it's a bare listing page that somehow got through
          const pathname = urlObj.pathname.toLowerCase();
          if (
            pathname === "/blog" ||
            pathname === "/blog/" ||
            pathname === "/news" ||
            pathname === "/news/" ||
            pathname === "/updates" ||
            pathname === "/updates/"
          ) {
            console.log(`Filtered out listing page: ${article.url}`);
            return false;
          }

          // URL should have meaningful path segments
          const segments = pathname.split("/").filter((s) => s.length > 0);
          if (segments.length === 0) {
            console.log(`Filtered out root URL: ${article.url}`);
            return false;
          }

          return true;
        } catch (_error) {
          console.log(`Filtered out malformed URL: ${article.url}`);
          return false;
        }
      });

      console.log(
        `Extracted ${validArticles.length} valid articles out of ${output.articles.length} total`,
      );

      return validArticles;
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
