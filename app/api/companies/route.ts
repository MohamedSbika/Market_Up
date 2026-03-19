/**
 * POST /api/companies — Company registration
 * GET  /api/companies — Search companies (public)
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { BrandUpProfile } from '@/models/BrandUpProfile';
import { TraceUpProfile } from '@/models/TraceUpProfile';
import { LinkUpProfile } from '@/models/LinkUpProfile';
import { RSEBadge } from '@/models/RSEBadge';
import { Sponsoring } from '@/models/Sponsoring';
import { getUniqueSlug, isBoostActive } from '@/lib/utils';
import { signUpSchema, searchQuerySchema } from '@/lib/validations';
import type { SearchCompanyItem } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// POST — Register a new company
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, type, rneNumber, taxId, sector, city } = parsed.data;

    await connectDB();

    // Check email uniqueness
    const existing = await Company.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (existing) {
      return NextResponse.json(
        { error: { fieldErrors: { email: ['This email is already registered'] } } },
        { status: 409 }
      );
    }

    // Hash password — rounds: 12 as per spec
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate unique slug from company name
    const slug = await getUniqueSlug(name, Company);

    // Create company (status: pending, emailVerified: false)
    const company = await Company.create({
      slug,
      email: email.toLowerCase(),
      passwordHash,
      type,
      name,
      rneNumber,
      taxId: taxId || undefined,
      status: 'pending',
      emailVerified: false,
    });

    const companyId = company._id;

    // Create all 3 profiles simultaneously
    await Promise.all([
      BrandUpProfile.create({ companyId, slug, status: 'pending' }),
      TraceUpProfile.create({ companyId, slug, status: 'pending' }),
      LinkUpProfile.create({ companyId, slug, status: 'pending' }),
      RSEBadge.create({ companyId, badgeActive: false }),
    ]);

    // TODO: Send confirmation email via Resend when email verification flow is implemented
    // await sendEmail({ to: email, subject: 'Vérifiez votre email', html: verifyTemplate(slug) });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/companies]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET — Search companies
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const queryObj = Object.fromEntries(searchParams.entries());

    const parsed = searchQuerySchema.safeParse(queryObj);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { q, type, sector, city, market, page, limit } = parsed.data;

    await connectDB();

    // Resolve the correct profile model
    const ProfileModel =
      type === 'brandup' ? BrandUpProfile :
      type === 'traceup' ? TraceUpProfile :
      LinkUpProfile;

    const now = new Date();

    // Build profile filter
    const profileFilter: Record<string, unknown> = { status: 'active' };

    // Build company filter
    const companyFilter: Record<string, unknown> = { status: 'active', isDeleted: false };
    if (market) companyFilter.type = market;

    // Sector/city filters on BrandUp only (TraceUp/LinkUp don't have sector)
    if (type === 'brandup') {
      if (sector) profileFilter.sector = { $regex: new RegExp(sector, 'i') };
      if (city)   profileFilter.city   = { $regex: new RegExp(city, 'i') };
    }

    // Fetch matching companies
    let companyQuery = Company.find(companyFilter).select('-passwordHash').lean();
    if (q) {
      companyQuery = Company.find({
        ...companyFilter,
        name: { $regex: new RegExp(q, 'i') },
      }).select('-passwordHash').lean();
    }

    const companies = await companyQuery;
    const companyIds = companies.map((c) => c._id);

    // Fetch profiles for those companies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profiles = await (ProfileModel as any).find({
      ...profileFilter,
      companyId: { $in: companyIds },
    }).lean();

    // Fetch RSE badges
    const rseBadges = await RSEBadge.find({
      companyId: { $in: companyIds },
      badgeActive: true,
    })
      .select('companyId')
      .lean<Array<{ companyId: { toString(): string } }>>();

    const rseSet = new Set(rseBadges.map((r) => r.companyId.toString()));

    // Build lookup maps
    type ProfileLean = {
      companyId: { toString(): string };
      slug: string;
      sector?: string;
      city?: string;
      shortDescription?: string;
      isBoostActive: boolean;
      boostExpiresAt?: Date;
      viewCount: number;
    };

    const profileByCompany = new Map<string, ProfileLean>();
    for (const p of profiles as ProfileLean[]) {
      profileByCompany.set(p.companyId.toString(), p);
    }

    // Map to search result items
    const items: SearchCompanyItem[] = [];
    for (const company of companies) {
      const id = (company._id as { toString(): string }).toString();
      const profile = profileByCompany.get(id);
      if (!profile) continue;

      const boosted = isBoostActive({
        isBoostActive: profile.isBoostActive,
        boostExpiresAt: profile.boostExpiresAt,
      });

      items.push({
        _id:              id,
        slug:             company.slug,
        name:             company.name,
        type:             company.type,
        logo:             company.logo,
        sector:           profile.sector,
        city:             profile.city,
        shortDescription: profile.shortDescription,
        isBoostActive:    boosted,
        boostExpiresAt:   profile.boostExpiresAt?.toISOString(),
        viewCount:        profile.viewCount,
        rseActive:        rseSet.has(id),
      });
    }

    // Sort: boosted (shuffled) first, then alphabetical
    const boosted  = items.filter((i) => i.isBoostActive).sort(() => Math.random() - 0.5);
    const standard = items.filter((i) => !i.isBoostActive).sort((a, b) => a.name.localeCompare(b.name));
    const sorted   = [...boosted, ...standard];

    // Paginate
    const total      = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const paginated  = sorted.slice((page - 1) * limit, page * limit);

    // Attach active sponsoring for first page
    let activeSponsor = null;
    if (page === 1) {
      activeSponsor = await Sponsoring.findOne({
        status: 'active',
        startDate: { $lte: now },
        endDate:   { $gte: now },
        sector: sector ?? 'generic',
      }).lean();

      if (!activeSponsor) {
        activeSponsor = await Sponsoring.findOne({
          status: 'active',
          startDate: { $lte: now },
          endDate:   { $gte: now },
          sector: 'generic',
        }).lean();
      }
    }

    return NextResponse.json({
      companies:  paginated,
      total,
      page,
      totalPages,
      sponsor:    activeSponsor,
    });
  } catch (err) {
    console.error('[GET /api/companies]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
