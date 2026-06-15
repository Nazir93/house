#!/usr/bin/env bash
# Запускать на СТАРОМ VPS: полный параллельный деплой house на NEW_HOST.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=1091
source "${SCRIPT_DIR}/vps-config.sh"

NEW_HOST="${NEW_HOST:-${VPS_HOST}}"
PASS_FILE="/tmp/newvps.pass"
OLD_FRONTEND="/var/www/house/frontend"
HOUSE_PORT="${HOUSE_PORT:-3000}"

[[ -f "$PASS_FILE" ]] || { echo "ERROR: $PASS_FILE missing"; exit 1; }

run_new() { sshpass -f "$PASS_FILE" ssh -o StrictHostKeyChecking=no "root@${NEW_HOST}" "$@"; }
copy_to_new() { sshpass -f "$PASS_FILE" scp -o StrictHostKeyChecking=no "$@"; }

echo "========== 1/3 Bootstrap на $NEW_HOST =========="
run_new bash -s <<REMOTE
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
HOUSE_PORT=${HOUSE_PORT}
PROJECT_ROOT="/var/www/house"

apt-get update -qq
apt-get install -y -qq git curl ca-certificates

if ! command -v node >/dev/null 2>&1 || [[ "\$(node -v | sed 's/v//' | cut -d. -f1)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
command -v pm2 >/dev/null 2>&1 || npm install -g pm2

if ! systemctl is-active --quiet postgresql 2>/dev/null; then
  apt-get install -y -qq postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'house_user') THEN
    CREATE USER house_user WITH PASSWORD 'house_local_2026';
  END IF;
END \$\$;
SELECT 'CREATE DATABASE house OWNER house_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'house')\gexec
GRANT ALL PRIVILEGES ON DATABASE house TO house_user;
SQL

mkdir -p /var/www
if [[ ! -d "\$PROJECT_ROOT/frontend" ]]; then
  rm -rf "\$PROJECT_ROOT"
  git clone https://github.com/Nazir93/house.git "\$PROJECT_ROOT"
fi
mkdir -p "\$PROJECT_ROOT/frontend/public/uploads"
mkdir -p "\$PROJECT_ROOT/frontend/storage/private/client-documents"
mkdir -p "\$PROJECT_ROOT/frontend/storage/private/proposals"

cat > /etc/nginx/sites-available/house-chastdushi <<NGINX
upstream house_next {
    server 127.0.0.1:\${HOUSE_PORT};
    keepalive 32;
}
server {
    listen 8080;
    listen [::]:8080;
    server_name _;
    client_max_body_size 300M;
    location / {
        proxy_pass http://house_next;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_set_header X-Forwarded-Host \\\$host;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/house-chastdushi /etc/nginx/sites-enabled/house-chastdushi
nginx -t && systemctl reload nginx
echo BOOTSTRAP_OK
REMOTE

echo "========== 2/3 Sync данных со старого =========="
STAMP="$(date +%Y%m%d-%H%M%S)"
WORKDIR="/tmp/house-sync-${STAMP}"
mkdir -p "$WORKDIR"
cd "$OLD_FRONTEND"
set -a
# shellcheck disable=1091
source .env
set +a
DB_URL="${DATABASE_URL%%\?*}"
pg_dump "$DB_URL" -Fc -f "$WORKDIR/house.dump"
tar czf "$WORKDIR/house-files.tar.gz" -C "$OLD_FRONTEND" public/uploads storage/private .env
copy_to_new "$WORKDIR/house.dump" "$WORKDIR/house-files.tar.gz" "root@${NEW_HOST}:/tmp/"

echo "========== 3/3 Restore + build =========="
run_new bash -s <<'REMOTE'
set -euo pipefail
FRONTEND="/var/www/house/frontend"
tar xzf /tmp/house-files.tar.gz -C "$FRONTEND"
NEW_IP="$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')"
sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=\"http://${NEW_IP}:8080\"|" "$FRONTEND/.env"
sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=\"http://${NEW_IP}:8080\"|" "$FRONTEND/.env"
grep -q '^PORT=' "$FRONTEND/.env" && sed -i 's|^PORT=.*|PORT=3000|' "$FRONTEND/.env" || echo 'PORT=3000' >> "$FRONTEND/.env"
sed -i 's|^DATABASE_URL=.*|DATABASE_URL="postgresql://house_user:house_local_2026@127.0.0.1:5432/house?schema=public"|' "$FRONTEND/.env"
sudo -u postgres pg_restore --clean --if-exists --no-owner --no-acl -d house /tmp/house.dump 2>/dev/null || \
  sudo -u postgres pg_restore --no-owner --no-acl -d house /tmp/house.dump
sudo -u postgres psql -d house -v ON_ERROR_STOP=1 <<'SQL'
GRANT ALL ON SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO house_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO house_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO house_user;
SQL
cd /var/www/house && git pull origin main || true
cd "$FRONTEND"
npm ci
npx playwright install chromium 2>/dev/null || true
npm run build
pm2 delete house-next 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sleep 6
curl -s -m 30 -o /dev/null -w "health3000:%{http_code}\n" http://127.0.0.1:3000/api/health
curl -s -m 30 -o /dev/null -w "health8080:%{http_code}\n" http://127.0.0.1:8080/api/health
REMOTE

echo "OK: http://${NEW_HOST}:8080/ (kemperlabs.ru не тронут)"
