/**
 * GET /api/dashboard/billing — List billing records for the logged-in company
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { BillingRecord } from '@/models/BillingRecord';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const records = await BillingRecord.find({ companyId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ records });
  } catch (err) {
    console.error('[GET /api/dashboard/billing]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
