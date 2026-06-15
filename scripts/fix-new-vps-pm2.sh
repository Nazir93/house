#!/usr/bin/env bash
set -euo pipefail
echo "=== ports ==="
ss -tlnp | grep -E ':8080|:3000' || true

echo "=== restart pm2 fork ==="
cd /var/www/house/frontend
pm2 delete house-next 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sleep 12
pm2 list

echo "=== curl ==="
curl -s -m 45 -o /dev/null -w "health3000:%{http_code} t:%{time_total}\n" http://127.0.0.1:3000/api/health || echo health_fail
curl -s -m 45 -o /dev/null -w "home8080:%{http_code} t:%{time_total}\n" http://127.0.0.1:8080/ || echo nginx_fail
curl -s -m 45 -o /dev/null -w "home3000:%{http_code} t:%{time_total}\n" http://127.0.0.1:3000/ || echo home_fail

echo "=== ufw ==="
ufw status 2>/dev/null || true
