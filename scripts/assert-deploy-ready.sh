#!/usr/bin/env bash
# Жёсткая проверка после build / после pm2: без зелёного сигнала — exit 1.
# Использование:
#   bash scripts/assert-deploy-ready.sh build   # только .next/BUILD_ID + server
#   bash scripts/assert-deploy-ready.sh health  # ретраи local+public health
#
set -euo pipefail

ROOT="${HOUSE_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
FRONTEND="${ROOT}/frontend"
MODE="${1:-}"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

assert_build() {
  local build_id_file="${FRONTEND}/.next/BUILD_ID"
  local server_dir="${FRONTEND}/.next/server"

  # Битый lock от оборванной сборки — убрать, но сам BUILD_ID обязателен.
  if [[ -f "${FRONTEND}/.next/lock" ]]; then
    echo "==> удаляю stale .next/lock"
    rm -f "${FRONTEND}/.next/lock"
  fi

  if [[ ! -s "$build_id_file" ]]; then
    fail "нет ${build_id_file} — сборка неполная. PM2 стартовать нельзя (crash-loop)."
  fi
  if [[ ! -d "$server_dir" ]]; then
    fail "нет ${server_dir} — сборка неполная."
  fi

  echo "OK: Next build ready (BUILD_ID=$(tr -d '\r\n' < "$build_id_file"))"
}

probe_once() {
  local url="$1"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$url" 2>/dev/null || echo "000")"
  echo "$code"
}

assert_health_url() {
  local label="$1"
  local url="$2"
  local attempts="${DEPLOY_HEALTH_ATTEMPTS:-12}"
  local delay="${DEPLOY_HEALTH_DELAY_SEC:-3}"
  local i code
  local codes=()

  echo "==> health ${label}: ${url} (${attempts} попыток, пауза ${delay}s)"
  for ((i = 1; i <= attempts; i++)); do
    code="$(probe_once "$url")"
    codes+=("$code")
    echo "  try ${i}/${attempts}: HTTP ${code}"
    if [[ "$code" == "200" ]]; then
      echo "OK: ${label} health 200"
      return 0
    fi
    if ((i < attempts)); then
      sleep "$delay"
    fi
  done

  fail "${label} health не дал 200 за ${attempts} попыток (коды: ${codes[*]}). Смотрите: pm2 logs house-next --lines 80"
}

assert_health() {
  local port="${PORT:-3000}"
  local local_next="${DEPLOY_HEALTH_LOCAL_NEXT:-http://127.0.0.1:${port}/api/health}"
  local local_nginx="${DEPLOY_HEALTH_LOCAL_NGINX:-http://127.0.0.1:8080/api/health}"
  local public_url="${HEALTH_URL:-https://chastdushi.ru/api/health}"

  # Сначала локально — иначе публичный 502 маскирует «next не поднялся».
  assert_health_url "next:${port}" "$local_next"
  assert_health_url "nginx:8080" "$local_nginx"
  assert_health_url "public" "$public_url"
}

case "$MODE" in
  build)
    assert_build
    ;;
  health)
    assert_health
    ;;
  *)
    echo "Usage: $0 {build|health}" >&2
    exit 2
    ;;
esac
