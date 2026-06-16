# Единые параметры production VPS (chastdushi.ru).
# Подключать: source "$(dirname "$0")/vps-config.sh"
#
# SSH с ПК:  ssh carcas-vps
# Деплой:     bash scripts/deploy-remote.sh

VPS_HOST="${VPS_HOST:-46.173.26.108}"
VPS_SSH_USER="${VPS_SSH_USER:-root}"
VPS_SSH_ALIAS="${VPS_SSH_ALIAS:-carcas-vps}"
VPS_SSH_KEY="${VPS_SSH_KEY:-${SSH_KEY_PATH:-${HOME}/.ssh/carcas_vps_ed25519}}"
VPS_OLD_HOST="${VPS_OLD_HOST:-81.200.145.113}"

HOUSE_ROOT="${HOUSE_ROOT:-/var/www/house}"
HOUSE_FRONTEND="${HOUSE_FRONTEND:-${HOUSE_ROOT}/frontend}"
PM2_APP_NAME="${PM2_APP_NAME:-house-next}"
NODE_PORT="${NODE_PORT:-3000}"
NGINX_TEST_PORT="${NGINX_TEST_PORT:-8080}"

# Домены сайта (punycode для .рф — как в certbot)
DOMAIN_PRIMARY="${DOMAIN_PRIMARY:-chastdushi.ru}"
DOMAIN_WWW="${DOMAIN_WWW:-www.chastdushi.ru}"
DOMAIN_RF="${DOMAIN_RF:-xn--80aim8afhxn7a.xn--p1ai}"
DOMAIN_RF_UNICODE="${DOMAIN_RF_UNICODE:-частьдуши.рф}"

PUBLIC_SITE_URL="${PUBLIC_SITE_URL:-https://chastdushi.ru}"
NEXTAUTH_PUBLIC_URL="${NEXTAUTH_PUBLIC_URL:-https://chastdushi.ru}"
