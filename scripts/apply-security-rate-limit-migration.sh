#!/usr/bin/env bash
# На VPS: PublicRateBucket + индекс Lead, если migrate deploy падает (must be owner).
set -euo pipefail
ROOT="${HOUSE_ROOT:-/var/www/house}"
MIGRATION="20260624180000_security_public_rate_bucket"
SQL="$ROOT/frontend/prisma/migrations/$MIGRATION/migration.sql"

if [[ ! -f "$SQL" ]]; then
  echo "ERROR: нет файла $SQL — сначала git pull"
  exit 1
fi

DB_NAME="${POSTGRES_DB:-house}"
echo "==> security migration (postgres)"
sudo -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$SQL"

echo "==> prisma migrate resolve"
cd "$ROOT/frontend"
npx prisma migrate resolve --applied "$MIGRATION" --schema=prisma/schema.prisma

echo "OK: PublicRateBucket + Lead index"
