# 301 / редиректы (live + код)

Дата проверки: 2026-08-14.

## Live (проверено curl, без follow)

| From | HTTP | Location |
|---|---|---|
| https://www.chastdushi.ru/ | 301 | https://chastdushi.ru/ |
| http://chastdushi.ru/ | 301 | https://chastdushi.ru/ |
| https://xn--80aim8afhxn7a.xn--p1ai/ (частьдуши.рф) | 301 | https://chastdushi.ru/ |
| https://xn--80aim8afhxn7a.xn--p1ai/projects | 301 | https://chastdushi.ru/projects |
| /stroitelstvo-domov-iz-gazobetona | **404** | — (в коде 301 → /projects/gazobeton, **не задеплоено**) |
| /stroitelstvo-domov-iz-kirpicha | **404** | — |
| /stroitelstvo-domov-iz-keramobloka | **404** | — |
| /projects?material=gazobeton | **200** | — (в коде 308 на ЧПУ, **не задеплоено**) |

## Код (после деплоя)

См. `SEO_LEGACY_PATH_REDIRECTS` в `frontend/src/lib/seo/redirect-map.ts` и proxy для `?material=`.
