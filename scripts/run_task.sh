#!/usr/bin/env bash
# run_task.sh — portfolio-cag
# Uso: ./scripts/run_task.sh <TASK_ID>
# Ejemplo: ./scripts/run_task.sh E0-T1

set -euo pipefail

# ─── Colores ────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ─── Validar argumento ───────────────────────────────────────────────────────
TASK_ID="${1:-}"
if [[ -z "$TASK_ID" ]]; then
  echo -e "${RED}❌ Uso: $0 <TASK_ID>${RESET}"
  echo -e "   Ejemplo: $0 E0-T1"
  exit 1
fi

# ─── Rutas ───────────────────────────────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLAN_FILE="$REPO_ROOT/PLAN_MAESTRO.md"
AGENTS_FILE="$REPO_ROOT/AGENTS.md"

if [[ ! -f "$PLAN_FILE" ]]; then
  echo -e "${RED}❌ No se encontró PLAN_MAESTRO.md en $REPO_ROOT${RESET}"
  exit 1
fi

# ─── Extraer sección de la tarea del PLAN_MAESTRO ───────────────────────────
TASK_CONTENT=$(awk "
  /^### ${TASK_ID}[[:space:]]/ { found=1; print; next }
  found && /^### [A-Z][0-9]+-T[0-9]+[[:space:]]/ { exit }
  found { print }
" "$PLAN_FILE")

if [[ -z "$TASK_CONTENT" ]]; then
  echo -e "${RED}❌ Tarea '${TASK_ID}' no encontrada en PLAN_MAESTRO.md${RESET}"
  echo -e "${YELLOW}Tareas disponibles:${RESET}"
  grep "^### E[0-9]\+-T[0-9]\+" "$PLAN_FILE" | sed 's/### /  /'
  exit 1
fi

# ─── Extraer branch sugerida ─────────────────────────────────────────────────
SUGGESTED_BRANCH=$(echo "$TASK_CONTENT" | grep -E "^- Branch:" | sed 's/- Branch: //' | tr -d '`' || echo "")

# ─── Preflight checks ────────────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════${RESET}"
echo -e "${CYAN}${BOLD}  PREFLIGHT — portfolio-cag — Tarea: ${TASK_ID}${RESET}"
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════${RESET}"

cd "$REPO_ROOT"

# 1. Verificar git
echo -e "\n${YELLOW}[1/5] Estado git${RESET}"
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "sin-branch")
GIT_STATUS=$(git status --short 2>/dev/null || echo "")
echo -e "  Branch actual: ${BOLD}${CURRENT_BRANCH}${RESET}"

if [[ -n "$SUGGESTED_BRANCH" ]]; then
  if [[ "$CURRENT_BRANCH" == "$SUGGESTED_BRANCH" ]]; then
    echo -e "  ${GREEN}✅ En la branch correcta: ${SUGGESTED_BRANCH}${RESET}"
  else
    echo -e "  ${YELLOW}⚠️  Branch sugerida para esta tarea: ${SUGGESTED_BRANCH}${RESET}"
    echo -e "  ${YELLOW}   Branch actual: ${CURRENT_BRANCH}${RESET}"
  fi
fi

if [[ -n "$GIT_STATUS" ]]; then
  echo -e "  ${YELLOW}⚠️  Árbol de trabajo no limpio:${RESET}"
  echo "$GIT_STATUS" | sed 's/^/     /'
else
  echo -e "  ${GREEN}✅ Árbol limpio${RESET}"
fi

# 2. Verificar node + pnpm
echo -e "\n${YELLOW}[2/5] Versiones${RESET}"
NODE_VERSION=$(node --version 2>/dev/null || echo "no encontrado")
PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "no encontrado")
echo -e "  Node: ${NODE_VERSION}"
echo -e "  pnpm: ${PNPM_VERSION}"

if [[ "$NODE_VERSION" == "no encontrado" ]]; then
  echo -e "  ${RED}❌ Node.js no encontrado${RESET}"
  exit 1
fi

# 3. TypeScript check (si el proyecto está scaffoldeado)
echo -e "\n${YELLOW}[3/5] TypeScript check${RESET}"
if [[ -f "$REPO_ROOT/tsconfig.json" ]]; then
  if pnpm typecheck 2>/dev/null; then
    echo -e "  ${GREEN}✅ TypeScript sin errores${RESET}"
  else
    echo -e "  ${RED}❌ Errores TypeScript — revisar antes de continuar${RESET}"
    PREFLIGHT_FAILED=true
  fi
else
  echo -e "  ${YELLOW}⏭  tsconfig.json no encontrado (scaffold pendiente)${RESET}"
fi

# 4. Lint check
echo -e "\n${YELLOW}[4/5] ESLint${RESET}"
if [[ -f "$REPO_ROOT/package.json" ]] && grep -q '"lint"' "$REPO_ROOT/package.json" 2>/dev/null; then
  if pnpm lint --max-warnings=0 2>/dev/null; then
    echo -e "  ${GREEN}✅ Lint sin errores${RESET}"
  else
    echo -e "  ${RED}❌ Errores de lint — revisar antes de continuar${RESET}"
    PREFLIGHT_FAILED=true
  fi
else
  echo -e "  ${YELLOW}⏭  package.json no encontrado o sin script lint (scaffold pendiente)${RESET}"
fi

# 5. Tests
echo -e "\n${YELLOW}[5/5] Tests${RESET}"
if [[ -f "$REPO_ROOT/vitest.config.ts" ]] || [[ -f "$REPO_ROOT/vitest.config.js" ]]; then
  if pnpm test 2>/dev/null; then
    echo -e "  ${GREEN}✅ Tests pasando${RESET}"
  else
    echo -e "  ${YELLOW}⚠️  Tests fallando — evaluar si es bloqueante${RESET}"
  fi
else
  echo -e "  ${YELLOW}⏭  vitest.config no encontrado (scaffold pendiente)${RESET}"
fi

# ─── Resumen preflight ────────────────────────────────────────────────────────
echo -e "\n${CYAN}${BOLD}═══════════════════════════════════════════════════════${RESET}"
if [[ "${PREFLIGHT_FAILED:-false}" == "true" ]]; then
  echo -e "${RED}${BOLD}  ❌ PREFLIGHT FALLIDO — resolver errores antes de continuar${RESET}"
  echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════${RESET}"
  exit 1
else
  echo -e "${GREEN}${BOLD}  ✅ PREFLIGHT OK — generando prompt${RESET}"
  echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════${RESET}"
fi

# ─── Estado git detallado ─────────────────────────────────────────────────────
GIT_LOG=$(git log --oneline -5 2>/dev/null || echo "sin commits")
GIT_DIFF_STAT=$(git diff --stat HEAD 2>/dev/null || echo "")

# ─── Generar prompt ───────────────────────────────────────────────────────────
PROMPT=$(cat <<PROMPT_EOF
════════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO — portfolio-cag
════════════════════════════════════════════════════════════════

Este es el portfolio web de Carlos Armando Guerra.
Migración completa desde Emergent (React CRA + Python FastAPI + MongoDB)
a Next.js 16 App Router + TypeScript + Prisma + NeonDB + Better Auth + Cloudinary.

Proyecto legado (solo lectura, referencia):
  /Users/gonzaloyacante/dev/portfolio-cag-legacy/

Portfolio personal del desarrollador (mismo stack, referencia de patrones):
  /Users/gonzaloyacante/dev/portfolio/

════════════════════════════════════════════════════════════════
STACK OBLIGATORIO (no proponer alternativas)
════════════════════════════════════════════════════════════════

Framework:       Next.js 16 App Router
Lenguaje:        TypeScript (strict, sin any)
Package manager: pnpm (NUNCA npm ni yarn)
DB:              NeonDB (PostgreSQL)
ORM:             Prisma (singleton en src/lib/prisma.ts)
Auth:            Better Auth + otpauth (TOTP)
Imágenes:        Cloudinary + next/image
Email:           Resend
UI:              shadcn/ui + Tailwind CSS v4
Forms:           React Hook Form + Zod
Rich text:       Tiptap
Charts:          Recharts
i18n:            next-intl (es / en)
Fetching:        Axios (cliente) / Prisma directo (servidor)
Testing:         Vitest
Linting:         ESLint + Prettier
Bundler:         Turbopack

════════════════════════════════════════════════════════════════
REGLAS ABSOLUTAS
════════════════════════════════════════════════════════════════

1. NUNCA usar npm/yarn — siempre pnpm
2. NUNCA usar 'any' en TypeScript — usar unknown + type guards
3. NUNCA instanciar PrismaClient directamente — solo src/lib/prisma.ts
4. NUNCA hardcodear strings en UI — siempre useTranslations()
5. NUNCA usar console.log en producción
6. NUNCA usar git commit --no-verify
7. NUNCA usar Auth.js/NextAuth — este proyecto usa Better Auth
8. NUNCA usar Drizzle — este proyecto usa Prisma
9. NUNCA exponer datos de admin en rutas públicas (/api/content es pública)
10. SIEMPRE verificar sesión server-side en admin routes y layouts
11. SIEMPRE correr lint + typecheck antes de cada commit
12. SIEMPRE usar Conventional Commits: feat/fix/chore/refactor/docs/test(scope): desc

════════════════════════════════════════════════════════════════
ESTADO GIT AL MOMENTO DEL ANÁLISIS
════════════════════════════════════════════════════════════════

Branch actual: ${CURRENT_BRANCH}
Branch sugerida para esta tarea: ${SUGGESTED_BRANCH:-"ver PLAN_MAESTRO.md"}

Últimos commits:
${GIT_LOG}

Diff actual:
${GIT_DIFF_STAT:-"(árbol limpio)"}

════════════════════════════════════════════════════════════════
TAREA A EJECUTAR: ${TASK_ID}
════════════════════════════════════════════════════════════════

${TASK_CONTENT}

════════════════════════════════════════════════════════════════
INSTRUCCIONES DE EJECUCIÓN
════════════════════════════════════════════════════════════════

1. Leer el PLAN_MAESTRO.md completo y el AGENTS.md antes de tocar código.
2. Consultar el proyecto legado en /portfolio-cag-legacy/ para entender
   la lógica y los componentes que se están migrando.
3. Consultar el portfolio personal en /portfolio/ para ver patrones
   del mismo stack ya funcionando.
4. Ejecutar SOLO los pasos de esta tarea. No adelantarse a la siguiente.
5. Al finalizar cada paso, correr:
     pnpm lint && pnpm typecheck
6. Al finalizar la tarea completa, correr:
     pnpm lint && pnpm typecheck && pnpm format:check && pnpm test
7. Hacer commit solo con los archivos exactos de esta tarea.
8. Reportar: archivos modificados, verificaciones pasadas, cualquier
   decisión tomada fuera del plan y por qué.

════════════════════════════════════════════════════════════════
CHECKLIST DE CIERRE (completar antes de reportar done)
════════════════════════════════════════════════════════════════

[ ] pnpm lint — 0 errores, 0 warnings
[ ] pnpm typecheck — 0 errores
[ ] pnpm format:check — sin diferencias
[ ] pnpm test — todos los tests pasan
[ ] Solo los archivos del scope de esta tarea están en el diff
[ ] No se usó npm/yarn en ningún momento
[ ] No se usó 'any' en TypeScript
[ ] No hay strings hardcodeados en componentes UI
[ ] Commit con mensaje Conventional Commits correcto
[ ] No se usó git commit --no-verify

════════════════════════════════════════════════════════════════
SEÑALES DE ALERTA — detenerse y preguntar si aparece:
════════════════════════════════════════════════════════════════

⚠️  pnpm lint/typecheck con errores nuevos no documentados en el plan
⚠️  Archivo ajeno al scope de la tarea en el diff
⚠️  Propuesta de usar npm/yarn/Auth.js/Drizzle/Firebase
⚠️  Pre-commit hook fallando
⚠️  Tests fallando por causa no relacionada con esta tarea
⚠️  Necesidad de tocar archivos de otra tarea/EPIC para completar esta

════════════════════════════════════════════════════════════════
PROMPT_EOF
)

# ─── Output final ─────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}PROMPT GENERADO — copiar todo lo de abajo:${RESET}"
echo -e "${CYAN}────────────────────────────────────────────────────────${RESET}"
echo ""
echo "$PROMPT"
echo ""
echo -e "${CYAN}────────────────────────────────────────────────────────${RESET}"
echo -e "${GREEN}${BOLD}✅ Fin del prompt para tarea ${TASK_ID}${RESET}"
echo ""
