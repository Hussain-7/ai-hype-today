import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { subDays } from "date-fns";
import { type Article, ArticleListSchema } from "@/schemas/article.schema";
import type { TavilyResult } from "@/types/pipeline.types";
import type { DomainFilter } from "@/types/sources.types";

export class ArticleExtractionAgent {
  private model: ReturnType<typeof google>;

  constructor() {
    // Use Gemini 2.5 Flash for fast, cost-effective extraction with web search capability
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
You are an AI article extractor for "AI Hype Today" - a platform that tracks NEW innovations, releases, and breakthrough developments in AI.

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTENT FILTERING - ONLY EXTRACT "HYPE-WORTHY" AI INNOVATION ARTICLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ MUST INCLUDE - Articles about:
1. NEW AI model releases (GPT-5, Claude 4, Gemini Pro, etc.)
2. NEW product launches (AI tools, features, APIs, platforms)
3. BREAKTHROUGH research (new capabilities, benchmarks, architectures)
4. MAJOR partnerships or acquisitions in AI space
5. NEW AI technologies or techniques announced
6. SIGNIFICANT funding rounds or company milestones
7. REGULATORY changes or policy announcements affecting AI
8. AI safety breakthroughs or important developments
9. NEW open-source AI model releases
10. INNOVATIVE use cases or applications of AI
11. MAJOR performance improvements or new benchmarks
12. AI infrastructure or platform announcements

🚫 MUST EXCLUDE - Filter out:
1. ❌ General company updates unrelated to AI innovation
2. ❌ Blog posts about "how to use" existing features
3. ❌ Tutorial or educational content (unless about brand new features)
4. ❌ Case studies or customer stories (unless groundbreaking use case)
5. ❌ Routine maintenance updates or bug fixes
6. ❌ Job postings or hiring announcements
7. ❌ Event recaps or conference summaries (unless major announcements made)
8. ❌ Opinion pieces without new information
9. ❌ Republished or recycled content
10. ❌ Minor feature updates or incremental improvements
11. ❌ Marketing fluff without substance
12. ❌ General tech news not specifically about AI innovation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXTRACTION RULES:

1. URL Validation:
   - Article URL MUST start with one of the allowed source URL paths above
   - Article URL MUST NOT be exactly equal to any source URL (those are listing pages)
   - ONLY extract URLs that are individual articles with specific content
   - NEVER extract listing pages, category pages, or index pages

2. Date Requirements:
   - Published within the last ${dateRangeDays} days (after ${cutoffDate.toISOString()})
   ${!isFirstFetch ? "   - For SUBSEQUENT FETCH: ONLY articles from yesterday or today" : ""}

3. Duplicate Avoidance${existingArticles.length > 0 ? " (CRITICAL)" : ""}:
   ${existingArticles.length > 0 ? "   - DO NOT extract articles that already exist in the database (see URLs above)" : "   - This is the first fetch, no duplicates exist yet"}

4. INNOVATION & HYPE FILTER (CRITICAL):
   - Article MUST be about something NEW, INNOVATIVE, or SIGNIFICANT
   - Must announce or discuss new technology, products, research, or developments
   - Should generate excitement or interest in the AI community
   - Avoid routine updates, tutorials, or non-newsworthy content
   - Focus on breakthrough moments, not incremental updates

5. Content Requirements:
   - Must have a meaningful, specific title that indicates innovation/news
   - Must have substantive content about new developments
   - Should represent a single article about a specific announcement or development
   - Title should clearly indicate what's NEW or INNOVATIVE

For each VALID article, extract:
- url: The direct article URL (must pass all filtering rules above)
- title: Article title (clean, without site name or extra metadata)
- description: Brief description highlighting the INNOVATION or NEW development (extract from content if available)
- publishedAt: ISO 8601 date when published
- author: Author name if mentioned in content
- tags: Relevant tags emphasizing innovation (e.g., "new-release", "breakthrough", "product-launch", "research", etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUALITY OVER QUANTITY: Be highly selective. Only extract articles that represent genuine AI innovation,
new product releases, breakthrough research, or significant developments that would excite AI enthusiasts.

When in doubt about whether content is "hype-worthy" or innovative enough, EXCLUDE it.

Return ONLY articles that meet ALL criteria above, especially the innovation/hype filter.
`;

    try {
      const { output } = await generateText({
        model: this.model,
        prompt,
        output: Output.object({
          schema: ArticleListSchema,
        }),
        temperature: 0.5,
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

        // CRITICAL: First check if article URL equals ANY source URL (they are listing pages)
        const isAnySourceUrl = sourceUrlsToCheck.some(
          (srcUrl) => normalizeUrl(srcUrl) === normalizedArticleUrl,
        );

        if (isAnySourceUrl) {
          console.log(
            `[FILTER] Rejected - matches source URL (listing page): ${article.url}`,
          );
          return false;
        }

        // Then check if article URL starts with at least one source URL
        const startsWithSource = sourceUrlsToCheck.some((srcUrl) => {
          const normalizedSource = normalizeUrl(srcUrl);
          return normalizedArticleUrl.startsWith(normalizedSource);
        });

        if (!startsWithSource) {
          console.log(
            `[FILTER] Rejected - not under any source path: ${article.url}`,
          );
          console.log(
            `  Must start with one of: ${sourceUrlsToCheck.join(", ")}`,
          );
          return false;
        }

        return true;
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
