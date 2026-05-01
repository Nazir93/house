#!/usr/bin/env bash
# То же, что db-tunnel.ps1 (Linux / macOS / WSL).
# Использование: VPS_SSH_HOST=1.2.3.4 ./scripts/db-tunnel.sh
# или: ./scripts/db-tunnel.sh 1.2.3.4

set -euo pipefail
HOST="${VPS_SSH_HOST:-${1:-}}"
USER="${VPS_SSH_USER:-root}"
LOCAL_PORT="${DB_TUNNEL_LOCAL_PORT:-5433}"

if [[ -z "$HOST" ]]; then
  echo "Укажите хост: VPS_SSH_HOST=1.2.3.4 $0  или  $0 1.2.3.4" >&2
  exit 1
fi

echo "Туннель: 127.0.0.1:${LOCAL_PORT} -> ${HOST}:5432 (Postgres на VPS)"
echo "В .env.local — DATABASE_URL с портом ${LOCAL_PORT}. Ctrl+C — стоп."
exec ssh -N -L "${LOCAL_PORT}:127.0.0.1:5432" "${USER}@${HOST}"
