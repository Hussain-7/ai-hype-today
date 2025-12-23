import { prisma } from '@/lib/prisma';
import { DomainFilterService } from './domain-filter.service';
import type { Article } from '@/schemas/article.schema';

interface PersistenceStats {
  saved: number;
  duplicates: number;
  errors: number;
}

export class ArticlePersistenceService {
  /**
   * Save articles to database with duplicate handling
   */
  async saveArticles(
    articles: Article[],
    companyId: string,
    sourceUrl: string,
    sourceLabel: string
  ): Promise<PersistenceStats> {
    const stats: PersistenceStats = {
      saved: 0,
      duplicates: 0,
      errors: 0,
    };

    for (const article of articles) {
      try {
        const existing = await prisma.article.findUnique({
          where: { url: article.url },
        });

        if (existing) {
          stats.duplicates++;
          continue;
        }

        await prisma.article.create({
          data: {
            url: article.url,
            title: article.title,
            description: article.description || null,
            publishedAt: new Date(article.publishedAt),
            companyId,
            author: article.author || null,
            tags: article.tags || [],
            sourceUrl,
            sourceLabel,
            domain: DomainFilterService.extractDomain(article.url),
          },
        });

        stats.saved++;
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Unique constraint violation (race condition)
          stats.duplicates++;
        } else {
          stats.errors++;
          console.error(`Failed to save article ${article.url}:`, error);
        }
      }
    }

    return stats;
  }

  /**
   * Batch upsert articles for better performance
   */
  async upsertArticles(
    articles: Article[],
    companyId: string,
    sourceUrl: string,
    sourceLabel: string
  ): Promise<PersistenceStats> {
    const stats: PersistenceStats = {
      saved: 0,
      duplicates: 0,
      errors: 0,
    };

    for (const article of articles) {
      try {
        const result = await prisma.article.upsert({
          where: { url: article.url },
          update: {
            title: article.title,
            description: article.description || null,
            publishedAt: new Date(article.publishedAt),
            author: article.author || null,
            tags: article.tags || [],
            sourceUrl,
            sourceLabel,
            domain: DomainFilterService.extractDomain(article.url),
          },
          create: {
            url: article.url,
            title: article.title,
            description: article.description || null,
            publishedAt: new Date(article.publishedAt),
            companyId,
            author: article.author || null,
            tags: article.tags || [],
            sourceUrl,
            sourceLabel,
            domain: DomainFilterService.extractDomain(article.url),
          },
        });

        // Check if it was created or updated
        const wasCreated =
          result.createdAt.getTime() === result.updatedAt.getTime();
        if (wasCreated) {
          stats.saved++;
        } else {
          stats.duplicates++;
        }
      } catch (error: any) {
        stats.errors++;
        console.error(`Failed to upsert article ${article.url}:`, error);
      }
    }

    return stats;
  }

  /**
   * Get articles count for a company
   */
  async getArticleCount(companyId: string): Promise<number> {
    return await prisma.article.count({
      where: { companyId },
    });
  }

  /**
   * Get recent articles for a company
   */
  async getRecentArticles(companyId: string, limit = 10) {
    return await prisma.article.findMany({
      where: { companyId },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }
}
