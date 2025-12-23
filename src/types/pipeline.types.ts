export interface TavilyResult {
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
}

export interface CompanyProcessingStats {
  found: number;
  saved: number;
  duplicates: number;
}

export interface PipelineConfig {
  rateLimitPerMinute: number;
  articleLimitPerSource: number;
  dateRangeDays: number;
  batchSize: number;
}

export interface PipelineError {
  company: string;
  error: string;
  timestamp: string;
}
