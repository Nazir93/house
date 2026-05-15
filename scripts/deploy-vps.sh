#!/usr/bin/env bash
# Деплой на VPS после git push в main: pull → npm ci → миграции/схема → build → PM2 reload.
#
# Одна команда (путь из SERVER-DEPLOY.md):
#   bash /var/www/house/scripts/deploy-vps.sh
#
# Другой корень репозитория:
#   HOUSE_ROOT=/path/to/clone bash /path/to/clone/scripts/deploy-vps.sh
#
# Без миграций (только db push — см. ниже):
#   SKIP_MIGRATE=1 bash /var/www/house/scripts/deploy-vps.sh
#
# Без db push после migrate (строго только migrate deploy):
#   SKIP_DB_PUSH=1 bash /var/www/house/scripts/deploy-vps.sh
#
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
cd "$ROOT"

echo "==> git pull --ff-only origin main"
git pull --ff-only origin main

cd "$ROOT/frontend"

if [[ -f .env ]]; then
  echo "==> подхват переменных из frontend/.env (для Prisma в этом сеансе)"
  set -a
  # shellcheck disable=1091
  source .env
  set +a
fi

echo "==> npm ci"
npm ci

if [[ "${SKIP_MIGRATE:-}" == "1" ]]; then
  echo "==> SKIP_MIGRATE=1 — prisma migrate deploy пропущен"
else
  echo "==> prisma migrate deploy"
  npx prisma migrate deploy --schema=prisma/schema.prisma
fi

if [[ "${SKIP_DB_PUSH:-}" == "1" ]]; then
  echo "==> SKIP_DB_PUSH=1 — prisma db push пропущен"
else
  echo "==> prisma db push (синхронизация schema.prisma с БД после migrate)"
  npx prisma db push --schema=prisma/schema.prisma --skip-generate
fi

echo "==> npm run build"
npm run build

echo "==> pm2 reload house-next --update-env && pm2 save"
pm2 reload house-next --update-env
pm2 save

echo "OK: деплой завершён (house-next перезагружен)."
