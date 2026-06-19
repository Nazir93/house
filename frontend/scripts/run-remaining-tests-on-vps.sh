#!/usr/bin/env bash
set -euo pipefail
cd /var/www/house/frontend

E2E_SECRET="${E2E_SECRET:-local-e2e-secret}"
export E2E_SECRET

E2E_ADDED=0
if ! grep -q '^E2E_ENABLED=' .env 2>/dev/null; then
  printf '\n# temporary for e2e tests\nE2E_ENABLED=1\nE2E_SECRET=%s\n' "$E2E_SECRET" >> .env
  E2E_ADDED=1
fi

pm2 restart house-next --update-env
sleep 3

echo "=== rebuild (e2e seed fix) ==="
npm run build 2>&1 | tail -20

pm2 restart house-next --update-env
sleep 3

echo "=== health deep ==="
curl -sS "http://127.0.0.1:3000/api/health?deep=1"
echo

echo "=== e2e seed probe ==="
SEED_HTTP=$(curl -sS -o /tmp/e2e-seed.json -w "%{http_code}" -X POST http://127.0.0.1:3000/api/e2e/client-cabinet -H "x-e2e-secret: $E2E_SECRET")
echo "seed status: $SEED_HTTP"
head -c 200 /tmp/e2e-seed.json || true
echo
curl -sS -X DELETE http://127.0.0.1:3000/api/e2e/client-cabinet -H "x-e2e-secret: $E2E_SECRET" >/dev/null || true

echo
echo "=== playwright browsers ==="
npx playwright install chromium 2>&1 | tail -3

echo
echo "=== E2E client-cabinet (4 tests) ==="
export PLAYWRIGHT_SKIP_WEBSERVER=1
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
export E2E_ENABLED=1
set +e
npm run test:e2e -- e2e/client-cabinet.spec.ts
E2E_EXIT=$?
set -e

echo
echo "=== vitest seed-calculator-catalog runner ==="
npm run db:seed-calculator

if [ "$E2E_ADDED" = "1" ]; then
  sed -i '/^# temporary for e2e tests$/d;/^E2E_ENABLED=1$/d;/^E2E_SECRET=/d' .env
  pm2 restart house-next --update-env
  echo "=== E2E vars removed from .env, pm2 restarted ==="
fi

echo
echo "=== verify e2e disabled ==="
FORBIDDEN=$(curl -sS -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:3000/api/e2e/client-cabinet -H "x-e2e-secret: $E2E_SECRET")
echo "seed after cleanup: $FORBIDDEN (expect 403)"

exit ${E2E_EXIT:-0}
