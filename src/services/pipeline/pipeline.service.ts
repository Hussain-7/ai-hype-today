import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CompanyProcessingStats,
  PipelineError,
} from "@/types/pipeline.types";
import type { DomainFilter, Source } from "@/types/sources.types";
import { ArticleExtractionAgent } from "./article-extraction.agent";
import { ArticlePersistenceService } from "./article-persistence.service";
import { TavilySearchService } from "./tavily-search.service";

export class PipelineService {
  private tavilyService: TavilySearchService;
  private extractionAgent: ArticleExtractionAgent;
  private persistenceService: ArticlePersistenceService;
  private config: {
    dateRangeDays: number;
    delayBetweenCompanies: number;
    delayBetweenSources: number;
  };

  constructor() {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
      throw new Error("TAVILY_API_KEY environment variable is required");
    }

    this.tavilyService = new TavilySearchService(tavilyApiKey);
    this.extractionAgent = new ArticleExtractionAgent();
    this.persistenceService = new ArticlePersistenceService();

    this.config = {
      dateRangeDays: Number(process.env.PIPELINE_DATE_RANGE_DAYS) || 30,
      delayBetweenCompanies: 2000, // 2 seconds
      delayBetweenSources: 1000, // 1 second
    };
  }

  /**
   * Run the complete pipeline for all companies
   */
  async runPipeline(jobId: string): Promise<void> {
    const job = await prisma.pipelineJob.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Update job status to RUNNING
    await prisma.pipelineJob.update({
      where: { id: jobId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    const companies = await prisma.company.findMany();
    const errors: PipelineError[] = [];

    let totalArticlesFound = 0;
    let totalArticlesSaved = 0;
    let duplicatesSkipped = 0;

    for (const company of companies) {
      // Check if job was cancelled
      const currentJob = await prisma.pipelineJob.findUnique({
        where: { id: jobId },
      });

      if (currentJob?.status === "CANCELLED") {
        console.log("Pipeline job was cancelled, stopping processing");
        return;
      }

      try {
        console.log(`Processing company: ${company.name}`);

        const companyStats = await this.processCompany(company, jobId);

        totalArticlesFound += companyStats.found;
        totalArticlesSaved += companyStats.saved;
        duplicatesSkipped += companyStats.duplicates;

        // Update job progress
        await prisma.pipelineJob.update({
          where: { id: jobId },
          data: {
            processedCompanies: { increment: 1 },
            successfulCompanies: { increment: 1 },
            totalArticlesFound,
            totalArticlesSaved,
            duplicatesSkipped,
          },
        });

        // Rate limiting: wait between companies
        await this.sleep(this.config.delayBetweenCompanies);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`Failed to process company ${company.name}:`, error);

        errors.push({
          company: company.name,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });

        await prisma.pipelineJob.update({
          where: { id: jobId },
          data: {
            processedCompanies: { increment: 1 },
            failedCompanies: { increment: 1 },
            errors: errors as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }

    // Mark job as completed
    const finalStatus =
      errors.length === companies.length ? "FAILED" : "COMPLETED";
    await prisma.pipelineJob.update({
      where: { id: jobId },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        errors: errors as unknown as Prisma.InputJsonValue,
      },
    });

    console.log(`Pipeline completed. Status: ${finalStatus}`);
  }

  /**
   * Process a single company
   */
  private async processCompany(
    company: {
      id: string;
      name: string;
      slug: string;
      sources: unknown;
      domainFilter: unknown;
    },
    _jobId: string,
  ): Promise<CompanyProcessingStats> {
    const sources = company.sources as Source[];
    const domainFilter = company.domainFilter as DomainFilter;

    // Collect all source URLs for strict path filtering
    const allSourceUrls = sources.map((s) => s.url);

    let totalFound = 0;
    let totalSaved = 0;
    let totalDuplicates = 0;

    for (const source of sources) {
      // Check if job was cancelled before processing each source
      const jobCheck = await prisma.pipelineJob.findUnique({
        where: { id: _jobId },
        select: { status: true },
      });

      if (jobCheck?.status === "CANCELLED") {
        console.log("Pipeline job was cancelled during source processing");
        return {
          found: totalFound,
          saved: totalSaved,
          duplicates: totalDuplicates,
        };
      }

      try {
        console.log(`  - Processing source: ${source.label} (${source.url})`);

        // Check if articles already exist for this company/source
        const existingArticles = await prisma.article.findMany({
          where: {
            companyId: company.id,
            sourceUrl: source.url,
          },
          select: {
            url: true,
            title: true,
            publishedAt: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
        });

        // Determine date range based on whether we've fetched before
        const isFirstFetch = existingArticles.length === 0;
        const dateRangeDays = isFirstFetch ? this.config.dateRangeDays : 2;
        const fetchContext = isFirstFetch
          ? "first fetch - getting all recent articles"
          : "subsequent fetch - only getting articles from yesterday and today";

        console.log(
          `    Fetch context: ${fetchContext} (${existingArticles.length} existing articles, ${dateRangeDays} days range)`,
        );

        // Search with Tavily
        const searchResults = await this.tavilyService.searchSourceContent(
          source.url,
          company.name,
          dateRangeDays,
          fetchContext,
        );

        console.log(`    Found ${searchResults.length} search results`);

        if (searchResults.length === 0) {
          continue;
        }

        // Extract articles with AI, passing existing articles as context and all source URLs for strict filtering
        const articles = await this.extractionAgent.extractArticlesWithRetry(
          searchResults,
          {
            slug: company.slug,
            name: company.name,
            domainFilter,
          },
          source.url,
          source.label,
          dateRangeDays,
          existingArticles,
          isFirstFetch,
          allSourceUrls,
        );

        console.log(`    Extracted ${articles.length} articles`);
        totalFound += articles.length;

        if (articles.length === 0) {
          continue;
        }

        // Persist to database
        const stats = await this.persistenceService.saveArticles(
          articles,
          company.id,
          source.url,
          source.label,
        );

        console.log(
          `    Saved ${stats.saved}, Duplicates ${stats.duplicates}, Errors ${stats.errors}`,
        );
        totalSaved += stats.saved;
        totalDuplicates += stats.duplicates;

        // Rate limiting between sources
        await this.sleep(this.config.delayBetweenSources);
      } catch (error) {
        console.error(`    Failed to process source ${source.url}:`, error);
        // Continue with next source
      }
    }

    return {
      found: totalFound,
      saved: totalSaved,
      duplicates: totalDuplicates,
    };
  }

  /**
   * Sleep helper for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test pipeline with a single company
   */
  async testWithCompany(companySlug: string): Promise<CompanyProcessingStats> {
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      throw new Error(`Company ${companySlug} not found`);
    }

    return await this.processCompany(company, "test");
  }
}
