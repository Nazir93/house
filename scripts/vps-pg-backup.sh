#!/usr/bin/env bash
# Ежедневный дамп PostgreSQL (локально на VPS).
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
BACKUP_DIR="${PG_BACKUP_DIR:-/var/backups/house}"
RETENTION_DAYS="${PG_BACKUP_RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

if [[ -f "$ROOT/frontend/.env" ]]; then
  set -a
  # shellcheck disable=1091
  source "$ROOT/frontend/.env"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL не задан"
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/house-$STAMP.sql.gz"

# pg_dump не принимает query-параметр schema= из Prisma DATABASE_URL
DUMP_URL="${DATABASE_URL%%\?*}"

pg_dump "$DUMP_URL" | gzip -9 > "$OUT"
echo "OK: backup $OUT ($(du -h "$OUT" | awk '{print $1}'))"

find "$BACKUP_DIR" -name 'house-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true
