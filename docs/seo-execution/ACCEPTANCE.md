# SEO acceptance — этап 1 (ТЗ §28)

Дата live-проверки: **2026-08-14**.  
Канон: `https://chastdushi.ru`.  
Артефакты: `docs/seo-execution/evidence/`.

Код приёмки: `frontend/src/lib/seo/seo-acceptance.ts` (+ тесты).

## Важно про деплой

Большая часть этапа 1 **в коде репозитория**, но **ещё не на проде** (или перебита `PageMeta` в БД).  
Ниже две таблицы: **live сейчас** и **ожидание из кода после деплоя**.

---

## 1. Таблица целевых URL — live (chastdushi.ru)

| URL | HTTP | Title | Description | H1 | Canonical | Indexable | Sitemap |
|---|---|---|---|---|---|---|---|
| `/` | 200 | + (старый бренд-Title) | + | 1 («Строим дома для жизни…») | self `https://chastdushi.ru` | index,follow | да (`https://chastdushi.ru`) |
| `/projects` | 200 | + «Каталог авторских проектов…» | + | 1 | self | index,follow | да |
| `/services/proektirovanie` | 200 | + под ТЗ | + | 1 «Проектирование частных домов» | self | index,follow | да |
| `/projects/gazobeton` | 200 | + «Проекты домов из газобетона…» | + | 1 | self | index,follow | да |
| `/projects/kirpich` | 200 | + «Проекты кирпичных домов…» | + | 1 | self | index,follow | да |
| `/projects/keramoblok` | 200 | + «Проекты домов из керамоблока…» | + | 1 | self | index,follow | да |

Live Title/Description/H1 между этими 6 URL **разные**.  
Коммерческие Title/H1 из кода (§1 / §7 / §11–12) на проде **ещё не видны** (нужен деплой + сверка `PageMeta`).

Полные live-значения: `evidence/_live-parse.txt`.

---

## 2. Ожидание из кода (после деплоя без перебития PageMeta)

| URL | Title (код) | H1 (код) |
|---|---|---|
| `/` | Строительство домов под ключ в СПб и Ленинградской области \| Часть души | Строительство домов под ключ в Санкт-Петербурге и Ленинградской области |
| `/projects` | Авторские проекты домов — каталог с ценами и планировками \| … | Авторские проекты домов |
| `/projects/gazobeton` | Строительство домов из газобетона под ключ … | Строительство домов из газобетона |
| `/projects/kirpich` | Строительство домов из кирпича под ключ … | Строительство домов из кирпича |
| `/projects/keramoblok` | Строительство домов из керамоблока под ключ … | Строительство домов из керамоблока |
| `/services/proektirovanie` | Проектирование частных домов в СПб … | Проектирование частных домов |

Уникальность Title/Description/H1 в коде покрыта тестом `seo-acceptance.test.ts`.

---

## 3. Артефакты (как в ТЗ)

| Артефакт | Файл / результат |
|---|---|
| Исходный HTML главной (фрагмент) | `evidence/home-source-sample.html`, `evidence/home-head.html` |
| robots.txt | `evidence/robots.txt` (live) |
| sitemap.xml | `evidence/sitemap.xml` (live, 171 URL, без `?`, без .рф) |
| Список 301 | `evidence/redirects.md` |
| JSON-LD главной | `evidence/home-json-ld.json` (`GeneralContractor` + `FAQPage`; **без** `aggregateRating`) |
| Проверка .рф | **301** `частьдуши.рф` / `xn--80aim8afhxn7a.xn--p1ai` → `chastdushi.ru` (+ path) |
| Поиск tehnadzorspb | В live HTML целевых — **нет**. В репо — только тесты/доки §10, **не контент сайта** |

### robots.txt (live, кратко)

```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /spasibo
Disallow: /promo
Disallow: /lp/
Host: chastdushi.ru
Sitemap: https://chastdushi.ru/sitemap.xml
```

`Clean-param` из кода §16 на проде пока **нет** (после деплоя).

### CODE1618

В HTML футера есть «студия CODE1618» внутри `<noindex>` + `data-nosnippet` в коде. В **meta description** кредита нет. Для сниппета это ок; полный вынос из HTML не требуется ТЗ §28.

---

## 4. Критерии приёмки — статус

| Критерий | Код | Live |
|---|---|---|
| Уникальные Title / Description / H1 | да (тест) | да (текущие live-значения тоже разные) |
| SEO-контент в HTML | SSR + §20 | Title/H1/canonical/JSON-LD в HTML; коммерческие посадочные материалов — после деплоя |
| Canonical | self без GET | да на всех 6 |
| Дубли / зеркало | www, .рф, legacy в коде | www/.рф **301**; legacy `/stroitelstvo-*` live **404** (нужен деплой 301); `?material=` live **200** (нужен 308) |
| Целевые в sitemap | политика §15 | все 6 есть |
| HTML-перелинковка | §25 в коде | `/projects` и материалы — ссылки есть; главная: тексты материалов есть, ЧПУ-href материалов в SSR live слабые → после деплоя §3/§25 |
| HTTP 200 целевых | — | **да** все 6 |
| Метрика конверсии | цели §24 в коде | `phone_click` / заявки уже были; новые `calculate_*` / `form_submit` / `project_open` — после деплоя + завести в UI Метрики |

---

## 5. Что ещё нужно для «сдачи под ключ»

1. **Деплой** фронта с SEO-этапом 1.  
2. Сверить/обновить **PageMeta** в админке под таблицу из §2 (иначе БД перебьёт код).  
3. В Яндекс.Метрике завести JS-цели из §24.  
4. Повторный live-прогон этой таблицы после деплоя → обновить `evidence/`.

До деплоя этап 1 **не считается полностью сданным по live**, хотя код и чеклист §28 подготовлены.
