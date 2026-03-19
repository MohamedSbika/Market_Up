/**
 * PATCH /api/dashboard/notifications/read-all
 * Marks all unread notifications as read for the logged-in company.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const result = await Notification.updateMany(
      { companyId: session.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ updated: result.modifiedCount });
  } catch (err) {
    console.error('[PATCH /api/dashboard/notifications/read-all]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
