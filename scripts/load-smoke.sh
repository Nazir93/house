#!/usr/bin/env bash
# Лёгкий load-smoke на staging-порту 8080 или prod URL.
set -euo pipefail

BASE="${LOAD_SMOKE_URL:-http://127.0.0.1:8080}"
REQUESTS="${LOAD_SMOKE_REQUESTS:-50}"

echo "==> load smoke: $BASE ($REQUESTS req each)"

for path in "/" "/portfolio" "/api/health"; do
  ok=0
  fail=0
  for _ in $(seq 1 "$REQUESTS"); do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$BASE$path" || echo 000)"
    if [[ "$code" =~ ^[23] ]]; then
      ok=$((ok + 1))
    else
      fail=$((fail + 1))
    fi
  done
  echo "  $path: ok=$ok fail=$fail"
  if [[ "$fail" -gt 5 ]]; then
    echo "ERROR: too many failures on $path"
    exit 1
  fi
done

echo "OK: load smoke passed"
