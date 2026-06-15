#!/usr/bin/env bash
set -euo pipefail
NEW_HOST="46.173.26.108"
PASS_FILE="/tmp/newvps.pass"
run_new() { sshpass -f "$PASS_FILE" ssh -o StrictHostKeyChecking=no "root@${NEW_HOST}" "$@"; }

echo "=== SYSTEM ==="
run_new "hostname; which node npm pm2 2>/dev/null; node -v 2>/dev/null; systemctl is-active postgresql nginx 2>/dev/null"

echo "=== ALL LISTEN PORTS ==="
run_new "ss -tlnp"

echo "=== KEMPERLABS NGINX ==="
run_new "cat /etc/nginx/sites-available/kemperlabs 2>/dev/null | head -80"

echo "=== DEFAULT NGINX ==="
run_new "cat /etc/nginx/sites-available/default 2>/dev/null | head -40"
