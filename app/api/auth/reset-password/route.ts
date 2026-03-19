import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { resetPasswordSchema } from '@/lib/validations';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const company = await Company.findOne({ email: parsed.data.email, isDeleted: false });

    // Always return 200 to prevent email enumeration
    if (!company) {
      return NextResponse.json({ success: true });
    }

    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await Company.findByIdAndUpdate(company._id, {
      resetPasswordToken:   token,
      resetPasswordExpires: expiresAt,
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/new-password?token=${token}`;

    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Segoe UI',system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0"
           style="background:#FFFFFF;border:1px solid #E0E0E0;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#0078D4;padding:24px 32px;">
        <span style="color:#FFFFFF;font-size:22px;font-weight:700;">MARKETUP</span>
      </td></tr>
      <tr><td style="padding:32px;">
        <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#242424;">Réinitialisation du mot de passe</h2>
        <p style="margin:0 0 12px;font-size:15px;color:#242424;line-height:1.6;">Bonjour <strong>${company.name}</strong>,</p>
        <p style="margin:0 0 12px;font-size:15px;color:#242424;line-height:1.6;">Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe. Ce lien est valable 1 heure.</p>
        <div style="margin:24px 0 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#0078D4;color:#FFFFFF;padding:10px 24px;border-radius:4px;font-weight:600;font-size:14px;text-decoration:none;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="margin:24px 0 0;font-size:13px;color:#616161;">Si vous n'avez pas demandé de réinitialisation, ignorez cet email.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

    await sendEmail({
      to:      company.email,
      subject: 'Réinitialisation de votre mot de passe MARKET-UP',
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
