#!/usr/bin/env bash
# scripts/sync-vercel-env.sh
# Sync .env.develop and .env.production to Vercel preview and production.
# Reads the two local files and pushes each key to the matching Vercel env.
# Idempotent: running it multiple times with the same files is a no-op.
#
# Skips:
#   - VERCEL_OIDC_TOKEN (auto-managed by Vercel)
#   - blank lines and # comments
#
# Requirements:
#   - vercel CLI installed and logged in (`vercel login`)
#   - .env.develop and .env.production in the project root
#
# Usage:
#   ./scripts/sync-vercel-env.sh
#
# Exit codes:
#   0  all env vars updated successfully
#   1  vercel CLI not logged in
#   2  missing .env.develop or .env.production
#   3+ number of env vars that failed to update

set -euo pipefail

# --- Pre-flight checks -------------------------------------------------------

cd "$(dirname "$0")/.."

if ! command -v vercel > /dev/null 2>&1; then
  echo "ERROR: vercel CLI not found. Install: npm i -g vercel"
  exit 1
fi

if ! vercel whoami > /dev/null 2>&1; then
  echo "ERROR: not logged in to Vercel. Run: vercel login"
  exit 1
fi

[[ -f .env.develop ]]    || { echo "ERROR: .env.develop not found in $(pwd)"; exit 2; }
[[ -f .env.production ]] || { echo "ERROR: .env.production not found in $(pwd)"; exit 2; }

# --- Helpers -----------------------------------------------------------------

# Redact secrets for logging. Two strategies:
#   1) URL with embedded credentials → mask the user:pass portion
#   2) Otherwise → show "<N chars>" to avoid leaking value length patterns
redact() {
  local v="$1"
  if [[ "$v" =~ ^[^:]+://[^:/]+:[^@]+@ ]]; then
    # URL with creds: keep protocol and host, mask the rest until @
    printf '%s' "$v" | sed -E 's|://[^:/]+:[^@]+@|://<redacted>@|'
  else
    printf '<%d chars>' "${#v}"
  fi
}

# Strip surrounding quotes from an env value
strip_quotes() {
  local v="$1"
  v="${v%\"}"
  v="${v#\"}"
  v="${v%\'}"
  v="${v#\'}"
  printf '%s' "$v"
}

# Sync a single env file to a Vercel target.
# Logs to stderr, returns "<ok_count> <fail_count>" on stdout for capture.
sync_env() {
  local source_file="$1"
  local target="$2"
  local label="$3"

  {
    echo ""
    echo "=== $label ← $source_file ==="
  } >&2

  local ok=0 fail=0

  while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip blank lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

    # Parse KEY=VALUE
    if [[ "$line" =~ ^[[:space:]]*([A-Z_][A-Z_0-9]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local val
      val="$(strip_quotes "${BASH_REMATCH[2]}")"

      # Skip Vercel-managed token
      if [[ "$key" == "VERCEL_OIDC_TOKEN" ]]; then
        printf "  SKIP %s (Vercel-managed)\n" "$key" >&2
        continue
      fi

      printf "  UPDATE %-30s = %s\n" "$key" "$(redact "$val")" >&2

      if vercel env update "$key" "$target" --sensitive --value "$val" --yes </dev/null >/dev/null 2>&1; then
        ok=$((ok + 1))
      else
        printf "    ERR: failed to update %s\n" "$key" >&2
        fail=$((fail + 1))
      fi
    fi
  done < "$source_file"

  {
    printf "  → %d ok, %d failed\n" "$ok" "$fail"
  } >&2

  # Return value: "ok_count fail_count" on stdout
  echo "$ok $fail"
}

# --- Main --------------------------------------------------------------------

# Capture stdout (ok, fail) while letting logs flow to stderr
preview_total=$(sync_env .env.develop    preview    "PREVIEW (develop)")
prod_total=$(sync_env   .env.production production "PRODUCTION")

preview_ok=$(echo "$preview_total" | awk '{print $1}')
preview_fail=$(echo "$preview_total" | awk '{print $2}')
prod_ok=$(echo "$prod_total" | awk '{print $1}')
prod_fail=$(echo "$prod_total" | awk '{print $2}')

echo ""
echo "=== TOTAL ==="
printf "Preview (develop):   %d ok, %d failed\n" "$preview_ok" "$preview_fail"
printf "Production (main):   %d ok, %d failed\n" "$prod_ok" "$prod_fail"
echo ""

total_fail=$((preview_fail + prod_fail))
if [[ "$total_fail" -eq 0 ]]; then
  echo "✓ All env vars in sync."
  exit 0
else
  echo "✗ $total_fail env var(s) failed. Re-run or check errors above."
  exit $((total_fail + 2))
fi
