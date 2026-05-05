# Деплой на VPS (закреплённый порядок)

Этот файл — единственный источник правды: в чате шаги не «запоминаются» между сессиями. Если на сервере порядок другой — допишите сюда.

## Типовой сценарий (после `git push` в `main`)

Подставьте свой путь к клону репозитория и при необходимости имя процесса PM2.

```bash
# 1. Код
cd /path/to/house          # корень репозитория (где лежит папка frontend)
git pull origin main

# 2. Frontend
cd frontend
npm ci

# 3. База (выберите ОДИН вариант — как у вас заведено на этом сервере)

# Вариант A — миграции из репозитория (предпочтительно, если используете migrate)
export DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB?schema=public"
npx prisma migrate deploy --schema=prisma/schema.prisma

# Вариант B — как в комментарии к ecosystem.config.cjs (толк схему без истории миграций)
# export DATABASE_URL="..."
# npm run db:push:server

# 4. Сборка
npm run build
# при странностях с Prisma: npm run build:with-prisma

# 5. PM2
pm2 reload house-next
pm2 save
```

## Первый запуск PM2 (если процесса ещё нет)

```bash
cd /path/to/house/frontend
pm2 start ecosystem.config.cjs
pm2 save
# pm2 startup — один раз, выполнить выведенную sudo-команду
```

## Проверка

- Сайт открывается, `/projects/aurora` — блок «Комплектация».
- Логи: `pm2 logs house-next --lines 80`

## Ваши уточнения (допишите сами)

- Путь на сервере: `________________`
- База: вариант A (migrate deploy) или B (db push): `________________`
- Другое (docker, другой порт, другое имя PM2): `________________`
