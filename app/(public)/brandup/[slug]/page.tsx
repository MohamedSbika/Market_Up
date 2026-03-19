import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { BrandUpProfile as BrandUpProfileModel } from '@/models/BrandUpProfile';
import { RSEBadge } from '@/models/RSEBadge';
import { BrandUpProfile } from '@/components/profiles/BrandUpProfile';
import { isBoostActive } from '@/lib/utils';
import { auth } from '@/lib/auth';
import type { IBrandUpProfile, SafeCompany } from '@/types';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const company = await Company.findOne({ slug, isDeleted: false }).select('name').lean<{ name: string }>();
  return { title: company ? `${company.name} — BrandUP` : 'Profil BrandUP' };
}

export const dynamic = 'force-dynamic';

export default async function BrandUpProfilePage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();

  const [company, profile, rseBadge] = await Promise.all([
    Company.findOne({ slug, isDeleted: false, status: { $ne: 'suspended' } })
      .select('-passwordHash')
      .lean<SafeCompany>(),
    BrandUpProfileModel.findOne({ slug, status: 'active' }).lean<IBrandUpProfile>(),
    RSEBadge.findOne({ companyId: undefined }).lean(), // fetched below after company check
  ]);

  if (!company || !profile) notFound();

  // Fetch RSE for this company
  const rseDoc = await RSEBadge.findOne({ companyId: company._id }).lean<{
    badgeActive: boolean;
    donations: Array<{ status: string; beneficiary: string; amount: number; validatedAt?: Date }>;
  }>();

  const rse = rseDoc
    ? {
        badgeActive: rseDoc.badgeActive,
        lastReceipts: rseDoc.donations
          .filter((d) => d.status === 'validated')
          .sort((a, b) => {
            const at = a.validatedAt ? new Date(a.validatedAt).getTime() : 0;
            const bt = b.validatedAt ? new Date(b.validatedAt).getTime() : 0;
            return bt - at;
          })
          .slice(0, 2)
          .map((d) => ({
            beneficiary: d.beneficiary,
            amount:      d.amount,
            validatedAt: d.validatedAt?.toISOString() ?? '',
          })),
      }
    : undefined;

  // Increment viewCount — skip if the viewer is the owner
  const session = await auth();
  const isOwner = session?.user?.slug === slug;

  if (!isOwner) {
    await BrandUpProfileModel.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } });
  }

  // Compute boost status server-side
  const profileWithBoost: IBrandUpProfile = {
    ...profile,
    _id: profile._id.toString(),
    companyId: profile.companyId?.toString() ?? '',
    isBoostActive: isBoostActive({
      isBoostActive: profile.isBoostActive,
      boostExpiresAt: profile.boostExpiresAt,
    }),
  };

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh' }}>
      <BrandUpProfile
        company={company}
        profile={profileWithBoost}
        rse={rse}
        isModal={false}
      />
    </div>
  );
}
