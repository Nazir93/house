# Что задать на VPS (production)

Файл **`.env.local`** в репозитории не используется на сервере (он в `.gitignore`). На машине, где запущен Next.js, переменные задают так:

- отдельный файл `.env` / `.env.production` в каталоге `frontend` (если процесс его подхватывает);
- **pm2** — `ecosystem.config.js` → `env`;
- **Docker** — `environment:` в `docker-compose.yml` или соседний `.env`;
- **systemd** — `EnvironmentFile=/path/to/app.env`.

После **любого** изменения переменных нужен **перезапуск** процесса Node (`pm2 restart`, `docker compose up -d`, `systemctl restart …`).

---

## Обязательно для сайта и БД

| Переменная | Пример | Зачем |
|------------|--------|--------|
| `DATABASE_URL` | `postgresql://user:pass@127.0.0.1:5432/house?schema=public` | Подключение к PostgreSQL (имя БД задаёте при создании в Postgres) |
| `NODE_ENV` | `production` | Режим production (редиректы, cookie) |

## Публичный адрес сайта

| Переменная | Пример |
|------------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://dom.ru` |

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
| **`NEXTAUTH_URL`** | **`https://dom.ru`** | **Должен совпадать с URL в браузере** |

### Ошибка «раньше заходил по IP, по домену не пускает»

На сервере часто остаётся что-то вроде:

```env
NEXTAUTH_URL=http://123.45.67.89:3000
```

или `http://localhost:3000`. Тогда вход по **`https://dom.ru`** ломается.

**Исправление:** выставить именно:

```env
NEXTAUTH_URL=https://dom.ru
```

(если сайт открывают с `www` — используйте один вариант везде, например `https://www.dom.ru`.)

Перезапустить приложение, в браузере очистить cookie для сайта или войти в инкогнито.

## Nginx

В прокси на Next.js должны передаваться заголовки (как в [`nginx/vps-site.conf`](../nginx/vps-site.conf)):

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
