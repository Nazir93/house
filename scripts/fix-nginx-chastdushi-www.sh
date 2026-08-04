#!/usr/bin/env bash
# Восстанавливает house-chastdushi nginx и добавляет редирект www → chastdushi.ru
set -euo pipefail

CONF="/etc/nginx/sites-available/house-chastdushi"
REPO="${HOUSE_ROOT:-/var/www/house}/nginx/chastdushi-site.conf"

if [[ ! -f "$REPO" ]]; then
  echo "ERROR: нет $REPO — сначала git pull на VPS"
  exit 1
fi

cp "$CONF" "${CONF}.bak.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true

# Сохраняем пути certbot из текущего конфига (если отличаются)
cp "$REPO" "$CONF"

nginx -t
systemctl reload nginx
echo "OK: nginx перезагружен (www + частьдуши.рф → chastdushi.ru)"
