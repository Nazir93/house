#!/usr/bin/env bash
# Закреплённый деплой на VPS (PM2: house-next).
# На сервере: cd /var/www/house && bash scripts/deploy-vps.sh
# Другой корень: HOUSE_ROOT=/path/to/repo bash scripts/deploy-vps.sh
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
cd "$ROOT"

git pull origin main

cd frontend
npx prisma generate
npx prisma migrate deploy
npm run build

pm2 restart house-next

echo "OK: деплой завершён, перезапущен pm2 process house-next"
