/**
 * GET /api/sponsoring
 * Returns the currently active sponsoring banner.
 * Priority: sector-specific → generic → null
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Sponsoring } from '@/models/Sponsoring';
import { z } from 'zod';

const querySchema = z.object({
  sector: z.string().max(100).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const parsed = querySchema.safeParse({ sector: searchParams.get('sector') ?? undefined });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { sector } = parsed.data;
    const now = new Date();

    await connectDB();

    const base = {
      status:    'active' as const,
      startDate: { $lte: now },
      endDate:   { $gte: now },
    };

    // Try sector-specific first, then fall back to generic
    let sponsor = null;

    if (sector) {
      sponsor = await Sponsoring.findOne({ ...base, sector }).lean();
    }

    if (!sponsor) {
      sponsor = await Sponsoring.findOne({ ...base, sector: 'generic' }).lean();
    }

    return NextResponse.json({ sponsor });
  } catch (err) {
    console.error('[GET /api/sponsoring]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
