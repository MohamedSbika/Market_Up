/**
 * GET /api/dashboard/traceup — Get TraceUp profile
 * PUT /api/dashboard/traceup — Update visibility (isPublic toggle)
 *
 * Note: Adding/removing videos does NOT trigger status: 'pending'
 * Only the isPublic toggle affects status.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { TraceUpProfile } from '@/models/TraceUpProfile';
import { updateTraceUpSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const profile = await TraceUpProfile.findOne({ companyId: session.user.id }).lean();
    if (!profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[GET /api/dashboard/traceup]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateTraceUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const current = await TraceUpProfile.findOne({ companyId: session.user.id })
      .select('status')
      .lean<{ status: string }>();

    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { isPublic } = parsed.data;

    let newStatus = current.status;
    if (isPublic === false) {
      newStatus = 'disabled';
    } else if (isPublic === true && current.status === 'disabled') {
      newStatus = 'pending';
    }

    const updated = await TraceUpProfile.findOneAndUpdate(
      { companyId: session.user.id },
      { $set: { status: newStatus } },
      { new: true }
    ).lean();

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error('[PUT /api/dashboard/traceup]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
