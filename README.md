# portfolio-cag

Portfolio de Carlos Armando Guerra — Migración completa desde Emergent a Next.js 16.

## Producción

- **URL**: [`https://cagg.vercel.app`](https://cagg.vercel.app) (alias: `dev-cagg.vercel.app`)
- **Hosting**: Vercel (proyecto `portfolio-cag`)
- **DB**: Neon (PostgreSQL serverless) — provisionada vía Vercel + Neon integration
- **Último deploy Ready**: ~19h

## Stack

| Capa            | Tecnología                 |
| --------------- | -------------------------- |
| Framework       | Next.js 16 App Router      |
| Lenguaje        | TypeScript                 |
| Package manager | pnpm                       |
| DB              | NeonDB (PostgreSQL)        |
| ORM             | Prisma                     |
| Auth            | Better Auth + TOTP         |
| Imágenes        | Cloudinary                 |
| Email           | Resend                     |
| UI              | shadcn/ui + Tailwind v4    |
| Forms           | React Hook Form + Zod      |
| i18n            | next-intl (es/en)          |
| Analytics       | GA4 (`NEXT_PUBLIC_GA4_ID`) |
| Deploy          | Vercel                     |

## Comandos

```bash
pnpm dev              # Servidor de desarrollo (Turbopack)
pnpm build            # Build de producción
pnpm lint             # ESLint (0 warnings)
pnpm typecheck        # TypeScript check
pnpm format:check     # Prettier check
pnpm test             # Vitest (19 tests, 3 archivos)

pnpm db:generate      # Regenerar Prisma client
pnpm db:push          # Sync schema en dev
pnpm db:migrate       # Migraciones en prod
pnpm db:studio        # Prisma GUI
pnpm db:seed          # Seed de desarrollo
pnpm db:seed:admin    # Crear admin inicial
```

## Pre-commit verification (obligatorio)

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
```

## Variables de entorno (Vercel)

| Variable                                                                 | Propósito                                   |
| ------------------------------------------------------------------------ | ------------------------------------------- |
| `POSTGRES_PRISMA_URL`                                                    | Prisma client (Neon pooling)                |
| `POSTGRES_URL_NON_POOLING`                                               | Prisma migrate (Neon directo)               |
| `BETTER_AUTH_SECRET`                                                     | Secret de sesiones                          |
| `BETTER_AUTH_URL`                                                        | URL pública (ej. `https://cagg.vercel.app`) |
| `NEXT_PUBLIC_APP_URL`                                                    | URL pública (cliente)                       |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME`                          | Seed admin                                  |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Media                                       |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL`                                   | Email transaccional                         |
| `NEXT_PUBLIC_GA4_ID`                                                     | Google Analytics 4                          |

> Las vars `POSTGRES_*` se generan automáticamente al instalar la integración de Neon en Vercel.

## Deploy

Cada push a `develop` triggerea un deploy (preview o producción según la config de Vercel). El último deploy de producción está en `https://cagg.vercel.app`.

Para configurar dominio custom: Vercel dashboard → proyecto `portfolio-cag` → Settings → Domains.

## Estructura

```
src/
├── app/                # Routing (Server Components, no JSX con hooks)
│   ├── [locale]/       # Landing (ISR 60s)
│   ├── admin/          # Panel (protegido)
│   └── api/            # Route handlers
├── components/
│   ├── landing/        # Secciones del portfolio
│   ├── admin/          # Componentes del panel
│   ├── common/         # SkipLink, ErrorBoundary, etc.
│   └── ui/             # shadcn/ui + átomos
├── hooks/              # Lógica cliente (sin JSX)
├── services/           # Axios (sin React)
├── lib/                # prisma, auth, cloudinary, resend, rate-limit
├── validations/        # Zod schemas (compartidos forms + API)
├── i18n/               # next-intl routing + request config
└── messages/           # es.json, en.json
```

## Documentación

- [AGENTS.md](./AGENTS.md) — Contexto para agentes AI, reglas, prohibiciones, estado del plan
- [PLAN_MAESTRO.md](./PLAN_MAESTRO.md) — Plan de migración completo (EPICs 0–8, todos marcados como ✅ o 🟡)
- [scripts/README.md](./scripts/README.md) — Documentación de scripts

## Proyecto legado

El proyecto original (Emergent, React CRA + Python FastAPI + MongoDB) está en:
`/Users/gonzaloyacante/dev/portfolio-cag-legacy/`
