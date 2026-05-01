#!/usr/bin/env bash
# Деплой на VPS из папки frontend:  bash scripts/vps-deploy.sh
# Сайт не падает при выходе из SSH, если после сборки запущен PM2 (см. низ скрипта).
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Нет файла .env — скопируй с ПК:"
  echo "  scp .env.local root@IP:/var/www/house/frontend/.env"
  echo "или: cp .env.example .env && nano .env"
  exit 1
fi

echo "==> npm ci"
npm ci

echo "==> prisma generate"
npx prisma generate

echo "==> prisma migrate deploy"
npx prisma migrate deploy

echo "==> next build"
npm run build

echo ""
if command -v pm2 >/dev/null 2>&1; then
  echo "==> PM2: перезапуск electro-next"
  pm2 delete electro-next 2>/dev/null || true
  pm2 start ecosystem.config.cjs
  pm2 save
  echo ""
  echo "Готово. Процесс работает в фоне (закрытие SSH не останавливает сайт)."
  echo "Один раз на этом сервере выполните:  pm2 startup"
  echo "и скопируйте в терминал строку с sudo, которую выведет PM2, затем снова:  pm2 save"
else
  echo "PM2 не установлен — npm run start в SSH отключится после выхода."
  echo "Установка:  npm install -g pm2"
  echo "Потом снова:  bash scripts/vps-deploy.sh"
  echo "Или вручную:  pm2 start ecosystem.config.cjs && pm2 save"
fi
echo ""
echo "Альтернатива без PM2: systemd, шаблон unit — scripts/house-next.service (поправьте User и пути)."
