# Видеоменю

Next.js сторис-меню с видео для кафе/ресторана.

## Разработка

```bash
npm install
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

## Переменные окружения

| Переменная | Где используется | Назначение |
| --- | --- | --- |
| `API_BASE_URL` | сервер (`src/app/api/menu/route.ts`) | Базовый URL бэкенда меню. Можно менять без пересборки образа. |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | клиент (`src/app/page.tsx`) | Базовый URL для относительных ссылок на медиа (видео/фото блюд). Вшивается в бандл на этапе сборки. |

Если переменные не заданы, используются значения по умолчанию (`https://wc.nets.tj`).

⚠️ `NEXT_PUBLIC_MEDIA_BASE_URL` уходит в браузер каждого посетителя — это должен быть реальный публичный домен/IP сервера, **никогда `localhost`**, даже если бэкенд и фронтенд на одной машине.

## Docker

Бэкенд (uvicorn) работает как обычный процесс на хосте, не в Docker. Поэтому `docker-compose.yml` использует `network_mode: host` — контейнер работает в сетевом пространстве хоста, и `API_BASE_URL=http://localhost:<порт-uvicorn>` действительно работает.

Самый простой способ — через `docker compose`:

```bash
cp .env.example .env
# отредактировать .env: указать порт uvicorn для API_BASE_URL
# и реальный публичный домен/IP для NEXT_PUBLIC_MEDIA_BASE_URL
docker compose up -d --build
```

При `network_mode: host` приложение слушает порт 3000 хоста напрямую (без `-p`/`ports:`).

Либо вручную, без compose (тогда localhost внутри контейнера работать не будет — нужен `--network host` либо IP хоста):

```bash
docker build \
  --build-arg NEXT_PUBLIC_MEDIA_BASE_URL=https://your-public-domain.example \
  -t cafe-menu .

docker run --network host \
  -e API_BASE_URL=http://localhost:8000/api/public \
  cafe-menu
```

`NEXT_PUBLIC_*` переменные нужны на этапе сборки (попадают в клиентский код) — при изменении `.env` нужен `--build`. `API_BASE_URL` читается на сервере при каждом запросе — его можно менять и просто перезапуском контейнера.
