/**
 * POST /api/dashboard/sponsoring — Submit a sponsoring order
 * GET  /api/dashboard/sponsoring — List company's sponsoring orders
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { SponsoringOrder } from '@/models/SponsoringOrder';
import { createSponsoringOrderSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createSponsoringOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, imageUrl, targetUrl, sector, desiredStart, desiredEnd } = parsed.data;

    await connectDB();

    const order = await SponsoringOrder.create({
      companyId:     session.user.id,
      name,
      imageUrl,
      targetUrl,
      sector,
      desiredStart:  desiredStart ? new Date(desiredStart) : undefined,
      desiredEnd:    desiredEnd   ? new Date(desiredEnd)   : undefined,
      paymentStatus: 'pending',
      adminStatus:   'pending',
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/dashboard/sponsoring]', err);
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

    const orders = await SponsoringOrder.find({ companyId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[GET /api/dashboard/sponsoring]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
