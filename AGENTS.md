# AGENTS.md — portfolio-cag

> Última actualización: 2026-06-18
> Estado del plan: EPIC 0–7 ✅, EPIC 8 🟡 (deploy hecho, tests parciales)
> Producción: `https://cagg.vercel.app` (alias: `dev-cagg.vercel.app`)
> 63 commits en `develop`, último deploy Ready hace ~19h.

---

## 1. Qué es este proyecto

**portfolio-cag** es la migración del portfolio de Carlos Armando Guerra desde la plataforma Emergent (React CRA + Python FastAPI + MongoDB) a un stack moderno propio.

| Ítem | Valor |
|------|-------|
| Framework | Next.js 16 App Router |
| Lenguaje | TypeScript (strict) |
| Package manager | pnpm |
| DB | NeonDB (PostgreSQL) |
| ORM | Prisma |
| Auth | Better Auth + TOTP (otpauth) |
| Imágenes | Cloudinary + next/image |
| Email | Resend |
| UI | shadcn/ui + Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Rich text | Tiptap |
| Charts | Recharts |
| i18n | next-intl (es / en) |
| Fetching cliente | Axios |
| Testing | Vitest |
| Linting | ESLint + Prettier |
| Bundler | Turbopack (default en v16) |
| Deploy | Vercel |
| Ruta raíz | `/Users/gonzaloyacante/dev/portfolio-cag/` |

---

## 2. Arquitectura

### 2.1 Estructura de carpetas

```
src/
├── app/
│   ├── [locale]/              # next-intl — /es /en
│   │   ├── page.tsx           # Landing pública (ISR, revalidate: 60s)
│   │   └── layout.tsx
│   ├── admin/                 # Panel admin (sin locale)
│   │   ├── layout.tsx         # Auth guard (Server Component)
│   │   ├── page.tsx           # Dashboard
│   │   ├── hero/
│   │   ├── sections/
│   │   ├── projects/
│   │   ├── messages/
│   │   ├── media/
│   │   ├── analytics/
│   │   ├── seo/
│   │   ├── email/
│   │   └── security/          # TOTP 2FA
│   ├── api/
│   │   ├── auth/[...all]/     # Better Auth route handler
│   │   ├── content/           # GET público de contenido (sin auth)
│   │   ├── admin/             # CRUD protegido (requiere sesión)
│   │   ├── media/             # Upload Cloudinary
│   │   ├── messages/          # Formulario de contacto público
│   │   └── analytics/         # Tracking de visitas
│   └── layout.tsx
├── components/
│   ├── landing/               # 15+ secciones del landing
│   ├── admin/                 # Componentes del panel admin
│   └── ui/                    # shadcn/ui
├── lib/
│   ├── auth.ts                # Better Auth config (server)
│   ├── auth-client.ts         # Better Auth client
│   ├── prisma.ts              # Singleton Prisma
│   ├── cloudinary.ts          # Config Cloudinary
│   ├── resend.ts              # Config Resend
│   └── axios.ts               # Instancia Axios configurada
├── middleware.ts              # next-intl + redirect admin sin sesión
├── messages/
│   ├── es.json                # Traducciones español
│   └── en.json                # Traducciones inglés
├── types/
│   └── index.ts               # Tipos compartidos
└── prisma/
    └── schema.prisma          # Schema (equivalente a models.py)
```

### 2.2 Secciones del landing (migradas desde Emergent)

| Componente | Descripción |
|-----------|-------------|
| `Header` | Navegación + toggle idioma |
| `Hero` | Nombre, headline, stats, CTAs |
| `BrandsMarquee` | Carrusel de marcas |
| `Experience` | Cards de experiencia |
| `Process` | Pasos del proceso |
| `Services` | Lista de servicios |
| `Projects` | Grid de proyectos |
| `Results` | Métricas clave |
| `Testimonials` | Testimonios |
| `Timeline` | Línea de tiempo |
| `FAQ` | Preguntas frecuentes |
| `Contact` | Formulario de contacto |
| `Footer` | Footer |
| `StickyWhatsApp` | Botón flotante WhatsApp |
| `SectionIndex` | Índice de secciones |

### 2.3 Páginas del admin (migradas desde Emergent)

| Página | Descripción |
|--------|-------------|
| `Dashboard` | Métricas generales |
| `HeroPage` | Editor del hero |
| `SectionsPage` | Editor de secciones |
| `CollectionPage` | CRUD colecciones (proyectos, experiencia, etc.) |
| `ContactInfoPage` | Info de contacto |
| `AnalyticsPage` | Analytics de visitas |
| `EmailPage` | Configuración email |
| `MessagesPage` | Mensajes recibidos |
| `MediaPage` | Gestión de imágenes (Cloudinary) |
| `SeoPage` | Metadatos SEO |
| `SecurityPage` | TOTP 2FA |
| `SystemPage` | Configuración del sistema |
| `LoginPage` | Login admin |
| `ForgotPasswordPage` | Recuperar contraseña |
| `ResetPasswordPage` | Resetear contraseña |

---

## 3. Reglas absolutas (NUNCA violar)

### 3.1 Package manager

```bash
# ✅ CORRECTO
pnpm install
pnpm add <paquete>
pnpm dev

# ❌ PROHIBIDO
npm install
yarn add
```

### 3.2 TypeScript — sin any

```typescript
// ✅ CORRECTO
function procesar(data: unknown) {
  if (typeof data === 'string') { ... }
}

// ❌ PROHIBIDO
function procesar(data: any) { ... }
```

### 3.3 Prisma — singleton obligatorio

```typescript
// ✅ CORRECTO — usar el singleton de lib/prisma.ts
import { prisma } from '@/lib/prisma';

// ❌ PROHIBIDO — crea conexiones múltiples en development
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

### 3.4 Auth — verificación server-side

```typescript
// ✅ CORRECTO — verificar sesión en Server Component o Route Handler
import { auth } from '@/lib/auth';
const session = await auth.api.getSession({ headers: await headers() });
if (!session) redirect('/admin/login');

// ❌ PROHIBIDO — nunca confiar solo en middleware para proteger datos
```

### 3.5 i18n — sin strings hardcodeados

```typescript
// ✅ CORRECTO
const t = useTranslations('hero');
<h1>{t('headline')}</h1>

// ❌ PROHIBIDO
<h1>Transformo empresas industriales</h1>
```

### 3.6 Logs — sin console.log en producción

```typescript
// ✅ CORRECTO en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('debug:', data);
}

// ✅ CORRECTO — errores reales
console.error('Error procesando:', error);

// ❌ PROHIBIDO en producción
console.log('datos:', response);
```

### 3.7 Rutas admin — siempre protegidas

- El `middleware.ts` redirige `/admin/*` a `/admin/login` si no hay sesión cookie.
- El `admin/layout.tsx` verifica la sesión server-side como segunda capa.
- Nunca exponer datos admin en rutas `/api/content/*` (esas son públicas).

### 3.8 Variables de entorno

```typescript
// ✅ CORRECTO — validar en el punto de uso o en lib/
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error('RESEND_API_KEY no configurada');

// ❌ PROHIBIDO — asumir que existen sin verificar
resend.emails.send({ from: process.env.RESEND_FROM!, ... });
```

### 3.9 Migraciones Prisma

Al modificar `prisma/schema.prisma`:
1. `pnpm db:generate` — regenerar cliente
2. `pnpm db:migrate` (prod) o `pnpm db:push` (dev)
3. Nunca editar el cliente generado manualmente
4. Nunca usar `prisma db push` en producción (siempre `migrate deploy`)

---

## 4. Convenciones de código

### Nombrado

| Elemento | Convención |
|----------|------------|
| Componentes | `PascalCase.tsx` |
| Hooks | `use-nombre.ts` (kebab-case) |
| Utilities | `nombre.ts` (kebab-case) |
| Constantes | `SCREAMING_SNAKE` |
| Variables/funciones | `camelCase` |
| Rutas API | `kebab-case` |

### Commits (Conventional Commits)

```
<type>(<scope>): <descripción en español o inglés>

Tipos válidos: feat, fix, chore, refactor, docs, test, perf, style
Scope: módulo afectado (auth, db, admin, landing, api, i18n, media, etc.)

Ejemplos:
  feat(auth): implement totp 2fa plugin
  fix(landing): correct bilingual content fallback
  chore(db): add prisma schema for hero model
  test(api): cover content route handlers
```

- NUNCA `git commit --no-verify`
- NUNCA `git push --force` en `develop` o `main`
- Un commit por cambio lógico

### Verificaciones obligatorias antes de commit

```bash
pnpm lint          # 0 errores, 0 warnings
pnpm typecheck     # 0 errores TypeScript
pnpm format:check  # Prettier sin diferencias
pnpm test          # Todos los tests pasan
```

---

## 5. Variables de entorno requeridas

| Variable | Propósito | Cuándo |
|---------|-----------|--------|
| `DATABASE_URL` | Neon PostgreSQL (pooling) | Siempre |
| `DIRECT_DATABASE_URL` | Neon PostgreSQL (directo) | Siempre |
| `BETTER_AUTH_SECRET` | Secret de sesiones | Siempre |
| `BETTER_AUTH_URL` | URL del sitio | Siempre |
| `ADMIN_EMAIL` | Email del admin único | Siempre |
| `ADMIN_PASSWORD` | Password inicial | Setup |
| `CLOUDINARY_CLOUD_NAME` | Cloud Cloudinary | Fase media |
| `CLOUDINARY_API_KEY` | API key Cloudinary | Fase media |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary | Fase media |
| `RESEND_API_KEY` | Emails transaccionales | Fase email |
| `RESEND_FROM_EMAIL` | Email remitente | Fase email |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 | Fase analytics |

---

## 6. Estado del plan de ejecución

> Leyenda: ⬜ No iniciada | 🟡 En progreso | ✅ Completa

| EPIC | Nombre | Estado |
|------|--------|--------|
| 0 | Setup + Scaffold | ✅ |
| 1 | DB Schema + Prisma | ✅ |
| 2 | Auth (Better Auth + TOTP) | ✅ |
| 3 | API Routes | ✅ |
| 4 | Landing pública | ✅ |
| 5 | Admin panel | ✅ |
| 6 | Media + Cloudinary | ✅ |
| 7 | SEO + Analytics | ✅ |
| 8 | Testing + Deploy | 🟡 (deploy ✅, tests 3/19 — falta cubrir admin CRUD y utils) |

---

## 7. Comandos de referencia

```bash
# Verificación obligatoria antes de commit
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test

# DB
pnpm db:generate    # regenerar Prisma client
pnpm db:push        # sync schema en desarrollo
pnpm db:migrate     # migraciones en producción
pnpm db:studio      # GUI Prisma
pnpm db:seed        # seed desarrollo

# Dev
pnpm dev            # servidor con Turbopack
pnpm build          # build producción
pnpm start          # servidor producción

# Verificar strings hardcodeados (debe retornar vacío en componentes)
rg "\"[A-Z][a-záéíóúñ]" src/components --glob "*.tsx" | grep -v "className\|href\|src\|alt\|type\|name\|id\|key\|value\|placeholder"

# Verificar console.log fuera de lib/logger
rg "console\.log" src --glob "*.ts" --glob "*.tsx" | grep -v "src/lib/"

# Commit seguro
git status --short
git diff --stat
pnpm lint && pnpm typecheck && pnpm test
git add <archivos exactos>
git commit -m "fix(scope): descripción"
```

---

## 8. Señales de alerta — detenerse y pedir confirmación

- `pnpm lint` o `pnpm typecheck` muestra errores nuevos no documentados
- Un archivo ajeno a la tarea aparece en el diff
- Se propone usar `npm` o `yarn`
- Se propone agregar un servicio externo de pago
- Se propone Auth.js, Drizzle, o cualquier alternativa a las libs del stack
- Un pre-commit hook falla — no usar `--no-verify`
- Tests fallan por motivo no relacionado con la tarea actual
- Se intenta hacer push con `--force` o `--no-verify`

---

## 8.1 Workflow de branches

**Regla de oro:** la rama de trabajo diaria es `develop`. `main` solo recibe
merges para releases.

```
# Flujo normal
git checkout develop          # siempre terminar una tarea aquí
git commit -m "feat: ..."
git push origin develop       # push directo a develop — sí, sin preguntar

# Solo cuando hay un release aprobado
git checkout main
git merge --no-ff develop     # o el commit específico
git push origin main
git checkout develop          # ← siempre volver a develop al final
```

Push directo a `develop` o `main` **sin `--force`** está permitido y es el
camino esperado. La regla de "no push directo" original se refería sólo a
`--force`; si estás parado en la rama y haces un push normal, el trabajo no
se pierde. La única prohibición real es `git push --force` en `develop`.

---

## 9. Prohibiciones absolutas

```
❌ npm / yarn                    → solo pnpm
❌ any en TypeScript             → usar unknown + type guards
❌ new PrismaClient()            → usar singleton de lib/prisma.ts
❌ console.log en producción     → solo console.error o logger
❌ strings hardcodeados en UI    → siempre useTranslations()
❌ git commit --no-verify        → nunca saltear hooks
❌ git push --force              → nunca en ninguna rama (usar `git push --force-with-lease` solo si es estrictamente necesario y con confirmación explícita)
❌ prisma db push en producción  → usar migrate deploy
❌ Auth.js / NextAuth            → este proyecto usa Better Auth
❌ Drizzle                       → este proyecto usa Prisma
❌ npm/yarn en scripts           → pnpm siempre
❌ datos admin en rutas públicas → separar /api/content y /api/admin
```
