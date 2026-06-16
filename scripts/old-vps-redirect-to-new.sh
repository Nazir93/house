#!/usr/bin/env bash
# Старый VPS (81.200.145.113): перестать отдавать сайт, только 301 → новый сервер.
# Запуск на СТАРОМ сервере: bash scripts/old-vps-redirect-to-new.sh
set -euo pipefail

NEW_URL="${NEW_PUBLIC_SITE_URL:-https://chastdushi.ru}"
SSL_CERT="${OLD_SSL_CERT:-/etc/letsencrypt/live/chastdushi.ru/fullchain.pem}"
SSL_KEY="${OLD_SSL_KEY:-/etc/letsencrypt/live/chastdushi.ru/privkey.pem}"
SITES="/etc/nginx/sites-available/house-chastdushi-redirect"
ENABLED="/etc/nginx/sites-enabled/house-chastdushi-redirect"

cat > "$SITES" <<EOF
# Автогенерация: весь трафик chastdushi.ru → ${NEW_URL} (новый VPS 46.173.26.108)
# Старый PM2 house-next можно остановить: pm2 stop house-next

server {
    listen 80;
    listen [::]:80;
    server_name chastdushi.ru www.chastdushi.ru xn--80aim8afhxn7a.xn--p1ai;
    return 301 ${NEW_URL}\$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name chastdushi.ru www.chastdushi.ru xn--80aim8afhxn7a.xn--p1ai;

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 ${NEW_URL}\$request_uri;
}
EOF

ln -sf "$SITES" "$ENABLED"

# Отключаем прокси на старый Next.js для chastdushi (если был отдельный файл)
for f in /etc/nginx/sites-enabled/*chastdushi*; do
  [[ "$f" == "$ENABLED" ]] && continue
  [[ -f "$f" ]] && rm -f "$f" && echo "disabled: $f"
done

pm2 stop house-next 2>/dev/null || true

nginx -t
systemctl reload nginx
echo "OK: старый VPS теперь только редирект → ${NEW_URL}"
