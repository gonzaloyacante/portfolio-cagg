# Scripts — portfolio-cag

## run_task.sh

Genera un prompt completo para ejecutar una tarea del PLAN_MAESTRO.md.

### Uso

```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x scripts/run_task.sh

# Ejecutar para una tarea específica
./scripts/run_task.sh <TASK_ID>

# Ejemplos
./scripts/run_task.sh E0-T1   # Scaffold del proyecto
./scripts/run_task.sh E1-T1   # Schema Prisma
./scripts/run_task.sh E2-T1   # Better Auth setup
```

### Qué hace

1. **Preflight checks**: verifica estado git, branch actual, Node/pnpm, TypeScript, ESLint y tests
2. **Extrae la tarea**: lee el PLAN_MAESTRO.md y extrae la sección de la tarea solicitada
3. **Genera el prompt**: produce un prompt completo con contexto del proyecto, stack, reglas absolutas, estado git, pasos de la tarea y checklist de cierre

### Cuándo usarlo

Antes de pedirle a cualquier agente AI que ejecute una tarea. El prompt generado incluye todo el contexto necesario para que el agente opere correctamente sin asumir cosas del stack.

### IDs de tareas disponibles

| ID | Descripción |
|----|-------------|
| E0-T1 | Scaffold Next.js 16 |
| E0-T2 | ESLint + Prettier + Husky |
| E0-T3 | Instalar dependencias del stack |
| E0-T4 | Configurar next-intl |
| E0-T5 | Baseline de calidad |
| E1-T1 | Schema Prisma |
| E1-T2 | Singleton Prisma + NeonDB |
| E1-T3 | Seed de datos iniciales |
| E2-T1 | Better Auth setup |
| E2-T2 | Login page + Admin layout guard |
| E2-T3 | TOTP 2FA management |
| E3-T1 | Content routes (GET público) |
| E3-T2 | Admin CRUD routes |
| E3-T3 | Messages + Analytics + SEO routes |
| E4-T1 | Landing layout + providers |
| E4-T2 | Hero + Header + BrandsMarquee |
| E4-T3 | Experience + Process + Services |
| E4-T4 | Projects + Results + Testimonials |
| E4-T5 | Timeline + FAQ + Contact + Footer |
| E4-T6 | Landing page principal (ISR) |
| E5-T1 | AdminShell (layout + sidebar) |
| E5-T2 | Dashboard |
| E5-T3 | HeroPage admin |
| E5-T4 | SectionsPage admin |
| E5-T5 | CollectionPage admin |
| E5-T6 | ContactInfoPage admin |
| E5-T7 | MessagesPage admin |
| E5-T8 | MediaPage admin |
| E5-T9 | AnalyticsPage admin |
| E5-T10 | SeoPage admin |
| E5-T11 | EmailPage admin |
| E5-T12 | SystemPage admin |
| E6-T1 | Cloudinary config + upload API |
| E6-T2 | Media browser component |
| E7-T1 | Metadata dinámica + sitemap |
| E7-T2 | GA4 + tracking propio |
| E8-T1 | Vitest setup + tests |
| E8-T2 | Vercel deploy |
