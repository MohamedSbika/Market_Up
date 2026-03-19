/**
 * POST /api/dashboard/boost — Initiate a boost purchase
 * GET  /api/dashboard/boost — List company's boost history
 *
 * Payment flow:
 *   1. Create Boost record (paymentStatus: 'pending')
 *   2. Initiate payment with Konnect/ClicToPay (stubbed — returns mock paymentUrl)
 *   3. Payment webhook (separate route) confirms and activates
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Boost } from '@/models/Boost';
import { BrandUpProfile } from '@/models/BrandUpProfile';
import { TraceUpProfile } from '@/models/TraceUpProfile';
import { LinkUpProfile } from '@/models/LinkUpProfile';
import { createBoostSchema } from '@/lib/validations';
import { computeTTC, computeTVA } from '@/lib/utils';

// Boost pricing in DT HT
const BOOST_PRICE_PER_DAY = 5; // 5 DT/day HT

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createBoostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { profileType, durationDays } = parsed.data;
    const companyId = session.user.id;

    await connectDB();

    // Check no active boost exists for this profile type
    const existing = await Boost.findOne({
      companyId,
      profileType,
      status: 'active',
      paymentStatus: 'paid',
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An active boost already exists for this profile' },
        { status: 409 }
      );
    }

    // Resolve profile to get its _id
    const ProfileModel =
      profileType === 'brandup' ? BrandUpProfile :
      profileType === 'traceup' ? TraceUpProfile :
      LinkUpProfile;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await (ProfileModel as any).findOne({ companyId })
      .select('_id status viewCount')
      .lean() as { _id: { toString(): string }; status: string; viewCount: number } | null;

    if (!profile || profile.status !== 'active') {
      return NextResponse.json(
        { error: 'Profile must be active before purchasing a boost' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    const endDate   = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const amountHT  = BOOST_PRICE_PER_DAY * durationDays;
    const amountTTC = computeTTC(amountHT);

    // Create boost record
    const boost = await Boost.create({
      companyId,
      profileType,
      profileId:     profile._id,
      status:        'active',
      startDate,
      endDate,
      amount:        amountHT,
      amountTTC,
      paymentStatus: 'pending',
      viewsAtStart:  profile.viewCount,
    });

    // Stub payment initiation
    // In production: call Konnect TN or ClicToPay API here
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/boost?payment=pending&boostId=${boost._id}`;

    return NextResponse.json({ paymentUrl, boostId: boost._id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/dashboard/boost]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const boosts = await Boost.find({ companyId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ boosts });
  } catch (err) {
    console.error('[GET /api/dashboard/boost]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
