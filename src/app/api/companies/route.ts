import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CreateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  slug: z.string().min(1, "Company slug is required"),
  category: z.array(z.string()).min(1, "At least one category is required"),
  dominanceBucket: z.string().min(1, "Dominance bucket is required"),
  domainKey: z.string().min(1, "Domain key is required"),
  domainFilter: z.object({
    include: z.array(z.string()),
    exclude: z.array(z.string()),
  }),
  sources: z.array(
    z.object({
      label: z.string(),
      url: z.string().url(),
    }),
  ),
});

const DeleteCompaniesSchema = z.object({
  companyIds: z.array(z.string()).min(1, "At least one company ID is required"),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "100", 10),
      1000,
    );
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = (searchParams.get("sortOrder") || "asc") as
      | "asc"
      | "desc";

    // Build orderBy based on sortBy field
    let orderBy: { name: "asc" | "desc" } | { slug: "asc" | "desc" };
    if (sortBy === "sources") {
      // Can't directly sort by JSON array length in Prisma, will sort in memory
      orderBy = { name: sortOrder };
    } else if (sortBy === "articles") {
      // Can't sort by _count in findMany, will sort in memory
      orderBy = { name: sortOrder };
    } else if (sortBy === "slug") {
      orderBy = { slug: sortOrder };
    } else {
      orderBy = { name: sortOrder };
    }

    let [companies, total] = await Promise.all([
      prisma.company.findMany({
        take: sortBy === "sources" || sortBy === "articles" ? undefined : limit,
        skip:
          sortBy === "sources" || sortBy === "articles" ? undefined : offset,
        orderBy,
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      }),
      prisma.company.count(),
    ]);

    // Sort in memory if needed for sources or articles count
    if (sortBy === "sources") {
      companies.sort((a, b) => {
        const aCount = (a.sources as Array<{ label: string; url: string }>)
          .length;
        const bCount = (b.sources as Array<{ label: string; url: string }>)
          .length;
        return sortOrder === "asc" ? aCount - bCount : bCount - aCount;
      });
      companies = companies.slice(offset, offset + limit);
    } else if (sortBy === "articles") {
      companies.sort((a, b) => {
        const aCount = a._count.articles;
        const bCount = b._count.articles;
        return sortOrder === "asc" ? aCount - bCount : bCount - aCount;
      });
      companies = companies.slice(offset, offset + limit);
    }

    return NextResponse.json({
      companies,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies", details: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateCompanySchema.parse(body);

    // Check if company with this slug already exists
    const existing = await prisma.company.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A company with this slug already exists" },
        { status: 409 },
      );
    }

    const company = await prisma.company.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        dominanceBucket: data.dominanceBucket,
        domainKey: data.domainKey,
        domainFilter: data.domainFilter,
        sources: data.sources,
      },
    });

    return NextResponse.json({
      success: true,
      company,
      message: `Company "${data.name}" created successfully`,
    });
  } catch (error) {
    console.error("Failed to create company:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create company", details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyIds } = DeleteCompaniesSchema.parse(body);

    // Delete companies and their related articles (cascade)
    const result = await prisma.company.deleteMany({
      where: {
        id: {
          in: companyIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} compan${result.count === 1 ? "y" : "ies"}`,
    });
  } catch (error) {
    console.error("Failed to delete companies:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete companies", details: String(error) },
      { status: 500 },
    );
  }
}
