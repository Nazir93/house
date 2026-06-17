#!/usr/bin/env bash
# Nginx для chastdushi: конфиг сайта, snippets (proxy/gzip), reload.
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
CONF="/etc/nginx/sites-available/house-chastdushi"
SNIPPETS="/etc/nginx/snippets"

cp "$ROOT/nginx/snippets/house-proxy.conf" "$SNIPPETS/house-proxy.conf"
cp "$ROOT/nginx/snippets/house-gzip.conf" "$SNIPPETS/house-gzip.conf"
cp "$ROOT/nginx/chastdushi-site.conf" "$CONF"

if [[ -f "$ROOT/nginx/nginx-vps.conf" ]]; then
  cp "$ROOT/nginx/nginx-vps.conf" /etc/nginx/nginx.conf
fi

if ! grep -q 'house-gzip.conf' /etc/nginx/nginx.conf; then
  sed -i '/http {/a \    include /etc/nginx/snippets/house-gzip.conf;' /etc/nginx/nginx.conf
fi

ln -sf "$CONF" /etc/nginx/sites-enabled/house-chastdushi

nginx -t
systemctl reload nginx
echo "OK: nginx обновлён (gzip, keepalive, кэш static/images)"
