#!/usr/bin/env bash
# Синхронизация frontend/.env с PM2 и текущим билдом.
# — не перезаписывает непустые значения;
# — подтягивает ключи из PM2, если в .env пусто;
# — восстанавливает NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY из .next (если был в билде);
# — генерирует HEALTH_CHECK_SECRET / INTERNAL_API_SECRET при отсутствии.
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
FRONTEND="$ROOT/frontend"
ENV_FILE="$FRONTEND/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: нет $ENV_FILE"
  exit 1
fi

env_get() {
  local key="$1"
  local raw
  raw="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2- || true)"
  raw="${raw#\"}"
  raw="${raw%\"}"
  raw="${raw#\'}"
  raw="${raw%\'}"
  printf '%s' "$raw"
}

env_set_if_empty() {
  local key="$1"
  local val="$2"
  [[ -n "$val" ]] || return 0
  local current
  current="$(env_get "$key")"
  if [[ -n "${current// /}" ]]; then
    return 0
  fi
  if grep -qE "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
  fi
  echo "  + ${key} (из PM2/билда/генерации)"
}

pm2_get() {
  local key="$1"
  pm2 env 0 2>/dev/null | grep -E "^${key}:" | tail -1 | sed "s/^${key}: //" || true
}

recover_captcha_client_from_build() {
  grep -roh 'ysc1_[a-zA-Z0-9_-]*' "$FRONTEND/.next" 2>/dev/null | head -1 || true
}

echo "==> sync frontend/.env"

SYNC_KEYS=(
  YANDEX_SMARTCAPTCHA_SERVER_KEY
  NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY
  HEALTH_CHECK_SECRET
  INTERNAL_API_SECRET
  NEXTAUTH_SECRET
  ADMIN_SECRET
  DATABASE_URL
)

for key in "${SYNC_KEYS[@]}"; do
  current="$(env_get "$key")"
  if [[ -n "${current// /}" ]]; then
    continue
  fi
  from_pm2="$(pm2_get "$key")"
  env_set_if_empty "$key" "$from_pm2"
done

client="$(env_get NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY)"
if [[ -z "${client// /}" ]]; then
  from_build="$(recover_captcha_client_from_build)"
  env_set_if_empty "NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY" "$from_build"
fi

if [[ -z "$(env_get HEALTH_CHECK_SECRET)" ]]; then
  env_set_if_empty "HEALTH_CHECK_SECRET" "$(openssl rand -base64 32)"
fi
if [[ -z "$(env_get INTERNAL_API_SECRET)" ]]; then
  env_set_if_empty "INTERNAL_API_SECRET" "$(openssl rand -base64 32)"
fi

echo "==> env:check"
cd "$FRONTEND"
export NODE_ENV=production
npm run env:check || echo "WARN: env:check — см. выше (часто пустые ключи SmartCaptcha в .env)"

echo "==> pm2 reload"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

curl -sf --max-time 15 http://127.0.0.1:8080/api/health >/dev/null && echo "OK: health" || echo "WARN: health не ответил"

client_after="$(env_get NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY)"
if [[ -z "${client_after// /}" ]]; then
  echo ""
  echo "WARN: NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY пуст — задайте ключ из Yandex SmartCaptcha"
  echo "      и выполните: cd frontend && npm run build && pm2 startOrReload ecosystem.config.cjs --update-env"
  echo ""
fi

echo "OK: .env синхронизирован, PM2 перезагружен"
