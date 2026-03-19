/**
 * GET /api/dashboard/notifications
 * Returns paginated notifications for the logged-in company.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { z } from 'zod';

const querySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const parsed = querySchema.safeParse({
      page:  searchParams.get('page')  ?? '1',
      limit: searchParams.get('limit') ?? '20',
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { page, limit } = parsed.data;
    const companyId = session.user.id;

    await connectDB();

    const [notifications, total] = await Promise.all([
      Notification.find({ companyId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ companyId }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[GET /api/dashboard/notifications]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
