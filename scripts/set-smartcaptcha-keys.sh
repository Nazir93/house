#!/usr/bin/env bash
# Одноразово на VPS: прописать ключи SmartCaptcha в frontend/.env и пересобрать.
# Использование: CLIENT_KEY=... SERVER_KEY=... bash scripts/set-smartcaptcha-keys.sh
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
ENV="$ROOT/frontend/.env"
CLIENT="${CLIENT_KEY:?CLIENT_KEY required}"
SERVER="${SERVER_KEY:?SERVER_KEY required}"

python3 - <<PY
import re
path = "$ENV"
client = """$CLIENT"""
server = """$SERVER"""
pairs = {
    "NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY": client,
    "YANDEX_SMARTCAPTCHA_SERVER_KEY": server,
}
text = open(path, encoding="utf-8").read()
for key, val in pairs.items():
    line = f'{key}="{val}"'
    if re.search(rf"^{re.escape(key)}=", text, re.M):
        text = re.sub(rf"^{re.escape(key)}=.*$", line, text, count=1, flags=re.M)
    else:
        text = text.rstrip() + "\n" + line + "\n"
open(path, "w", encoding="utf-8").write(text)
print("OK: keys written to .env")
PY

cd "$ROOT/frontend"
export NODE_ENV=production
npm run env:check
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
sleep 12
curl -sf https://chastdushi.ru/api/health && echo
