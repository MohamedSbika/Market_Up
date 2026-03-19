/**
 * GET /api/dashboard/linkup  — Get LinkUp profile
 * PUT /api/dashboard/linkup  — Update LinkUp links + visibility
 *
 * Business rule: if isPublic === true, whatsapp AND gpsUrl must be non-empty.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { LinkUpProfile } from '@/models/LinkUpProfile';
import { updateLinkUpSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const profile = await LinkUpProfile.findOne({ companyId: session.user.id }).lean();
    if (!profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[GET /api/dashboard/linkup]', err);
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
    const parsed = updateLinkUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const current = await LinkUpProfile.findOne({ companyId: session.user.id })
      .select('status whatsapp gpsUrl')
      .lean<{ status: string; whatsapp: string; gpsUrl: string }>();

    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { isPublic, whatsapp, gpsUrl, ...links } = parsed.data;

    // Business rule: publishing requires whatsapp + gpsUrl
    const effectiveWhatsapp = whatsapp ?? current.whatsapp;
    const effectiveGpsUrl   = gpsUrl   ?? current.gpsUrl;

    if (isPublic === true && (!effectiveWhatsapp || !effectiveGpsUrl)) {
      return NextResponse.json(
        { error: { fieldErrors: { _form: ['WhatsApp and GPS URL are required to publish the LinkUp profile'] } } },
        { status: 400 }
      );
    }

    let newStatus = current.status;
    if (isPublic === false) {
      newStatus = 'disabled';
    } else if (isPublic === true && current.status === 'disabled') {
      newStatus = 'pending';
    } else if (Object.keys({ whatsapp, gpsUrl, ...links }).some((k) => parsed.data[k as keyof typeof parsed.data] !== undefined)) {
      newStatus = 'pending';
    }

    const updatePayload: Record<string, unknown> = { status: newStatus };
    if (whatsapp !== undefined) updatePayload.whatsapp  = whatsapp;
    if (gpsUrl   !== undefined) updatePayload.gpsUrl    = gpsUrl;
    for (const [key, value] of Object.entries(links)) {
      if (value !== undefined) updatePayload[key] = value || undefined;
    }

    const updated = await LinkUpProfile.findOneAndUpdate(
      { companyId: session.user.id },
      { $set: updatePayload },
      { new: true }
    ).lean();

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error('[PUT /api/dashboard/linkup]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
