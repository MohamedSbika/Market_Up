import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Tailwind class merge (shadcn/ui utility)
// ─────────────────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// Slug generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a company name to a URL-safe slug.
 * Normalises accents, lowercases, replaces non-alphanumeric with hyphens.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}

/**
 * Returns a slug guaranteed to be unique in the given Mongoose model.
 * Appends incrementing suffix until a free slug is found.
 */
export async function getUniqueSlug(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MongooseModel: Model<any>
): Promise<string> {
  const base = generateSlug(name);
  let slug = base;
  let count = 0;

  while (await MongooseModel.exists({ slug })) {
    count += 1;
    slug = `${base}-${count}`;
  }

  return slug;
}

// ─────────────────────────────────────────────────────────────────────────────
// Boost status (always server-side — never trust client)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true only if isBoostActive flag is set AND boostExpiresAt is in
 * the future. Both conditions must hold — a stale flag does not count.
 */
export function isBoostActive(profile: {
  isBoostActive: boolean;
  boostExpiresAt?: Date | string | null;
}): boolean {
  if (!profile.isBoostActive || !profile.boostExpiresAt) return false;
  return new Date(profile.boostExpiresAt) > new Date();
}

// ─────────────────────────────────────────────────────────────────────────────
// YouTube utilities
// ─────────────────────────────────────────────────────────────────────────────

const YT_REGEX =
  /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Extracts the 11-character YouTube video ID from a standard YouTube URL.
 * Returns null if the URL doesn't match.
 */
export function extractYouTubeId(url: string): string | null {
  return url.match(YT_REGEX)?.[3] ?? null;
}

/**
 * Returns the medium-quality thumbnail URL for a YouTube video ID.
 */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoice number generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the next sequential invoice number for the current calendar year.
 * Format: MU-YYYY-NNNNN (e.g. MU-2026-00042)
 *
 * NOTE: Call this inside a transaction or with a unique-index fallback to
 * avoid race conditions in high-concurrency scenarios.
 */
export async function generateInvoiceNumber(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BillingRecordModel: Model<any>
): Promise<string> {
  const year = new Date().getFullYear();
  const count = await BillingRecordModel.countDocuments({
    createdAt: { $gte: new Date(`${year}-01-01`) },
  });
  return `MU-${year}-${String(count + 1).padStart(5, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Monetary helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Computes TTC (TVA inclusive) from an HT amount at the Tunisian 19% rate. */
export function computeTTC(amountHT: number): number {
  return Math.round(amountHT * 1.19 * 100) / 100;
}

/** Computes the TVA portion (19%) of an HT amount. */
export function computeTVA(amountHT: number): number {
  return Math.round(amountHT * 0.19 * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Date formatting
// ─────────────────────────────────────────────────────────────────────────────

/** Formats a date as DD/MM/YYYY for invoice display. */
export function formatDateFR(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('fr-TN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Returns "X days ago" or "Today" for notification timestamps. */
export function timeAgo(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString('fr-TN');
}
