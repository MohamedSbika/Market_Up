/**
 * GET /api/dashboard/stats
 * Returns aggregated stats for the logged-in company's dashboard overview.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { BrandUpProfile } from '@/models/BrandUpProfile';
import { TraceUpProfile } from '@/models/TraceUpProfile';
import { LinkUpProfile } from '@/models/LinkUpProfile';
import { Boost } from '@/models/Boost';
import { RSEBadge } from '@/models/RSEBadge';
import { Notification } from '@/models/Notification';
import { isBoostActive } from '@/lib/utils';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.id;
    await connectDB();

    // Fetch all data in parallel
    const [brandUp, traceUp, linkUp, activeBoost, rse, unreadCount] = await Promise.all([
      BrandUpProfile.findOne({ companyId }).select('status viewCount').lean<{ status: string; viewCount: number }>(),
      TraceUpProfile.findOne({ companyId }).select('status viewCount').lean<{ status: string; viewCount: number }>(),
      LinkUpProfile.findOne({ companyId }).select('status viewCount').lean<{ status: string; viewCount: number }>(),
      Boost.findOne({ companyId, paymentStatus: 'paid' })
        .sort({ createdAt: -1 })
        .lean(),
      RSEBadge.findOne({ companyId })
        .select('badgeActive donations')
        .lean<{
          badgeActive: boolean;
          donations: Array<{ status: string; beneficiary: string; amount: number; createdAt: Date }>;
        }>(),
      Notification.countDocuments({ companyId, isRead: false }),
    ]);

    const totalViews   = (brandUp?.viewCount ?? 0) + (traceUp?.viewCount ?? 0) + (linkUp?.viewCount ?? 0);

    // Check if the fetched boost is still active
    const boostActive =
      activeBoost && isBoostActive({
        isBoostActive: (activeBoost as { isBoostActive?: boolean }).isBoostActive ?? false,
        boostExpiresAt: (activeBoost as { endDate?: Date }).endDate,
      })
        ? activeBoost
        : null;

    // Last donation for RSE section
    const lastDonation = rse?.donations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return NextResponse.json({
      views: {
        total:          totalViews,
        brandup:        brandUp?.viewCount ?? 0,
        traceup:        traceUp?.viewCount ?? 0,
        linkup:         linkUp?.viewCount ?? 0,
        // Deltas are 0 for now — would require historical snapshots
        totalDelta:     0,
        brandupDelta:   0,
        traceupDelta:   0,
        linkupDelta:    0,
      },
      activeBoost: boostActive,
      rse: {
        badgeActive:  rse?.badgeActive ?? false,
        lastDonation: lastDonation,
      },
      profiles: {
        brandup: brandUp ? { status: brandUp.status,  viewCount: brandUp.viewCount }  : null,
        traceup: traceUp ? { status: traceUp.status,  viewCount: traceUp.viewCount }  : null,
        linkup:  linkUp  ? { status: linkUp.status,   viewCount: linkUp.viewCount }   : null,
      },
      unreadNotifications: unreadCount,
    });
  } catch (err) {
    console.error('[GET /api/dashboard/stats]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
