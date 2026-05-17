# HTTPS и редирект для dom.ru (nginx на VPS)

## Что сделано в `vps-site.conf`

- Порт **80**: ответ для проверки Let's Encrypt (`/.well-known/acme-challenge/`) и **редирект 301** на `https://` для всех остальных запросов.
- Порт **443**: прокси на Next.js (`127.0.0.1:3000`) с TLS.

## Порядок действий на сервере (Ubuntu/Debian)

### 1. Открыть порты в файрволе

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### 2. Подготовить webroot для проверки домена

```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html
```

### 3. Временная конфигурация только HTTP (первый выпуск сертификата)

Пока **нет** файлов в `/etc/letsencrypt/live/dom.ru/`, блок `listen 443` в полном `vps-site.conf` **не заведётся** — nginx не стартует.

**Вариант A — проще всего:** один раз выпустить сертификат через **standalone** (nginx на время остановить):

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d dom.ru -d www.dom.ru
sudo systemctl start nginx
```

Затем положить на сервер актуальный [`vps-site.conf`](vps-site.conf), проверить и перезагрузить nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**Вариант B:** не останавливая nginx — временно использовать только `server { listen 80; ... }` **без** редиректа на HTTPS и **без** блока 443, с `location /` → `proxy_pass` как раньше, плюс `location /.well-known/...` → `root /var/www/html`. Затем:

```bash
sudo certbot certonly --webroot -w /var/www/html -d dom.ru -d www.dom.ru
```

После появления сертификатов подключить полный `vps-site.conf` с редиректом и HTTPS.

### 4. Установка Certbot (если ещё нет)

```bash
sudo apt update
sudo apt install -y certbot
```

(Для плагина nginx: `sudo apt install -y certbot python3-certbot-nginx` — тогда иногда достаточно `sudo certbot --nginx -d dom.ru -d www.dom.ru`, certbot сам подправит конфиг; но репозиторный `vps-site.conf` можно всё равно использовать как эталон.)

### 5. Продление

```bash
sudo certbot renew --dry-run
```

Cron задача certbot обычно ставится автоматически.

### 6. Next.js и админка (`/admin`)

На VPS в **production** в `.env` (или переменных PM2 / systemd) должны совпадать с тем, как пользователь открывает сайт:

| Переменная | Пример |
|------------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://dom.ru` |
| **`NEXTAUTH_URL`** | **`https://dom.ru`** (тот же хост и **https**, не `http://IP:3000` и не `http://localhost:3000`) |

Если `NEXTAUTH_URL` указывает на IP или localhost, **вход в админку по домену не заработает** (CSRF и cookie привязаны к этому URL), а по прямому IP может казаться, что «всё ок».

После смены переменных перезапустите процесс Node (`pm2 restart` или `systemctl restart`).

## Проверка

- В браузере: `http://dom.ru` → адресная строка должна стать `https://dom.ru`.
- [SSL Labs](https://www.ssllabs.com/ssltest/) — опционально проверить оценку конфигурации.
