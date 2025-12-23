import { z } from 'zod';

export const ArticleSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  description: z.string().optional(),
  publishedAt: z.string().datetime(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const ArticleListSchema = z.object({
  articles: z.array(ArticleSchema),
});

export type Article = z.infer<typeof ArticleSchema>;
export type ArticleList = z.infer<typeof ArticleListSchema>;
