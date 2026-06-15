# Что задать на VPS (production)

**Production VPS:** `46.173.26.108` · SSH: `ssh carcas-vps` · домены: `chastdushi.ru`, `частьдуши.рф`

## Закреплённая команда деплоя

Выполнять **на сервере** по SSH. Каталог проекта: **`/var/www/house`**. Перезапуск PM2: **`house-next`**.

```bash
cd /var/www/house && git pull origin main && cd frontend && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 restart house-next
```

Тот же сценарий одним скриптом из корня репозитория на сервере:

```bash
cd /var/www/house && bash scripts/deploy-vps.sh
```

Если менялись зависимости (`package.json` / `package-lock.json`), перед Prisma выполните **`npm ci`** в `frontend` — см. раздел **«После обновления кода из Git»** ниже.

---

Файл **`.env.local`** в репозитории не используется на сервере (он в `.gitignore`). **Полный перечень переменных** — [`frontend/.env.example`](.env.example): скопируйте в **`frontend/.env`** на VPS и подставьте свои значения.

- отдельный файл `.env` / `.env.production` в каталоге `frontend` (если процесс его подхватывает);
- **pm2** — `ecosystem.config.js` → `env`;
- **systemd** — `EnvironmentFile=/path/to/app.env`.

После **любого** изменения переменных нужен **перезапуск** процесса Node (`pm2 restart`, `systemctl restart …`).

---

## Prisma на VPS (важно)

В проекте зафиксирован **Prisma 5.x** (поле `url` в `schema.prisma` — нормально для этой версии).

- Не запускайте `npx prisma …` **до** `npm ci` в каталоге `frontend`: без установленных зависимостей `npx` может скачать **Prisma 7+** и вы получите ошибку **P1012** («`url` is no longer supported»).
- Всегда работайте из `frontend` после установки зависимостей:

```bash
cd /var/www/house/frontend && npm ci
./node_modules/.bin/prisma version   # должно быть 5.x.x
```

Если уже ставили глобально лишний CLI: `npm uninstall -g prisma` при необходимости. Если запутались с версиями: `rm -rf node_modules && npm ci`.

---

## Обязательно для сайта и БД

| Переменная | Пример | Зачем |
|------------|--------|--------|
| `DATABASE_URL` | `postgresql://user:pass@127.0.0.1:5432/house?schema=public` | Подключение к PostgreSQL (имя БД задаёте при создании в Postgres) |
| `NODE_ENV` | `production` | Режим production (редиректы, cookie). Обычно задаётся в PM2 / systemd, не обязательно дублировать в `.env` |

### Быстрая проверка с SSH (после настройки `.env` в `frontend`)

```bash
cd /var/www/house/frontend && npm run env:check && npm run db:verify
```

- **`env:check`** — обязательные ключи для админки и NextAuth (`ADMIN_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, …).
- **`db:verify`** — пинг PostgreSQL и счётчики; строка **ClientConstructionProject** показывает, применены ли миграции личного кабинета (если «таблиц нет» → выполните `npx prisma migrate deploy`).

---

## Личный кабинет `/account` (клиент по договору)

| Что нужно | Действие |
|-----------|----------|
| Таблицы `ClientConstructionProject` и связанные | Цепочка миграций в `prisma/migrations/` (от `client_portal` до документов, уведомлений, `PHOTO_NEW`). На сервере: **`bash /var/www/house/scripts/deploy-vps.sh`** или `npx prisma migrate deploy` после `npm ci`. |
| Учётка клиента | В админке: **«Клиенты (кабинет)»** → `/admin/client-projects` → создать объект, задать **номер договора** и **пароль** (они же для входа на `/account/login`). |
| Переменные | Те же, что для сайта: `DATABASE_URL`, `NEXTAUTH_*`, `ADMIN_*`. Отдельный секрет для кабинета не требуется — пароль клиента хранится в БД (хэш). |
| Внешний портал | Если задан **`NEXT_PUBLIC_ACCOUNT_PORTAL_URL`**, раздел `/account` может редиректить наружу — для встроенного кабинета оставьте пустым (см. `.env.example`). |

---

## Первый запуск: связать админку и входы клиентов

Секреты **в Git не кладутся** — задаются только на сервере в `frontend/.env`, **PM2 `env`** или **systemd**.

### 1. База и миграции

- Создайте БД в PostgreSQL и пропишите **`DATABASE_URL`** (пользователь с правами на эту БД).
- Один раз после деплоя из каталога `frontend`:

```bash
cd /var/www/house/frontend && npm ci && npx prisma migrate deploy && npm run build && pm2 restart house-next
```

(или ваш скрипт деплоя). Так появятся таблицы, в том числе **`ClientConstructionProject`** для кабинета клиентов.

### 2. Переменные для входа администратора и сессий

В одном месте (файл или PM2) задайте:

| Переменная | Назначение |
|------------|------------|
| **`DATABASE_URL`** | PostgreSQL. Без рабочей БД вход админа и клиентов невозможен (клиенты читаются из таблицы договоров). |
| **`ADMIN_EMAIL`** | Email, который вводите на **`/admin/login`** (по умолчанию в коде `admin@dom.ru`, если не задали). |
| **`ADMIN_SECRET`** | Пароль администратора — **тот же**, что вводите в форме входа в админку. |
| **`NEXTAUTH_SECRET`** | Случайная длинная строка для подписи JWT (не путать с паролем админа). |
| **`NEXTAUTH_URL`** | Точный публичный адрес сайта: `http://ВАШ_IP` или `http://IP:3000` или `https://домен` — **как в браузере**. |
| **`NEXT_PUBLIC_SITE_URL`** | Тот же базовый URL, что и у **`NEXTAUTH_URL`**. |

Смена **`ADMIN_SECRET`** или **`ADMIN_EMAIL`**: обновить переменные → **перезапуск** Node → зайти с новыми данными. **`NEXTAUTH_SECRET`** при смене сбрасывает все текущие сессии.

### 3. Проверка

```bash
cd /var/www/house/frontend && npm run env:check && npm run db:verify
```

### 4. Вход в админку

1. Откройте **`/admin/login`** (на том же хосте, что в **`NEXTAUTH_URL`**).
2. Введите **`ADMIN_EMAIL`** и **`ADMIN_SECRET`**.

### 5. Учётки клиентов (личный кабинет)

Отдельных переменных для «пароля клиентов» **нет** — всё в БД.

1. В админке: **«Клиенты (кабинет)»** → **`/admin/client-projects`** → **Новый клиентский объект**.
2. Укажите **номер договора**, **пароль клиента**, название/адрес (и при желании имя клиента). Пароль на сервере сохраняется **в хэше**.
3. Клиент заходит на **`/account/login`**: **номер договора** и **этот пароль**.

Смена пароля клиента: карточка объекта в админке → поле пароля (новое значение) → сохранить.

Админ и клиент **не пересекаются**: роль `admin` только через **`/admin`**, роль `client` только через **`/account`** (см. `src/proxy.ts`).

---

## Публичный адрес сайта

| Переменная | Пример |
|------------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://chastdushi.ru` |

Должен совпадать с тем, как пользователи открывают сайт (**https**, ваш домен, без лишнего слэша в конце или с ним — главное единообразие).

## География в текстах и SEO (опционально)

| Переменная | Пример | Зачем |
|------------|--------|--------|
| `NEXT_PUBLIC_CITY` | `Сочи` | Якорный город (офис, мета, hero). Если не задано — в коде по умолчанию Сочи. |
| `NEXT_PUBLIC_SERVICE_REGIONS` | `Краснодарский край, Ростовская область, Москва` | Зона работ через запятую: подзаголовок на главной, описания, JSON-LD `areaServed`. Если не задано — значение по умолчанию из кода. |

После изменения — пересборка и перезапуск процесса Next.js.

## Админка `/admin` (NextAuth)

| Переменная | Пример | Важно |
|------------|--------|--------|
| `ADMIN_EMAIL` | ваш email | Тот же, что вводите в форме входа |
| `ADMIN_SECRET` | длинная случайная строка | Пароль администратора |
| `NEXTAUTH_SECRET` | длинная случайная строка | Подпись сессий; не меняйте без сброса всех сессий |
| **`NEXTAUTH_URL`** | **`https://chastdushi.ru`** | **Должен совпадать с URL в браузере** |
| **`AUTH_TRUST_HOST`** | `true` | За **nginx** с HTTPS: иначе возможны CSRF и редирект на `/api/auth/signin?csrf=true`. В `location /`: `proxy_set_header Host $host;`, `proxy_set_header X-Forwarded-Proto $scheme;`, желательно `X-Forwarded-Host $host;`. |

### Ошибка «раньше заходил по IP, по домену не пускает»

На сервере часто остаётся что-то вроде:

```env
NEXTAUTH_URL=http://123.45.67.89:3000
```

или `http://46.173.26.108:8080` (тест до DNS). Тогда вход по **`https://chastdushi.ru`** ломается.

**Исправление:** выставить именно:

```env
NEXTAUTH_URL=https://chastdushi.ru
```

(если сайт открывают с `www` — используйте один вариант везде, например `https://www.chastdushi.ru`.)

Перезапустить приложение, в браузере очистить cookie для сайта или войти в инкогнито.

## Редирект HTTP→HTTPS

По умолчанию Next.js **не** делает редирект на HTTPS в `middleware`. Редирект с порта **80** на **443** — **nginx** + certbot (см. [`nginx/chastdushi-site.conf`](../nginx/chastdushi-site.conf), `scripts/enable-https-chastdushi.sh`).

## Nginx

Эталон для chastdushi.ru + частьдуши.рф: [`nginx/chastdushi-site.conf`](../nginx/chastdushi-site.conf).

- **Тест по IP:** порт **8080** → `http://46.173.26.108:8080`
- **Домены (после DNS):** порт **80/443** → `chastdushi.ru`, `частьдуши.рф`
- На том же VPS **kemperlabs.ru** — отдельный `server_name`, не трогать.

На сервере: `/etc/nginx/sites-available/house-chastdushi` → symlink в `sites-enabled`, `nginx -t`, `systemctl reload nginx`.

- `Host`
- `X-Forwarded-Proto` (чтобы приложение понимало HTTPS)

Иначе редирект на HTTPS и cookie могут вести себя неправильно.

## После обновления кода из Git

**Деплой на VPS (текущая схема):** один заход по SSH, каталог приложения `/var/www/house`, процесс PM2 `house-next`. Prisma — всегда перед сборкой (клиент и миграции БД).

```bash
cd /var/www/house && git pull origin main && cd frontend && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 restart house-next
```

Если менялись зависимости (`package.json` / `package-lock.json`), перед Prisma выполните `npm ci`:

```bash
cd /var/www/house && git pull origin main && cd frontend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 restart house-next
```

Если у вас на сервере исторически использовали `prisma db push` вместо `migrate deploy` — замените соответствующий шаг на свой вариант.

Если код на сервере уже актуален и вы в каталоге `frontend`:

```bash
npx prisma generate && npx prisma migrate deploy && npm run build && pm2 restart house-next
```

Полный список опций см. в [`.env.example`](.env.example).

## Telegram (уведомления о новых заявках)

Заявки с сайта сохраняются в БД и дублируются сообщением в Telegram через `POST /api/leads` → [`src/lib/telegram.ts`](src/lib/telegram.ts).

**Где задать токен и chat id**

1. **Переменные окружения на сервере** (приоритетнее) — таблица ниже.
2. **Админка** → Настройки → «Telegram-уведомления» (ключи `telegram_bot_token`, `telegram_chat_id` в БД). Подхватывается, если в `.env` не заданы `TELEGRAM_BOT_TOKEN` и нет ни `TELEGRAM_CHAT_ID`, ни `TELEGRAM_CHAT_IDS`.

| Переменная | Зачем |
|------------|--------|
| `TELEGRAM_BOT_TOKEN` | Токен бота от @BotFather |
| `TELEGRAM_CHAT_ID` | Куда слать (личный чат или группа; у группы id часто отрицательный) |
| `TELEGRAM_CHAT_IDS` | (опционально) Несколько `chat_id` через запятую; если задано — используется вместо одного `TELEGRAM_CHAT_ID` |
| `TELEGRAM_MESSAGE_THREAD_ID` | (опционально) Номер темы в супергруппе с топиками |

Без токена и хотя бы одного chat id уведомления **не отправляются** (ошибка в ответе API не ломает сохранение заявки).

После изменения **переменных окружения** — перезапуск процесса Node. Если задано только в админке, перезапуск не обязателен.
