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

## Docker

Самый простой способ — через `docker compose`:

```bash
cp .env.example .env
# отредактировать .env под свой бэкенд
docker compose up -d --build
```

Либо вручную, без compose:

```bash
docker build \
  --build-arg NEXT_PUBLIC_MEDIA_BASE_URL=https://your-backend.example \
  -t cafe-menu .

docker run -p 3000:3000 \
  -e API_BASE_URL=https://your-backend.example/api/public \
  cafe-menu
```

`NEXT_PUBLIC_*` переменные нужны на этапе сборки (попадают в клиентский код) — при изменении `.env` нужен `--build`. `API_BASE_URL` читается на сервере при каждом запросе — его можно менять и просто перезапуском контейнера.
