/**
 * GET  /api/dashboard/rse — Get RSE badge + donations
 * POST /api/dashboard/rse — Submit a new donation
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { RSEBadge } from '@/models/RSEBadge';
import { addDonationSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const rse = await RSEBadge.findOne({ companyId: session.user.id }).lean();
    if (!rse) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ rse });
  } catch (err) {
    console.error('[GET /api/dashboard/rse]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = addDonationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { beneficiary, amount, receiptUrl } = parsed.data;

    await connectDB();

    // Verify RSE badge exists for this company
    const rse = await RSEBadge.findOne({ companyId: session.user.id }).select('_id');
    if (!rse) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await RSEBadge.findOneAndUpdate(
      { companyId: session.user.id },
      {
        $push: {
          donations: {
            beneficiary,
            amount,
            receiptUrl,
            status: 'pending',
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).lean();

    return NextResponse.json({ rse: updated }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/dashboard/rse]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
