#!/usr/bin/env bash
# Cron: подхват зависших PENDING КП (раз в 2 мин). Вызывается из deploy-vps.sh.
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
CRON_LINE="*/2 * * * * cd $ROOT/frontend && /usr/bin/node scripts/process-pending-proposals.cjs >> /var/log/house-proposals.log 2>&1"
MARKER="# house-proposal-jobs"

TMP="$(mktemp)"
crontab -l 2>/dev/null | grep -v "$MARKER" | grep -v "process-pending-proposals.cjs" > "$TMP" || true
echo "$CRON_LINE $MARKER" >> "$TMP"
crontab "$TMP"
rm -f "$TMP"
touch /var/log/house-proposals.log 2>/dev/null || true
echo "OK: cron proposal worker (*/2 min)"
