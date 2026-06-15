#!/usr/bin/env bash
# Деплой на production VPS с вашего ПК (нужен SSH-ключ carcas-vps).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=1091
source "${SCRIPT_DIR}/vps-config.sh"

SSH_TARGET="${VPS_SSH_ALIAS}"
if ssh -G "${VPS_SSH_ALIAS}" >/dev/null 2>&1; then
  SSH_CMD=(ssh "${VPS_SSH_ALIAS}")
else
  SSH_CMD=(ssh "${VPS_SSH_USER}@${VPS_HOST}")
fi

echo "==> Deploy on ${VPS_HOST} (${PM2_APP_NAME})"
"${SSH_CMD[@]}" "bash ${HOUSE_ROOT}/scripts/deploy-vps.sh"
