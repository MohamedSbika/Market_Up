/**
 * GET /api/companies/[slug]
 * Returns full public profile data.
 * Side effect: increments viewCount server-side.
 * Skip increment when the requesting session owns this profile.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { BrandUpProfile } from '@/models/BrandUpProfile';
import { TraceUpProfile } from '@/models/TraceUpProfile';
import { LinkUpProfile } from '@/models/LinkUpProfile';
import { RSEBadge } from '@/models/RSEBadge';
import { isBoostActive } from '@/lib/utils';
import { z } from 'zod';

const querySchema = z.object({
  type: z.enum(['brandup', 'traceup', 'linkup']),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = req.nextUrl;

    const parsed = querySchema.safeParse({ type: searchParams.get('type') });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Query param "type" must be brandup | traceup | linkup' },
        { status: 400 }
      );
    }

    const { type } = parsed.data;

    await connectDB();

    // Resolve profile model
    const ProfileModel =
      type === 'brandup' ? BrandUpProfile :
      type === 'traceup' ? TraceUpProfile :
      LinkUpProfile;

    // Fetch company (never expose passwordHash)
    const company = await Company.findOne({
      slug,
      isDeleted: false,
      status: { $ne: 'suspended' },
    })
      .select('-passwordHash')
      .lean<{
        _id: { toString(): string };
        slug: string;
        name: string;
        email: string;
        type: string;
        status: string;
        logo?: string;
      }>();

    if (!company) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch the specific profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await (ProfileModel as any).findOne({
      companyId: company._id,
      slug,
      status: 'active',
    }).lean();

    if (!profile) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Compute boost status server-side
    const profileTyped = profile as {
      _id: { toString(): string };
      isBoostActive: boolean;
      boostExpiresAt?: Date;
      viewCount: number;
    };

    const boosted = isBoostActive({
      isBoostActive: profileTyped.isBoostActive,
      boostExpiresAt: profileTyped.boostExpiresAt,
    });

    // RSE badge — last 2 validated donations
    const rseBadge = await RSEBadge.findOne({ companyId: company._id }).lean<{
      badgeActive: boolean;
      donations: Array<{
        beneficiary: string;
        amount: number;
        status: string;
        validatedAt?: Date;
      }>;
    }>();

    const rse = rseBadge
      ? {
          badgeActive: rseBadge.badgeActive,
          lastReceipts: rseBadge.donations
            .filter((d) => d.status === 'validated')
            .sort((a, b) => {
              const aTime = a.validatedAt ? new Date(a.validatedAt).getTime() : 0;
              const bTime = b.validatedAt ? new Date(b.validatedAt).getTime() : 0;
              return bTime - aTime;
            })
            .slice(0, 2)
            .map((d) => ({
              beneficiary: d.beneficiary,
              amount:      d.amount,
              validatedAt: d.validatedAt?.toISOString() ?? '',
            })),
        }
      : undefined;

    // Increment viewCount — skip if the viewer owns this profile
    const session = await auth();
    const isOwner = session?.user?.slug === slug;

    if (!isOwner) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ProfileModel as any).findOneAndUpdate(
        { companyId: company._id, slug },
        { $inc: { viewCount: 1 } }
      );
    }

    return NextResponse.json({
      company,
      profile: { ...profileTyped, isBoostActive: boosted },
      profileType: type,
      rse,
    });
  } catch (err) {
    console.error('[GET /api/companies/[slug]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
