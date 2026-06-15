#!/usr/bin/env bash
# Финальная production-настройка house на новом VPS (параллельно kemperlabs).
set -euo pipefail

FRONTEND="/var/www/house/frontend"
ROOT="/var/www/house"
HOUSE_PORT=3000

echo "========== 1. PostgreSQL grants =========="
sudo -u postgres psql -d house -v ON_ERROR_STOP=1 <<'SQL'
GRANT ALL ON SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO house_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO house_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO house_user;
SQL

echo "========== 2. nginx: домен + IP:8080 =========="
cat > /etc/nginx/sites-available/house-chastdushi <<NGINX
upstream house_next {
    server 127.0.0.1:${HOUSE_PORT};
    keepalive 32;
}

# Доступ по IP для тестов (пока DNS на старом сервере)
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

# chastdushi.ru — заработает после переключения DNS на этот сервер
server {
    listen 80;
    listen [::]:80;
    server_name chastdushi.ru www.chastdushi.ru;

    client_max_body_size 300M;

    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        root /var/www/html;
    }

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
NGINX

mkdir -p /var/www/html/.well-known/acme-challenge
ln -sf /etc/nginx/sites-available/house-chastdushi /etc/nginx/sites-enabled/house-chastdushi
nginx -t
systemctl reload nginx

echo "========== 3. .env: AUTH_TRUST_HOST + домен =========="
ENV_FILE="$FRONTEND/.env"
grep -q '^AUTH_TRUST_HOST=' "$ENV_FILE" && \
  sed -i 's|^AUTH_TRUST_HOST=.*|AUTH_TRUST_HOST="true"|' "$ENV_FILE" || \
  echo 'AUTH_TRUST_HOST="true"' >> "$ENV_FILE"

# URL для IP:8080 пока DNS не переключён; блок для быстрого переключения на HTTPS ниже
if ! grep -q '^# PROD_URLS_AFTER_DNS' "$ENV_FILE"; then
  cat >> "$ENV_FILE" <<'ENVNOTE'

# PROD_URLS_AFTER_DNS — после A-записи chastdushi.ru → 46.173.26.108 и certbot:
# NEXT_PUBLIC_SITE_URL="https://chastdushi.ru"
# NEXTAUTH_URL="https://chastdushi.ru"
ENVNOTE
fi

echo "========== 4. Playwright (PDF заявок) =========="
cd "$FRONTEND"
npx playwright install chromium 2>/dev/null || npx playwright install chromium || true

echo "========== 5. env:check + db:verify =========="
npm run env:check
npm run db:verify

echo "========== 6. PM2 fork + автозапуск =========="
pm2 delete house-next 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
STARTUP=$(pm2 startup systemd -u root --hp /root 2>&1 | grep -E '^sudo' || true)
if [[ -n "$STARTUP" ]]; then
  eval "$STARTUP" || true
fi

echo "========== 7. UFW (8080 для тестов) =========="
if command -v ufw >/dev/null 2>&1; then
  ufw allow 8080/tcp comment 'house test' 2>/dev/null || true
  ufw status | head -20 || true
fi

sleep 6
echo "========== 8. Проверки =========="
curl -s -m 15 http://127.0.0.1:3000/api/health
echo
curl -s -m 15 -o /dev/null -w "ip8080:%{http_code}\n" http://127.0.0.1:8080/
curl -s -m 15 -o /dev/null -w "home3000:%{http_code}\n" http://127.0.0.1:3000/
pm2 list

echo ""
echo "OK finish-setup"
echo "Тест: http://46.173.26.108:8080/"
echo "После DNS chastdushi.ru → 46.173.26.108: certbot --nginx -d chastdushi.ru -d www.chastdushi.ru"
