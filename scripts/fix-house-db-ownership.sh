#!/usr/bin/env bash
# Одноразово на VPS: передать владение объектами БД house_user, чтобы prisma migrate deploy
# не падал с «must be owner of table …» (типично после pg_restore --no-owner).
#
# Безопасно: только GRANT + ALTER OWNER / REASSIGN OWNED, данные не трогаем.
# Перед запуском: bash scripts/vps-pg-backup.sh (или SKIP_BACKUP=1 осознанно).
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
DB_NAME="${POSTGRES_DB:-house}"
DB_USER="${POSTGRES_USER:-house_user}"

if [[ "${SKIP_BACKUP:-}" != "1" ]]; then
  echo "==> backup"
  bash "$ROOT/scripts/vps-pg-backup.sh" || {
    echo "ERROR: backup failed — задайте SKIP_BACKUP=1 только если бэкап уже есть"
    exit 1
  }
fi

echo "==> grants для ${DB_USER}"
sudo -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
SQL

echo "==> ownership: postgres → ${DB_USER}"
sudo -u postgres psql -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
ALTER SCHEMA public OWNER TO ${DB_USER};
REASSIGN OWNED BY postgres TO ${DB_USER};
SQL

echo "==> verify"
cd "$ROOT/frontend"
set -a
# shellcheck disable=1091
source .env
set +a
npm run db:verify
npx prisma migrate status --schema=prisma/schema.prisma

echo "OK: ${DB_USER} — владелец объектов в ${DB_NAME}; migrate deploy должен проходить без apply-*-migration.sh"
