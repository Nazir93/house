#!/usr/bin/env bash
# Быстрая проверка VPS после деплоя или по cron (раз в 5–15 мин).
# Usage: bash scripts/vps-health-check.sh
# Опционально: HEALTH_URL=https://chastdushi.ru/api/health HEALTH_SECRET=...

set -euo pipefail

HEALTH_URL="${HEALTH_URL:-https://chastdushi.ru/api/health}"
DEEP_URL="${HEALTH_URL}?deep=1"
SECRET="${HEALTH_CHECK_SECRET:-${HEALTH_SECRET:-}}"

echo "==> $(date -Is) VPS health"
echo "    RAM: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "    Load: $(uptime | sed 's/.*load average: //')"
echo "    Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 ")"}')"

if command -v pm2 >/dev/null 2>&1; then
  pm2 jlist 2>/dev/null | head -c 2000 || pm2 status house-next 2>/dev/null || true
  echo ""
fi

echo "==> shallow health"
curl -fsS --max-time 15 "$HEALTH_URL" | head -c 500
echo ""

if [[ -n "$SECRET" ]]; then
  echo "==> deep health"
  curl -fsS --max-time 20 -H "Authorization: Bearer $SECRET" "$DEEP_URL" | head -c 800
  echo ""
else
  echo "==> deep health (skip — задайте HEALTH_CHECK_SECRET для БД и очереди КП)"
fi

echo "OK"
