#!/usr/bin/env bash
# Запускать на СТАРОМ VPS: перенос БД + файлов + .env на новый (параллельно kemperlabs).
set -euo pipefail

NEW_HOST="46.173.26.108"
PASS_FILE="/tmp/newvps.pass"
OLD_FRONTEND="/var/www/house/frontend"
STAMP="$(date +%Y%m%d-%H%M%S)"
WORKDIR="/tmp/house-sync-${STAMP}"

[[ -f "$PASS_FILE" ]] || { echo "ERROR: $PASS_FILE missing"; exit 1; }

run_new() { sshpass -f "$PASS_FILE" ssh -o StrictHostKeyChecking=no "root@${NEW_HOST}" "$@"; }
copy_new() { sshpass -f "$PASS_FILE" scp -o StrictHostKeyChecking=no "$@"; }

mkdir -p "$WORKDIR"
cd "$OLD_FRONTEND"

[[ -f .env ]] || { echo "ERROR: no .env on old server"; exit 1; }

set -a
# shellcheck disable=1091
source .env
set +a

echo "==> pg_dump"
DB_URL="${DATABASE_URL%%\?*}"
pg_dump "$DB_URL" -Fc -f "$WORKDIR/house.dump"
ls -lh "$WORKDIR/house.dump"

echo "==> archive uploads + private + .env"
tar czf "$WORKDIR/house-files.tar.gz" -C "$OLD_FRONTEND" public/uploads storage/private .env
ls -lh "$WORKDIR/house-files.tar.gz"

echo "==> upload to $NEW_HOST"
copy_new "$WORKDIR/house.dump" "$WORKDIR/house-files.tar.gz" "root@${NEW_HOST}:/tmp/"

echo "==> restore + build on new"
run_new bash -s <<'REMOTE'
set -euo pipefail
FRONTEND="/var/www/house/frontend"
ROOT="/var/www/house"

tar xzf /tmp/house-files.tar.gz -C "$FRONTEND"

# Пока домен не переключён — доступ по IP:8080
NEW_IP="$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')"
if grep -q '^NEXT_PUBLIC_SITE_URL=' "$FRONTEND/.env"; then
  sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=\"http://${NEW_IP}:8080\"|" "$FRONTEND/.env"
fi
if grep -q '^NEXTAUTH_URL=' "$FRONTEND/.env"; then
  sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=\"http://${NEW_IP}:8080\"|" "$FRONTEND/.env"
fi
if grep -q '^PORT=' "$FRONTEND/.env"; then
  sed -i 's|^PORT=.*|PORT=3000|' "$FRONTEND/.env"
else
  echo 'PORT=3000' >> "$FRONTEND/.env"
fi

# DATABASE_URL на локальный Postgres нового сервера
if grep -q '^DATABASE_URL=' "$FRONTEND/.env"; then
  sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://house_user:house_local_2026@127.0.0.1:5432/house?schema=public"|' "$FRONTEND/.env"
fi

echo "==> pg_restore"
sudo -u postgres pg_restore --clean --if-exists --no-owner --no-acl -d house /tmp/house.dump 2>/dev/null || \
  sudo -u postgres pg_restore --no-owner --no-acl -d house /tmp/house.dump

cd "$ROOT"
git fetch origin main
git reset --hard origin/main 2>/dev/null || git pull origin main || true

cd "$FRONTEND"
npm ci
npx playwright install chromium 2>/dev/null || true
npm run build

pm2 delete house-next 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash || true

sleep 5
curl -s -m 30 -o /dev/null -w "direct3000:%{http_code}\n" http://127.0.0.1:3000/api/health || true
curl -s -m 30 -o /dev/null -w "nginx8080:%{http_code}\n" http://127.0.0.1:8080/api/health || true
REMOTE

echo "OK: house развёрнут параллельно kemperlabs"
echo "Проверка: http://46.173.26.108:8080/"
