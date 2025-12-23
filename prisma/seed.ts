import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import sourcesData from "../src/constants/sources.json";

// Create connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  for (const company of sourcesData) {
    console.log(`Seeding company: ${company.company}`);

    await prisma.company.upsert({
      where: { slug: company.slug },
      update: {
        name: company.company,
        category: company.category,
        dominanceBucket: company.dominance_bucket,
        domainKey: company.domain_key,
        domainFilter: company.domain_filter,
        sources: company.sources,
      },
      create: {
        name: company.company,
        slug: company.slug,
        category: company.category,
        dominanceBucket: company.dominance_bucket,
        domainKey: company.domain_key,
        domainFilter: company.domain_filter,
        sources: company.sources,
      },
    });
  }

  const companyCount = await prisma.company.count();
  console.log(`\nSeeding complete! Total companies: ${companyCount}`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
