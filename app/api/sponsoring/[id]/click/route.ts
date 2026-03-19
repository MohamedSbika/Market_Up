/**
 * POST /api/sponsoring/[id]/click
 * Increments clickCount for the given sponsoring banner.
 * Called client-side when a user clicks on the ad.
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Sponsoring } from '@/models/Sponsoring';
import mongoose from 'mongoose';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await connectDB();

    const updated = await Sponsoring.findByIdAndUpdate(
      id,
      { $inc: { clickCount: 1 } },
      { new: true }
    ).select('targetUrl').lean<{ targetUrl: string }>();

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, targetUrl: updated.targetUrl });
  } catch (err) {
    console.error('[POST /api/sponsoring/[id]/click]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
