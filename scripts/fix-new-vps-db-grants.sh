#!/usr/bin/env bash
set -euo pipefail
FRONTEND="/var/www/house/frontend"

echo "=== fix postgres grants ==="
sudo -u postgres psql -d house -v ON_ERROR_STOP=1 <<'SQL'
GRANT ALL ON SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO house_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO house_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO house_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO house_user;
SQL

cd "$FRONTEND"
npm run db:verify 2>&1 | tail -15

pm2 delete house-next 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
sleep 10

curl -s -m 45 -o /dev/null -w "health:%{http_code} t:%{time_total}\n" http://127.0.0.1:3000/api/health
curl -s -m 45 -o /dev/null -w "nginx8080:%{http_code} t:%{time_total}\n" http://127.0.0.1:8080/api/health
pm2 list
