# Проверка запуска и адресов sitemap

Команды выполняются из корня репозитория:

```bash
docker compose -f docker/compose.yaml -f docker/compose.prod.yaml up -d --build app
node --import tsx --test tests/sitemap.test.mjs
curl -fsS http://pivkarta.localhost:8080/sitemap.xml
```

Express включает `trust proxy`: React Router получает внешний адрес через
`X-Forwarded-Host` и `X-Forwarded-Proto`. Sitemap и ссылка на него в `robots.txt`
используют origin запроса, включая порт. Канонические метаданные страниц
продолжают использовать настройку `VITE_SITE_ORIGIN`.

Varnish может хранить прежние ответы до часа. После изменения этих маршрутов
можно сбросить только их кеш через внутренний интерфейс контейнера:

```bash
docker compose -f docker/compose.yaml -f docker/compose.prod.yaml exec -T varnish varnishadm ban 'req.url ~ ^/(sitemap[.]xml|robots[.]txt)([?]|$)'
```

Производственный сервер загружает `build/server/index.js` по файловому URL
относительно `build/node/index.js`. Пакет `ws` необходим во время выполнения
и должен оставаться в `dependencies`, поскольку образ устанавливает зависимости
через `npm ci --omit=dev`.

Проверено 29 сентября 2026 года: сборка Docker, проверка типов, запуск
производственного контейнера, sitemap и robots через Traefik → Varnish → Node.js,
а также dev-сервер на временном порту. Проверены внешний хост, HTTPS и порт
через прокси-заголовки. Автоматический тест проверяет индекс sitemap и robots
для трёх origin; содержимое разделов, требующих БД, эта проверка не охватывает.
