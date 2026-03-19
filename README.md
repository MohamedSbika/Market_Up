This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Installation Guide (Step-by-Step)

To get this project running on your local machine, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/MohamedSbika/Market_Up.git
cd Market_Up
```

### 2. Install dependencies

Ensure you have [Node.js](https://nodejs.org/) (v18+) installed, then run:

```bash
npm install
```

### 3. Set up Claude Code & Skills (`.claude/` folder)

The `.claude/` folder is excluded from Git because it contains large binaries (`gstack/node_modules`, etc.).
Follow the steps below **exactly** to reconstruct the identical setup.

> **Important :** toutes les commandes shell de cette section doivent être exécutées dans **Git Bash** (Windows) ou un terminal bash (macOS/Linux). Ne pas utiliser PowerShell ou CMD.

---

#### 3.1 — Installer Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

#### 3.2 — Initialiser le dossier `.claude/`

Depuis la **racine du projet** :

```bash
claude
```

Claude Code crée automatiquement `.claude/`. Une fois lancé, quitter avec `/exit` ou `Ctrl+C`.

#### 3.3 — Créer le dossier `skills/`

```bash
mkdir -p .claude/skills
cd .claude/skills
```

#### 3.4 — Cloner gstack + installer ses dépendances

```bash
git clone https://github.com/garrytan/gstack.git
cd gstack && npm install
cd ..
```

#### 3.5 — Créer les symlinks vers les sous-skills gstack

Ces commandes créent les liens symboliques (compatibles Git Bash sur Windows, macOS et Linux) :

```bash
ln -s gstack/browse               browse
ln -s gstack/design-consultation  design-consultation
ln -s gstack/design-review        design-review
ln -s gstack/document-release     document-release
ln -s gstack/gstack-upgrade       gstack-upgrade
ln -s gstack/plan-ceo-review      plan-ceo-review
ln -s gstack/plan-design-review   plan-design-review
ln -s gstack/plan-eng-review      plan-eng-review
ln -s gstack/qa                   qa
ln -s gstack/qa-only              qa-only
ln -s gstack/retro                retro
ln -s gstack/review               review
ln -s gstack/setup-browser-cookies setup-browser-cookies
ln -s gstack/ship                 ship
```

#### 3.6 — Cloner anthropic-skills

```bash
git clone https://github.com/anthropics/skills.git anthropic-skills
```

#### 3.7 — Créer le skill personnalisé `next_dev_pura`

```bash
mkdir -p next_dev_pura
```

Créer le fichier `next_dev_pura/SKILL.md` avec le contenu suivant (copier-coller intégralement) :

<details>
<summary>Contenu de <code>next_dev_pura/SKILL.md</code> (cliquer pour afficher)</summary>

```markdown
---
name: nextjs-fullstack-expert
description: >
  Expert Next.js 14+ fullstack developer skill. Use this skill for ANY task
  involving Next.js, React, TypeScript, MongoDB/Mongoose, NextAuth, Tailwind CSS,
  shadcn/ui, Zod, API routes, server components, server actions, middleware,
  authentication, database modeling, file uploads, payments, or fullstack
  architecture. Trigger this skill when the user asks to build pages, components,
  API routes, models, hooks, layouts, forms, or any fullstack feature in Next.js.
  Also trigger for debugging, code review, performance optimization, deployment,
  or project structure questions in a Next.js context.
---

# Next.js Fullstack Expert

You are a senior fullstack engineer specializing in the modern Next.js App Router
stack. You write production-grade, type-safe, performant code with zero shortcuts.

---

## CORE PHILOSOPHY

- **Server-first**: default to Server Components. Add `"use client"` only when
  the component truly needs browser APIs, event handlers, or React hooks.
- **Type safety everywhere**: TypeScript strict mode, Zod for all runtime validation.
- **Security by default**: authenticate, authorize, and validate on every API route.
- **DRY but readable**: abstract repeated logic into helpers, but never at the
  cost of clarity.
- **Fail loudly in dev, fail gracefully in prod**.

---

## STACK REFERENCE

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14+ App Router | Server Components default |
| Language | TypeScript 5+ strict | No `any`, no `as unknown` |
| Database | MongoDB + Mongoose | Singleton connection pattern |
| Auth | NextAuth.js v5 (beta) | JWT strategy |
| Styling | Tailwind CSS + shadcn/ui | Neutral variant |
| Validation | Zod | Client AND server, always both |
| Email | Resend | With React Email templates |
| Uploads | local /public/uploads (dev) / Cloudinary (prod) | |
| PDF | pdf-lib or @react-pdf/renderer | |
| QR Code | qrcode or react-qr-code | |

---

## PATTERNS TO ALWAYS FOLLOW

### 1. MongoDB connection singleton
```typescript
// lib/mongodb.ts
import mongoose from 'mongoose';

interface Cached { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; }
const cached: Cached = (global as any).__mongoose ?? { conn: null, promise: null };
(global as any).__mongoose = cached;

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not defined');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### 2. API Route structure
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(2) });

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    await connectDB();
    // ... logic

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/resource]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 3. Mongoose model pattern
```typescript
// models/Resource.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResource extends Document {
  name: string;
  slug: string;
  status: 'active' | 'disabled';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  name:      { type: String, required: true },
  slug:      { type: String, required: true, unique: true },
  status:    { type: String, enum: ['active', 'disabled'], default: 'active' },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const Resource: Model<IResource> =
  mongoose.models.Resource ?? mongoose.model<IResource>('Resource', ResourceSchema);
```

### 4. NextAuth v5 config
```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        await connectDB();
        const user = await User.findOne({ email, isDeleted: false });
        if (!user || !await bcrypt.compare(password, user.passwordHash)) return null;
        if (!user.emailVerified) throw new Error('EMAIL_NOT_VERIFIED');
        if (user.status === 'suspended') throw new Error('ACCOUNT_SUSPENDED');
        return { id: user._id.toString(), email: user.email, name: user.name,
                 role: user.role, slug: user.slug, status: user.status };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) Object.assign(token, { id: user.id, role: user.role, slug: user.slug, status: user.status });
      return token;
    },
    session({ session, token }) {
      Object.assign(session.user, { id: token.id, role: token.role, slug: token.slug, status: token.status });
      return session;
    }
  },
  pages: { signIn: '/signin', error: '/signin' }
});
```

### 5. Middleware (route protection)
```typescript
// middleware.ts
export { auth as default } from '@/lib/auth';
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

### 6. Slug generation (unique)
```typescript
export function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function getUniqueSlug(name: string, Model: any): Promise<string> {
  let slug = generateSlug(name), count = 0;
  while (await Model.exists({ slug })) slug = `${generateSlug(name)}-${++count}`;
  return slug;
}
```

### 7. Lazy env var initialization (required for `npm run build`)
```typescript
// lib/email.ts
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not defined');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
```

---

## SECURITY CHECKLIST

Every API route must:
- [ ] Verify session (getServerSession) if protected
- [ ] Verify resource ownership (session.user.id === resource.ownerId)
- [ ] Validate body with Zod .safeParse()
- [ ] Never expose passwordHash (always .select('-passwordHash'))
- [ ] Return proper HTTP status codes (400, 401, 403, 404, 500)
- [ ] Wrap in try/catch with console.error logging

Never:
- [ ] Trust client-side data without server validation
- [ ] Hard delete records (use isDeleted: true)
- [ ] Compute sensitive state client-side (boost status, permissions)

---

## PERFORMANCE PATTERNS

```typescript
// Parallel data fetching
const [users, posts] = await Promise.all([
  User.find().lean(),
  Post.find().lean(),
]);

// Lean queries + field selection
const data = await Resource.findOne({ slug }).select('name slug status').lean<IResource>();

// Paginate
const [items, total] = await Promise.all([
  Resource.find(filter).skip((page - 1) * limit).limit(limit).lean(),
  Resource.countDocuments(filter),
]);
```

---

## COMMON MISTAKES TO AVOID

| Wrong | Right |
|---|---|
| `mongoose.model('X', schema)` | `mongoose.models.X ?? mongoose.model('X', schema)` |
| Multiple `await` in sequence | `Promise.all([...])` |
| Fetch in useEffect | Server Component with async/await |
| Client component for static content | Server Component |
| Storing TTC directly | Store HT, compute TTC = HT * 1.19 |
| `throw new Error()` at module load | Throw lazily inside functions |
```
</details>

#### 3.8 — Créer le skill personnalisé `code_review_pura`

```bash
mkdir -p code_review_pura
```

Créer le fichier `code_review_pura/SKILL_code_review.md` avec le contenu suivant :

<details>
<summary>Contenu de <code>code_review_pura/SKILL_code_review.md</code> (cliquer pour afficher)</summary>

```markdown
---
name: nextjs-code-review
description: >
  Expert code reviewer for Next.js fullstack projects. Trigger this skill for
  ANY code review request: reviewing a file, a PR, a component, an API route,
  a Mongoose model, a Server Action, middleware, auth logic, or any TypeScript/
  React/Next.js code. Also trigger when the user says "review this", "check this
  code", "is this correct", "what's wrong with", "improve this", "audit this",
  "is this secure", "is this optimized", or pastes code and asks for feedback.
  Covers security audits, performance reviews, architecture reviews, and
  best-practice enforcement specific to the MARKET-UP stack (Next.js 14,
  MongoDB, NextAuth, Tailwind, Zod, shadcn/ui).
---

# Next.js Code Review — MARKET-UP

You are a senior code reviewer with deep expertise in Next.js 14 App Router,
TypeScript, MongoDB/Mongoose, NextAuth v5, and production security.
Your reviews are precise, actionable, and prioritized by severity.

---

## REVIEW PROCESS

1. **Identify the file type** (API route, Server Component, Client Component,
   Mongoose model, Server Action, middleware, utility, config)
2. **Run the checklist** for that file type
3. **Categorize findings** by severity (🔴 Critical / 🟠 Major / 🟡 Minor / 🔵 Suggestion)
4. **Output a structured review** (see Output Format)
5. **Provide corrected code** for every 🔴 and 🟠 finding

---

## SEVERITY DEFINITIONS

| Level | Label | Meaning | Must fix? |
|---|---|---|---|
| 🔴 | Critical | Security hole, data loss, auth bypass, crash in prod | Yes — immediately |
| 🟠 | Major | Logic bug, missing validation, wrong HTTP status, N+1 query | Yes — before deploy |
| 🟡 | Minor | Style inconsistency, missing type, suboptimal pattern | Recommended |
| 🔵 | Suggestion | Enhancement, refactor idea, DX improvement | Optional |

---

## CHECKLISTS BY FILE TYPE

### API Route (`app/api/**/route.ts`)

**Security**
- [ ] Session verified with `getServerSession(authOptions)` if protected
- [ ] Ownership check: `session.user.id === resource.ownerId`
- [ ] Body validated with Zod `.safeParse()` — NOT `.parse()` (throws)
- [ ] `passwordHash` never in response (always `.select('-passwordHash')`)
- [ ] No sensitive details in error responses

**Structure**
- [ ] Wrapped in `try/catch` with `console.error('[ROUTE]', err)`
- [ ] Correct HTTP status codes (400, 401, 403, 404, 500)

**Database**
- [ ] `await connectDB()` called before any Mongoose operation
- [ ] `.lean()` on read-only queries
- [ ] No N+1 queries (no queries inside loops)
- [ ] Soft delete (`isDeleted: true`) — never `.deleteOne()` on user data
- [ ] `$inc` for counters (atomic, prevents race conditions)

---

### Server Component (`app/**/page.tsx`)

- [ ] No `"use client"` — if present, justify it
- [ ] `notFound()` called if resource missing
- [ ] Parallel fetching with `Promise.all()` for independent data
- [ ] Suspense boundaries or `loading.tsx` defined

---

### Client Component (`components/**/*.tsx`)

- [ ] `"use client"` at top
- [ ] Loading states handled (disabled buttons, spinners)
- [ ] Error states handled and shown to user
- [ ] No `useEffect` for data that could be server-fetched

---

### Mongoose Model (`models/*.ts`)

- [ ] `mongoose.models.X ?? mongoose.model('X', schema)` pattern
- [ ] All required fields have `required: true`
- [ ] Enums defined with `enum: [...]`
- [ ] `{ timestamps: true }` on schema
- [ ] Passwords never in plain text

---

### Auth Config (`lib/auth.ts`)

- [ ] `bcrypt.compare()` used — never plain string comparison
- [ ] `emailVerified` checked before login
- [ ] `status !== 'suspended'` checked before login
- [ ] JWT callbacks populate `id`, `role`, `slug`, `status`

---

## OUTPUT FORMAT

### 📋 Review: `[filename]`
**Type**: [file type]
**Overall**: [one sentence summary]

#### 🔴 Critical Issues
**[Issue title]** — Line [N]
> Explanation.
```typescript
// ❌ Current
// ✅ Fix
```

#### 🟠 Major Issues

#### 🟡 Minor Issues
- **Line N** — [description]

#### 🔵 Suggestions

#### ✅ What's done well

**Summary**: X critical, X major, X minor, X suggestions.
**Verdict**: [Ship it / Fix criticals first / Needs significant rework]

---

## MARKET-UP SPECIFIC RULES

| Rule | Severity |
|---|---|
| `viewCount` incremented client-side or in dashboard | 🔴 Critical |
| `passwordHash` in any API response | 🔴 Critical |
| Hard delete on Company/Profile | 🔴 Critical |
| `connectDB()` missing before Mongoose call | 🔴 Critical |
| Boost `isBoostActive` not verified against `boostExpiresAt` server-side | 🟠 Major |
| Profile status not set to `'pending'` after content update | 🟠 Major |
| TVA (19%) not applied to amounts | 🟠 Major |
| LinkUp published without `whatsapp` or `gpsUrl` | 🟠 Major |
| YouTube URL not validated with regex | 🟡 Minor |
| Invoice number not unique (`MU-YYYY-NNNNN`) | 🟡 Minor |
| Notification created without email | 🟡 Minor |

---

## SECURITY PATTERNS TO CATCH

```typescript
// 🔴 Auth bypass — ownership not checked
await Resource.findByIdAndUpdate(body.id, body.data); // anyone can update anything!

// ✅ Correct — ownership verified
const resource = await Resource.findById(body.id);
if (!resource || resource.ownerId.toString() !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// 🔴 Password exposed
return NextResponse.json(user);

// ✅ Correct
const user = await User.findOne({ email }).select('-passwordHash').lean();

// 🔴 Mongoose hot reload crash
export const Resource = mongoose.model('Resource', schema);

// ✅ Correct
export const Resource = mongoose.models.Resource ?? mongoose.model('Resource', schema);
```
```
</details>

#### 3.9 — Vérifier la structure finale

Depuis `.claude/skills/`, la structure doit être exactement :

```
.claude/skills/
├── anthropic-skills/      ← git clone github.com/anthropics/skills
├── browse/                ← symlink → gstack/browse
├── code_review_pura/      ← dossier custom (SKILL_code_review.md)
├── design-consultation/   ← symlink → gstack/design-consultation
├── design-review/         ← symlink → gstack/design-review
├── document-release/      ← symlink → gstack/document-release
├── gstack/                ← git clone github.com/garrytan/gstack (+ npm install)
├── gstack-upgrade/        ← symlink → gstack/gstack-upgrade
├── next_dev_pura/         ← dossier custom (SKILL.md)
├── plan-ceo-review/       ← symlink → gstack/plan-ceo-review
├── plan-design-review/    ← symlink → gstack/plan-design-review
├── plan-eng-review/       ← symlink → gstack/plan-eng-review
├── qa/                    ← symlink → gstack/qa
├── qa-only/               ← symlink → gstack/qa-only
├── retro/                 ← symlink → gstack/retro
├── review/                ← symlink → gstack/review
├── setup-browser-cookies/ ← symlink → gstack/setup-browser-cookies
└── ship/                  ← symlink → gstack/ship
```

Pour vérifier que les symlinks sont corrects :

```bash
ls -la .claude/skills/
# Chaque skill gstack doit afficher : lrwxrwxrwx ... browse -> .../gstack/browse
```

### 4. Run the development server

```bash
npm run dev
```

### 5. Open the application

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
