# PLAN MAESTRO DE EJECUCIÓN — portfolio-cag

Migración del portfolio de Carlos Armando Guerra desde Emergent (React CRA + Python FastAPI + MongoDB) a Next.js 16 App Router + TypeScript + Prisma + NeonDB + Better Auth + Cloudinary.

Referencia del proyecto existente: `/Users/gonzaloyacante/dev/portfolio` (mismo stack, consultar para patrones).
Proyecto legado: `/Users/gonzaloyacante/dev/portfolio-cag-legacy` (fuente de verdad de componentes y lógica a migrar).

---

## Tabla de Contenidos

1. EPIC 0 — Setup + Scaffold
2. EPIC 1 — DB Schema + Prisma
3. EPIC 2 — Auth (Better Auth + TOTP)
4. EPIC 3 — API Routes
5. EPIC 4 — Landing pública
6. EPIC 5 — Admin panel
7. EPIC 6 — Media + Cloudinary
8. EPIC 7 — SEO + Analytics
9. EPIC 8 — Testing + Deploy

---

## EPIC 0 — Setup + Scaffold

### E0-T1 — Scaffold Next.js 16

- Estado: ✅ Hecho
- Branch: `chore/scaffold`
- 🔒 Prerequisito: ninguno.

#### E0-T1-P1 — Crear proyecto

```bash
cd /Users/gonzaloyacante/dev/portfolio-cag
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

#### E0-T1-P2 — Verificar versiones

```bash
cat package.json | grep '"next"'
# Debe ser ^16.x.x
node --version
# Debe ser >= 20.9
```

#### E0-T1-P3 — Limpiar boilerplate

Eliminar:
- `src/app/page.tsx` (reemplazar con landing)
- `src/app/globals.css` contenido (mantener archivo, reescribir tokens)
- `public/vercel.svg`, `public/next.svg`

#### E0-T1-P4 — Commit

```bash
git init
git add .
git commit -m "chore(scaffold): initialize next.js 16 project"
```

Criterio done: `pnpm dev` levanta sin errores. `pnpm build` compila.

---

### E0-T2 — Configurar ESLint + Prettier + Husky

- Estado: ✅ Hecho
- Branch: `chore/scaffold`
- 🔒 Prerequisito: E0-T1 DONE.

#### E0-T2-P1 — Instalar Prettier

```bash
pnpm add -D prettier prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports
```

#### E0-T2-P2 — Crear `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  "importOrder": ["^(react|next)", "^@/", "^[./]"],
  "importOrderSeparation": true
}
```

#### E0-T2-P3 — Configurar Husky + lint-staged

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

Crear `.husky/pre-commit`:
```bash
#!/bin/sh
pnpm lint-staged
```

Agregar en `package.json`:
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

#### E0-T2-P4 — Agregar scripts en package.json

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint --max-warnings=0",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:admin": "tsx scripts/seed-admin.ts"
  }
}
```

#### E0-T2-P5 — Commit

```bash
pnpm lint
git add .
git commit -m "chore(lint): configure eslint, prettier, husky"
```

---

### E0-T3 — Instalar dependencias del stack

- Estado: ✅ Hecho
- Branch: `chore/scaffold`
- 🔒 Prerequisito: E0-T2 DONE.

#### E0-T3-P1 — Dependencias principales

```bash
# DB + ORM
pnpm add prisma @prisma/client @prisma/adapter-neon @neondatabase/serverless

# Auth
pnpm add better-auth otpauth

# UI
pnpm add tailwindcss-animate class-variance-authority clsx tailwind-merge
pnpm add lucide-react

# Forms + Validación
pnpm add react-hook-form @hookform/resolvers zod

# i18n
pnpm add next-intl

# HTTP
pnpm add axios

# Email
pnpm add resend

# Cloudinary
pnpm add cloudinary next-cloudinary

# Rich text
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder

# Charts
pnpm add recharts

# Utilidades
pnpm add date-fns

# Dev
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
pnpm add -D tsx @types/node
```

#### E0-T3-P2 — Instalar shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

Seleccionar: TypeScript, Default style, CSS variables, `src/` directory, `@/` alias.

Componentes base inmediatos:
```bash
pnpm dlx shadcn@latest add button input label card dialog sheet tabs toast sonner
pnpm dlx shadcn@latest add dropdown-menu avatar badge separator
pnpm dlx shadcn@latest add form select textarea switch
```

#### E0-T3-P3 — Configurar Prisma

```bash
pnpm dlx prisma init --datasource-provider postgresql
```

Editar `prisma/schema.prisma` para agregar adapter Neon (ver E1-T1).

#### E0-T3-P4 — Commit

```bash
pnpm lint
git add .
git commit -m "chore(deps): install full stack dependencies"
```

---

### E0-T4 — Configurar next-intl

- Estado: ✅ Hecho
- Branch: `chore/scaffold`
- 🔒 Prerequisito: E0-T3 DONE.

#### E0-T4-P1 — Crear archivos de mensajes

Archivo: `src/messages/es.json`
```json
{
  "meta": {
    "title": "Carlos Armando Guerra — Consultor Industrial",
    "description": "Transformo empresas industriales con soluciones de consultoría estratégica."
  }
}
```

Archivo: `src/messages/en.json`
```json
{
  "meta": {
    "title": "Carlos Armando Guerra — Industrial Consultant",
    "description": "I transform industrial companies with strategic consulting solutions."
  }
}
```

#### E0-T4-P2 — Crear i18n config

Archivo: `src/i18n/request.ts`
```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as 'es' | 'en')) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

Archivo: `src/i18n/routing.ts`
```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
});
```

#### E0-T4-P3 — Crear middleware.ts

Archivo: `src/middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas admin — redirect a login si no hay sesión cookie
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token');
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Rutas que no necesitan i18n
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
```

#### E0-T4-P4 — Crear estructura de carpetas app

```
src/app/
├── [locale]/
│   ├── layout.tsx
│   └── page.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   └── login/
│       └── page.tsx
└── api/
    └── auth/
        └── [...all]/
            └── route.ts
```

#### E0-T4-P5 — Commit

```bash
pnpm lint && pnpm typecheck
git add .
git commit -m "feat(i18n): configure next-intl with es/en routing"
```

---

### E0-T5 — Baseline de calidad

- Estado: ✅ Hecho
- Branch: `chore/scaffold`
- 🔒 Prerequisito: E0-T4 DONE.

#### E0-T5-P1 — Verificar baseline

```bash
pnpm lint          # 0 errores
pnpm typecheck     # 0 errores
pnpm build         # build exitoso
pnpm test          # (puede no haber tests aún, debe pasar)
```

#### E0-T5-P2 — Merge a develop

```bash
git checkout -b develop
git merge --no-ff chore/scaffold -m "Merge branch 'chore/scaffold' — EPIC 0 completado"
git log --oneline -5
```

Criterio done: scaffold completo, dependencias instaladas, i18n configurado, build exitoso.

---

## EPIC 1 — DB Schema + Prisma

### E1-T1 — Schema Prisma (equivalente a models.py)

- Estado: ✅ Hecho
- Branch: `feat/db-schema`
- 🔒 Prerequisito: E0-T5 DONE.

#### E1-T1-P1 — Crear branch

```bash
git checkout develop
git checkout -b feat/db-schema
```

#### E1-T1-P2 — Escribir schema.prisma

Archivo: `prisma/schema.prisma`

Traducir los modelos de `portfolio-cag-legacy/backend/models.py` a Prisma.

Modelos principales:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

// === Auth (Better Auth genera estas tablas) ===
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
  totpCredential TotpCredential?
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?   @db.Text
  refreshToken          String?   @db.Text
  idToken               String?   @db.Text
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}

model TotpCredential {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  secret    String   @db.Text
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// === Contenido bilingüe ===

model Hero {
  id             String   @id @default(cuid())
  overlineEs     String
  overlineEn     String
  name           String
  headlineEs     String
  headlineEn     String
  summaryEs      String   @db.Text
  summaryEn      String   @db.Text
  ctaWhatsappEs  String   @default("WhatsApp")
  ctaWhatsappEn  String   @default("WhatsApp")
  ctaEmailEs     String   @default("Escribir Email")
  ctaEmailEn     String   @default("Send Email")
  ctaLinkedinEs  String   @default("LinkedIn")
  ctaLinkedinEn  String   @default("LinkedIn")
  stats          HeroStat[]
  updatedAt      DateTime @updatedAt
}

model HeroStat {
  id       String @id @default(cuid())
  heroId   String
  hero     Hero   @relation(fields: [heroId], references: [id], onDelete: Cascade)
  value    String
  labelEs  String
  labelEn  String
  order    Int    @default(0)
}

model ExperienceCard {
  id      String @id @default(cuid())
  code    String @unique
  titleEs String
  titleEn String
  bodyEs  String @db.Text
  bodyEn  String @db.Text
  order   Int    @default(0)
}

model ProcessStep {
  id             String @id @default(cuid())
  code           String @unique
  titleEs        String
  titleEn        String
  bodyEs         String @db.Text
  bodyEn         String @db.Text
  deliverableEs  String
  deliverableEn  String
  order          Int    @default(0)
}

model Service {
  id      String @id @default(cuid())
  labelEs String
  labelEn String
  order   Int    @default(0)
}

model Project {
  id               String @id @default(cuid())
  tag              String
  periodEs         String
  periodEn         String
  titleEs          String
  titleEn          String
  challengeEs      String @db.Text
  challengeEn      String @db.Text
  interventionEs   String @db.Text
  interventionEn   String @db.Text
  outcomeEs        String @db.Text
  outcomeEn        String @db.Text
  order            Int    @default(0)
}

model ResultItem {
  id    String @id @default(cuid())
  kEs   String
  kEn   String
  vEs   String
  vEn   String
  order Int    @default(0)
}

model Testimonial {
  id       String @id @default(cuid())
  quoteEs  String @db.Text
  quoteEn  String @db.Text
  roleEs   String
  roleEn   String
  sectorEs String
  sectorEn String
  order    Int    @default(0)
}

model TimelineItem {
  id      String @id @default(cuid())
  period  String
  titleEs String
  titleEn String
  bodyEs  String @db.Text
  bodyEn  String @db.Text
  order   Int    @default(0)
}

model FaqItem {
  id    String @id @default(cuid())
  qEs   String
  qEn   String
  aEs   String @db.Text
  aEn   String @db.Text
  order Int    @default(0)
}

model Brand {
  id    String @id @default(cuid())
  name  String
  order Int    @default(0)
}

model ContactInfo {
  id              String @id @default(cuid())
  name            String
  phoneDisplay    String
  whatsappNumber  String
  email           String
  linkedinUrl     String
  linkedinHandle  String
  location        String
}

model SectionMeta {
  id         String  @id @default(cuid())
  slug       String  @unique
  overlineEs String?
  overlineEn String?
  titleEs    String?
  titleEn    String?
  descEs     String? @db.Text
  descEn     String? @db.Text
  extra      Json    @default("{}")
  updatedAt  DateTime @updatedAt
}

// === Mensajes de contacto ===

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String   @default("")
  message   String   @db.Text
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

// === Media ===

model MediaFile {
  id           String   @id @default(cuid())
  publicId     String   @unique
  url          String
  secureUrl    String
  format       String
  width        Int?
  height       Int?
  bytes        Int?
  folder       String   @default("portfolio-cag")
  createdAt    DateTime @default(now())
}

// === SEO ===

model SeoConfig {
  id           String   @id @default(cuid())
  slug         String   @unique
  titleEs      String?
  titleEn      String?
  descEs       String?  @db.Text
  descEn       String?  @db.Text
  ogImage      String?
  noIndex      Boolean  @default(false)
  updatedAt    DateTime @updatedAt
}

// === Analytics ===

model PageView {
  id        String   @id @default(cuid())
  path      String
  referrer  String?
  userAgent String?
  ipHash    String?
  createdAt DateTime @default(now())

  @@index([path])
  @@index([createdAt])
}

// === Configuración del sistema ===

model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   @db.Text
  updatedAt DateTime @updatedAt
}
```

#### E1-T1-P3 — Verificación

```bash
pnpm dlx prisma validate
pnpm lint && pnpm typecheck
```

#### E1-T1-P4 — Commit

```bash
git add prisma/schema.prisma
git commit -m "chore(db): define prisma schema from models.py"
```

---

### E1-T2 — Singleton Prisma + conexión NeonDB

- Estado: ✅ Hecho
- Branch: `feat/db-schema`
- 🔒 Prerequisito: E1-T1 DONE.

#### E1-T2-P1 — Crear lib/prisma.ts

Archivo: `src/lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### E1-T2-P2 — Configurar .env.local

```bash
cp .env.example .env.local
# Agregar las variables de NeonDB:
# DATABASE_URL=postgresql://...
# DIRECT_DATABASE_URL=postgresql://...
```

#### E1-T2-P3 — Primera migración

```bash
pnpm db:generate
pnpm db:push   # desarrollo
```

#### E1-T2-P4 — Commit

```bash
pnpm lint && pnpm typecheck
git add src/lib/prisma.ts .env.example
git commit -m "feat(db): add prisma singleton with neon adapter"
```

---

### E1-T3 — Seed de datos iniciales

- Estado: ✅ Hecho
- Branch: `feat/db-schema`
- 🔒 Prerequisito: E1-T2 DONE.

#### E1-T3-P1 — Crear seed script

Archivo: `prisma/seed.ts`

Migrar los datos de `portfolio-cag-legacy/backend/seed_data.py` a TypeScript usando el cliente Prisma. El seed debe ser idempotente (upsert, no insert).

```typescript
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Seeding database...');

  // Hero
  await prisma.hero.upsert({
    where: { id: 'hero-main' },
    update: {},
    create: {
      id: 'hero-main',
      overlineEs: 'Consultor Industrial',
      overlineEn: 'Industrial Consultant',
      name: 'Carlos Armando Guerra',
      headlineEs: 'Transformo empresas industriales',
      headlineEn: 'I transform industrial companies',
      summaryEs: '...',
      summaryEn: '...',
      stats: {
        create: [
          { value: '15+', labelEs: 'Años de experiencia', labelEn: 'Years of experience', order: 0 },
          { value: '50+', labelEs: 'Proyectos completados', labelEn: 'Projects completed', order: 1 },
        ],
      },
    },
  });

  // ContactInfo
  await prisma.contactInfo.upsert({
    where: { id: 'contact-main' },
    update: {},
    create: {
      id: 'contact-main',
      name: 'Carlos Armando Guerra',
      phoneDisplay: '+58 412 000 0000',
      whatsappNumber: '584120000000',
      email: 'carlos@example.com',
      linkedinUrl: 'https://linkedin.com/in/carlosguerra',
      linkedinHandle: '@carlosguerra',
      location: 'Venezuela',
    },
  });

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Completar con datos reales del `seed_data.py` del legado.

#### E1-T3-P2 — Verificación

```bash
pnpm db:seed
pnpm db:studio  # verificar visualmente
```

#### E1-T3-P3 — Commit

```bash
git add prisma/seed.ts
git commit -m "feat(db): add seed script with initial content"
```

#### E1-T3-P4 — Merge a develop

```bash
pnpm lint && pnpm typecheck && pnpm test
git checkout develop
git merge --no-ff feat/db-schema -m "Merge branch 'feat/db-schema' — EPIC 1 completado"
```

---

## EPIC 2 — Auth (Better Auth + TOTP)

### E2-T1 — Better Auth setup

- Estado: ✅ Hecho
- Branch: `feat/auth`
- 🔒 Prerequisito: E1-T3 DONE.

#### E2-T1-P1 — Crear branch

```bash
git checkout develop
git checkout -b feat/auth
```

#### E2-T1-P2 — Crear lib/auth.ts (server)

Referencia: `/Users/gonzaloyacante/dev/portfolio/src/lib/auth.ts`

Archivo: `src/lib/auth.ts`
```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { totp } from 'better-auth/plugins';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    totp({
      issuer: process.env.BETTER_AUTH_URL ?? 'portfolio-cag',
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 días
    },
  },
});
```

#### E2-T1-P3 — Crear lib/auth-client.ts

Archivo: `src/lib/auth-client.ts`
```typescript
import { createAuthClient } from 'better-auth/client';
import { totpClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  plugins: [totpClient()],
});
```

#### E2-T1-P4 — Crear route handler

Archivo: `src/app/api/auth/[...all]/route.ts`
```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
```

#### E2-T1-P5 — Seed admin user

Archivo: `scripts/seed-admin.ts`
```typescript
import { auth } from '../src/lib/auth';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Admin';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son requeridos');
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
    });
    console.log('✅ Admin creado:', email);
  } catch {
    console.log('ℹ️  Admin ya existe o error — revisar manualmente');
  }
}

seedAdmin().catch(console.error);
```

#### E2-T1-P6 — Commit

```bash
pnpm lint && pnpm typecheck
git add src/lib/auth.ts src/lib/auth-client.ts src/app/api/auth scripts/seed-admin.ts
git commit -m "feat(auth): setup better-auth with prisma adapter"
```

---

### E2-T2 — Login page + Admin layout guard

- Estado: ✅ Hecho
- Branch: `feat/auth`
- 🔒 Prerequisito: E2-T1 DONE.

#### E2-T2-P1 — Login page

Archivo: `src/app/admin/login/page.tsx`

Formulario con React Hook Form + Zod:
- Campo email
- Campo password
- Campo TOTP (aparece si la cuenta tiene 2FA activado)
- Botón submit
- Manejo de errores
- Redirect a `/admin` on success

#### E2-T2-P2 — Admin layout guard

Archivo: `src/app/admin/layout.tsx`
```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/admin/login');
  return <AdminShell>{children}</AdminShell>;
}
```

#### E2-T2-P3 — ForgotPassword + ResetPassword pages

Migrar la lógica de `ForgotPasswordPage.jsx` y `ResetPasswordPage.jsx` del legado usando la API de Better Auth para reset de contraseña.

#### E2-T2-P4 — Commit

```bash
pnpm lint && pnpm typecheck
git add src/app/admin/
git commit -m "feat(auth): add login page and admin layout guard"
```

---

### E2-T3 — TOTP 2FA management

- Estado: ✅ Hecho
- Branch: `feat/auth`
- 🔒 Prerequisito: E2-T2 DONE.

#### E2-T3-P1 — SecurityPage en admin

Migrar `SecurityPage.jsx` del legado:
- Mostrar estado de 2FA (activado/desactivado)
- Botón para activar: genera QR con `otpauth` → escanear → verificar código → activar
- Botón para desactivar: pide código actual → desactiva

#### E2-T3-P2 — Commit + merge

```bash
pnpm lint && pnpm typecheck && pnpm test
git add src/
git commit -m "feat(auth): implement totp 2fa management"
git checkout develop
git merge --no-ff feat/auth -m "Merge branch 'feat/auth' — EPIC 2 completado"
```

---

## EPIC 3 — API Routes

### E3-T1 — Content routes (GET público)

- Estado: ✅ Hecho
- Branch: `feat/api-routes`
- 🔒 Prerequisito: E2-T3 DONE.

Crear `src/app/api/content/route.ts` que devuelva todo el contenido del landing en un solo request (hero, contact_info, brands, experience, process, services, projects, results, testimonials, timeline, faqs, sections).

Equivalente al `content_router.py` del legado.

---

### E3-T2 — Admin CRUD routes (protegidos)

- Estado: ✅ Hecho
- Branch: `feat/api-routes`
- 🔒 Prerequisito: E3-T1 DONE.

Crear route handlers bajo `src/app/api/admin/` para cada entidad: hero, sections, experience, process, services, projects, results, testimonials, timeline, faqs, brands, contact-info.

Verificar sesión en cada handler con `auth.api.getSession()`.

---

### E3-T3 — Messages + Analytics + SEO routes

- Estado: ✅ Hecho
- Branch: `feat/api-routes`
- 🔒 Prerequisito: E3-T2 DONE.

- `api/messages` — POST público (formulario contacto)
- `api/admin/messages` — GET + PATCH protegido
- `api/analytics` — POST tracking page views
- `api/admin/analytics` — GET stats protegido
- `api/seo/sitemap.xml` — sitemap dinámico
- `api/seo/robots.txt` — robots

#### Merge a develop

```bash
pnpm lint && pnpm typecheck && pnpm test
git checkout develop
git merge --no-ff feat/api-routes -m "Merge branch 'feat/api-routes' — EPIC 3 completado"
```

---

## EPIC 4 — Landing pública

### E4-T1 — Layout + providers + Axios config

- Estado: ✅ Hecho
- Branch: `feat/landing`
- 🔒 Prerequisito: E3-T3 DONE.

Crear `src/lib/axios.ts` con instancia configurada (baseURL desde env, interceptors de error).
Crear `src/app/[locale]/layout.tsx` con NextIntlClientProvider.

---

### E4-T2 — Componentes Hero + Header + BrandsMarquee

- Estado: ✅ Hecho
- Branch: `feat/landing`
- 🔒 Prerequisito: E4-T1 DONE.

Migrar JSX → TSX de:
- `Header.jsx` → `Header.tsx`
- `Hero.jsx` → `Hero.tsx`
- `BrandsMarquee.jsx` → `BrandsMarquee.tsx`

Reemplazar `useLang()` y `useContent()` por props tipadas (datos vienen del Server Component padre).
Reemplazar strings hardcodeados por `useTranslations()`.

---

### E4-T3 — Experience + Process + Services

- Estado: ✅ Hecho
- Branch: `feat/landing`
- 🔒 Prerequisito: E4-T2 DONE.

Migrar: `Experience.jsx`, `Process.jsx`, `Services.jsx`

---

### E4-T4 — Projects + Results + Testimonials

- Estado: ✅ Hecho
- Branch: `feat/landing`
- 🔒 Prerequisito: E4-T3 DONE.

Migrar: `Projects.jsx`, `Results.jsx`, `Testimonials.jsx`

---

### E4-T5 — Timeline + FAQ + Contact + Footer + StickyWhatsApp

- Estado: ✅ Hecho
- Branch: `feat/landing`
- 🔒 Prerequisito: E4-T4 DONE.

Migrar: `Timeline.jsx`, `FAQ.jsx`, `Contact.jsx`, `Footer.jsx`, `StickyWhatsApp.jsx`, `SectionIndex.jsx`

---

### E4-T6 — Landing page principal (ISR)

- Estado: ✅ Hecho
- Branch: `feat/landing`
- 🔒 Prerequisito: E4-T5 DONE.

Crear `src/app/[locale]/page.tsx`:
- Fetch de contenido server-side con `prisma` directamente (no Axios en server)
- `export const revalidate = 60;`
- Pasar datos como props a cada componente

#### Merge a develop

```bash
pnpm lint && pnpm typecheck && pnpm test
git checkout develop
git merge --no-ff feat/landing -m "Merge branch 'feat/landing' — EPIC 4 completado"
```

---

## EPIC 5 — Admin panel

### E5-T1 — AdminShell (layout + sidebar)

- Estado: ✅ Hecho
- Branch: `feat/admin`
- 🔒 Prerequisito: E4-T6 DONE.

Crear `src/components/admin/AdminShell.tsx` con:
- Sidebar con links a todas las secciones del admin
- Header con nombre del usuario + logout
- Área de contenido

---

### E5-T2 al E5-T12 — Páginas del admin

Migrar cada página del admin del legado, en este orden:

| Tarea | Página | Descripción |
|-------|--------|-------------|
| E5-T2 | Dashboard | Métricas: mensajes no leídos, page views, últimos mensajes |
| E5-T3 | HeroPage | Editor del hero con React Hook Form + Zod |
| E5-T4 | SectionsPage | Editor de section metas |
| E5-T5 | CollectionPage | CRUD genérico para experience, process, services, projects, etc. con Tiptap |
| E5-T6 | ContactInfoPage | Editor de info de contacto |
| E5-T7 | MessagesPage | Lista de mensajes con marcar como leído |
| E5-T8 | MediaPage | Browser de imágenes Cloudinary (ver EPIC 6) |
| E5-T9 | AnalyticsPage | Charts de page views con Recharts |
| E5-T10 | SeoPage | Editor de metadatos SEO por sección |
| E5-T11 | EmailPage | Configuración del email (remitente, notificaciones) |
| E5-T12 | SystemPage | Settings del sistema |

#### Merge a develop

```bash
pnpm lint && pnpm typecheck && pnpm test
git checkout develop
git merge --no-ff feat/admin -m "Merge branch 'feat/admin' — EPIC 5 completado"
```

---

## EPIC 6 — Media + Cloudinary

### E6-T1 — Cloudinary config + upload API

- Estado: ✅ Hecho
- Branch: `feat/media`
- 🔒 Prerequisito: E5-T12 DONE.

#### E6-T1-P1 — Crear lib/cloudinary.ts

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
```

#### E6-T1-P2 — Upload API route

Archivo: `src/app/api/admin/media/route.ts`
- POST: recibe FormData con imagen, sube a Cloudinary, guarda MediaFile en DB, retorna URL
- GET: lista MediaFile de la DB con paginación
- DELETE: elimina de Cloudinary y de la DB

---

### E6-T2 — Media browser component

- Estado: ✅ Hecho
- Branch: `feat/media`
- 🔒 Prerequisito: E6-T1 DONE.

Crear `src/components/admin/MediaBrowser.tsx` para la MediaPage del admin.

#### Merge a develop

```bash
git checkout develop
git merge --no-ff feat/media -m "Merge branch 'feat/media' — EPIC 6 completado"
```

---

## EPIC 7 — SEO + Analytics

### E7-T1 — Metadata dinámica + sitemap

- Estado: ✅ Hecho
- Branch: `feat/seo`
- 🔒 Prerequisito: E6-T2 DONE.

- `generateMetadata()` en `[locale]/page.tsx` con datos de SeoConfig de la DB
- `src/app/sitemap.ts` generado dinámicamente
- `src/app/robots.ts`

---

### E7-T2 — GA4 + tracking propio

- Estado: ✅ Hecho
- Branch: `feat/seo`
- 🔒 Prerequisito: E7-T1 DONE.

- Componente `GoogleAnalytics.tsx` (equivalente al del legado)
- Hook `useAnalytics.ts` que llama a `/api/analytics` para tracking propio

#### Merge a develop

```bash
git checkout develop
git merge --no-ff feat/seo -m "Merge branch 'feat/seo' — EPIC 7 completado"
```

---

## EPIC 8 — Testing + Deploy

### E8-T1 — Vitest setup + tests

- Estado: 🟡 Parcial — Vitest + 3 archivos (message-schema, rate-limit, content-structure, 19 tests). Falta cubrir admin CRUD, login/TOTP y utils de formato.
- Branch: `feat/deploy`
- 🔒 Prerequisito: E7-T2 DONE.

Configurar Vitest. Tests mínimos obligatorios:
- API handler `/api/content` retorna estructura correcta
- API handler `/api/messages` valida campos con Zod
- Utilidades de formateo y helpers

---

### E8-T2 — Vercel deploy + variables de entorno

- Estado: ✅ Hecho — proyecto `portfolio-cag` en Vercel, 5+ deploys de prod Ready, alias `cagg.vercel.app` y `dev-cagg.vercel.app`, todas las env vars cargadas (Neon `POSTGRES_*`, Cloudinary, Resend, GA4, Better Auth, Admin). 4 deploys de prod fallaron hace ~21h (Prisma postinstall, ya resuelto).
- Branch: `feat/deploy`
- 🔒 Prerequisito: E8-T1 DONE.

- Conectar repositorio a Vercel
- Configurar todas las env vars en Vercel dashboard
- Deploy a preview → verificar
- Deploy a producción (merge a main)
- `pnpm db:seed:admin` en producción

---

## Orden de ejecución recomendado

```
EPIC 0 (scaffold) → EPIC 1 (DB) → EPIC 2 (auth) → EPIC 3 (API)
→ EPIC 4 (landing) → EPIC 5 (admin) → EPIC 6 (media)
→ EPIC 7 (seo) → EPIC 8 (deploy)
```

No hay paralelismo hasta EPIC 4+:
- EPIC 4 (landing) y EPIC 5 (admin) pueden hacerse en paralelo una vez EPIC 3 esté completo.

---

## Comandos de referencia

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
pnpm dev            # Turbopack dev server
pnpm build          # Build producción
pnpm db:generate    # Regenerar Prisma client (siempre tras cambiar schema)
pnpm db:push        # Sync schema desarrollo
pnpm db:migrate     # Migraciones producción

# Verificar strings hardcodeados
rg "\"[A-Z][a-záéíóúñ]" src/components --glob "*.tsx"

# Verificar console.log
rg "console\.log" src --glob "*.ts" --glob "*.tsx" | grep -v "src/lib/"

# Verificar imports de PrismaClient directo (debe retornar vacío)
rg "new PrismaClient" src --glob "*.ts" --glob "*.tsx" | grep -v "src/lib/prisma"
```

---

## Señales de alerta

- `pnpm lint` o `pnpm typecheck` con errores nuevos sin explicación
- Archivo ajeno a la tarea en el diff
- Propuesta de usar npm/yarn, Auth.js, Drizzle, Firebase
- Hook pre-commit fallando → investigar antes de continuar
- Tests fallando por causa no relacionada con la tarea
