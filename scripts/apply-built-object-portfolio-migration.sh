#!/usr/bin/env bash
# Одноразово на VPS: колонки портфолио, если migrate deploy не может ALTER (must be owner).
set -euo pipefail
ROOT="${HOUSE_ROOT:-/var/www/house}"
MIGRATION="20260624140000_built_object_portfolio_publish_fields"
SQL="$ROOT/frontend/prisma/migrations/$MIGRATION/migration.sql"

if [[ ! -f "$SQL" ]]; then
  echo "ERROR: нет файла $SQL — сначала git pull"
  exit 1
fi

DB_NAME="${POSTGRES_DB:-house}"
echo "==> ALTER TABLE BuiltObject (postgres)"
sudo -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$SQL"

echo "==> prisma migrate resolve (отметить миграцию применённой)"
cd "$ROOT/frontend"
npx prisma migrate resolve --applied "$MIGRATION" --schema=prisma/schema.prisma

echo "OK: колонки портфолио добавлены"
