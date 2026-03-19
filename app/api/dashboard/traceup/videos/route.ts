/**
 * POST /api/dashboard/traceup/videos
 * Add a YouTube video to the TraceUp profile.
 * Adding/removing videos does NOT trigger status: 'pending'.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { TraceUpProfile } from '@/models/TraceUpProfile';
import { addVideoSchema } from '@/lib/validations';
import { extractYouTubeId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addVideoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { youtubeUrl, title, description, category } = parsed.data;

    // Validate YouTube URL extracts a valid ID
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: { fieldErrors: { youtubeUrl: ['Could not extract YouTube video ID'] } } },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify ownership
    const profile = await TraceUpProfile.findOne({ companyId: session.user.id })
      .select('_id')
      .lean();

    if (!profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await TraceUpProfile.findOneAndUpdate(
      { companyId: session.user.id },
      {
        $push: {
          videos: {
            youtubeUrl,
            title,
            description: description || undefined,
            category,
            addedAt: new Date(),
          },
        },
      },
      { new: true }
    ).lean();

    return NextResponse.json({ profile: updated }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/dashboard/traceup/videos]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
