#!/usr/bin/env bash
# Деплой на VPS после git push в main: fetch/pull → npm ci → Prisma → build → PM2 reload.
#
# Личный кабинет (/account): все таблицы и enum (документы, уведомления, PHOTO_NEW и др.)
# накатываются через prisma migrate deploy — отдельный db push не нужен.
#
# Одна команда:
#   bash /var/www/house/scripts/deploy-vps.sh
#
# Другой корень репозитория:
#   HOUSE_ROOT=/path/to/clone bash /path/to/clone/scripts/deploy-vps.sh
#
# Только db push без migrate (legacy, не для продакшена с миграциями):
#   SKIP_MIGRATE=1 USE_DB_PUSH=1 bash /var/www/house/scripts/deploy-vps.sh
#
# Дополнительно db push после migrate (обычно не нужно):
#   USE_DB_PUSH=1 bash /var/www/house/scripts/deploy-vps.sh
#
# Без проверки БД после миграций:
#   SKIP_VERIFY=1 bash /var/www/house/scripts/deploy-vps.sh
#
# Без lint/typecheck/unit перед сборкой (не рекомендуется):
#   SKIP_TESTS=1 bash /var/www/house/scripts/deploy-vps.sh
#
set -euo pipefail

ROOT="${HOUSE_ROOT:-/var/www/house}"
BRANCH="${DEPLOY_BRANCH:-main}"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: $ROOT не является git-репозиторием. Проверьте HOUSE_ROOT."
  exit 1
fi

echo "==> git status"
git status --short --branch

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: на VPS есть незакоммиченные изменения в отслеживаемых файлах. Сначала разберите их, чтобы deploy не перезатёр код."
  git status --short --untracked-files=no
  exit 1
fi

echo "==> git fetch origin ${BRANCH}"
git fetch origin "$BRANCH"

LOCAL_REV="$(git rev-parse HEAD)"
REMOTE_REV="$(git rev-parse "origin/${BRANCH}")"

echo "==> текущий коммит: $(git rev-parse --short HEAD)"
echo "==> origin/${BRANCH}: $(git rev-parse --short "origin/${BRANCH}")"

if [[ "$LOCAL_REV" == "$REMOTE_REV" ]]; then
  echo "==> код уже актуален"
elif git merge-base --is-ancestor "$LOCAL_REV" "$REMOTE_REV"; then
  echo "==> git pull --ff-only origin ${BRANCH}"
  git pull --ff-only origin "$BRANCH"
elif git merge-base --is-ancestor "$REMOTE_REV" "$LOCAL_REV"; then
  echo "==> текущий код впереди origin/${BRANCH}; деплоим локальный HEAD"
else
  echo "ERROR: ветка разошлась с origin/${BRANCH}. Нужен ручной rebase/merge перед деплоем."
  exit 1
fi

cd "$ROOT/frontend"

if [[ -f .env ]]; then
  echo "==> подхват переменных из frontend/.env (для Prisma в этом сеансе)"
  set -a
  # shellcheck disable=1091
  source .env
  set +a
elif [[ -f .env.local ]]; then
  echo "==> подхват переменных из frontend/.env.local"
  set -a
  # shellcheck disable=1091
  source .env.local
  set +a
else
  echo "WARN: нет frontend/.env — Prisma и сборка могут не увидеть DATABASE_URL"
fi

if [[ "${E2E_ENABLED:-}" == "1" ]]; then
  echo "WARN: E2E_ENABLED=1 в .env на проде — отключите (seed API /account только для тестов)"
fi

echo "==> npm ci"
npm ci

echo "==> prisma generate"
npx prisma generate --schema=prisma/schema.prisma

if [[ "${SKIP_MIGRATE:-}" == "1" ]]; then
  echo "==> SKIP_MIGRATE=1 — prisma migrate deploy пропущен"
else
  echo "==> prisma migrate deploy (в т.ч. личный кабинет: ClientConstructionProject, документы, уведомления)"
  npx prisma migrate deploy --schema=prisma/schema.prisma
fi

if [[ "${USE_DB_PUSH:-}" == "1" ]]; then
  echo "==> prisma db push (опционально, только если так заведено на сервере)"
  npx prisma db push --schema=prisma/schema.prisma --skip-generate
fi

if [[ "${SKIP_VERIFY:-}" == "1" ]]; then
  echo "==> SKIP_VERIFY=1 — db:verify пропущен"
else
  echo "==> npm run db:verify"
  npm run db:verify
fi

if [[ "${SKIP_TESTS:-}" == "1" ]]; then
  echo "==> SKIP_TESTS=1 — npm run check пропущен"
else
  echo "==> npm run check (lint + typecheck + unit)"
  npm run check
fi

echo "==> npm run build"
npm run build

echo "==> pm2 reload house-next --update-env && pm2 save"
pm2 reload house-next --update-env
pm2 save

echo "OK: деплой завершён (house-next перезагружен). ЛК: /account/login, админка: /admin/client-projects"
