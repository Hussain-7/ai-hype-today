import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const DeleteArticlesSchema = z.object({
  articleIds: z.array(z.string()).min(1, "At least one article ID is required"),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "50", 10),
      1000,
    );
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);
    const sortBy = searchParams.get("sortBy") || "publishedAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build orderBy based on sortBy field
    let orderBy:
      | { company: { name: "asc" | "desc" } }
      | { sourceLabel: "asc" | "desc" }
      | { title: "asc" | "desc" }
      | { publishedAt: "asc" | "desc" };

    if (sortBy === "company") {
      orderBy = { company: { name: sortOrder } };
    } else if (sortBy === "source") {
      orderBy = { sourceLabel: sortOrder };
    } else if (sortBy === "title") {
      orderBy = { title: sortOrder };
    } else {
      orderBy = { publishedAt: sortOrder };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        take: limit,
        skip: offset,
        orderBy,
        include: {
          company: {
            select: {
              name: true,
              slug: true,
              dominanceBucket: true,
              category: true,
            },
          },
        },
      }),
      prisma.article.count(),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles", details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleIds } = DeleteArticlesSchema.parse(body);

    // Delete articles in batch
    const result = await prisma.article.deleteMany({
      where: {
        id: {
          in: articleIds,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} article${result.count === 1 ? "" : "s"}`,
    });
  } catch (error) {
    console.error("Failed to delete articles:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete articles", details: String(error) },
      { status: 500 },
    );
  }
}
