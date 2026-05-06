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

## Админка `/admin`: редирект на чужой сайт, «дом» или сразу на главную

NextAuth строит CSRF и cookie от **`NEXTAUTH_URL`**. Если в `.env` указан **другой хост** (старый домен, `http://127.0.0.1:3000`, а в браузере открываете **публичный HTTPS**), после ввода логина браузер уезжает не туда или сессия не записывается.

### Что сделать на сервере

1. Откройте **`frontend/.env`** на VPS (тот же каталог, откуда PM2 запускает `next start`).

2. Выставьте **одинаковый публичный адрес** — ровно как в адресной строке при заходе в админку (схема `http`/`https`, **без** лишнего слэша в конце):

   - Сайт открываете как **`https://ваш-домен.ru`** →  
     `NEXTAUTH_URL=https://ваш-домен.ru`  
     `NEXT_PUBLIC_SITE_URL=https://ваш-домен.ru`

   - Заходите по IP и порту **`http://123.45.67.89:3000`** →  
     `NEXTAUTH_URL=http://123.45.67.89:3000`  
     `NEXT_PUBLIC_SITE_URL=http://123.45.67.89:3000`

3. За **nginx** (HTTPS на 443, Node на :3000) добавьте в `location` прокси:

   ```nginx
   proxy_set_header Host $host;
   proxy_set_header X-Forwarded-Proto $scheme;
   proxy_set_header X-Forwarded-Host $host;
   ```

   И в **`frontend/.env`**: `AUTH_TRUST_HOST=true` — чтобы NextAuth доверял этим заголовкам.

4. Перезапуск с подхватом env:

   ```bash
   cd /var/www/house/frontend   # или ваш PROJECT_ROOT/frontend
   npm run env:check
   pm2 restart house-next --update-env && pm2 save
   ```

5. Вход на **`/admin/login`**: email = **`ADMIN_EMAIL`** из `.env` (если не задали — в коде подставляется пример **`admin@dom.ru`**, это **не** адрес сайта, а просто логин), пароль = **`ADMIN_SECRET`**.

6. Если после «Войти» страница **только обновляется** (сессия не держится): за HTTPS nginx обязательно **`X-Forwarded-Proto`** (см. выше). В коде middleware читает этот заголовок, чтобы искать тот же session-cookie, что выдал NextAuth за TLS.

7. На проде **`NEXTAUTH_SECRET`**, **`ADMIN_*`**, **`NEXTAUTH_URL`** — в **`frontend/.env`** и/или **PM2** (`pm2 restart … --update-env`). После `git pull` — **`npm run build`** и перезапуск. HTML-страницы `/admin` и API `/api/admin` проверяют сессию в **Node** (`getServerSession` / `requireAdminApiSession`), а не в Edge middleware — так стабильнее на VPS.

Полный список переменных и смысл каждой — **`frontend/.env.example`** и **`DEPLOY-SERVER.md`**.

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
