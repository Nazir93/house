#!/usr/bin/env bash
set -euo pipefail
PASS_FILE="/tmp/newvps.pass"
NEW="46.173.26.108"
sshpass -f "$PASS_FILE" scp -o StrictHostKeyChecking=no /tmp/proxy.ts root@${NEW}:/var/www/house/frontend/src/proxy.ts
sshpass -f "$PASS_FILE" scp -o StrictHostKeyChecking=no /tmp/rebuild-new-vps.sh root@${NEW}:/tmp/rebuild-new-vps.sh
sshpass -f "$PASS_FILE" ssh -o StrictHostKeyChecking=no root@${NEW} "pkill -f 'next start' 2>/dev/null || true; bash /tmp/rebuild-new-vps.sh"
