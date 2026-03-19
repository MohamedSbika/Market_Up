/**
 * PATCH /api/dashboard/notifications/[id]/read
 * Marks a single notification as read.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import mongoose from 'mongoose';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await connectDB();

    // Ownership enforced by including companyId in the filter
    const updated = await Notification.findOneAndUpdate(
      { _id: id, companyId: session.user.id },
      { $set: { isRead: true } },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ notification: updated });
  } catch (err) {
    console.error('[PATCH /api/dashboard/notifications/[id]/read]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
