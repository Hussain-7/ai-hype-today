import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "50", 10),
      1000,
    );
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          publishedAt: "desc",
        },
        include: {
          company: {
            select: {
              name: true,
              slug: true,
              dominanceBucket: true,
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
