/**
 * DELETE /api/dashboard/traceup/videos/[videoId]
 * Remove a video by its subdocument _id.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { TraceUpProfile } from '@/models/TraceUpProfile';
import mongoose from 'mongoose';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await params;

    if (!mongoose.isValidObjectId(videoId)) {
      return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
    }

    await connectDB();

    // $pull removes the matching subdocument — ownership guaranteed by companyId
    const updated = await TraceUpProfile.findOneAndUpdate(
      { companyId: session.user.id },
      { $pull: { videos: { _id: new mongoose.Types.ObjectId(videoId) } } },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error('[DELETE /api/dashboard/traceup/videos/[videoId]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
