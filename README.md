# MARKET-UP — Next.js Fullstack Platform

Plateforme nationale digitale pour les entreprises tunisiennes. Trois moteurs de recherche indépendants (BrandUP, TraceUP, LinkUP), badges RSE, et module de visibilité monétisable (Boost & Sponsoring).

> Stack : Next.js 16 · React 19 · TypeScript · MongoDB · NextAuth v5 · Tailwind CSS v4 · shadcn/ui · Zod · Resend

---

## Table des matières

1. [Démarrage rapide](#1-démarrage-rapide)
2. [Installation complète](#2-installation-complète)
3. [Setup du dossier `.claude/skills`](#3-setup-du-dossier-claudeskills)
4. [Comment ce projet a été construit avec Claude Code](#4-comment-ce-projet-a-été-construit-avec-claude-code)
5. [Pourquoi le dossier `skills` est essentiel](#5-pourquoi-le-dossier-skills-est-essentiel)
6. [Comment créer un skill personnalisé](#6-comment-créer-un-skill-personnalisé)
7. [Commandes Claude Code essentielles](#7-commandes-claude-code-essentielles)
8. [Déploiement sur Vercel](#8-déploiement-sur-vercel)

---

## 1. Démarrage rapide

```bash
git clone https://github.com/MohamedSbika/Market_Up.git
cd Market_Up
npm install
cp .env.local.example .env.local   # remplir les variables
npm run dev
# → http://localhost:3000
```

Variables minimum dans `.env.local` :

```bash
MONGODB_URI=mongodb://localhost:27017/marketup
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=      # openssl rand -base64 32
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 2. Installation complète

### Prérequis

- Node.js v18+
- MongoDB local ou Atlas
- Git + Git Bash (Windows) / Terminal (macOS/Linux)

### Étapes

```bash
# 1. Cloner
git clone https://github.com/MohamedSbika/Market_Up.git
cd Market_Up

# 2. Dépendances
npm install

# 3. Variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos valeurs

# 4. Lancer en développement
npm run dev

# 5. Vérification TypeScript (0 erreurs attendues)
npx tsc --noEmit

# 6. Build de production
npm run build
```

---

## 3. Setup du dossier `.claude/skills`

Le dossier `.claude/` est exclu du repo (binaires lourds : `gstack/node_modules`, `.exe`).
Suivre ces étapes **dans Git Bash** (Windows) ou un terminal bash (macOS/Linux) — ne pas utiliser PowerShell.

### Étape 1 — Installer Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### Étape 2 — Initialiser `.claude/`

Depuis la racine du projet :

```bash
claude
# Claude Code crée .claude/ automatiquement
# Quitter avec /exit ou Ctrl+C
```

### Étape 3 — Créer le dossier skills

```bash
mkdir -p .claude/skills
cd .claude/skills
```

### Étape 4 — Cloner gstack + installer ses dépendances

```bash
git clone https://github.com/garrytan/gstack.git
cd gstack && npm install
cd ..
```

### Étape 5 — Créer les symlinks vers les sous-skills gstack

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

### Étape 6 — Cloner anthropic-skills

```bash
git clone https://github.com/anthropics/skills.git anthropic-skills
```

### Étape 7 — Créer le skill `next_dev_pura`

```bash
mkdir -p next_dev_pura
```

Créer `next_dev_pura/SKILL.md` :

Contenu de `next_dev_pura/SKILL.md` :

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

## CORE PHILOSOPHY

- **Server-first**: default to Server Components. Add `"use client"` only when interactivity is required.
- **Type safety everywhere**: TypeScript strict mode, Zod for all runtime validation.
- **Security by default**: authenticate, authorize, and validate on every API route.
- **Fail loudly in dev, fail gracefully in prod**.

## PATTERNS TO ALWAYS FOLLOW

### MongoDB connection singleton
```typescript
// lib/mongodb.ts
interface Cached { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; }
const cached: Cached = (global as any).__mongoose ?? { conn: null, promise: null };
(global as any).__mongoose = cached;

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not defined');
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(process.env.MONGODB_URI);
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### API Route structure
```typescript
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const result = schema.safeParse(await req.json());
    if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    await connectDB();
    // ... logic
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/resource]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Mongoose model pattern
```typescript
export const Resource: Model<IResource> =
  mongoose.models.Resource ?? mongoose.model<IResource>('Resource', ResourceSchema);
```

### Lazy env var initialization (required for `npm run build`)
```typescript
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not defined');
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
```

## SECURITY CHECKLIST

Every API route must:
- [ ] Verify session + ownership (session.user.id === resource.ownerId)
- [ ] Validate with Zod .safeParse()
- [ ] Never expose passwordHash (.select('-passwordHash'))
- [ ] Wrap in try/catch
- [ ] Use soft delete (isDeleted: true), never hard delete

## COMMON MISTAKES

| Wrong | Right |
|---|---|
| `mongoose.model('X', schema)` | `mongoose.models.X ?? mongoose.model('X', schema)` |
| Sequential awaits | `Promise.all([...])` |
| Fetch in useEffect | Server Component with async/await |
| Storing TTC directly | Store HT, compute TTC = HT * 1.19 |
| `throw` at module load | Throw lazily inside functions |
```

### Étape 8 — Créer le skill `code_review_pura`

```bash
mkdir -p code_review_pura
```

Contenu de `code_review_pura/SKILL_code_review.md` :

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
---

# Next.js Code Review — MARKET-UP

You are a senior code reviewer. Reviews are precise, actionable, and prioritized by severity.

## SEVERITY

| Level | Meaning |
|---|---|
| 🔴 Critical | Security hole, data loss, auth bypass — fix immediately |
| 🟠 Major | Logic bug, missing validation, N+1 query — fix before deploy |
| 🟡 Minor | Style, suboptimal pattern — recommended |
| 🔵 Suggestion | Optional improvement |

## CHECKLISTS

### API Route
- [ ] Session verified + ownership checked
- [ ] Zod `.safeParse()` on body and query params
- [ ] `passwordHash` excluded from all responses
- [ ] `connectDB()` before any Mongoose call
- [ ] `.lean()` on read-only queries, no N+1
- [ ] Soft delete only, never `.deleteOne()` on user data

### Server Component
- [ ] No `"use client"` unless justified
- [ ] `notFound()` if resource missing
- [ ] `Promise.all()` for parallel fetches

### Mongoose Model
- [ ] `mongoose.models.X ?? mongoose.model('X', schema)`
- [ ] `{ timestamps: true }` on schema
- [ ] Required fields marked `required: true`

## OUTPUT FORMAT

### 📋 Review: `[filename]`
**Overall**: [one sentence]

#### 🔴 Critical — [title] (line N)
> Explanation
```typescript
// ❌  // ✅
```

#### ✅ What's done well

**Verdict**: [Ship it / Fix criticals first / Needs rework]

## MARKET-UP SPECIFIC RULES

| Rule | Severity |
|---|---|
| `viewCount` incremented client-side | 🔴 Critical |
| `passwordHash` in response | 🔴 Critical |
| Hard delete on Company/Profile | 🔴 Critical |
| `connectDB()` missing | 🔴 Critical |
| Boost status not verified server-side | 🟠 Major |
| Profile not set to `pending` after update | 🟠 Major |
| TVA 19% not applied | 🟠 Major |
| LinkUp published without whatsapp/gpsUrl | 🟠 Major |
```

### Étape 9 — Vérifier la structure finale

```bash
ls -la .claude/skills/
# Chaque skill gstack doit afficher :
# lrwxrwxrwx ... browse -> .../gstack/browse
```

Structure attendue :

```
.claude/skills/
├── anthropic-skills/       ← git clone github.com/anthropics/skills
├── browse/                 ← symlink → gstack/browse
├── code_review_pura/       ← skill custom  (SKILL_code_review.md)
├── design-consultation/    ← symlink → gstack/design-consultation
├── design-review/          ← symlink → gstack/design-review
├── document-release/       ← symlink → gstack/document-release
├── gstack/                 ← git clone github.com/garrytan/gstack + npm install
├── gstack-upgrade/         ← symlink → gstack/gstack-upgrade
├── next_dev_pura/          ← skill custom  (SKILL.md)
├── plan-ceo-review/        ← symlink → gstack/plan-ceo-review
├── plan-design-review/     ← symlink → gstack/plan-design-review
├── plan-eng-review/        ← symlink → gstack/plan-eng-review
├── qa/                     ← symlink → gstack/qa
├── qa-only/                ← symlink → gstack/qa-only
├── retro/                  ← symlink → gstack/retro
├── review/                 ← symlink → gstack/review
├── setup-browser-cookies/  ← symlink → gstack/setup-browser-cookies
└── ship/                   ← symlink → gstack/ship
```

---

## 4. Comment ce projet a été construit avec Claude Code

Ce projet a été entièrement développé avec **Claude Code** — l'agent de coding en terminal d'Anthropic. Claude Code ne se contente pas de générer du code : il lit les fichiers du projet, exécute des commandes, comprend le contexte complet du codebase, et utilise des **skills** pour appliquer une expertise persistante à chaque session.

### Historique des sessions de développement

#### Session 1 — Exploration et documentation
**Objectif :** Comprendre la structure existante et créer le `CLAUDE.md`.

Prompts utilisés :
```
Explore the project structure and list all existing files.
Create a CLAUDE.md that documents the full stack, all models,
all routes, the design system rules, and the build order for this project.
```

**Résultat :** `CLAUDE.md` complet qui sert de mémoire permanente à Claude lors de toutes les sessions suivantes.

---

#### Session 2 — Construction Phase 1 (Public)
**Objectif :** Construire tous les composants publics, pages, et API routes.

Prompts utilisés :
```
Build all Mongoose models: Company, BrandUpProfile, TraceUpProfile,
LinkUpProfile, RSEBadge, Sponsoring. Follow the schemas in CLAUDE.md exactly.
```
```
Create the lib/utils.ts file with: generateSlug, getUniqueSlug,
isBoostActive, extractYouTubeId, getYouTubeThumbnail.
```
```
Build the GET /api/companies route (search engine).
It must support: q, type, sector, city, market, page, limit.
Sort boosted profiles first, then alphabetically.
```
```
Build the /brandup search page with SearchBar, FilterPanel,
CompanyGrid, CompanyCard, Pagination, and SponsoringBanner components.
Use the Microsoft Fluent Design System from CLAUDE.md. Blue accent #0078D4.
```
```
Build the /brandup/[slug] public profile page.
Fetch company + BrandUpProfile + RSE from the API.
Increment viewCount server-side. Return 404 if profile is not active.
```
```
Build the /signup page with a 2-step registration flow.
Step 1: email + password + type (B2B/B2C).
Step 2: company name, RNE number, sector, city.
Use Suspense boundary pattern for useSearchParams compatibility.
```

---

#### Session 3 — Construction Phase 2 (Dashboard)
**Objectif :** Construire les 11 pages du dashboard entreprise et toutes leurs API routes.

Prompts utilisés :
```
Build the dashboard layout with a dark sidebar (office.com style, #1F1F1F)
and a sticky topbar with notification bell. Use the exact CSS specs from CLAUDE.md.
```
```
Build the GET /api/dashboard/stats route.
Return: total views per engine, active boost, RSE status,
profile statuses, and unread notification count.
```
```
Build the /dashboard/brandup page.
It must allow editing: shortDescription, about, sector, city, phone, email,
foundedYear, employeesCount, clientsCount.
Include the GalleryUpload component (max 10 images, drag-and-drop).
Updating any field sets profile status to 'pending'.
```
```
Build the VideoManager component for TraceUP.
It must validate YouTube URLs with the regex from CLAUDE.md,
extract the video ID, show a thumbnail, and support add/delete.
Adding/removing videos does NOT trigger status: 'pending'.
```
```
Build the /dashboard/boost page with two tabs:
Tab 1: buy a boost (select profile type + duration + price HT/TTC with TVA 19%)
Tab 2: boost history table.
Use the BoostModal component.
```
```
Build the GET /api/dashboard/billing/[id]/pdf route.
Generate a PDF invoice with pdf-lib containing:
invoiceNumber (MU-YYYY-NNNNN), date, label, HT, TVA 19%, TTC,
AGGREGAX SUARL company details, and the client's company details.
```

---

#### Session 4 — Correction TypeScript et Build
**Objectif :** Résoudre les 24 erreurs TypeScript bloquant `npm run build`.

Prompts utilisés :
```
Run npx tsc --noEmit and fix all TypeScript errors.
```
```
The build fails because useSearchParams() is used without a Suspense boundary.
Refactor /signin, /signup, and /new-password to use the shell + form pattern:
page.tsx = Server Component with <Suspense>
SignInForm.tsx = 'use client' with useSearchParams
```
```
lib/mongodb.ts throws at module load time which breaks npm run build.
Move the MONGODB_URI check inside the connectDB() function so it throws lazily.
Do the same for lib/email.ts with the Resend client.
```

**Résultat :** Build 100% propre, 0 erreur TypeScript.

---

#### Session 5 — Documentation et setup Git
**Objectif :** Documenter l'usage de Claude Code dans le README et nettoyer le repo.

Prompts utilisés :
```
Update the README with a detailed guide to reconstruct the .claude/skills
folder after cloning. Include the full content of the two custom SKILL.md
files so any developer can recreate the setup without external help.
```
```
The git push failed because .claude/skills/browse/dist/browse.exe is 110 MB.
Delete the .git folder (keep all project files), reinitialize git,
and push cleanly — .gitignore already excludes .claude/.
```

---

## 5. Pourquoi le dossier `skills` est essentiel

### Le problème sans skills

Sans skills, Claude Code est un assistant généraliste. Pour chaque session, il faut :
- Réexpliquer le stack technique
- Rappeler les règles de sécurité
- Redéfinir les patterns à suivre
- Reclasser les conventions de code

Résultat : du code incohérent, des oublis, des erreurs répétées.

### Ce que font les skills

Un skill est un **fichier Markdown chargé automatiquement** au début de chaque session Claude Code. Il transforme Claude en expert spécialisé pour votre projet spécifique.

```
Sans skill                          Avec skill next_dev_pura
────────────────────────────────    ────────────────────────────────
Claude généraliste                  Expert Next.js App Router
Ignore les conventions du projet    Connaît tous les patterns du projet
Doit être guidé sur chaque point    Applique les règles automatiquement
Code inconsistant entre sessions    Code cohérent à travers toutes les sessions
Peut oublier la sécurité            Checklist sécurité appliquée systématiquement
```

### Les skills utilisés sur ce projet

| Skill | Type | Rôle sur ce projet |
|---|---|---|
| `next_dev_pura` | Custom | Expert fullstack Next.js — applique automatiquement tous les patterns du projet |
| `code_review_pura` | Custom | Reviewer senior — audite chaque fichier (sécurité, bugs, performance) |
| `browse` | gstack | Permet à Claude de naviguer le web pour consulter la doc officielle |
| `qa` | gstack | Checklist QA complète avant mise en production |
| `review` | gstack | Workflow de revue de code structuré |
| `ship` | gstack | Guide le processus de release (version, changelog, PR, push) |
| `design-review` | gstack | Audit visuel de l'interface (spacing, hiérarchie, cohérence) |
| `plan-eng-review` | gstack | Revue d'architecture et plan d'implémentation |

### Comment les skills sont chargés

Claude Code scanne automatiquement `.claude/skills/` au démarrage. Chaque dossier contenant un fichier `.md` avec un frontmatter `name` + `description` est chargé comme skill disponible.

Claude décide **lui-même** quel skill activer en fonction de la description et de la demande de l'utilisateur. On peut aussi invoquer explicitement un skill avec `/nom-du-skill`.

---

## 6. Comment créer un skill personnalisé

### Structure d'un skill

```
.claude/skills/
└── mon_skill/
    └── SKILL.md        ← fichier principal (nom libre, doit finir en .md)
    └── references/     ← optionnel : fichiers de référence additionnels
        └── checklist.md
        └── examples.md
```

Un skill peut contenir **plusieurs fichiers Markdown**. Claude les lit tous au démarrage.

### Format du fichier SKILL.md

```markdown
---
name: nom-du-skill
description: >
  Description précise du skill. Claude lit cette description pour décider
  quand l'activer automatiquement. Mentionner les mots-clés déclencheurs :
  "quand l'utilisateur demande X", "pour toute tâche impliquant Y".
  Plus la description est précise, mieux Claude sait quand l'utiliser.
---

# Titre du Skill

[Corps du skill : instructions, règles, patterns, exemples de code...]
```

Le frontmatter YAML est **obligatoire**. Sans `name` et `description`, le skill n'est pas reconnu.

### Contenu d'un skill efficace

Un bon skill contient :

| Section | Contenu | Pourquoi |
|---|---|---|
| **Persona** | "Tu es un expert en..." | Calibre le ton et le niveau d'expertise |
| **Stack référence** | Tableau des technos + versions | Évite les mauvaises versions ou libs alternatives |
| **Patterns de code** | Snippets des patterns exacts à suivre | Claude reproduit exactement ces patterns |
| **Checklist sécurité** | Liste des points obligatoires | Rien n'est oublié |
| **Anti-patterns** | Tableau Mauvais → Bon | Évite les erreurs connues |
| **Règles projet** | Règles spécifiques à ce projet | Garde la cohérence entre sessions |
| **Format de sortie** | Template de réponse attendu | Sorties structurées et prévisibles |

### Exemple complet : skill pour une API REST Express

```markdown
---
name: express-api-expert
description: >
  Expert développeur API REST Express.js + TypeScript. Déclencher ce skill
  pour toute tâche impliquant des routes Express, middleware, validation,
  authentification JWT, ou gestion d'erreurs. Activer aussi pour debugging
  d'API, revue de sécurité, ou questions sur la structure du projet.
---

# Express API Expert

Tu es un développeur backend senior spécialisé Express.js + TypeScript.

## RÈGLES ABSOLUES

1. Toujours valider les entrées avec Joi ou Zod avant traitement
2. JWT vérifié dans un middleware — jamais inline dans les routes
3. Erreurs logguées avec winston, jamais console.log en production
4. Soft delete uniquement (deletedAt: Date | null)
5. Réponses HTTP strictes : 200, 201, 400, 401, 403, 404, 500

## PATTERN ROUTE STANDARD

```typescript
router.post('/resource', authenticate, validate(schema), async (req, res) => {
  try {
    const data = await ResourceService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (err) {
    logger.error('[POST /resource]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## CHECKLIST SÉCURITÉ

- [ ] Rate limiting sur les routes publiques
- [ ] Helmet configuré
- [ ] CORS whitelist explicite
- [ ] Mots de passe hashés avec bcrypt rounds:12
- [ ] Tokens JWT expirés après 24h max
```

### Activer un skill explicitement

```bash
# Dans Claude Code, pour forcer l'activation d'un skill :
/express-api-expert

# Ou dans le prompt :
"En utilisant le skill express-api-expert, crée la route POST /users"
```

### Tips pour écrire un skill efficace

- **Description longue et précise** : c'est le critère principal d'activation automatique
- **Snippets de code réels** : copier les patterns exacts du projet, pas des exemples génériques
- **Anti-patterns explicites** : lister ce qu'il ne faut PAS faire, avec exemples
- **Règles projet-spécifiques** : tout ce qui est propre à votre codebase et non-évident
- **Checklist actionnable** : des cases à cocher, pas des paragraphes

---

## 7. Commandes Claude Code essentielles

### Lancer Claude Code

```bash
# Depuis la racine du projet
claude

# Avec un prompt direct (mode non-interactif)
claude "Explique la structure du projet"

# En mode plan (réfléchit avant d'agir)
claude --plan "Ajoute une fonctionnalité de recherche avancée"
```

### Commandes slash (dans la session interactive)

| Commande | Description |
|---|---|
| `/help` | Affiche toutes les commandes disponibles |
| `/exit` ou `Ctrl+C` | Quitte Claude Code |
| `/clear` | Vide le contexte de la conversation |
| `/status` | Affiche l'état de la session (modèle, tokens, etc.) |
| `/compact` | Compresse l'historique pour libérer du contexte |
| `/memory` | Affiche les mémoires persistantes du projet |
| `/cost` | Affiche le coût estimé de la session |

### Invoquer un skill

```bash
# Appel explicite d'un skill (ex: /nom-du-skill)
/next_dev_pura
/qa
/ship
/design-review
/review
```

### Commandes de workflow

```bash
# QA complet de l'application
/qa

# Revue de code avant merge
/review

# Audit visuel de l'interface
/design-review

# Process de release (version + changelog + PR)
/ship

# Navigation web (chercher dans la doc officielle)
/browse https://nextjs.org/docs/app/...

# Rétrospective hebdomadaire
/retro

# Planification ingénierie
/plan-eng-review
```

### Patterns de prompts efficaces

**Construire une fonctionnalité complète :**
```
Construis [nom de la fonctionnalité].
Fichiers à créer : [liste].
Comportement attendu : [description précise].
Suis les patterns du CLAUDE.md et du skill next_dev_pura.
```

**Corriger un bug :**
```
J'ai cette erreur : [coller l'erreur complète]
Elle apparaît quand je [action].
Fichiers concernés : [liste].
Trouve la cause racine et corrige-la.
```

**Revue de sécurité :**
```
Fais une revue de sécurité complète de [fichier ou dossier].
Utilise la checklist du skill code_review_pura.
Priorise les problèmes par sévérité.
```

**Débogage TypeScript :**
```
Lance npx tsc --noEmit et corrige toutes les erreurs.
Ne change pas le comportement, corrige seulement les types.
```

**Refactoring :**
```
Refactorise [fichier] pour suivre les patterns du skill.
Garde le même comportement, améliore : [type safety / perf / lisibilité].
```

### Raccourcis clavier

| Raccourci | Action |
|---|---|
| `Ctrl+C` | Interrompre une génération en cours |
| `Ctrl+L` | Vider l'écran |
| `↑` / `↓` | Naviguer dans l'historique des prompts |
| `Tab` | Autocomplétion des chemins de fichiers |

---

## 8. Déploiement sur Vercel

```bash
# Via Vercel CLI
npm i -g vercel
vercel

# Variables d'environnement à configurer sur Vercel :
MONGODB_URI
NEXTAUTH_URL           # https://votre-domaine.vercel.app
NEXTAUTH_SECRET
NEXT_PUBLIC_APP_URL    # https://votre-domaine.vercel.app
RESEND_API_KEY
EMAIL_FROM
CRON_SECRET
# Cloudinary (production uploads)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Le fichier `vercel.json` inclut la configuration du cron job pour l'expiration des boosts (tous les jours à 9h00).

---

> Développé avec [Claude Code](https://www.anthropic.com/claude-code) par Anthropic.
