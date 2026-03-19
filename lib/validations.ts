/**
 * MARKET-UP — Zod validation schemas
 * Used on BOTH client (form validation) and server (API route validation).
 * Every API route must call schema.safeParse() before processing.
 */
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Shared field validators
// ─────────────────────────────────────────────────────────────────────────────

const slugField   = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Invalid slug');
const urlField    = z.string().url('Must be a valid URL').optional().or(z.literal(''));
const phoneField  = z.string().regex(/^\+?[0-9\s\-().]{6,20}$/, 'Invalid phone number').optional().or(z.literal(''));
const sectorField = z.string().min(1).max(100);
const cityField   = z.string().min(1).max(100);

const YT_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

// ─────────────────────────────────────────────────────────────────────────────
// Auth schemas
// ─────────────────────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  name:      z.string().min(2, 'Name must be at least 2 characters').max(200),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters').max(100),
  type:      z.enum(['B2B', 'B2C']),
  rneNumber: z.string().min(1, 'RNE number is required').max(50),
  taxId:     z.string().max(50).optional().or(z.literal('')),
  sector:    sectorField,
  city:      cityField,
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'New password must be at least 8 characters').max(100),
});

// ─────────────────────────────────────────────────────────────────────────────
// Company / Account
// ─────────────────────────────────────────────────────────────────────────────

export const updateAccountSchema = z.object({
  name:      z.string().min(2).max(200).optional(),
  phone:     phoneField,
  taxId:     z.string().max(50).optional().or(z.literal('')),
  logo:      z.string().optional().or(z.literal('')),
});

// ─────────────────────────────────────────────────────────────────────────────
// BrandUp Profile
// ─────────────────────────────────────────────────────────────────────────────

export const updateBrandUpSchema = z.object({
  isPublic:         z.boolean().optional(),
  shortDescription: z.string().max(200).optional().or(z.literal('')),
  about:            z.string().max(2000).optional().or(z.literal('')),
  sector:           sectorField.optional().or(z.literal('')),
  city:             cityField.optional().or(z.literal('')),
  address:          z.string().max(300).optional().or(z.literal('')),
  phone:            phoneField,
  email:            z.string().email().optional().or(z.literal('')),
  foundedYear:      z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  employeesCount:   z.number().int().min(0).optional().nullable(),
  clientsCount:     z.number().int().min(0).optional().nullable(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TraceUp Profile
// ─────────────────────────────────────────────────────────────────────────────

export const updateTraceUpSchema = z.object({
  isPublic: z.boolean().optional(),
});

export const addVideoSchema = z.object({
  youtubeUrl:  z.string().regex(YT_REGEX, 'Must be a valid YouTube URL'),
  title:       z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  category:    z.enum(['actualite', 'offres', 'astuces', 'emplois']),
});

export const deleteVideoSchema = z.object({
  videoId: z.string().min(1),
});

// ─────────────────────────────────────────────────────────────────────────────
// LinkUp Profile
// ─────────────────────────────────────────────────────────────────────────────

export const updateLinkUpSchema = z.object({
  isPublic:  z.boolean().optional(),
  whatsapp:  phoneField,
  gpsUrl:    z.string().url('Must be a valid GPS URL').optional().or(z.literal('')),
  website:   urlField,
  linkedin:  urlField,
  facebook:  urlField,
  instagram: urlField,
  youtube:   urlField,
});

// ─────────────────────────────────────────────────────────────────────────────
// Boost
// ─────────────────────────────────────────────────────────────────────────────

export const createBoostSchema = z.object({
  profileType: z.enum(['brandup', 'traceup', 'linkup']),
  durationDays: z.number().int().min(7).max(365),
});

// ─────────────────────────────────────────────────────────────────────────────
// Sponsoring order
// ─────────────────────────────────────────────────────────────────────────────

export const createSponsoringOrderSchema = z.object({
  name:         z.string().min(2).max(200),
  imageUrl:     z.string().url('Must be a valid image URL'),
  targetUrl:    z.string().url('Must be a valid target URL'),
  sector:       z.string().min(1).max(100).default('generic'),
  desiredStart: z.string().datetime().optional().or(z.literal('')),
  desiredEnd:   z.string().datetime().optional().or(z.literal('')),
});

// ─────────────────────────────────────────────────────────────────────────────
// RSE Badge / Donation
// ─────────────────────────────────────────────────────────────────────────────

export const addDonationSchema = z.object({
  beneficiary: z.string().min(2, 'Beneficiary name required').max(200),
  amount:      z.number().min(1, 'Amount must be at least 1 DT'),
  receiptUrl:  z.string().url('Must be a valid URL for the receipt'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Search / query params
// ─────────────────────────────────────────────────────────────────────────────

export const searchQuerySchema = z.object({
  q:      z.string().max(200).optional(),
  type:   z.enum(['brandup', 'traceup', 'linkup']),
  sector: z.string().max(100).optional(),
  city:   z.string().max(100).optional(),
  market: z.enum(['B2B', 'B2C']).optional(),
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(50).default(15),
});

// ─────────────────────────────────────────────────────────────────────────────
// Uploads
// ─────────────────────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// ─────────────────────────────────────────────────────────────────────────────
// Slug param
// ─────────────────────────────────────────────────────────────────────────────

export const slugParamSchema = z.object({ slug: slugField });

// ─────────────────────────────────────────────────────────────────────────────
// Type exports (inferred from schemas)
// ─────────────────────────────────────────────────────────────────────────────

export type SignInInput              = z.infer<typeof signInSchema>;
export type SignUpInput              = z.infer<typeof signUpSchema>;
export type ResetPasswordInput       = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput         = z.infer<typeof newPasswordSchema>;
export type ChangePasswordInput      = z.infer<typeof changePasswordSchema>;
export type UpdateAccountInput       = z.infer<typeof updateAccountSchema>;
export type UpdateBrandUpInput       = z.infer<typeof updateBrandUpSchema>;
export type UpdateTraceUpInput       = z.infer<typeof updateTraceUpSchema>;
export type AddVideoInput            = z.infer<typeof addVideoSchema>;
export type UpdateLinkUpInput        = z.infer<typeof updateLinkUpSchema>;
export type CreateBoostInput         = z.infer<typeof createBoostSchema>;
export type CreateSponsoringOrderInput = z.infer<typeof createSponsoringOrderSchema>;
export type AddDonationInput         = z.infer<typeof addDonationSchema>;
export type SearchQueryInput         = z.infer<typeof searchQuerySchema>;
