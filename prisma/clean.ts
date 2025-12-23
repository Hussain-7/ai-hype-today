import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import pg from "pg";

// Load environment variables
dotenv.config();

// Create connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting complete database cleanup...");
  console.log(
    "⚠️  This will delete ALL data including articles, jobs, and companies\n",
  );

  try {
    // Delete all articles first (due to foreign key constraints)
    const deletedArticles = await prisma.article.deleteMany({});
    console.log(`🗑️  Deleted ${deletedArticles.count} articles`);

    // Delete all pipeline jobs
    const deletedJobs = await prisma.pipelineJob.deleteMany({});
    console.log(`🗑️  Deleted ${deletedJobs.count} pipeline jobs`);

    // Delete all companies
    const deletedCompanies = await prisma.company.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCompanies.count} companies`);

    console.log(`\n✅ Database completely cleared!`);
    console.log(
      `💡 Run "pnpm db:seed" to repopulate companies from sources.json`,
    );
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
