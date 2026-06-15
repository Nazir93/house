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

## Файл `.env` (админка и NextAuth)

- Имя файла: **`.env`** (не `.env.txt`, не только `.env.example`).
- Путь: **`$PROJECT_ROOT/frontend/.env`** — рядом с `package.json` и `ecosystem.config.cjs`.
- Шаблон: скопировать **`frontend/.env.example`** → **`.env`** и подставить свои значения.
- **`ecosystem.config.cjs`** при старте PM2 **читает этот `.env`** и передаёт переменные процессу — если файла нет или он в корне репо без копии в `frontend/`, сессии не заведутся.
- После первого создания `.env` или смены секретов: из **`frontend`** выполните `npm run env:check`, затем перезапуск PM2 (см. ниже).

## Одна команда на сервере (после `git push` в `main`)

С **любой** текущей папки SSH (путь как у вас в блоке «Ваши уточнения» ниже):

```bash
bash /var/www/house/scripts/deploy-vps.sh
```

Другой корень репозитория — одна строка (подставьте путь к клону, где лежит `scripts/deploy-vps.sh`):

```bash
HOUSE_ROOT=/ваш/путь bash /ваш/путь/scripts/deploy-vps.sh
```

Скрипт делает подряд: `git pull` → `npm ci` → `prisma generate` → **`prisma migrate deploy`** (все миграции ЛК, документов, `PHOTO_NEW` и др.) → `npm run db:verify` → `npm run build` → `pm2 reload house-next --update-env` → `pm2 save`.

- Дополнительно `db push` (legacy, по умолчанию **выключен**): `USE_DB_PUSH=1 bash /var/www/house/scripts/deploy-vps.sh`
- Только `db push`, без migrate (не для продакшена с миграциями): `SKIP_MIGRATE=1 USE_DB_PUSH=1 bash /var/www/house/scripts/deploy-vps.sh`
- Без `db:verify`: `SKIP_VERIFY=1 bash /var/www/house/scripts/deploy-vps.sh`

---

## Типовой сценарий по шагам (если нужно вручную)

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
pm2 reload house-next --update-env
pm2 save
# Если впервые положили frontend/.env или меняли ecosystem.config.cjs и переменные не подхватились:
# cd "$PROJECT_ROOT/frontend" && pm2 delete house-next && pm2 start ecosystem.config.cjs && pm2 save
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

## Security Checklist

- В production заданы `NEXTAUTH_SECRET`, `ADMIN_SECRET`, `YANDEX_SMARTCAPTCHA_SERVER_KEY`, `NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_CLIENT_KEY` и `HEALTH_CHECK_SECRET`.
- `E2E_ENABLED=1` не включён на production: тестовый seed API должен быть доступен только в dev/CI.
- Клиентские документы загружаются как `/private-uploads/client-documents/...` и скачиваются только через `/api/client/documents/:id/download`.
- Nginx/прокси передаёт `X-Forwarded-Proto` и `Host`; HTTPS включён, HSTS отдаётся приложением.
- CSP сейчас включён как `Content-Security-Policy-Report-Only`; после проверки карт, SmartCaptcha, аналитики и камер можно переводить в enforced `Content-Security-Policy`.

## PWA (установка на экран)

- PWA **включается только в production** (`npm run build` + `next start` / PM2). В `next dev` service worker отключён.
- Manifest: `https://ВАШ_ДОМЕН/manifest.webmanifest`
- Service worker: `https://ВАШ_ДОМЕН/serwist/sw.js` (network-first: HTML и API из сети, кэш статики).
- После деплоя проверка: Chrome DevTools → **Application** → Manifest + Service Workers, или Lighthouse → **Installable**.
- Иконки PWA: `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`. Перегенерация из `src/app/icon.svg`:
  ```bash
  cd frontend && node scripts/generate-pwa-icons.mjs
  ```

## Ваши уточнения (production VPS)

Сервер: **`46.173.26.108`** (рядом с kemperlabs.ru на том же VPS).

- **SSH с ПК:** `ssh carcas-vps` (ключ `~/.ssh/carcas_vps_ed25519`)
- **Старый VPS (архив):** `ssh carcas-vps-old` — `81.200.145.113`
- **Корень репо** (`PROJECT_ROOT`, там же `git pull`): **`/var/www/house`**
- **Рабочая папка фронта / PM2 `exec cwd`**: **`/var/www/house/frontend`**
- **Домены:** `chastdushi.ru`, `www.chastdushi.ru`, `частьдуши.рф` (`xn--80aim8afhxn7a.xn--p1ai`)
- **База:** `migrate deploy` (`bash scripts/deploy-vps.sh`)
- **PM2:** процесс **`house-next`**, Node **`3000`**, nginx тест **`8080`**, домены **`80/443`**
- **Деплой с ПК:** `bash scripts/deploy-remote.sh` или `node .ssh-deploy-tmp/deploy-remote.js`

Копипаст — **на сервере**:

```bash
bash /var/www/house/scripts/deploy-vps.sh
```

Тест до DNS: **http://46.173.26.108:8080/**  
После DNS + HTTPS: `bash /var/www/house/scripts/enable-https-chastdushi.sh`
