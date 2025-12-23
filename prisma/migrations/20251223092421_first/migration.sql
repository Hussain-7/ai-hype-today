-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT[],
    "dominance_bucket" TEXT NOT NULL,
    "domain_key" TEXT NOT NULL,
    "domain_filter" JSONB NOT NULL,
    "sources" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL,
    "company_id" TEXT NOT NULL,
    "source_url" TEXT,
    "source_label" TEXT,
    "domain" TEXT NOT NULL,
    "author" TEXT,
    "image_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "extracted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_jobs" (
    "id" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "total_companies" INTEGER NOT NULL,
    "processed_companies" INTEGER NOT NULL DEFAULT 0,
    "successful_companies" INTEGER NOT NULL DEFAULT 0,
    "failed_companies" INTEGER NOT NULL DEFAULT 0,
    "total_articles_found" INTEGER NOT NULL DEFAULT 0,
    "total_articles_saved" INTEGER NOT NULL DEFAULT 0,
    "duplicates_skipped" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "triggered_by" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_slug_idx" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_dominance_bucket_idx" ON "companies"("dominance_bucket");

-- CreateIndex
CREATE UNIQUE INDEX "articles_url_key" ON "articles"("url");

-- CreateIndex
CREATE INDEX "articles_company_id_idx" ON "articles"("company_id");

-- CreateIndex
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at");

-- CreateIndex
CREATE INDEX "articles_domain_idx" ON "articles"("domain");

-- CreateIndex
CREATE INDEX "articles_extracted_at_idx" ON "articles"("extracted_at");

-- CreateIndex
CREATE INDEX "articles_company_id_published_at_idx" ON "articles"("company_id", "published_at");

-- CreateIndex
CREATE INDEX "pipeline_jobs_status_idx" ON "pipeline_jobs"("status");

-- CreateIndex
CREATE INDEX "pipeline_jobs_created_at_idx" ON "pipeline_jobs"("created_at");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
