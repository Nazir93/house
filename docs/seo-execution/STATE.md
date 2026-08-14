# SEO execution state

Ориентир: `docs/seo-execution/PLAN.md`.  
Источники: `SEO 13.08.2026.pdf` + выгрузка Вебмастера CSV (01–10.08.2026).

## Current

- Этап: 1 (CTR и гигиена)
- Режим: ждём абзацы из ТЗ по одному; каждый абзац сверяем с CSV-блоком в PLAN
- Деплой сам по себе не делаем

## Progress (этап 1)

- [x] §1.1 Title главной — один интент, без материалов в Title (`commercial-page-seo.ts`)
- [x] §1.2 Description главной — частные дома, материалы, смета, расчёт
- [x] §1.3 H1 — SEO-фраза текстом в одном `<h1>` баннера
- [x] §2 Первый экран — lead + 3 CTA
- [x] §3 Блок материалов — ссылки на `/projects/{материал}` + текстовые анкоры
- [x] §4 Коммерческий блок услуг — H2 + плитки на `/services/*`
- [x] §5 Построенные дома — H2 + ≥6 из каталога `/portfolio`
- [x] §6 Ссылки с объекта — проекты / калькулятор / `/projects/{материал}`
- [x] §7 `/projects` — Title / Description / H1 / intro
- [x] §8 SEO-текст после каталога `/projects` (~1500–2500 знаков)
- [x] §9 Фильтры каталога — noindex GET / ЧПУ материалов / sitemap без `?`
- [x] §10 `/services/proektirovanie` — Title/H1/Description; tehnadzorspb в коде нет
- [x] §11 Газобетон — коммерческая посадочная на `/projects/gazobeton` (без нового URL)
- [x] §12 Кирпич / керамоблок — отдельные посадочные на `/projects/kirpich` и `/projects/keramoblok` (без новых URL, не «каменные дома»)
- [x] §13 Canonical — self-referencing без GET (`self-referencing-canonical.ts` + `getPageMeta`)
- [x] §14 Кириллический домен — live 301 `частьдуши.рф` → `chastdushi.ru` + тот же path; политика в `cyrillic-mirror-domain.ts`
- [x] §15 Sitemap — только канон без GET/зеркала/техники/дублей; материалы и срезы уже включены (`public-sitemap.ts`)
- [x] §16 Robots — основные открыты; фильтры через Clean-param + canonical/noindex, не Disallow (`robots-policy.ts`)
- [x] §17 Schema GeneralContractor — sitewide JSON-LD без фейковых рейтингов/отзывов/цен (`general-contractor-json-ld.ts`)
- [x] §19 Изображения объектов — осмысленные имена файлов + уникальные ALT/title (`built-object-image-seo.ts`)
- [x] §20 SSR — SEO-элементы в HTML; каталог/featured без unmount; `/services` с crawlable ссылками (`ssr-seo-html.ts`)
- [x] §21 HTTP — 200/301/404 без цепочек; legacy stroitelstvo + material query; resolve redirect chains (`redirect-map.ts`)
- [x] §22 Стабильность URL — каноны не меняли; защита в `indexed-url-stability.ts`
- [x] §23 Не массовые GEO — нет city-landing фабрики; запрет в `seo-prohibitions.ts`
- [x] §24 Метрика — цели ТЗ (`calculate_*`, `form_submit`, `project_open`, visit/mortgage) + skip WhatsApp (`seo-metrika-goals.ts`)
- [x] §25 Перелинковка — главная / `/projects` / материал / объект на каноны (`seo-interlinking.ts`)
- [x] §26 Не делать — инварианты скрытого текста / дублей / ключей / H1 / фильтров / 301 / Schema (`seo-prohibitions.ts`)
- [x] §27 Порядок этапа — meta/главная → материалы; GEO не трогали
- [x] §28 Приёмка — таблица + артефакты (`ACCEPTANCE.md`, `evidence/`, `seo-acceptance.ts`)
- [x] Деплой `186daf0` (2026-08-14): check+build OK → VPS; PageMeta синхронизирован под ТЗ; smoke 200 + 308 legacy/material + Clean-param robots

## Next

Завести цели Метрики §24 в UI Яндекса; через 1–2 недели — сверка Вебмастера.

## Already done (до этого плана)

- Сниппет: кредит CODE1618 исключён из выдачи
- Органические срезы материалов: `/projects/gazobeton|kirpich|keramoblok`
- LP реклама: `/lp/*` noindex
- Schema `GeneralContractor` (без фейковых рейтингов/цен), BreadcrumbList
- Поиск `tehnadzorspb` / `tehnadzorspb.ru` (§10): код/`public` — нет; **прод БД VPS** (`PageMeta`×16, `Service`×6, `SiteSettings`, `Post`) — **0 совпадений**. Искусственно ничего не удаляли. В `PageMeta` для `/services/proektirovanie` были старые title/H1 — **обновлены на VPS** под ТЗ §10 (иначе админка перебивала код).
- Локальный `.env.local`: убраны имена `electro` (user/db → `house`, как в `.env.example`).

## CSV snapshot (учтено в PLAN)

- ~393 показа / 10 кликов; почти всё на `/`
- №1 проблема: «услуги по строительству домов» ~201 показ, поз. ~10, **0 кликов**
- `/projects`: «авторские проекты домов» — 130 показов, поз. 8,58, 3 клика (обновлено по данным заказчика к §7)
- Газобетон в запросах есть, но путь = `/`, не материаловый URL
- Бренд даёт почти все клики

