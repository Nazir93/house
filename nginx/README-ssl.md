# HTTPS для chastdushi.ru и частьдуши.рф (nginx на VPS 46.173.26.108)

Эталон конфига: [`chastdushi-site.conf`](chastdushi-site.conf)  
Скрипт после DNS: `bash /var/www/house/scripts/enable-https-chastdushi.sh`

## Домены

| Домен | Punycode (certbot) |
|-------|-------------------|
| chastdushi.ru, www.chastdushi.ru | как есть |
| частьдуши.рф | `xn--80aim8afhxn7a.xn--p1ai` |

## TLS и ТСПУ (мобильный интернет в РФ)

На VPS для `chastdushi.ru` используется **`ssl-tls12-only.conf`** (только TLS 1.2) — рекомендация хостинга при сбоях ТСПУ у части операторов. Certbot-сертификаты те же; меняются только протоколы.

Если после смены у **десктопных** клиентов появятся ошибки сертификата — временно вернуть `include /etc/letsencrypt/options-ssl-nginx.conf;` в `chastdushi-site.conf` и `bash scripts/setup-nginx-house.sh`.

## Certbot (после A-записей на 46.173.26.108)

```bash
sudo certbot --nginx \
  -d chastdushi.ru -d www.chastdushi.ru \
  -d xn--80aim8afhxn7a.xn--p1ai
```

Или одной командой из репозитория на сервере:

```bash
bash /var/www/house/scripts/enable-https-chastdushi.sh
```

## Next.js / админка

В `frontend/.env` на VPS:

| Переменная | Значение |
|------------|----------|
| `NEXT_PUBLIC_SITE_URL` | `https://chastdushi.ru` |
| `NEXTAUTH_URL` | `https://chastdushi.ru` |
| `AUTH_TRUST_HOST` | `true` |

В nginx `location /` обязательно: `proxy_set_header Host $host;`, `proxy_set_header X-Forwarded-Proto $scheme;`

После смены `.env`: `npm run build && pm2 restart house-next --update-env`

## Тест до DNS

**http://46.173.26.108:8080/** — порт 8080, без HTTPS.

---

Старый шаблон для dom.ru/gmont.ru — см. историю git; production сейчас **chastdushi.ru**.
