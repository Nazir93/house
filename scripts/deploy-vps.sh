#!/usr/bin/env bash
# Один заход: pull → зависимости → миграции → сборка → PM2.
# На сервере (одна команда):
#   cd /var/www/house && bash scripts/deploy-vps.sh
# Другой корень репозитория:
#   HOUSE_ROOT=/path/to/repo bash scripts/deploy-vps.sh
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
cd "$ROOT"

git pull origin main

cd "$ROOT/frontend"
npm ci
npx prisma migrate deploy --schema=prisma/schema.prisma
npm run build

pm2 reload house-next --update-env
pm2 save

echo "OK: деплой завершён (house-next перезагружен)."
