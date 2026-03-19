import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { LinkUpProfile as LinkUpProfileModel } from '@/models/LinkUpProfile';
import { RSEBadge } from '@/models/RSEBadge';
import { LinkUpProfile } from '@/components/profiles/LinkUpProfile';
import { isBoostActive } from '@/lib/utils';
import { auth } from '@/lib/auth';
import type { ILinkUpProfile, SafeCompany } from '@/types';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const company = await Company.findOne({ slug, isDeleted: false }).select('name').lean<{ name: string }>();
  return { title: company ? `${company.name} — LinkUP` : 'Profil LinkUP' };
}

export const dynamic = 'force-dynamic';

export default async function LinkUpProfilePage({ params }: PageProps) {
  const { slug } = await params;
  await connectDB();

  const [company, profile] = await Promise.all([
    Company.findOne({ slug, isDeleted: false, status: { $ne: 'suspended' } })
      .select('-passwordHash').lean<SafeCompany>(),
    LinkUpProfileModel.findOne({ slug, status: 'active' }).lean<ILinkUpProfile>(),
  ]);

  if (!company || !profile) notFound();

  const rseDoc = await RSEBadge.findOne({ companyId: company._id }).lean<{ badgeActive: boolean }>();

  const session  = await auth();
  const isOwner  = session?.user?.slug === slug;
  if (!isOwner) {
    await LinkUpProfileModel.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } });
  }

  const profileWithBoost: ILinkUpProfile = {
    ...profile,
    _id: profile._id.toString(),
    companyId: profile.companyId?.toString() ?? '',
    isBoostActive: isBoostActive({ isBoostActive: profile.isBoostActive, boostExpiresAt: profile.boostExpiresAt }),
  };

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh' }}>
      <LinkUpProfile
        company={company}
        profile={profileWithBoost}
        rse={rseDoc ? { badgeActive: rseDoc.badgeActive } : undefined}
        isModal={false}
      />
    </div>
  );
}
