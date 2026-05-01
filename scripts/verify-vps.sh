#!/usr/bin/env bash
# Проверка окружения на VPS (Ubuntu). Запуск из любой директории:
#   bash scripts/verify-vps.sh
# Или с явным корнем проекта:
#   HOUSE_ROOT=/var/www/house bash scripts/verify-vps.sh
set +e

HOUSE_ROOT="${HOUSE_ROOT:-/var/www/house}"
FRONTEND="$HOUSE_ROOT/frontend"
PASS=0
FAIL=0

ok() { echo "[OK] $*"; PASS=$((PASS + 1)); }
bad() { echo "[!!] $*"; FAIL=$((FAIL + 1)); }

echo ""
echo "=== Проверка VPS (HOUSE_ROOT=$HOUSE_ROOT) ==="
echo ""

# --- Бинарники ---
for cmd in node npm git; do
  if command -v "$cmd" >/dev/null 2>&1; then
    ver=$("$cmd" --version 2>/dev/null | head -1)
    ok "$cmd: $ver"
  else
    bad "нет команды: $cmd"
  fi
done

if command -v pm2 >/dev/null 2>&1; then
  ok "pm2: $(pm2 --version 2>/dev/null | head -1)"
else
  bad "нет pm2 (npm install -g pm2)"
fi

if command -v nginx >/dev/null 2>&1; then
  ok "nginx: установлен"
else
  bad "нет nginx"
fi

if command -v psql >/dev/null 2>&1 || command -v pg_isready >/dev/null 2>&1; then
  ok "postgresql-клиент: есть"
else
  bad "нет psql/pg_isready (apt install postgresql-client)"
fi

echo ""

# --- Каталог проекта ---
if [[ -d "$FRONTEND" ]]; then
  ok "каталог frontend существует"
else
  bad "нет $FRONTEND (git clone → $HOUSE_ROOT)"
fi

if [[ -f "$FRONTEND/package.json" ]]; then
  ok "package.json найден"
else
  bad "нет $FRONTEND/package.json"
fi

if [[ -f "$FRONTEND/.env" ]]; then
  ok "frontend/.env существует"
else
  bad "нет $FRONTEND/.env — скопируйте с ПК или: cp .env.example .env && nano .env"
fi

if [[ -d "$FRONTEND/node_modules" ]]; then
  ok "node_modules есть (npm ci уже выполняли)"
else
  bad "нет node_modules — выполните: cd $FRONTEND && npm ci"
fi

if [[ -d "$FRONTEND/.next" ]]; then
  ok ".next есть (сборка выполнялась)"
else
  bad "нет .next — выполните: cd $FRONTEND && npm run build"
fi

echo ""

# --- PostgreSQL ---
if pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
  ok "PostgreSQL отвечает на 127.0.0.1:5432"
else
  bad "PostgreSQL не отвечает на 5432 (sudo systemctl status postgresql)"
fi

echo ""

# --- PM2 ---
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe house-next >/dev/null 2>&1; then
    ok "PM2: процесс house-next найден"
    pm2 describe house-next 2>/dev/null | grep -E "status|uptime|memory|restart" || true
  else
    bad "PM2: нет процесса house-next (pm2 start ecosystem.config.cjs)"
  fi
fi

echo ""

# --- HTTP Next.js ---
_http_ok=
if command -v curl >/dev/null 2>&1; then
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 http://127.0.0.1:3000/ 2>/dev/null || echo "")
  [[ "$code" =~ ^[23] ]] && _http_ok=1
elif command -v wget >/dev/null 2>&1; then
  wget -q -O /dev/null --timeout=2 http://127.0.0.1:3000/ 2>/dev/null && _http_ok=1
fi
if [[ -n "$_http_ok" ]]; then
  ok "HTTP 127.0.0.1:3000 отвечает"
else
  bad "нет ответа на http://127.0.0.1:3000 (PM2 / сборка / PORT)"
fi

echo ""

# --- nginx ---
if command -v nginx >/dev/null 2>&1; then
  if sudo nginx -t >/dev/null 2>&1; then
    ok "nginx -t: синтаксис конфигурации верный"
  else
    bad "nginx -t: ошибка (sudo nginx -t)"
  fi
  if systemctl is-active --quiet nginx 2>/dev/null; then
    ok "nginx: сервис active"
  else
    bad "nginx: сервис не active (sudo systemctl status nginx)"
  fi
fi

echo ""

# --- Prisma + DATABASE_URL (через существующий verify-db.cjs) ---
if [[ -f "$FRONTEND/.env" && -d "$FRONTEND/node_modules/@prisma/client" ]]; then
  if grep -qE '^[[:space:]]*DATABASE_URL=' "$FRONTEND/.env" 2>/dev/null; then
    ok "в .env есть строка DATABASE_URL"
  else
    bad "в .env нет DATABASE_URL"
  fi
  if (cd "$FRONTEND" && node scripts/verify-db.cjs); then
    ok "Prisma: подключение к БД (verify-db.cjs)"
  else
    bad "Prisma: нет связи с БД — DATABASE_URL, права, миграции (npx prisma migrate deploy)"
  fi
elif [[ -f "$FRONTEND/.env" ]]; then
  bad "нет @prisma/client — выполните: cd $FRONTEND && npm ci && npx prisma generate"
fi

echo ""
echo "=== Итого: OK=$PASS, проблем=$FAIL ==="
echo ""
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
