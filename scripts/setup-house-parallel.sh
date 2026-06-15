#!/usr/bin/env bash
# Параллельный деплой house (chastdushi) рядом с kemperlabs на том же VPS.
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
HOUSE_PORT="${HOUSE_PORT:-3000}"
PROJECT_ROOT="/var/www/house"

echo "==> Node.js 20"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
echo "node $(node -v) npm $(npm -v)"

echo "==> PM2"
command -v pm2 >/dev/null 2>&1 || npm install -g pm2

echo "==> PostgreSQL"
if ! systemctl is-active --quiet postgresql 2>/dev/null; then
  apt-get update -qq
  apt-get install -y -qq postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi

echo "==> БД house (если нет)"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'house_user') THEN
    CREATE USER house_user WITH PASSWORD 'house_local_2026';
  END IF;
END $$;
SELECT 'CREATE DATABASE house OWNER house_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'house')\gexec
GRANT ALL PRIVILEGES ON DATABASE house TO house_user;
SQL

echo "==> Git + клон репозитория"
apt-get install -y -qq git
mkdir -p /var/www
if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
  git clone https://github.com/Nazir93/house.git "$PROJECT_ROOT"
fi
test -d "$PROJECT_ROOT/frontend" || { echo "ERROR: clone failed, no frontend/"; exit 1; }

mkdir -p "$PROJECT_ROOT/frontend/public/uploads"
mkdir -p "$PROJECT_ROOT/frontend/storage/private/client-documents"
mkdir -p "$PROJECT_ROOT/frontend/storage/private/proposals"

echo "==> nginx vhost house (HTTP, порт $HOUSE_PORT)"
cat > /etc/nginx/sites-available/house-chastdushi <<NGINX
upstream house_next {
    server 127.0.0.1:${HOUSE_PORT};
    keepalive 32;
}

# Временный доступ по IP (default_server только если kemperlabs не занимает)
server {
    listen 8080;
    listen [::]:8080;
    server_name _;

    client_max_body_size 300M;

    location / {
        proxy_pass http://house_next;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}

# Когда DNS chastdushi.ru укажет на этот сервер — раскомментируйте и certbot:
# server {
#     listen 80;
#     server_name chastdushi.ru www.chastdushi.ru;
#     location / { proxy_pass http://house_next; ... }
# }
NGINX

ln -sf /etc/nginx/sites-available/house-chastdushi /etc/nginx/sites-enabled/house-chastdushi
nginx -t
systemctl reload nginx

echo "==> Bootstrap OK (house on :${HOUSE_PORT}, nginx :8080)"
df -h / | tail -1
free -h | head -2
