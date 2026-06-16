#!/usr/bin/env bash
# Деплой на production VPS с вашего ПК (нужен SSH-ключ carcas-vps).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=1091
source "${SCRIPT_DIR}/vps-config.sh"

if ssh -G "${VPS_SSH_ALIAS}" >/dev/null 2>&1; then
  SSH_CMD=(ssh "${VPS_SSH_ALIAS}")
elif [[ -f "${VPS_SSH_KEY}" ]]; then
  SSH_CMD=(ssh -i "${VPS_SSH_KEY}" -o IdentitiesOnly=yes "${VPS_SSH_USER}@${VPS_HOST}")
else
  echo "ERROR: нет ~/.ssh/config alias ${VPS_SSH_ALIAS} и ключ ${VPS_SSH_KEY}" >&2
  exit 1
fi

echo "==> Deploy on ${VPS_HOST} (${PM2_APP_NAME})"
"${SSH_CMD[@]}" "bash ${HOUSE_ROOT}/scripts/deploy-vps.sh"
