# MARKET-UP — CLAUDE.md
# Master AI Developer Instructions — All Phases
# Platform: vivasky.media
# For use with: Claude Code, Cursor, Windsurf, Copilot, or any AI coding assistant
# ─────────────────────────────────────────────────────────────────────────────

## PROJECT OVERVIEW

MARKET-UP is a national digital platform for Tunisian companies.
It combines 3 independent search engines, institutional profiles, an RSE badge
system, and a monetizable visibility module (Boost & Sponsoring).

The platform has 3 engines, each with its own accent color:
- BrandUP  → Institutional profile   → Blue   #0078D4
- TraceUP  → Media / YouTube profile → Purple #8764B8
- LinkUP   → Contact card profile    → Black + Gold #000 / #C5A059

---

## TECH STACK (non-negotiable)

- Framework    : Next.js 16 (App Router, TypeScript) — installed version is 16.1.7
- React        : React 19 — see React 19 compatibility notes below
- Database     : MongoDB + Mongoose
- Auth         : NextAuth.js v5 (beta), credentials provider (email + password), JWT
- Styling      : Tailwind CSS v4 + shadcn/ui (neutral variant)
                 ⚠️ Tailwind v4 uses CSS-first config via `@theme inline` in globals.css — NO tailwind.config.js
- Validation   : Zod (client AND server, always both)
- Uploads dev  : local /public/uploads via API route
- Uploads prod : Cloudinary (env variable toggle)
- Email        : Resend (lazy singleton — see patterns below)
- Payment V1.2 : Konnect TN or ClicToPay
- Language     : English (all code, comments, variable names)

---

## REACT 19 & FRAMEWORK COMPATIBILITY NOTES

### useRef signature change (React 19)
`useRef<T>()` now returns `RefObject<T | null>`, not `RefObject<T>`. Update hook signatures:
```typescript
// hooks/useClickOutside.ts
function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,   // ← T | null, NOT T
  handler: () => void
) { ... }
```

### useSearchParams requires Suspense (Next.js App Router)
Any component calling `useSearchParams()` must be wrapped in `<Suspense>`. Pattern for auth pages:
```
app/(auth)/signin/page.tsx        ← Server Component, Suspense wrapper (shell only)
app/(auth)/signin/SignInForm.tsx  ← 'use client', actual form with useSearchParams
```
Apply this pattern to: signin, signup, new-password (any page reading query params).

### Tailwind v4 configuration
No `tailwind.config.js`. All theme customization goes in `app/globals.css`:
```css
@import "tailwindcss";
@theme inline {
  --color-ms-blue: #0078D4;
  /* ... other tokens */
}
```

---

## ABSOLUTE RULES

1. Server Components by default. Add "use client" ONLY when interactivity is required.
2. NEVER expose passwordHash in any API response. Always .select('-passwordHash').
3. NEVER hard delete anything. Use isDeleted:true or status:'disabled'.
4. ALL API routes must validate with Zod before processing.
5. Boost status ALWAYS computed server-side: boostExpiresAt > new Date().
6. viewCount incremented server-side only, never from dashboard or admin views.
7. Slugs always generated with generateSlug(name) from lib/utils.ts — must be unique.
8. All monetary amounts: store in DT (Tunisian Dinar), TVA 19% — store HT, compute TTC = HT * 1.19.
9. Every /api/dashboard/* route: verify session + verify resource ownership before processing.

---

## DESIGN SYSTEM — Microsoft Fluent Design (MANDATORY)

The client explicitly requires the visual style of microsoft.com and office.com.
This is Microsoft Fluent Design System 2. Apply it strictly and consistently across
every page, component, and state.

### Font
```css
font-family: 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
/* Google Fonts fallback: 'Plus Jakarta Sans' */
```
- Title weight: 600–700 (never 800+ on headings)
- Letter spacing: -0.01em to -0.02em on titles, normal on body
- Body size: 14–16px, line-height: 1.5
- Text primary: #242424 (NOT pure black #000000)
- Never use ALL CAPS on headings

### Color Palette (exact — do not improvise)
```css
--ms-blue:          #0078D4;  /* Primary action */
--ms-blue-hover:    #106EBE;  /* Hover state */
--ms-blue-light:    #EFF6FC;  /* Light backgrounds, badges */
--ms-blue-dark:     #005A9E;  /* Pressed state */
--ms-text:          #242424;  /* Primary text */
--ms-text-muted:    #616161;  /* Secondary text */
--ms-bg:            #FFFFFF;  /* Page background */
--ms-bg-subtle:     #F5F5F5;  /* Section backgrounds */
--ms-border:        #E0E0E0;  /* Default borders */
--ms-border-strong: #D1D1D1;  /* Input borders */
--ms-success:       #107C10;  /* Microsoft green */
--ms-error:         #D13438;  /* Microsoft red */
--ms-sidebar:       #1F1F1F;  /* Dashboard sidebar background */
--ms-gold:          #C5A059;  /* RSE badge accent only */
```

### Border Radius (Fluent 2 — strict)
```
Badges, tags, inputs, small elements : 4px
Buttons, cards, dropdowns            : 8px   ← most common
Modals, large panels, drawers        : 12px
```
- NEVER use rounded-full (50%) on cards or primary buttons
- Pills/tags CAN use rounded-full only for small status dot indicators

### Shadows (subtle — Microsoft style)
```css
/* Card resting  */ box-shadow: 0 2px 4px rgba(0,0,0,0.08);
/* Card hover    */ box-shadow: 0 4px 16px rgba(0,0,0,0.12);
/* Modal         */ box-shadow: 0 8px 32px rgba(0,0,0,0.16);
```
- NO colored shadows (no blue glow, no colored drop-shadow)

### Buttons
```css
/* Primary   */ bg: #0078D4; color: white; radius: 4px; padding: 8px 20px; font-weight: 600;
/* Hover     */ bg: #106EBE;
/* Active    */ bg: #005A9E;
/* Secondary */ bg: transparent; border: 1.5px solid #0078D4; color: #0078D4; radius: 4px;
/* Ghost     */ bg: transparent; border: none; color: #0078D4; hover-bg: #EFF6FC;
```
- NO gradients on any button
- NO box-shadow on buttons (flat Fluent style)

### Cards
```css
background: #FFFFFF;
border: 1px solid #E0E0E0;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0,0,0,0.08);
padding: 20px; /* or 24px */

/* Hover */
border-color: #0078D4;
box-shadow: 0 4px 16px rgba(0,0,0,0.12);
```
- NO colored card backgrounds (except #F5F5F5 for secondary/muted cards)

### Form Inputs
```css
border: 1px solid #D1D1D1; border-radius: 4px;
/* Focus */ border-color: #0078D4; box-shadow: 0 0 0 2px #EFF6FC;
/* Label */ font-size: 12px; font-weight: 600; color: #616161;
           text-transform: uppercase; letter-spacing: 0.04em;
/* Placeholder */ color: #A0A0A0;
/* Error */ border-color: #D13438;
```

### Dashboard Sidebar (office.com style)
```css
/* Container    */ background: #1F1F1F;
/* Logo area    */ padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
/* Nav resting  */ color: rgba(255,255,255,0.65); icon: rgba(255,255,255,0.45);
/* Nav hover    */ background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9);
/* Nav active   */ background: rgba(0,120,212,0.2); color: #60AFFE;
                   border-left: 3px solid #0078D4;
/* Section label*/ font-size: 9px; font-weight: 700; letter-spacing: 0.15em;
                   color: rgba(255,255,255,0.25); text-transform: uppercase;
/* User bottom  */ border-top: 1px solid rgba(255,255,255,0.08);
```

### Layout & Spacing
- Base unit: 8px — use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Page max-width: 1280px centered
- Section padding: 40px–64px vertical
- Card grid gap: 16px or 24px
- Use whitespace to separate sections — avoid decorative dividers

### Tables
```css
/* Header */ bg: #F5F5F5; font-weight: 600; font-size: 12px; text-transform: uppercase;
/* Row hover */ bg: #F5F5F5;
/* Border */ border-bottom: 1px solid #E0E0E0 on each row (no full grid borders)
/* Cell padding */ 12px 16px;
```

### Badges & Status Tags
```css
/* Active   */ bg: #F0FDF4; color: #107C10; border: 1px solid #B7EBC0; radius: 4px;
/* Pending  */ bg: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; radius: 4px;
/* Disabled */ bg: #F5F5F5; color: #616161; border: 1px solid #E0E0E0; radius: 4px;
/* Boosted  */ bg: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA; radius: 4px;
/* RSE      */ bg: #FEFCE8; color: #C5A059; border: 1px solid #FDE68A; radius: 4px;
```

### Toggle (Microsoft Fluent style)
```css
/* Track off */ background: #C7C7C7; width: 40px; height: 20px; border-radius: 10px;
/* Track on  */ background: #0078D4;
/* Thumb     */ background: white; width: 16px; height: 16px; border-radius: 50%;
               box-shadow: 0 1px 3px rgba(0,0,0,0.2);
/* Transition*/ 200ms ease;
```

### Iconography
- Use Lucide React (included with shadcn/ui) — outline style, stroke-width: 1.5
- Sizes: 16px inline, 20px in nav, 24px in feature sections

### What to AVOID
- NO purple gradients or colorful hero backgrounds
- NO glassmorphism (backdrop-filter: blur on cards)
- NO heavy drop shadows or neon glows
- NO rounded-full on cards or standard buttons
- NO font-weight 900 or ultra-condensed typography
- NO decorative illustrations or abstract shapes in UI
- NO emoji in UI labels or buttons
- NO colored card backgrounds (keep cards white)
- Target feel: clean, structured, professional enterprise SaaS

---

## MONGODB MODELS

### Company
```typescript
{
  slug:                  string   // unique, auto-generated from name
  email:                 string   // unique
  passwordHash:          string   // bcrypt rounds:12 — NEVER expose
  type:                  'B2B' | 'B2C'
  country:               string   // default: 'TN'
  name:                  string
  rneNumber:             string
  taxId?:                string
  phone?:                string
  logo?:                 string   // image URL
  role:                  'company' | 'admin'  // default: 'company'
  status:                'pending' | 'active' | 'suspended'  // default: 'pending'
  emailVerified:         boolean  // default: false
  isDeleted:             boolean  // default: false
  resetPasswordToken?:   string   // sparse index — set by /api/auth/reset-password
  resetPasswordExpires?: Date     // 1 hour TTL — cleared after use
  createdAt, updatedAt
}
```

### BrandUpProfile
```typescript
{
  companyId:        ObjectId → Company
  slug:             string
  status:           'pending' | 'active' | 'disabled'
  shortDescription? string
  about?:           string
  sector?:          string
  city?:            string
  address?:         string
  phone?:           string
  email?:           string
  foundedYear?:     number
  employeesCount?:  number
  clientsCount?:    number
  gallery:          Array<{ url: string, uploadedAt: Date }>  // max 10
  isBoostActive:    boolean
  boostExpiresAt?:  Date
  viewCount:        number
  adminNote?:       string
  createdAt, updatedAt
}
```

### TraceUpProfile
```typescript
{
  companyId:      ObjectId → Company
  slug:           string
  status:         'pending' | 'active' | 'disabled'
  videos:         Array<{
    youtubeUrl:   string
    title:        string
    description?: string
    category:     'actualite' | 'offres' | 'astuces' | 'emplois'
    addedAt:      Date
  }>
  isBoostActive:  boolean
  boostExpiresAt? Date
  viewCount:      number
  adminNote?:     string
  createdAt, updatedAt
}
```

### LinkUpProfile
```typescript
{
  companyId:      ObjectId → Company
  slug:           string
  status:         'pending' | 'active' | 'disabled'
  whatsapp:       string   // required for publication
  gpsUrl:         string   // required for publication
  website?:       string
  linkedin?:      string
  facebook?:      string
  instagram?:     string
  youtube?:       string
  isBoostActive:  boolean
  boostExpiresAt? Date
  viewCount:      number
  adminNote?:     string
  createdAt, updatedAt
}
```

### RSEBadge
```typescript
{
  companyId:   ObjectId → Company  // unique per company
  badgeActive: boolean
  donations:   Array<{
    beneficiary: string
    amount:      number
    receiptUrl:  string
    status:      'pending' | 'validated' | 'rejected'
    adminNote?:  string
    validatedAt? Date
    createdAt:   Date
  }>
}
```

### Sponsoring
```typescript
{
  companyId?:  ObjectId   // null if created by admin
  name:        string
  imageUrl:    string
  targetUrl:   string
  sector:      string     // 'generic' or specific sector
  status:      'pending' | 'active' | 'inactive'
  clickCount:  number
  startDate?:  Date
  endDate?:    Date
  createdAt, updatedAt
}
```

### Boost
```typescript
{
  companyId:     ObjectId → Company
  profileType:   'brandup' | 'traceup' | 'linkup'
  profileId:     ObjectId
  status:        'active' | 'expired' | 'cancelled'
  startDate:     Date
  endDate:       Date
  amount:        number   // HT in DT
  amountTTC:     number   // HT * 1.19
  paymentRef?:   string
  paymentStatus: 'pending' | 'paid' | 'failed'
  viewsAtStart:  number   // profile.viewCount at boost start
  createdAt, updatedAt
}
```

### SponsoringOrder
```typescript
{
  companyId:     ObjectId → Company
  sponsoringId?: ObjectId → Sponsoring
  name:          string
  imageUrl:      string
  targetUrl:     string
  sector:        string
  desiredStart?: Date
  desiredEnd?:   Date
  amount?:       number
  amountTTC?:    number
  paymentRef?:   string
  paymentStatus: 'pending' | 'paid' | 'failed'
  adminStatus:   'pending' | 'approved' | 'rejected'
  adminNote?:    string
  createdAt, updatedAt
}
```

### Notification
```typescript
{
  companyId: ObjectId → Company
  type:
    | 'account_approved'
    | 'profile_validated'    // data: { profileType }
    | 'profile_rejected'     // data: { profileType, reason }
    | 'account_suspended'    // data: { reason }
    | 'rse_validated'
    | 'rse_rejected'         // data: { reason }
    | 'boost_activated'      // data: { profileType }
    | 'boost_expiring_soon'  // data: { profileType, daysLeft }
    | 'sponsoring_approved'
    | 'sponsoring_rejected'  // data: { reason }
  data?:     Record<string, any>
  isRead:    boolean
  emailSent: boolean
  createdAt, updatedAt
}
```

### BillingRecord
```typescript
{
  companyId:     ObjectId → Company
  type:          'boost' | 'sponsoring'
  referenceId:   ObjectId
  label:         string     // e.g. 'Boost BrandUP - 30 jours'
  amount:        number     // HT
  tva:           number     // HT * 0.19
  amountTTC:     number
  status:        'paid' | 'failed' | 'refunded'
  paymentRef?:   string
  invoiceNumber: string     // unique, e.g. 'MU-2026-00042'
  paidAt?:       Date
  createdAt, updatedAt
}
```

---

## COMPLETE ROUTE MAP

### Public routes (no auth)
```
/                          Landing page
/onboarding                B2B / B2C choice
/brandup                   BrandUp search engine
/brandup/[slug]            BrandUp public profile
/traceup                   TraceUp search engine
/traceup/[slug]            TraceUp public profile
/linkup                    LinkUp search engine
/linkup/[slug]             LinkUp public profile
/signin                    Company login          (page.tsx shell + SignInForm.tsx client)
/signup                    Company registration   (page.tsx shell + SignUpForm.tsx client — 2 steps)
/reset-password            Request password reset (anti-enumeration: always shows success)
/new-password              Set new password       (page.tsx shell + NewPasswordForm.tsx client)
```

### Public API routes (auth-related)
```
POST /api/auth/reset-password   Generates token, stores on Company, sends email
POST /api/auth/new-password     Validates token, hashes new password, clears token
```

### Protected — Company dashboard
```
/dashboard                 Overview: stats, profiles, boost, RSE, shortcuts
/dashboard/account         Company info + logo + sharing + QR code
/dashboard/brandup         BrandUp editor + gallery + boost shortcut
/dashboard/traceup         TraceUp video manager + boost shortcut
/dashboard/linkup          LinkUp links + QR code + boost shortcut
/dashboard/boost           Tab 1: buy boost / Tab 2: boost history
/dashboard/sponsoring      Tab 1: buy sponsoring / Tab 2: campaign history
/dashboard/rse             RSE badge + donations + new donation
/dashboard/billing         Payment history + PDF invoices
/dashboard/notifications   Notification center
/dashboard/settings        Password change
```

---

## FOLDER STRUCTURE

```
market-up/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── brandup/page.tsx
│   │   ├── brandup/[slug]/page.tsx
│   │   ├── traceup/page.tsx
│   │   ├── traceup/[slug]/page.tsx
│   │   ├── linkup/page.tsx
│   │   └── linkup/[slug]/page.tsx
│   ├── (auth)/
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── new-password/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── account/page.tsx
│   │   ├── brandup/page.tsx
│   │   ├── traceup/page.tsx
│   │   ├── linkup/page.tsx
│   │   ├── boost/page.tsx
│   │   ├── sponsoring/page.tsx
│   │   ├── rse/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── companies/route.ts
│   │   ├── companies/[slug]/route.ts
│   │   ├── sponsoring/route.ts
│   │   ├── sponsoring/[id]/click/route.ts
│   │   ├── uploads/route.ts
│   │   ├── dashboard/
│   │   │   ├── stats/route.ts
│   │   │   ├── account/route.ts
│   │   │   ├── brandup/route.ts
│   │   │   ├── traceup/route.ts
│   │   │   ├── traceup/videos/route.ts
│   │   │   ├── traceup/videos/[videoId]/route.ts
│   │   │   ├── linkup/route.ts
│   │   │   ├── boost/route.ts
│   │   │   ├── sponsoring/route.ts
│   │   │   ├── rse/route.ts
│   │   │   ├── billing/route.ts
│   │   │   ├── billing/[id]/pdf/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── notifications/[id]/read/route.ts
│   │   │   ├── notifications/read-all/route.ts
│   │   │   └── settings/route.ts
│   │   └── cron/boost-expiry/route.ts
│   └── not-found.tsx
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── CompanyCard.tsx
│   │   ├── CompanyGrid.tsx
│   │   ├── CompanyModal.tsx
│   │   ├── SponsoringBanner.tsx
│   │   └── Pagination.tsx
│   ├── profiles/
│   │   ├── BrandUpProfile.tsx
│   │   ├── TraceUpProfile.tsx
│   │   └── LinkUpProfile.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── StatCard.tsx
│   │   ├── ProfileStatusCard.tsx
│   │   ├── BoostModal.tsx
│   │   ├── GalleryUpload.tsx
│   │   ├── VideoManager.tsx
│   │   ├── QRCodeDisplay.tsx
│   │   ├── NotificationItem.tsx
│   │   └── BillingTable.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── RSEBadge.tsx
│       ├── BoostTag.tsx
│       └── CompanyInitials.tsx
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   ├── utils.ts
│   ├── notifications.ts
│   └── validations.ts
├── models/
│   ├── Company.ts
│   ├── BrandUpProfile.ts
│   ├── TraceUpProfile.ts
│   ├── LinkUpProfile.ts
│   ├── RSEBadge.ts
│   ├── Sponsoring.ts
│   ├── Boost.ts
│   ├── SponsoringOrder.ts
│   ├── Notification.ts
│   └── BillingRecord.ts
├── types/index.ts
├── middleware.ts
├── .env.local
└── CLAUDE.md
```

---

## API SPECIFICATIONS

### Public API

#### GET /api/companies — Search
```typescript
// Query params
q?: string        // text search (name, description, sector)
type: 'brandup' | 'traceup' | 'linkup'  // required
sector?: string
city?: string
market?: 'B2B' | 'B2C'
page?: number     // default: 1
limit?: number    // default: 15

// Sort logic:
// 1. Boosted (isBoostActive:true AND boostExpiresAt > now) — shuffled randomly
// 2. Standard — alphabetical by name
// 3. If < 5 boosted → fill line 1 with standard profiles

// Response
{ companies: Company[], total: number, page: number, totalPages: number }
```

#### GET /api/companies/[slug]
```typescript
// Query: type = 'brandup' | 'traceup' | 'linkup'
// Returns: Company + matching profile + RSE (badgeActive + last 2 validated receipts)
// isBoostActive computed: boostExpiresAt > new Date()
// Side effect: viewCount++ (server-side)
// Returns 404 if: not found, isDeleted, status:suspended, profile status !== 'active'
```

#### POST /api/companies — Registration
```typescript
// Body (Zod):
{ name, email, password, type: 'B2B'|'B2C', rneNumber, taxId?, sector, city }
// 1. Check email unique
// 2. bcrypt.hash(password, 12)
// 3. generateSlug(name) — unique
// 4. Create Company (status:'pending', emailVerified:false)
// 5. Create BrandUpProfile + TraceUpProfile + LinkUpProfile (all status:'pending')
// 6. Send confirmation email via Resend
// 7. Return { success: true }
```

#### GET /api/sponsoring
```typescript
// Query: sector? (optional)
// Logic: sector-specific → generic → null (show default banner)
// Active: status:'active' AND startDate <= now AND endDate >= now
```

### Dashboard API (all require session + ownership check)

#### GET /api/dashboard/stats
```typescript
Response: {
  views: { total, brandup, traceup, linkup, totalDelta, brandupDelta, traceupDelta, linkupDelta },
  activeBoost: Boost | null,
  rse: { badgeActive, lastDonation? },
  profiles: { brandup: { status, viewCount }, traceup: { status, viewCount }, linkup: { status, viewCount } },
  unreadNotifications: number,
}
```

#### PUT /api/dashboard/brandup (and /traceup, /linkup)
```typescript
// Profile status logic:
if (isPublic === false) → status = 'disabled'          // immediate, no admin review
if (isPublic === true && currentStatus === 'disabled') → status = 'pending'
if (otherFieldsChanged) → status = 'pending'
// else: keep current status
```

#### POST /api/dashboard/traceup/videos
```typescript
// YouTube URL validation:
const YT_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
// Thumbnail: https://img.youtube.com/vi/${videoId}/mqdefault.jpg
// Adding/removing videos does NOT trigger status: 'pending'
```

#### PUT /api/dashboard/linkup
```typescript
// If isPublic === true: whatsapp AND gpsUrl must be present → else 400
```

#### POST /api/dashboard/boost
```typescript
// Flow: check no active boost → create Boost{paymentStatus:'pending'} →
//       init payment → return { paymentUrl }
// On payment success webhook:
//   Boost.paymentStatus = 'paid'
//   Profile.isBoostActive = true, Profile.boostExpiresAt = endDate
//   Boost.viewsAtStart = profile.viewCount
//   Create BillingRecord + Notification + send email
```

#### GET /api/dashboard/billing/[id]/pdf
```typescript
// Generate PDF invoice with: invoiceNumber, date, label, HT, TVA 19%, TTC,
// AGGREGAX SUARL details, company details
// Library: pdf-lib or @react-pdf/renderer
```

---

## KEY BUSINESS LOGIC SNIPPETS

### Boost active check
```typescript
const isBoostActive = (profile: { isBoostActive: boolean, boostExpiresAt?: Date }) =>
  profile.isBoostActive && profile.boostExpiresAt
    ? new Date(profile.boostExpiresAt) > new Date()
    : false;
```

### Search sort (MongoDB)
```typescript
const pipeline = [
  { $match: { status: 'active', isDeleted: false, ...filters } },
  { $addFields: {
    isCurrentlyBoosted: {
      $and: [{ $eq: ['$isBoostActive', true] }, { $gt: ['$boostExpiresAt', new Date()] }]
    }
  }},
  { $sort: { isCurrentlyBoosted: -1, name: 1 } },
  { $skip: (page - 1) * limit },
  { $limit: limit }
];
// After fetch: shuffle the boosted subset, keep standards in order
```

### RSE last 2 receipts
```typescript
const lastTwoReceipts = rseDoc?.donations
  .filter(d => d.status === 'validated')
  .sort((a, b) => b.validatedAt!.getTime() - a.validatedAt!.getTime())
  .slice(0, 2) ?? [];
```

### Active sponsoring
```typescript
async function getActiveSponsor(sector?: string) {
  const now = new Date();
  const base = { status: 'active', startDate: { $lte: now }, endDate: { $gte: now } };
  if (sector) {
    const specific = await Sponsoring.findOne({ ...base, sector });
    if (specific) return specific;
  }
  return Sponsoring.findOne({ ...base, sector: 'generic' }) ?? null;
}
```

### Slug generation
```typescript
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
async function getUniqueSlug(name: string): Promise<string> {
  let slug = generateSlug(name);
  let count = 0;
  while (await Company.exists({ slug })) slug = `${generateSlug(name)}-${++count}`;
  return slug;
}
```

### YouTube validator
```typescript
const YT_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
export const extractYouTubeId = (url: string) => url.match(YT_REGEX)?.[3] ?? null;
export const getYouTubeThumbnail = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
```

### Invoice number
```typescript
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await BillingRecord.countDocuments({ createdAt: { $gte: new Date(`${year}-01-01`) } });
  return `MU-${year}-${String(count + 1).padStart(5, '0')}`;
}
```

### Notification helper
```typescript
// lib/notifications.ts
export async function createNotification(companyId: string, type: string, data?: Record<string, any>) {
  const notification = await Notification.create({ companyId, type, data });
  const company = await Company.findById(companyId).select('email name');
  if (company) {
    await sendEmail({ to: company.email, subject: getEmailSubject(type), html: getEmailTemplate(type, data, company.name) });
    await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
  }
  return notification;
}
```

### Cron job — boost expiry warning
```typescript
// app/api/cron/boost-expiry/route.ts — runs daily at 9:00 AM
// vercel.json: { "crons": [{ "path": "/api/cron/boost-expiry", "schedule": "0 9 * * *" }] }
const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
const expiring = await Boost.find({ status: 'active', endDate: { $lte: in3Days, $gte: new Date() } });
// For each: check no recent notification → createNotification('boost_expiring_soon', { profileType, daysLeft })
```

---

## AUTH & MIDDLEWARE

```typescript
// middleware.ts
export { default } from 'next-auth/middleware';
export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };

// lib/auth.ts — NextAuth JWT strategy
// Session: { user: { id, email, name, role, slug, status } }
// authorize(): find Company by email → bcrypt.compare → check emailVerified → check not suspended
```

---

## NOTIFICATIONS REFERENCE

| Type | Trigger | Email |
|---|---|---|
| account_approved | Admin approves company | Yes |
| profile_validated | Admin validates a profile | Yes |
| profile_rejected | Admin rejects (with reason) | Yes |
| account_suspended | Admin suspends (with reason) | Yes |
| rse_validated | Admin validates RSE donation | Yes |
| rse_rejected | Admin rejects (with reason) | Yes |
| boost_activated | Payment confirmed | Yes |
| boost_expiring_soon | Cron: 3 days before expiry | Yes |
| sponsoring_approved | Admin approves sponsoring | Yes |
| sponsoring_rejected | Admin rejects (with reason) | Yes |

---

## ENV VARIABLES

```bash
MONGODB_URI=mongodb://localhost:27017/marketup
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=   # openssl rand -base64 32
RESEND_API_KEY=
EMAIL_FROM=noreply@vivasky.media
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=       # for cron job auth
# Cloudinary (prod)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## CRITICAL PATTERNS (learned from build)

### 1. Lazy env var initialization — REQUIRED for `npm run build`
Never throw at module load time. Throw lazily inside functions:
```typescript
// lib/mongodb.ts
export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  // ... connect
}

// lib/email.ts
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not defined');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
```

### 2. Mongoose union type cast — required for union ProfileModel
When `ProfileModel` is a union of 3 Mongoose model types, TypeScript can't resolve
`findOne`/`find`/`findOneAndUpdate` overloads. Cast to `any`:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const profile = await (ProfileModel as any).findOne({ slug }).lean() as IProfile | null;
```

### 3. Component prop contracts (do not change)

**GalleryUpload** — `value` must be `GalleryItem[]`, NOT `string[]`:
```typescript
type GalleryItem = { url: string; uploadedAt: string };
<GalleryUpload value={gallery} onChange={setGallery} maxItems={10} />
```

**VideoManager** — callbacks are async, named `onAdd`/`onDelete`:
```typescript
<VideoManager
  videos={videos}
  onAdd={async (video: Omit<IVideo, '_id'>) => Promise<void>}
  onDelete={async (videoId: string) => Promise<void>}
/>
```

**QRCodeDisplay** — prop is `value`, NOT `url`:
```typescript
<QRCodeDisplay value="https://..." size={200} />
```

**StatCard** — prop is `title`, NOT `label`:
```typescript
<StatCard title="Vue totales" value={42} delta={+5} />
```

**BoostModal** — requires `isOpen` boolean:
```typescript
<BoostModal isOpen={showModal} onClose={() => setShowModal(false)} ... />
```

**BillingTable** — accepts optional `isLoading` prop:
```typescript
<BillingTable records={records} isLoading={isLoading} />
```

### 4. PDF route — wrap Uint8Array in Buffer
`pdf.save()` returns `Uint8Array`. Wrap for `NextResponse`:
```typescript
const pdfBytes = await pdfDoc.save();
return new NextResponse(Buffer.from(pdfBytes), {
  headers: { 'Content-Type': 'application/pdf', ... }
});
```

### 5. Upload route — Blob constructor
`Buffer<ArrayBufferLike>` not assignable to `BlobPart`. Use:
```typescript
const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
```

### 6. types/index.ts — do NOT augment next-auth/jwt
The module `next-auth/jwt` is not found in NextAuth v5 beta. Remove:
```typescript
// ❌ This causes a build error
declare module 'next-auth/jwt' { ... }
```

---

## INSTALL COMMANDS

```bash
npx create-next-app@latest market-up \
  --typescript --tailwind --app --src-dir=false --import-alias="@/*"
cd market-up
npx shadcn@latest init
npm install mongoose next-auth@beta bcryptjs zod resend pdf-lib qrcode react-dropzone
npm install -D @types/bcryptjs @types/qrcode
```

---

## BUILD ORDER (recommended)

### Phase 1 — Public
1. Models: Company, BrandUpProfile, TraceUpProfile, LinkUpProfile, RSEBadge, Sponsoring
2. lib/utils.ts (generateSlug, isBoostActive, extractYouTubeId)
3. lib/auth.ts + middleware.ts
4. POST /api/companies (registration)
5. GET /api/companies (search)
6. GET /api/companies/[slug]
7. GET /api/sponsoring
8. POST /api/uploads
9. Pages: /signin, /signup, /reset-password, /new-password
10. Components: CompanyCard, CompanyInitials, RSEBadge, BoostTag
11. Pages: /brandup, /traceup, /linkup (search engines)
12. Pages: /brandup/[slug], /traceup/[slug], /linkup/[slug]
13. CompanyModal (popup)
14. Pages: /, /onboarding, not-found.tsx

### Phase 2 — Dashboard
15. Models: Boost, SponsoringOrder, Notification, BillingRecord
16. lib/notifications.ts
17. dashboard/layout.tsx (Sidebar + Topbar)
18. GET /api/dashboard/stats + /dashboard page
19. Account: GET+PUT /api/dashboard/account + page
20. BrandUp: GET+PUT /api/dashboard/brandup + GalleryUpload + page
21. TraceUp: GET+PUT + videos routes + VideoManager + page
22. LinkUp: GET+PUT + QRCodeDisplay + page
23. BoostModal (shared component)
24. Boost: POST+GET /api/dashboard/boost + page
25. Sponsoring: POST+GET /api/dashboard/sponsoring + page
26. RSE: POST+GET /api/dashboard/rse + page
27. Billing: GET + PDF route + page
28. Notifications: GET+PATCH + page
29. Settings: PUT + page
30. Cron: /api/cron/boost-expiry

---

## UI REFERENCE FILES

Files in /ui folder (HTML mockups provided by client):
```
0_-_page_inscription_B2B_B2C.html    → /onboarding design reference
1_-_Moteur_de_recherche.html          → search engine structure
2_-_profile_public_traceup.html       → TraceUp profile design
3_-_profile_public_linkup.html        → LinkUp profile design
4_-_profile_public_brandup.html       → BrandUp profile design
5_-_formulaire_inscription.html       → /signup form design
6_-_dashboard_entreprise.html         → dashboard overview reference
```

Font used in mockups: Instrument Sans (Google Fonts) — acceptable fallback.
Preferred font: 'Segoe UI Variable', 'Segoe UI', system-ui (Microsoft Fluent).

⚠️  Search page color schemes (/brandup, /traceup, /linkup) are NOT yet validated
by the client. Use neutral Tailwind grays for search pages until client confirms.
Apply #0078D4 only as accent (buttons, active states, links).

---

## RUN COMMANDS

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local — required: MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL

# 3. Start development server
npm run dev
# → http://localhost:3000

# 4. Type check (zero errors expected)
npx tsc --noEmit

# 5. Production build
npm run build

# 6. Start production server
npm start
```

### Minimum .env.local to run locally
```bash
MONGODB_URI=mongodb://localhost:27017/marketup
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Optional for dev (email will fail gracefully):
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@vivasky.media
CRON_SECRET=any-random-string
```


  1. /              → vérifie le landing
  2. /onboarding    → vérifie le choix B2B/B2C                                                        
  3. /signup        → crée un compte test                                                             
  4. /signin        → connecte-toi                                                                    
  5. /dashboard     → vérifie l'overview                                                              
  6. /dashboard/account    → vérifie l'édition profil                                                 
  7. /dashboard/brandup    → vérifie la galerie                                                       
  8. /dashboard/traceup    → vérifie les vidéos                                                       
  9. /dashboard/linkup     → vérifie les liens + QR                                                   
  10. /brandup      → teste la recherche                                                                11. /traceup      → teste la recherche                                                              
  12. /linkup       → teste la recherche                                                              
  13. /reset-password      → vérifie le formulaire                                                    
  14. /dashboard/boost     → vérifie le module boost                                                  
  15. /dashboard/billing   → vérifie les factures                                                     
  16. /dashboard/notifications → vérifie les notifs                                                     
  17. /dashboard/settings  → vérifie le changement mdp                                                
  18. /xyz-inexistant      → vérifie la 404   