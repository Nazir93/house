# Скриншоты для PDF-презентации

Положите PNG-файлы в эту папку. HTML-презентация (`../index.html`) подхватит их автоматически.

## Требования

- **Десктоп:** ширина окна 1440 px, формат PNG
- **Мобильный (PWA):** 390×844 px, iPhone-вид
- **Без персональных данных** клиентов (замажьте телефоны, ФИО, номера договоров)
- Имена файлов — **строго по таблице**

## Чеклист

| Файл | URL | Статус |
|------|-----|--------|
| `01-home.png` | `/` | ☐ |
| `02-projects-catalog.png` | `/projects` | ☐ |
| `03-project-plans-public.png` | `/projects/[slug]` — вкладка планировок | ☐ |
| `04-admin-plans-upload.png` | Админка → **Авторские проекты** → карандаш у любого проекта → блок «Планировки» (см. ниже) | ☐ |
| `05-calculator.png` | `/calculator` | ☐ |
| `06-spasibo-kp.png` | `/spasibo?token=…` — кнопка скачать КП | ☐ |
| `07-kp-pdf-sample.png` | 2–3 страницы из PDF КП (экспорт из просмотрщика) | ☐ |
| `08-admin-leads.png` | `/admin/leads` | ☐ |
| `09-admin-lead-detail.png` | `/admin/leads/[id]` | ☐ |
| `10-admin-calculator.png` | `/admin/calculator` | ☐ |
| `11-account-dashboard.png` | `/account/dashboard` | ☐ |
| `12-account-stages.png` | `/account/stages` или `/account/photos` | ☐ |
| `13-admin-client-project.png` | `/admin/client-projects/[id]` | ☐ |
| `14-admin-tickets.png` | `/admin/tickets` | ☐ |
| `15-admin-dashboard.png` | `/admin` | ☐ |
| `16-pwa-install.png` | мобильный — баннер «Установить приложение» | ☐ |
| `17-portfolio-map.png` | `/portfolio/map` | ☐ |
| `18-admin-seo.png` | `/admin/seo` | ☐ |

## Как снять

1. Запустите сайт локально или откройте прод: `npm run dev` в `frontend/`
2. Chrome DevTools → Toggle device toolbar (для мобильного)
3. Расширение «GoFullPage» или Win+Shift+S / Cmd+Shift+4
4. Для админки — войдите под тестовым аккаунтом

### Скрин 04 — загрузка планировок (частая путаница)

**Не** `/admin/projects` — это старый URL, он редиректит в «Портфолио» (построенные дома).

Правильный путь:

1. `/admin/house-projects` — пункт меню **«Авторские проекты»**
2. Нажать **карандаш** (редактировать) у любого проекта из списка  
   (URL будет вида `/admin/house-projects/abc123…`, не буквально `[id]`)
3. Прокрутить до секции **«Рендеры и планировки»** → подблок **«Планировки»** с кнопкой «Добавить»

Если список проектов пуст — создайте проект (**+ Новый**) или используйте **«Типовые проекты»** (`/admin/partner-house-projects`) — там тот же блок планировок.

## После добавления скринов

Автоматически (сайт должен быть запущен: `npm run dev`):

```bash
cd frontend
# ADMIN_EMAIL и ADMIN_SECRET из .env.local подхватятся, если экспортированы
npm run brochure:screenshots
npm run brochure:pdf
```

Или вручную положите PNG в эту папку и:

```bash
cd frontend
npm run brochure:pdf
```
