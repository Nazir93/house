#!/usr/bin/env bash
# Миграция house с текущего VPS на NEW_HOST (запускать на СТАРОМ сервере).
set -euo pipefail

NEW_HOST="${NEW_HOST:?NEW_HOST required}"
NEW_PASS="${NEW_PASS:?NEW_PASS required}"
OLD_FRONTEND="/var/www/house/frontend"
STAMP="$(date +%Y%m%d-%H%M%S)"
WORKDIR="/tmp/house-migrate-${STAMP}"

SSH="sshpass -p ${NEW_PASS} ssh -o StrictHostKeyChecking=no root@${NEW_HOST}"
SCP="sshpass -p ${NEW_PASS} scp -o StrictHostKeyChecking=no"

mkdir -p "$WORKDIR"
cd "$OLD_FRONTEND"

if [[ ! -f .env ]]; then
  echo "ERROR: нет $OLD_FRONTEND/.env"
  exit 1
fi

set -a
# shellcheck disable=1091
source .env
set +a

echo "==> Дамп PostgreSQL"
pg_dump "$DATABASE_URL" -Fc -f "$WORKDIR/house.dump"

echo "==> Архив uploads + private + .env"
tar czf "$WORKDIR/house-files.tar.gz" \
  -C "$OLD_FRONTEND" \
  public/uploads \
  storage/private \
  .env

echo "==> Копирование на $NEW_HOST"
$SCP "$WORKDIR/house.dump" "$WORKDIR/house-files.tar.gz" "root@${NEW_HOST}:/tmp/"

echo "==> Восстановление на новом сервере"
$SSH bash -s <<'REMOTE'
set -euo pipefail
FRONTEND="/var/www/house/frontend"
mkdir -p "$FRONTEND"

if [[ -f /tmp/house-files.tar.gz ]]; then
  tar xzf /tmp/house-files.tar.gz -C "$FRONTEND"
fi

set -a
# shellcheck disable=1091
source "$FRONTEND/.env"
set +a

echo "==> pg_restore"
sudo -u postgres pg_restore --clean --if-exists --no-owner --no-acl -d house /tmp/house.dump 2>/dev/null \
  || sudo -u postgres pg_restore --no-owner --no-acl -d house /tmp/house.dump

echo "==> npm ci + deploy"
cd /var/www/house/frontend
npm ci
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium
cd /var/www/house
SKIP_TESTS=1 bash scripts/deploy-vps.sh

echo "==> PM2"
cd /var/www/house/frontend
pm2 delete house-next 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

curl -s -m 20 -o /dev/null -w "health:%{http_code}\n" http://127.0.0.1:3000/api/health || true
curl -s -m 20 -o /dev/null -w "home:%{http_code}\n" http://127.0.0.1:3000/ || true
REMOTE

echo "OK: миграция завершена на $NEW_HOST"
