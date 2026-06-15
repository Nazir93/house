#!/usr/bin/env bash
set -euo pipefail
NEW_HOST="46.173.26.108"
PASS_FILE="/tmp/newvps.pass"
[[ -f "$PASS_FILE" ]] || { echo "missing $PASS_FILE"; exit 1; }

run_new() {
  sshpass -f "$PASS_FILE" ssh -o StrictHostKeyChecking=no "root@${NEW_HOST}" "$@"
}

echo "=== PORTS ==="
run_new "ss -tlnp | grep -E ':80|:443|:300[0-9]|:5432' || true"

echo "=== PM2 ==="
run_new "pm2 list 2>/dev/null || echo no_pm2"

echo "=== NGINX SITES ==="
run_new "ls -la /etc/nginx/sites-enabled/ 2>/dev/null; echo '---'; grep -r server_name /etc/nginx/sites-enabled/ 2>/dev/null | head -20"

echo "=== /var/www ==="
run_new "ls -la /var/www/ 2>/dev/null"

echo "=== POSTGRES DBs ==="
run_new "sudo -u postgres psql -tAc \"SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY 1\" 2>/dev/null || true"

echo "=== OUR PROJECT ==="
run_new "test -d /var/www/house && echo house_exists || echo house_missing"
run_new "test -f /var/www/house/frontend/.env && echo house_env_ok || echo house_env_missing"
