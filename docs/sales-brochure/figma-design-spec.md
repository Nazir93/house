# Спецификация Figma-шаблона A4

Документ для сборки презентации в Figma, если нужен более «дизайнерский» PDF, чем HTML-экспорт.

HTML-альтернатива уже готова: [`index.html`](index.html) + [`styles.css`](styles.css).

---

## Файл и формат

| Параметр | Значение |
|----------|----------|
| Размер фрейма | **A4 — 210 × 297 mm** |
| Поля (safe zone) | 18 mm со всех сторон |
| Рабочая область | 174 × 261 mm |
| Единицы | mm |
| DPI экспорта | 300 (Export → PDF) |

---

## Цвета

| Token | HEX | Использование |
|-------|-----|---------------|
| `brand/primary` | `#0F3D2E` | Заголовки, акценты, обложка |
| `brand/primary-dark` | `#0A2A20` | Градиент обложки |
| `brand/accent` | `#2563EB` | Редкие акценты (ссылки) |
| `neutral/text` | `#1A1A1A` | Основной текст |
| `neutral/muted` | `#5C5C5C` | Подзаголовки, подписи |
| `neutral/bg` | `#FFFFFF` | Фон страниц |
| `neutral/subtle` | `#F4F6F5` | Карточки, блоки |
| `neutral/border` | `#E2E8E5` | Рамки скринов |

---

## Типографика

Шрифт: **Inter** (Google Fonts)

| Стиль | Size | Weight | Line height | Применение |
|-------|------|--------|-------------|------------|
| `Cover/Title` | 26 pt | 700 | 115% | Обложка |
| `Cover/Subtitle` | 11 pt | 400 | 150% | Обложка |
| `Page/Title` | 18 pt | 700 | 120% | Заголовок страницы |
| `Page/Lead` | 10 pt | 400 | 150% | Вводный абзац |
| `Body` | 9.5 pt | 400 | 150% | Буллеты |
| `Label/Section` | 7.5 pt | 600 | 100% | «ПУБЛИЧНЫЙ САЙТ» — uppercase, letter-spacing 0.08em |
| `Caption` | 8 pt | 400 | 140% | Подписи к скринам |

---

## Компоненты (создать как Components)

### 1. `Page/Content`

- Auto-layout vertical, gap 12 px (≈3 mm)
- Padding 18 mm
- Fill: white
- Верх: `Page/Header` (instance)
- Заголовок + текст + `Screenshot/Frame`

### 2. `Page/Header`

- Horizontal auto-layout, space-between
- Слева: `Label/Section` (brand green)
- Справа: «NN / 18» muted
- Border-bottom 2 px `#0F3D2E`, padding-bottom 8 px

### 3. `Screenshot/Frame`

- Размер: **full width** контентной области, height **75–95 mm** (варианты: Short 55, Medium 75, Tall 95)
- Border radius 8 px
- Border 1 px `#E2E8E5`
- Shadow: Y 4, blur 16, `#0F3D2E` 8%
- Fill: `#F4F6F5` (placeholder) или Image fill

### 4. `Screenshot/Pair`

- Grid 2 columns, gap 12 px
- Два `Screenshot/Frame` по 80 mm height

### 5. `Bullet/List`

- Vertical list, gap 6 px
- Marker: circle 2 mm `#0F3D2E`
- Text: Body style

### 6. `Page/Cover`

- Fill: linear gradient 145° `#0F3D2E` → `#061F18`
- Декор: grid pattern top-right, opacity 12%
- Badge → Title → Subtitle → Footer line

### 7. `Page/CTA`

- Background `#F4F6F5`
- 3 package cards in row
- Bottom: green CTA box `#0F3D2E`, white text, radius 12 px

### 8. `Arch/Card`

- Background `#F4F6F5`, border 1 px, radius 8 px, padding 12 px
- Title 9 pt bold green + description 8.5 pt muted

---

## Сетка скринов на странице

```
┌─────────────────────────────────────┐
│ SECTION LABEL              04 / 18  │
│ ─────────────────────────────────── │
│ Заголовок страницы                  │
│ Вводный текст (1–2 строки)          │
│ • буллет 1                          │
│ • буллет 2                          │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │         SCREENSHOT              │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

Для стр. 6, 9, 10, 13 — два скрина в ряд (`Screenshot/Pair`).

---

## Страницы (18 фреймов)

| # | Component | Скрин(ы) |
|---|-----------|----------|
| 1 | `Page/Cover` | — |
| 2 | `Page/Content` | — (только текст) |
| 3 | `Page/Content` | 4× `Arch/Card` + flow |
| 4 | `Page/Content` | `01-home.png` Tall |
| 5 | `Page/Content` | `02-projects-catalog.png` Tall |
| 6 | `Page/Content` | Pair: 03 + 04 |
| 7 | `Page/Content` | `17-portfolio-map.png` Tall |
| 8 | `Page/Content` | `05-calculator.png` Medium |
| 9 | `Page/Content` | Pair: 06 + 07 |
| 10 | `Page/Content` | Pair: 08 + 09 |
| 11 | `Page/Content` | `10-admin-calculator.png` Medium |
| 12 | `Page/Content` | `11-account-dashboard.png` Tall |
| 13 | `Page/Content` | Pair: 12 + 13 |
| 14 | `Page/Content` | `14-admin-tickets.png` Tall |
| 15 | `Page/Content` | `15-admin-dashboard.png` Tall |
| 16 | `Page/Content` | `16-pwa-install.png` Medium |
| 17 | `Page/Content` | `18-admin-seo.png` Tall |
| 18 | `Page/CTA` | — |

Тексты — из [`../sales-brochure-content.md`](../sales-brochure-content.md).

---

## Экспорт PDF из Figma

1. Выделить все 18 фреймов
2. Export → PDF
3. Настройки: **Include "Export for print"** (если доступно)
4. Проверить: фоны и тени включены (Export with background)

---

## Быстрый старт в Figma

1. File → New design file
2. Frame → Preset A4
3. Создать Color styles и Text styles по таблицам выше
4. Собрать 8 компонентов из раздела «Компоненты»
5. Duplicate `Page/Content` 16 раз + Cover + CTA
6. Вставить скрины из `screenshots/`
7. Export PDF
