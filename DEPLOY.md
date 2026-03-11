# Deploy

## Локально (Docker)

```bash
cp .env.example .env
# Заполни JWT_SECRET и ENCRYPTION_KEY (тот же ключ, что при шифровании паролей ящиков)
docker compose up -d
```

Применить SQL к Postgres: `localhost:5432`, user/db `mailchecker` / password `mailchecker`.

API: `http://localhost:5001/health`  
Фронт локально: `cd front && npm run dev` — в `.env` фронта или при билде задать `VITE_API_URL=http://localhost:5001`.

## Прод без Compose (VPS)

```bash
cd back
npm ci
npm run build
JWT_SECRET=... ENCRYPTION_KEY=... DATABASE_URL=... FRONTEND_URL=... node dist/server.js
# второй процесс:
DATABASE_URL=... ENCRYPTION_KEY=... node dist/worker.js
```

Или один образ, два контейнера с разным `command` (как в `docker-compose.yml`).

## Railway / Render

- Один сервис **Web** → `node dist/server.js`, build: `cd back && npm ci && npm run build`, start из `back`.
- Второй сервис **Worker** → `node dist/worker.js`, те же env (особенно `DATABASE_URL`, `ENCRYPTION_KEY`).
- Postgres — managed, `DATABASE_URL` подставить в оба сервиса.

## Фронт (Vercel/Netlify)

`cd front && npm run build`  
Переменная окружения при сборке: `VITE_API_URL=https://твой-api`.
