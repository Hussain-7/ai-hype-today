import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '10'), 50);

    const jobs = await prisma.pipelineJob.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: String(error) },
      { status: 500 }
    );
  }
}
