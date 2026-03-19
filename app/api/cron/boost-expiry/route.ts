/**
 * GET /api/cron/boost-expiry
 * Daily cron job: find boosts expiring in ≤ 3 days and send warning notifications.
 * Protected by CRON_SECRET header.
 *
 * Vercel cron config (vercel.json):
 * { "crons": [{ "path": "/api/cron/boost-expiry", "schedule": "0 9 * * *" }] }
 */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Boost } from '@/models/Boost';
import { Notification } from '@/models/Notification';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const now     = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find active paid boosts expiring within 3 days
    const expiringBoosts = await Boost.find({
      status:        'active',
      paymentStatus: 'paid',
      endDate:       { $lte: in3Days, $gte: now },
    }).lean<Array<{
      _id: { toString(): string };
      companyId: { toString(): string };
      profileType: string;
      endDate: Date;
    }>>();

    let notified = 0;

    for (const boost of expiringBoosts) {
      const companyId  = boost.companyId.toString();
      const daysLeft   = Math.ceil((boost.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      // Check if a warning was already sent in the last 24h to avoid duplicates
      const recentNotif = await Notification.findOne({
        companyId,
        type:      'boost_expiring_soon',
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        'data.profileType': boost.profileType,
      });

      if (recentNotif) continue;

      await createNotification(companyId, 'boost_expiring_soon', {
        profileType: boost.profileType,
        daysLeft,
      });

      notified++;
    }

    console.info(`[CRON /boost-expiry] Processed ${expiringBoosts.length} boosts, sent ${notified} warnings`);

    return NextResponse.json({
      ok:       true,
      checked:  expiringBoosts.length,
      notified,
    });
  } catch (err) {
    console.error('[GET /api/cron/boost-expiry]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
