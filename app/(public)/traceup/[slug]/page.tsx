import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { TraceUpProfile as TraceUpProfileModel } from '@/models/TraceUpProfile';
import { RSEBadge } from '@/models/RSEBadge';
import { TraceUpProfile } from '@/components/profiles/TraceUpProfile';
import { isBoostActive } from '@/lib/utils';
import { auth } from '@/lib/auth';
import type { ITraceUpProfile, SafeCompany } from '@/types';

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const company = await Company.findOne({ slug, isDeleted: false }).select('name').lean<{ name: string }>();
  return { title: company ? `${company.name} — TraceUP` : 'Profil TraceUP' };
}

export const dynamic = 'force-dynamic';

export default async function TraceUpProfilePage({ params }: PageProps) {
  const { slug } = await params;
  await connectDB();

  const [company, profile] = await Promise.all([
    Company.findOne({ slug, isDeleted: false, status: { $ne: 'suspended' } })
      .select('-passwordHash').lean<SafeCompany>(),
    TraceUpProfileModel.findOne({ slug, status: 'active' }).lean<ITraceUpProfile>(),
  ]);

  if (!company || !profile) notFound();

  const rseDoc = await RSEBadge.findOne({ companyId: company._id }).lean<{ badgeActive: boolean }>();

  const session  = await auth();
  const isOwner  = session?.user?.slug === slug;
  if (!isOwner) {
    await TraceUpProfileModel.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } });
  }

  const profileWithBoost: ITraceUpProfile = {
    ...profile,
    _id: profile._id.toString(),
    companyId: profile.companyId?.toString() ?? '',
    isBoostActive: isBoostActive({ isBoostActive: profile.isBoostActive, boostExpiresAt: profile.boostExpiresAt }),
  };

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh' }}>
      <TraceUpProfile
        company={company}
        profile={profileWithBoost}
        rse={rseDoc ? { badgeActive: rseDoc.badgeActive } : undefined}
        isModal={false}
      />
    </div>
  );
}
