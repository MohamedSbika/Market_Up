import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { newPasswordSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = newPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const company = await Company.findOne({
      resetPasswordToken:   parsed.data.token,
      resetPasswordExpires: { $gt: new Date() },
      isDeleted: false,
    });

    if (!company) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await Company.findByIdAndUpdate(company._id, {
      passwordHash,
      $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/auth/new-password]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
