#!/usr/bin/env bash
# После переключения DNS на VPS (46.173.26.108).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=1091
source "${SCRIPT_DIR}/vps-config.sh"

FRONTEND="${HOUSE_FRONTEND}"
EMAIL="${CERTBOT_EMAIL:-admin@chastdushi.ru}"

certbot --nginx \
  -d "${DOMAIN_PRIMARY}" \
  -d "${DOMAIN_WWW}" \
  -d "${DOMAIN_RF}" \
  --non-interactive --agree-tos -m "${EMAIL}" --redirect \
  || certbot certonly --webroot -w /var/www/html \
  -d "${DOMAIN_PRIMARY}" -d "${DOMAIN_WWW}" -d "${DOMAIN_RF}" \
  --non-interactive --agree-tos -m "${EMAIL}"

sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=\"${PUBLIC_SITE_URL}\"|" "${FRONTEND}/.env"
sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=\"${NEXTAUTH_PUBLIC_URL}\"|" "${FRONTEND}/.env"
grep -q '^AUTH_TRUST_HOST=' "${FRONTEND}/.env" && \
  sed -i 's|^AUTH_TRUST_HOST=.*|AUTH_TRUST_HOST="true"|' "${FRONTEND}/.env" || \
  echo 'AUTH_TRUST_HOST="true"' >> "${FRONTEND}/.env"

cd "${FRONTEND}"
npm run build
pm2 restart "${PM2_APP_NAME}" --update-env
pm2 save

curl -s -m 15 -o /dev/null -w "https:%{http_code}\n" "${PUBLIC_SITE_URL}/api/health"
echo "OK HTTPS for ${DOMAIN_PRIMARY} and ${DOMAIN_RF_UNICODE}"
