# Деплой на VPS (закреплённый порядок)

Этот файл — единственный источник правды: в чате шаги не «запоминаются» между сессиями. Если на сервере порядок другой — допишите сюда.

## Важно: `/path/to/house` — не команда, а пример

**Не копируйте** строку `cd /path/to/house` буквально: такой папки на сервере нет.

Сначала узнайте, где лежит проект (см. ниже), **впишите реальный путь** в конец файла в блок «Ваши уточнения» и дальше везде используйте его.

## Как узнать путь к проекту на сервере

Выполните по SSH (достаточно **одного** рабочего способа):

```bash
# 1) Часто сразу даёт рабочую директорию PM2 (если процесс уже запускали)
pm2 show house-next 2>/dev/null | grep -E "exec cwd|cwd"

# 2) Где лежит PM2-конфиг фронта = папка frontend репозитория
sudo find /root /home /var/www /opt -type f -path "*/frontend/ecosystem.config.cjs" 2>/dev/null

# 3) Если нашли, например /root/CARCAS/frontend/ecosystem.config.cjs — корень репо: /root/CARCAS
```

- Если нашли файл `.../frontend/ecosystem.config.cjs`, то **деплой идёт из этой папки** `frontend`, а `git pull` — из **родителя** (корень репо, где лежит `.git` и папка `frontend`).
- Если ничего не нашлось — проект на этот сервер ещё не клонировали; нужен первый `git clone` в выбранный каталог и настройка PM2 по разделу ниже.

После того как путь известен, подставьте его вместо примера в командах:

```bash
PROJECT_ROOT=/РЕАЛЬНЫЙ/ПУТЬ/К/КОРНЮ РЕПО   # где есть папка frontend и .git
```

## Типовой сценарий (после `git push` в `main`)

Подставьте **свой** `PROJECT_ROOT` и при необходимости имя процесса PM2.

```bash
# 1. Код
cd "$PROJECT_ROOT"         # корень репозитория (рядом с папкой frontend)
git pull origin main

# 2. Frontend
cd "$PROJECT_ROOT/frontend"
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
cd "$PROJECT_ROOT/frontend"
pm2 start ecosystem.config.cjs
pm2 save
# pm2 startup — один раз, выполнить выведенную sudo-команду
```

## Проверка

- Сайт открывается, `/projects/aurora` — блок «Комплектация».
- Логи: `pm2 logs house-next --lines 80`

## Ваши уточнения (этот VPS)

Сервер: `7767362-mb967823` (из приглашения shell — при смене хоста обновите).

- **Корень репо** (`PROJECT_ROOT`, там же `git pull`): **`/var/www/house`**
- **Рабочая папка фронта / PM2 `exec cwd`**: **`/var/www/house/frontend`**
- База: вариант A (`migrate deploy`) или B (`db push`): `________________` *(допишите, как у вас принято)*
- Другое (докер, порт, имя процесса PM2): процесс **`house-next`**, порт в `ecosystem.config.cjs` — **3000**

Копипаст для деплоя на этом сервере:

```bash
export PROJECT_ROOT=/var/www/house
cd "$PROJECT_ROOT" && git pull origin main
cd "$PROJECT_ROOT/frontend" && npm ci && npm run build
pm2 reload house-next && pm2 save
```

*(Перед `build` при необходимости — `DATABASE_URL` и миграции / `db:push` по разделу выше.)*
