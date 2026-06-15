#!/usr/bin/env bash
set -euo pipefail
FRONTEND="/var/www/house/frontend"
cd "$FRONTEND"

pkill -f "next start" 2>/dev/null || true
pm2 delete house-next 2>/dev/null || true

git fetch origin main
git pull origin main

npm run build
pm2 start ecosystem.config.cjs
pm2 save
sleep 8

curl -s -m 20 -o /dev/null -w "health:%{http_code}\n" http://127.0.0.1:3000/api/health
curl -s -m 20 -o /dev/null -w "nginx8080:%{http_code}\n" http://127.0.0.1:8080/api/health
