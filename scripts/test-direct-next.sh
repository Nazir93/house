#!/usr/bin/env bash
set -euo pipefail
FRONTEND="/var/www/house/frontend"
cd "$FRONTEND"

pm2 delete house-next 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
sleep 2

echo "=== start next directly ==="
nohup env NODE_ENV=production npx next start -H 0.0.0.0 -p 3000 > /tmp/next-direct.log 2>&1 &
sleep 8
tail -5 /tmp/next-direct.log

node -e "fetch('http://127.0.0.1:3000/api/health',{signal:AbortSignal.timeout(15000)}).then(r=>console.log('nodefetch',r.status)).catch(e=>console.log('nodefetch_err',e.message))"

curl -s -m 15 -o /dev/null -w "curl:%{http_code}\n" http://127.0.0.1:3000/api/health || echo curl_fail
