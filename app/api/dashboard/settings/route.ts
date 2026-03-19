/**
 * PUT /api/dashboard/settings
 * Change company password.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { changePasswordSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    await connectDB();

    // Fetch company with passwordHash for verification
    const company = await Company.findById(session.user.id).select('+passwordHash');
    if (!company) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, company.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { fieldErrors: { currentPassword: ['Current password is incorrect'] } } },
        { status: 400 }
      );
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    await Company.findByIdAndUpdate(session.user.id, { passwordHash: newHash });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PUT /api/dashboard/settings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
