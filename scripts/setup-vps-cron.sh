#!/usr/bin/env bash
# Cron: health-check каждые 5 мин + pg_dump ежедневно.
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
MARKER="# house-vps-cron"

if ! crontab -l 2>/dev/null | grep -qF "$MARKER"; then
  (
    crontab -l 2>/dev/null || true
    echo "*/5 * * * * cd $ROOT/frontend && set -a && [ -f .env ] && . ./.env; set +a; bash $ROOT/scripts/vps-health-check.sh >> /var/log/house-health.log 2>&1 $MARKER-health"
    echo "15 3 * * * bash $ROOT/scripts/vps-pg-backup.sh >> /var/log/house-pg-backup.log 2>&1 $MARKER-backup"
  ) | crontab -
  echo "OK: cron health + pg backup"
else
  echo "OK: cron уже настроен ($MARKER)"
fi
