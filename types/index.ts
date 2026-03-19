/**
 * MARKET-UP — Central TypeScript type definitions
 * All interfaces mirror Mongoose model schemas exactly.
 * Used by API responses, Server Components, and client components.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared / primitives
// ─────────────────────────────────────────────────────────────────────────────

export type ProfileType = 'brandup' | 'traceup' | 'linkup';
export type ProfileStatus = 'pending' | 'active' | 'disabled';
export type CompanyType = 'B2B' | 'B2C';
export type CompanyRole = 'company' | 'admin';
export type CompanyStatus = 'pending' | 'active' | 'suspended';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type BoostStatus = 'active' | 'expired' | 'cancelled';
export type DonationStatus = 'pending' | 'validated' | 'rejected';
export type AdminStatus = 'pending' | 'approved' | 'rejected';
export type BillingType = 'boost' | 'sponsoring';
export type SponsoringStatus = 'pending' | 'active' | 'inactive';

export type NotificationType =
  | 'account_approved'
  | 'profile_validated'
  | 'profile_rejected'
  | 'account_suspended'
  | 'rse_validated'
  | 'rse_rejected'
  | 'boost_activated'
  | 'boost_expiring_soon'
  | 'sponsoring_approved'
  | 'sponsoring_rejected';

export type VideoCategory = 'actualite' | 'offres' | 'astuces' | 'emplois';

// ─────────────────────────────────────────────────────────────────────────────
// Company
// ─────────────────────────────────────────────────────────────────────────────

export interface ICompany {
  _id: string;
  slug: string;
  email: string;
  /** Never included in API responses — always .select('-passwordHash') */
  passwordHash?: string;
  type: CompanyType;
  country: string;
  name: string;
  rneNumber: string;
  taxId?: string;
  phone?: string;
  logo?: string;
  role: CompanyRole;
  status: CompanyStatus;
  emailVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Safe company shape (no passwordHash) */
export type SafeCompany = Omit<ICompany, 'passwordHash'>;

// ─────────────────────────────────────────────────────────────────────────────
// Profiles
// ─────────────────────────────────────────────────────────────────────────────

export interface IGalleryItem {
  url: string;
  uploadedAt: string;
}

export interface IBrandUpProfile {
  _id: string;
  companyId: string;
  slug: string;
  status: ProfileStatus;
  shortDescription?: string;
  about?: string;
  sector?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  foundedYear?: number;
  employeesCount?: number;
  clientsCount?: number;
  gallery: IGalleryItem[];
  isBoostActive: boolean;
  boostExpiresAt?: string;
  viewCount: number;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IVideo {
  _id: string;
  youtubeUrl: string;
  title: string;
  description?: string;
  category: VideoCategory;
  addedAt: string;
}

export interface ITraceUpProfile {
  _id: string;
  companyId: string;
  slug: string;
  status: ProfileStatus;
  videos: IVideo[];
  isBoostActive: boolean;
  boostExpiresAt?: string;
  viewCount: number;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILinkUpProfile {
  _id: string;
  companyId: string;
  slug: string;
  status: ProfileStatus;
  whatsapp: string;
  gpsUrl: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  isBoostActive: boolean;
  boostExpiresAt?: string;
  viewCount: number;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RSE Badge
// ─────────────────────────────────────────────────────────────────────────────

export interface IDonation {
  _id: string;
  beneficiary: string;
  amount: number;
  receiptUrl: string;
  status: DonationStatus;
  adminNote?: string;
  validatedAt?: string;
  createdAt: string;
}

export interface IRSEBadge {
  _id: string;
  companyId: string;
  badgeActive: boolean;
  donations: IDonation[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sponsoring
// ─────────────────────────────────────────────────────────────────────────────

export interface ISponsoring {
  _id: string;
  companyId?: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  sector: string;
  status: SponsoringStatus;
  clickCount: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Boost
// ─────────────────────────────────────────────────────────────────────────────

export interface IBoost {
  _id: string;
  companyId: string;
  profileType: ProfileType;
  profileId: string;
  status: BoostStatus;
  startDate: string;
  endDate: string;
  amount: number;
  amountTTC: number;
  paymentRef?: string;
  paymentStatus: PaymentStatus;
  viewsAtStart: number;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sponsoring Order
// ─────────────────────────────────────────────────────────────────────────────

export interface ISponsoringOrder {
  _id: string;
  companyId: string;
  sponsoringId?: string;
  name: string;
  imageUrl: string;
  targetUrl: string;
  sector: string;
  desiredStart?: string;
  desiredEnd?: string;
  amount?: number;
  amountTTC?: number;
  paymentRef?: string;
  paymentStatus: PaymentStatus;
  adminStatus: AdminStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification
// ─────────────────────────────────────────────────────────────────────────────

export interface INotification {
  _id: string;
  companyId: string;
  type: NotificationType;
  data?: Record<string, unknown>;
  isRead: boolean;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Billing Record
// ─────────────────────────────────────────────────────────────────────────────

export interface IBillingRecord {
  _id: string;
  companyId: string;
  type: BillingType;
  referenceId: string;
  label: string;
  amount: number;     // HT
  tva: number;        // amount * 0.19
  amountTTC: number;  // amount * 1.19
  status: 'paid' | 'failed' | 'refunded';
  paymentRef?: string;
  invoiceNumber: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API response shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchResult {
  companies: SearchCompanyItem[];
  total: number;
  page: number;
  totalPages: number;
}

/** Minimal shape returned by /api/companies search (list view) */
export interface SearchCompanyItem {
  _id: string;
  slug: string;
  name: string;
  type: CompanyType;
  logo?: string;
  sector?: string;
  city?: string;
  shortDescription?: string;
  isBoostActive: boolean;
  boostExpiresAt?: string;
  viewCount: number;
  rseActive: boolean;
}

/** Full public profile shape returned by /api/companies/[slug] */
export interface PublicProfileResponse {
  company: SafeCompany;
  profile: IBrandUpProfile | ITraceUpProfile | ILinkUpProfile;
  profileType: ProfileType;
  rse?: {
    badgeActive: boolean;
    lastReceipts: Array<{ beneficiary: string; amount: number; validatedAt: string }>;
  };
}

/** Dashboard stats */
export interface DashboardStats {
  views: {
    total: number;
    brandup: number;
    traceup: number;
    linkup: number;
    totalDelta: number;
    brandupDelta: number;
    traceupDelta: number;
    linkupDelta: number;
  };
  activeBoost: IBoost | null;
  rse: {
    badgeActive: boolean;
    lastDonation?: IDonation;
  };
  profiles: {
    brandup: { status: ProfileStatus; viewCount: number } | null;
    traceup: { status: ProfileStatus; viewCount: number } | null;
    linkup: { status: ProfileStatus; viewCount: number } | null;
  };
  unreadNotifications: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NextAuth session extension
// ─────────────────────────────────────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: CompanyRole;
      slug: string;
      status: CompanyStatus;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: CompanyRole;
    slug: string;
    status: CompanyStatus;
  }
}

// next-auth/jwt module augmentation is handled in lib/auth.ts via NextAuth callbacks

