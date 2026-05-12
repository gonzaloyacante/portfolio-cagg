# portfolio-cag

Portfolio de Carlos Armando Guerra — Migración completa desde Emergent a Next.js 16.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 App Router |
| Lenguaje | TypeScript |
| Package manager | pnpm |
| DB | NeonDB (PostgreSQL) |
| ORM | Prisma |
| Auth | Better Auth + TOTP |
| Imágenes | Cloudinary |
| Email | Resend |
| UI | shadcn/ui + Tailwind v4 |
| Forms | React Hook Form + Zod |
| i18n | next-intl (es/en) |
| Deploy | Vercel |

## Comandos

```bash
pnpm dev          # Servidor de desarrollo (Turbopack)
pnpm build        # Build de producción
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm test         # Vitest
pnpm db:studio    # Prisma Studio
pnpm db:seed      # Seed de desarrollo
```

## Ejecutar una tarea del plan

```bash
chmod +x scripts/run_task.sh
./scripts/run_task.sh E0-T1
```

## Documentación

- [AGENTS.md](./AGENTS.md) — Contexto para agentes AI, reglas y prohibiciones
- [PLAN_MAESTRO.md](./PLAN_MAESTRO.md) — Plan de migración completo con EPICs y tareas
- [scripts/README.md](./scripts/README.md) — Documentación de scripts

## Proyecto legado

El proyecto original (Emergent) está en:
`/Users/gonzaloyacante/dev/portfolio-cag-legacy/`

## Variables de entorno requeridas

Ver `AGENTS.md` sección 5 para la lista completa.
Crear `.env.local` copiando `.env.example`.
