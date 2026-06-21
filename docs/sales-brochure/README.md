# PDF-презентация — готово

**Файл:** [`output/platform-brochure.pdf`](output/platform-brochure.pdf)  
**Источник:** [`index.html`](index.html) · 20 страниц A4

## Пересборка

```bash
cd frontend
npm run brochure:pdf
```

Или откройте `index.html` в браузере → «Сохранить как PDF».

## Скрины (14 из 18 — в папке `screenshots/`)

| Файл | Страница | Статус |
|------|----------|--------|
| `01-home.png` | 4 | ✓ |
| `02-projects-catalog.png` | 5 | ✓ |
| `02-typical-projects-catalog.png` | 5 | ✓ |
| `03-project-plans-public.png` | 6 | опционально |
| `04-admin-plans-upload.png` | 6 | опционально |
| `05-calculator.png` | 9 | ✓ |
| `05-calculator-general.png` | 9 | ✓ |
| `05-calculator-design.png` | 9 | ✓ |
| `09-admin-lead-detail.png` | 10 | ✓ |
| `11-account-dashboard.png` | 13 | ✓ |
| `13-admin-client-project.png` | 14 | ✓ |
| `14-admin-documents.png` | 15 | ✓ |
| `15-admin-dashboard.png` | 11, 17 | ✓ |
| `17-portfolio-map.png` | 7 | ✓ |
| `18-admin-seo.png` | 19 | ✓ |
| `mortgage.png` | 8 | ✓ |

Опционально (текст уже есть, скрин улучшит): `08-admin-leads.png`, `14-admin-tickets.png`, `16-pwa-install.png`, `06-spasibo-kp.png`, `07-kp-pdf-sample.png`.

## Перед отправкой клиенту

1. Замените контакт на стр. 20 в `index.html` (CTA-блок)
2. При необходимости добавьте недостающие скрины и пересоберите PDF
3. One-pager: [`one-pager.html`](one-pager.html)

## Структура 20 страниц

1. Обложка · 2. Боль · 3. Решение · 4. Главная · 5. Каталоги · 6. Планировки · 7. Карта · 8. Ипотека · 9. Калькуляторы · 10. КП PDF · 11. Заявки · 12. Интеграции · 13. Кабинет · 14. Платежи · 15. Документы · 16. Чат · 17. Админка · 18. PWA · 19. SEO · 20. CTA
