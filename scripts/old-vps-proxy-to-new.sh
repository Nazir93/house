#!/usr/bin/env bash
# Старый VPS (81.200.145.113): не отдавать сайт и не редиректить на www (петля!),
# а проксировать на новый сервер 46.173.26.108:8080.
#
# Запуск на СТАРОМ сервере: bash scripts/old-vps-proxy-to-new.sh
set -euo pipefail

NEW_VPS="${NEW_VPS_HOST:-46.173.26.108}"
NEW_PORT="${NEW_VPS_PROXY_PORT:-8080}"
SSL_CERT="${OLD_SSL_CERT:-/etc/letsencrypt/live/chastdushi.ru/fullchain.pem}"
SSL_KEY="${OLD_SSL_KEY:-/etc/letsencrypt/live/chastdushi.ru/privkey.pem}"
SITES="/etc/nginx/sites-available/house-chastdushi-proxy"
ENABLED="/etc/nginx/sites-enabled/house-chastdushi-proxy"

cat > "$SITES" <<EOF
# Старый VPS → прокси на новый (${NEW_VPS}:${NEW_PORT}). Без редиректов (иначе петля www→www).
upstream house_new_vps {
    server ${NEW_VPS}:${NEW_PORT};
    keepalive 16;
}

server {
    listen 80;
    listen [::]:80;
    server_name chastdushi.ru www.chastdushi.ru xn--80aim8afhxn7a.xn--p1ai;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name chastdushi.ru www.chastdushi.ru xn--80aim8afhxn7a.xn--p1ai;

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 300M;

    location / {
        proxy_pass http://house_new_vps;
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
EOF

ln -sf "$SITES" "$ENABLED"

for f in /etc/nginx/sites-enabled/house-chastdushi-redirect /etc/nginx/sites-enabled/chastdushi.ru /etc/nginx/sites-enabled/house-chastdushi; do
  [[ -e "$f" ]] && rm -f "$f" && echo "disabled: $f"
done

pm2 stop house-next 2>/dev/null || true

nginx -t
systemctl reload nginx
echo "OK: старый VPS проксирует на http://${NEW_VPS}:${NEW_PORT}"
