#!/usr/bin/env bash
# Первичная настройка нового VPS для house-next (chastdushi.ru)
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "==> Обновление системы"
apt-get update -qq
apt-get upgrade -y -qq

echo "==> Базовые пакеты"
apt-get install -y -qq git curl ca-certificates gnupg ufw nginx postgresql postgresql-contrib certbot

echo "==> Node.js 20"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
node -v
npm -v

echo "==> PM2"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "==> UFW"
ufw allow OpenSSH || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
echo "y" | ufw enable || true

echo "==> PostgreSQL: пользователь и БД house"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'house_user') THEN
    CREATE USER house_user WITH PASSWORD 'CHANGE_ME_AFTER_MIGRATION';
  END IF;
END
$$;
SELECT 'CREATE DATABASE house OWNER house_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'house')\gexec
GRANT ALL PRIVILEGES ON DATABASE house TO house_user;
SQL

echo "==> Каталог проекта"
mkdir -p /var/www
if [[ ! -d /var/www/house/.git ]]; then
  git clone https://github.com/Nazir93/house.git /var/www/house
fi

mkdir -p /var/www/house/frontend/public/uploads
mkdir -p /var/www/house/frontend/storage/private/client-documents
mkdir -p /var/www/house/frontend/storage/private/proposals

echo "==> nginx (временно HTTP по IP)"
cat > /etc/nginx/sites-available/house <<'NGINX'
upstream nextjs_house {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 300M;

    location / {
        proxy_pass http://nextjs_house;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/house /etc/nginx/sites-enabled/house
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

echo "==> Bootstrap завершён"
df -h /
free -h
