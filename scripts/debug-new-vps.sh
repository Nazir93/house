#!/usr/bin/env bash
set -euo pipefail
FRONTEND="/var/www/house/frontend"
cd "$FRONTEND"

echo "=== ecosystem ==="
grep -E "exec_mode|instances" ecosystem.config.cjs || true

echo "=== db verify ==="
npm run db:verify 2>&1 | tail -25

echo "=== manual next on 3001 (10s) ==="
pm2 stop house-next 2>/dev/null || true
timeout 15 env NODE_ENV=production npx next start -H 127.0.0.1 -p 3001 &
NPID=$!
sleep 8
curl -s -m 10 -o /dev/null -w "manual3001:%{http_code}\n" http://127.0.0.1:3001/api/health || echo fail
kill $NPID 2>/dev/null || true
wait $NPID 2>/dev/null || true

echo "=== pm2 fork via npm ==="
pm2 delete house-next 2>/dev/null || true
pm2 start npm --name house-next -- start -- -H 0.0.0.0 -p 3000
sleep 10
curl -s -m 30 -o /dev/null -w "pm2npm:%{http_code}\n" http://127.0.0.1:3000/api/health || echo fail
pm2 list
