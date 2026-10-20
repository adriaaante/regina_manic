# CLAUDE.md — память проекта

## Что это
Премиум сайт-визитка частного мастера маникюра и педикюра **Регины**
(бренд **Regina Nails**, работает сама, **Краснодар**).
**Статический сайт без сборки**: HTML5 + CSS (custom properties) + Vanilla JS.
Нет npm/бандлера/бэкенда (кроме `gift-api.php`). Подход — близнец
dr-vlada-site / ania-psychology-site. Палитра «фарфор + лак»: ягодный
`#8E2F4D`, шампанское золото `#C9A36A`, фарфор `#FBF6F2`, румянец `#F1DAD5`.
Шрифты: Cormorant Garamond (заголовки) + Manrope (текст), Google Fonts.

## Структура
- `index.html` — лендинг: hero (портрет Регины в арке + мини-веер типсов, флакон,
  парящие типсы; на ≤900px фото идёт ПЕРВЫМ), лента, «почему ко
  мне», услуги, **конструктор маникюра** `#studio`, галерея `#works`, шаги
  визита, обо мне, промо сертификатов `#gift`, отзывы, FAQ, запись+контакты.
- `prices.html` — полный прайс (отдельная страница под SEO «цены на маникюр»).
- `404.html`, `gift.html` + `gift-studio.html` + `gift-api.php` (см. ниже).
- Шапка/футер/FAB скопированы в каждую страницу (шаблонизатора нет).
  Во внутренних страницах якоря ведут на `index.html#...`.
- `assets/css/styles.css` — вся дизайн-система, палитра в `:root`.
- `assets/js/config.js` — **единственный источник правды** по контактам
  (`window.RN_CONFIG`), подставляются через `data-cfg` / `data-href`
  (`data-hide-empty` — скрыть ссылку, если значение пустое).
- `assets/js/main.js` — меню, FAB, reveal, счётчики, **SVG-«рука» с ногтями**
  (`SHAPES`/`FINISHES`/`COLORS`, `nailsMarkup`) для конструктора и галереи,
  смена цвета лака во флаконе героя, блёстки за курсором (только мышь,
  не при reduced-motion), карусель отзывов, форма записи → WhatsApp
  (`?text=`) / Telegram (текст копируется в буфер — TG не принимает текст
  в ссылке на профиль). `window.__revealAll()` — для скриншот-тестов.
- `assets/js/works.js` — карточки галереи (`window.RN_WORKS`). Без `img`
  карточка рисуется кодом; с `img` — показывает фото. shape/color/finish
  нужны всегда (кнопка «Примерить» грузит их в конструктор).
- `assets/img/logo-mark.svg` — лого (миндальный ноготь в кольце) = favicon.
  `og-cover.png`, `apple-touch-icon.png` — генерит `scripts/generate-og.py`.
  `regina/hero.jpg` (портрет крупным планом, кроп 4:5, preload + fetchpriority —
  это LCP) и `regina/about.jpg` (фото в лифте, кроп 4:5) — реальные фото Регины,
  оригиналы 640×640 (прислала в чат). Будут крупнее — заменить, `generate-og.py`
  вставляет hero.jpg в og-обложку.

## Заглушки (заменить реальными данными)
- `config.js`: телефон, WhatsApp, Telegram (`XXXX`), улица, часы (город — Краснодар, подтверждён).
- Те же телефон/адрес/часы **продублированы в JSON-LD** `<head>` index.html
  (NailSalon) — синхронизировать. Город «Краснодар» зашит в тексты, title,
  meta, JSON-LD, og-обложку (для SEO город должен быть в статичном HTML).
- Цены: index.html (6 карточек) + prices.html (+ OfferCatalog в JSON-LD
  обеих страниц) — образцы.
- Отзывы, цифры (5+ лет, 1200+, «5,0 · 120+ отзывов», «200+ оттенков»),
  текст «Обо мне» — образцы. Работы в галерее — нарисованы кодом.
- Абсолютные URL (canonical/og/JSON-LD/sitemap/robots) указывают на
  `https://adriaaante.github.io/regina_manic/`. Появится домен — заменить везде
  (`grep -rl adriaaante.github.io`). robots.txt в подпапке проекта поисковики
  не читают — sitemap подавать вручную в Яндекс.Вебмастер / Search Console.

## Подарочные сертификаты
Схема как в dr-vlada-site: данные в ссылке `gift.html#1.<base64url(JSON)>`,
JSON `{n,a,t,e,m,k}`, номер `RN-ГГММ-XXXX`.
- Пин студии: **2580** (`atob('MjU4MA==')` в gift-studio.html, `PIN_HASH` =
  sha256 в gift-api.php — менять синхронно; точки пина строятся по длине).
- Поводы: `THEMES` в gift.html == `TYPES` в студии (менять синхронно):
  universal («Время быть красивой», блёстки `glitter`), birthday, girlfriend
  (лепестки), newyear (тёмная ягодная тема), march8, love.
- История: gift-api.php → `gift-data/history.json` (нужен PHP-хостинг;
  папку `gift-data` при деплое не перетирать). Кэш/fallback — localStorage
  `rn_gift_history`, пин в sessionStorage `rn_gift_auth`.
- Пример сертификата (кнопка «Посмотреть пример» в `#gift`) — статичная
  ссылка в index.html, сгенерирована тем же кодированием.
- Обе страницы `noindex`, в sitemap не добавлять; robots закрывает студию.

## Деплой
**GitHub Pages** — Deploy from a branch, `main`, папка `/` (root). Прод:
https://adriaaante.github.io/regina_manic/ — выкатка автоматически после
push в `main` (~1 мин). Custom domain не настроен. PHP на Pages не работает →
gift-api.php мёртв, история сертификатов только в localStorage браузера
(сами сертификаты работают — всё в ссылке). Для общей истории нужен PHP-хостинг.

## Грабли
- Холст `#glitter` (блёстки за курсором) — размер строго через CSS 100vw/100vh:
  без этого при масштабе экрана >100% canvas раздувался в DPR раз.
- `html,body{overflow-x:clip}` (не hidden) — не создаёт контейнер прокрутки,
  sticky и колесо мыши работают.
- Бесконечные анимации вне экрана ставятся на паузу (`.is-off`, main.js →
  setupOffscreenPause) — иначе прокрутка тяжелее на слабых ноутбуках.
- Окно Telegram в форме записи открывается синхронно в клике (иначе блокировка попапов).

## Команды
- Локально: `python3 -m http.server 8080`.
- `python3 scripts/generate-og.py` — og-обложка + apple-touch-icon (Pillow).
- Скриншоты в песочнице: playwright из `$(npm root -g)/playwright`
  (Chromium предустановлен); карта Яндекса и Google Fonts в песочнице не грузятся — норм.
