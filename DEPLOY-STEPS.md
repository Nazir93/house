# Шаг за шагом: GitHub → Vercel

## Шаг 1 — Готово
- [x] Git инициализирован, первый коммит сделан, ветка `main`.

---

## Шаг 2 — Создать репозиторий на GitHub (сделайте в браузере)

1. Откройте **https://github.com/new**
2. **Repository name:** например `carcas` или `dom`
3. **Public**
4. **НЕ** ставьте галочки "Add a README" / "Add .gitignore" — репо должен быть пустым
5. Нажмите **Create repository**

6. На странице нового репо скопируйте URL. Он такой:
   - **HTTPS:** `https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПО.git`
   - или **SSH:** `git@github.com:ВАШ_ЛОГИН/ИМЯ_РЕПО.git`

---

## Шаг 3 — Готово
- [x] Remote добавлен, код отправлен в ваш репозиторий на GitHub (например **https://github.com/Nazir93/house**).

Если спросит логин/пароль — используйте логин GitHub и **Personal Access Token** (не пароль от аккаунта).  
Токен: GitHub → Settings → Developer settings → Personal access tokens → Generate new token.

---

## Шаг 4 — Подключить Vercel (в браузере)

1. Зайдите на **https://vercel.com** и войдите через **GitHub**
2. **Add New** → **Project**
3. Выберите нужный репозиторий → **Import**
4. **Root Directory:** нажмите **Edit** и укажите `frontend`
5. **Environment Variables** (если нужны): добавьте, например:
   - `NEXT_PUBLIC_CITY` = `Сочи`
   - `NEXT_PUBLIC_SITE_URL` = `https://ваш-проект.vercel.app` (подставите после первого деплоя)
6. Нажмите **Deploy**
7. Когда сборка закончится — скопируйте ссылку на сайт и отправьте заказчику.

---

Дальше: при каждом `git push` в `main` Vercel будет автоматически пересобирать сайт.
