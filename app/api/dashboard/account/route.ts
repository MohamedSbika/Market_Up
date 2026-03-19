/**
 * GET  /api/dashboard/account — Get company account info
 * PUT  /api/dashboard/account — Update name, phone, taxId, logo
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { updateAccountSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const company = await Company.findById(session.user.id)
      .select('-passwordHash')
      .lean();

    if (!company) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (err) {
    console.error('[GET /api/dashboard/account]', err);
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
    const parsed = updateAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    // Verify ownership — session.user.id must match the company being updated
    const company = await Company.findById(session.user.id).select('_id');
    if (!company) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, phone, taxId, logo } = parsed.data;

    const updated = await Company.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          ...(name  !== undefined && { name }),
          ...(phone !== undefined && { phone: phone || undefined }),
          ...(taxId !== undefined && { taxId: taxId || undefined }),
          ...(logo  !== undefined && { logo: logo || undefined }),
        },
      },
      { new: true }
    )
      .select('-passwordHash')
      .lean();

    return NextResponse.json({ company: updated });
  } catch (err) {
    console.error('[PUT /api/dashboard/account]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
