# Regina Nails — сайт мастера маникюра

Статический сайт без сборки: открыть `index.html` или запустить
`python3 -m http.server 8080`.

- Контакты и адрес — `assets/js/config.js` (+ JSON-LD в `<head>` index.html).
- Цены — `index.html` (#services) и `prices.html`.
- Работы в галерее — `assets/js/works.js` (поле `img` для реальных фото).
- Подарочные сертификаты — студия `gift-studio.html` (по пин-коду),
  просмотр `gift.html`, история — `gift-api.php` (нужен PHP-хостинг,
  папку `gift-data/` при деплое не перетирать).

Подробности и список заглушек — в `CLAUDE.md`.
