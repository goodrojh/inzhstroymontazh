# ИНЖСТРОЙМОНТАЖ — лендинг

Продающий одностраничный сайт: проектирование инженерных систем под ключ, прохождение экспертизы и согласований (МОЭК / МОЭСК / Россети), BIM, по всей России.

## Технологии
Чистая статика — без сборщика и внешних CDN: семантический HTML, современный CSS (дизайн-система по брендбуку), vanilla JS. Шрифты (Montserrat, Inter) и все медиа — локальные. Грузится быстро по всей РФ, идеально для GitHub Pages.

## Структура
- `index.html` — страница
- `assets/styles.css` — дизайн-система
- `assets/script.js` — квиз-калькулятор, модалки, счётчик акции, поп-ап на выход
- `assets/fonts.css` + `assets/fonts/` — самохостинг шрифтов
- `assets/*.jpg`, `assets/*.mp4` — изображения и видео (Higgsfield)
- `assets/logo.svg`, `assets/favicon.svg` — логотип

## Что заменить на реальные данные (см. также STRATEGY.md)
- Контакты: телефон, WhatsApp, Telegram, email, реквизиты, № СРО — в `index.html` и `CONFIG` в `assets/script.js` (`waNumber`, `phone`, `formEndpoint`).
- Цифры: лет на рынке, объектов, регионов, % экспертизы, цены «от».
- Кейсы и отзывы (помечены ‹…›).
- Яндекс.Метрика: вставить ID счётчика и подключить цели `click_call`, `submit_lead`, `quiz_complete`, `open_whatsapp`.
- Приём заявок: укажите `formEndpoint` (Formspree/CRM webhook). Без него формы показывают успех и предлагают написать в MAX/Telegram.

## Локальный запуск
`powershell -File serve.ps1 -Port 8080` → http://localhost:8080/
