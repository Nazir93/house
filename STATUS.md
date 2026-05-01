# Дом — Статус проекта

> Дата обновления: 16 марта 2026

**Продакшен-сайт:** [https://dom.ru](https://dom.ru)

---

## Как запустить локально (без VPS)

### 1. Запуск dev-сервера (без базы данных)

```bash
cd frontend
npm run dev
```

Сайт откроется на **http://localhost:3000**.
Админка доступна на **http://localhost:3000/admin/login**.

> Без PostgreSQL сайт работает нормально (контент берётся из захардкоженных данных).
> Админка откроется, но не сможет сохранять/загружать данные из БД.

### 2. Запуск с базой данных (Docker)

Убедитесь, что Docker Desktop установлен и запущен.

```bash
# Из корня проекта (c:\Users\admin\Desktop\ELECTRO)
docker compose up postgres -d

# Применить схему БД
cd frontend
npx prisma db push

# Запустить dev-сервер
npm run dev
```

### 3. Вход в админку

- **URL:** http://localhost:3000/admin/login
- **Email:** `admin@dom.ru`
- **Пароль:** значение `ADMIN_SECRET` из `.env.local` (сейчас: `dev-secret-change-in-production`)

### 4. Полный запуск (Next.js + PostgreSQL + Nginx)

```bash
docker compose up -d
```

---

## Что уже сделано

### Публичный сайт

| Страница | URL | Описание |
|----------|-----|----------|
| Главная | `/` | Баннер, About, Hero, Услуги, Портфолио, Технологии, Партнёры |
| Блог | `/blog` | 9 статей (загрузка из БД с fallback на статику) |
| Контакты | `/contacts` | Контакты, мессенджеры, реквизиты |
| Прайс | `/price` | Калькулятор сметы (238 позиций, НДС, поиск) |
| Портфолио | `/portfolio` | Проекты компании |
| Услуги | `/services` | Каталог услуг |
| Электрика | `/services/electrical` | Лендинг электромонтажа |
| Акустика | `/services/acoustics` | Лендинг акустики |
| СКС | `/services/structured-cabling` | Лендинг слаботочных систем |
| Умный дом | `/services/smart-home` | Лендинг умного дома |
| Безопасность | `/services/security` | Лендинг видеонаблюдения |
| Спасибо | `/spasibo` | Страница после отправки заявки |
| Приватность | `/privacy` | Политика конфиденциальности |

### Мобильное нижнее меню

- Закреплённое меню внизу экрана на мобильных/планшетах
- 5 пунктов: Главная, Электрика, Охрана, Умный дом, Звук
- Скрыто на десктопе (lg и выше)

### Админ-панель (`/admin`)

| Раздел | URL | Что можно делать |
|--------|-----|------------------|
| Дашборд | `/admin` | Статистика: заявки, публикации, партнёры. Последние заявки |
| Заявки | `/admin/leads` | Список заявок, поиск, фильтр по статусу, пагинация |
| Заявка | `/admin/leads/[id]` | Просмотр, смена статуса (Новая/В работе/Завершена/Отменена), заметки, удаление |
| Новости | `/admin/posts` | Список, поиск, публикация/черновик, удаление |
| Новая запись | `/admin/posts/new` | Создание: заголовок, категория, описание, контент (HTML), публикация |
| Редактирование | `/admin/posts/[id]` | Полное редактирование записи |
| Услуги | `/admin/services` | Список, видимость, порядок, удаление |
| Новая услуга | `/admin/services/new` | Создание: название, тип, иконка, описание |
| Редактирование | `/admin/services/[id]` | Полное редактирование услуги |
| Портфолио | `/admin/projects` | Список проектов, поиск, публикация, удаление |
| Новый проект | `/admin/projects/new` | Создание: название, категория, услуга, площадь, обложка, видео, описание |
| Редактирование | `/admin/projects/[id]` | Полное редактирование проекта + галерея изображений |
| Отзывы | `/admin/reviews` | Список, инлайн-форма, рейтинг, привязка к услуге, видимость |
| FAQ | `/admin/faq` | Вопросы-ответы, привязка к услуге, видимость, порядок |
| Команда | `/admin/team` | Сотрудники: имя, должность, фото, описание, видимость |
| Партнёры | `/admin/partners` | Список, инлайн-форма добавления/редактирования, видимость |
| Настройки | `/admin/settings` | Название, контакты, соцсети, реквизиты, аналитика, Telegram-бот |
| SEO | `/admin/seo` | Мета-теги страниц, 301 редиректы, 404 логи, robots.txt |

### API маршруты

| Маршрут | Методы | Описание |
|---------|--------|----------|
| `/api/leads` | POST | Приём заявок (сохранение в БД + Telegram) |
| `/api/log-404` | POST | Логирование 404 ошибок |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth авторизация |
| `/api/admin/leads` | GET | Список заявок (фильтры, пагинация) |
| `/api/admin/leads/[id]` | GET, PATCH, DELETE | CRUD заявки |
| `/api/admin/posts` | GET, POST | Список/создание постов |
| `/api/admin/posts/[id]` | GET, PUT, DELETE | CRUD поста |
| `/api/admin/services` | GET, POST | Список/создание услуг |
| `/api/admin/services/[id]` | GET, PUT, DELETE | CRUD услуги |
| `/api/admin/partners` | GET, POST | Список/создание партнёров |
| `/api/admin/partners/[id]` | PUT, DELETE | Редактирование/удаление партнёра |
| `/api/admin/projects` | GET, POST | Список/создание проектов |
| `/api/admin/projects/[id]` | GET, PUT, DELETE | CRUD проекта |
| `/api/admin/projects/[id]/images` | POST, DELETE | Галерея проекта |
| `/api/admin/reviews` | GET, POST | Список/создание отзывов |
| `/api/admin/reviews/[id]` | PUT, DELETE | Редактирование/удаление отзыва |
| `/api/admin/faq` | GET, POST | Список/создание FAQ |
| `/api/admin/faq/[id]` | PUT, DELETE | Редактирование/удаление FAQ |
| `/api/admin/team` | GET, POST | Список/создание сотрудников |
| `/api/admin/team/[id]` | PUT, DELETE | Редактирование/удаление сотрудника |
| `/api/admin/settings` | GET, PUT | Чтение/сохранение настроек |
| `/api/admin/redirects` | GET, POST | 301 редиректы |
| `/api/admin/redirects/[id]` | DELETE | Удаление редиректа |
| `/api/admin/errors` | GET, DELETE | Логи 404 ошибок |
| `/api/admin/meta` | GET, PUT | Мета-теги для страниц |
| `/api/admin/upload` | POST | Загрузка изображений (auto WebP) |

### Авторизация

- NextAuth v4 (Credentials provider)
- JWT-сессия (7 дней)
- Middleware защищает `/admin/*` и `/api/admin/*`
- Логин из env: `ADMIN_EMAIL` + `ADMIN_SECRET`

### База данных (Prisma + PostgreSQL)

Модели в схеме:
- `AdminUser` — администратор
- `Lead` — заявки (имя, телефон, email, услуга, UTM, статус, заметки)
- `Post` — новости/блог (заголовок, slug, контент, категория, публикация)
- `Service` — услуги (название, slug, тип, иконка, порядок)
- `Partner` — партнёры (лого, сайт, видимость, порядок)
- `SiteSettings` — настройки (key-value)
- `Redirect` — 301 редиректы (fromPath, toPath, hits)
- `ErrorLog` — 404 ошибки (path, referer, count)
- `PageMeta` — мета-теги страниц (title, description, keywords, OG, H1, noindex)
- `Project`, `ProjectImage`, `Hotspot` — портфолио
- `TeamMember` — команда
- `Review` — отзывы
- `Faq` — FAQ
- `ThankYouToken` — токены "спасибо" страницы

### Уведомления

- Telegram-бот при новой заявке (нужны `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в `.env.local`)

---

## Переменные окружения (.env.local)

```
DATABASE_URL="postgresql://user:password@localhost:5432/garant_montazh?schema=public"
# На сервере укажите канонический адрес сайта (политика конфиденциальности, метаданные):
NEXT_PUBLIC_SITE_URL="https://dom.ru"
NEXT_PUBLIC_SITE_NAME="Дом"
NEXT_PUBLIC_CITY="Сочи"
ADMIN_EMAIL="admin@dom.ru"
ADMIN_SECRET="dev-secret-change-in-production"
NEXTAUTH_SECRET="dev-nextauth-secret"
NEXTAUTH_URL="https://dom.ru"
```

Локальная разработка: `NEXT_PUBLIC_SITE_URL` и `NEXTAUTH_URL` можно временно задать как `http://localhost:3000`.

### Опционально (добавить когда будут готовы):

```
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
NEXT_PUBLIC_YANDEX_METRIKA_ID=""
NEXT_PUBLIC_GA_ID=""
RECAPTCHA_SECRET_KEY=""
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=""
RESEND_API_KEY=""
NOTIFICATION_EMAIL=""
```

---

### SEO (Фаза 4 — реализовано)

- [x] **Sitemap.xml** — автогенерация из статических + динамических страниц (посты, проекты)
- [x] **Robots.txt** — стандартные правила + редактирование через админку (`/admin/seo` → вкладка Robots.txt)
- [x] **Мета-теги** — Title, Description, Keywords, OG-теги для каждой страницы через админку
- [x] **301 Редиректы** — управление через админку (`/admin/seo` → вкладка Редиректы)
- [x] **404 Логирование** — автоматическая запись 404 ошибок с referer и user-agent
- [x] **JSON-LD** — Organization, ElectricalContractor, FAQPage, Reviews (из БД)
- [x] **Яндекс.Метрика + Google Analytics** — скрипты подгружаются из настроек
- [x] **Загрузка изображений** — API `/api/admin/upload` с авто-конвертацией в WebP (через sharp)
- [x] **Open Graph** — OG Title, OG Description, OG Image для каждой страницы
- [x] **H1** — отдельное поле H1 для каждой страницы через админку
- [x] **noindex** — возможность скрыть страницу от индексации
- [x] **Страница 404** — кастомная с логированием в БД

## Что ещё предстоит (Фаза 5)

- [ ] Портфолио CRUD через админку
- [ ] Массовое редактирование мета-тегов
- [ ] Визуальный контент-редактор (WYSIWYG)
- [ ] Интеграция с Яндекс.Вебмастером
- [ ] Развёртывание на VPS

---

## Стек технологий

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL 16
- **ORM:** Prisma 5
- **Auth:** NextAuth v4
- **Deploy:** Docker + Nginx
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
