/**
 * GET /api/dashboard/brandup — Get BrandUp profile for the logged-in company
 * PUT /api/dashboard/brandup — Update BrandUp profile fields
 *
 * Status transition logic (per CLAUDE.md):
 *   isPublic: false        → status = 'disabled'   (immediate, no review)
 *   isPublic: true + was disabled → status = 'pending'
 *   any field changed      → status = 'pending'
 *   else                   → keep current status
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { BrandUpProfile } from '@/models/BrandUpProfile';
import { updateBrandUpSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const profile = await BrandUpProfile.findOne({ companyId: session.user.id }).lean();
    if (!profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[GET /api/dashboard/brandup]', err);
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
    const parsed = updateBrandUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    // Verify ownership
    const current = await BrandUpProfile.findOne({ companyId: session.user.id })
      .select('status')
      .lean<{ status: string }>();

    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { isPublic, ...fields } = parsed.data;

    // Determine new status
    let newStatus: string = current.status;

    if (isPublic === false) {
      newStatus = 'disabled';
    } else if (isPublic === true && current.status === 'disabled') {
      newStatus = 'pending';
    } else if (Object.keys(fields).length > 0) {
      // Any content field changed triggers review
      newStatus = 'pending';
    }

    // Build update payload (exclude undefined optional fields)
    const updatePayload: Record<string, unknown> = { status: newStatus };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updatePayload[key] = value === '' ? null : value;
      }
    }

    const updated = await BrandUpProfile.findOneAndUpdate(
      { companyId: session.user.id },
      { $set: updatePayload },
      { new: true }
    ).lean();

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error('[PUT /api/dashboard/brandup]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
