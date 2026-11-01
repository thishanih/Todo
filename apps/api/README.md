# API

The API is a TypeScript Express service in the pnpm monorepo. It connects to
MongoDB before accepting requests and protects `/api` routes with an API key.

## Setup

From the monorepo root:

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
```

Set these values in `apps/api/.env`:

- `MONGODB_URI` — your MongoDB Atlas connection string.
- `API_KEY` — a private key expected in the `x-api-key` request header.
- `PORT` — optional; defaults to `3000`.
- `TRUST_PROXY_HOPS` — optional; defaults to `0`. Set this to the number of
  trusted reverse-proxy hops in front of the API.
- `CORS_ORIGIN` — optional; defaults to `*`. Use a comma-separated list of
  allowed origins when deploying.

Keep `.env` private. Do not commit Atlas credentials or API keys. Start the
workspace from the monorepo root with:

```sh
pnpm dev
```

## Health endpoint

`GET http://localhost:3000/api/health/` returns the API status. Send the
configured key in the `x-api-key` header:

```sh
curl -H "x-api-key: $API_KEY" http://localhost:3000/api/health/
```

The response has this shape:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "..."
  }
}
```

## Rate limiting

Requests to `/api` are limited to 100 per IP address per 15-minute window.
Exceeding the limit returns HTTP `429`. The in-memory limit is per server
instance; use a shared rate-limit store when running multiple instances.
When deployed behind a reverse proxy, set `TRUST_PROXY_HOPS` to the exact
number of trusted proxy hops so clients are limited by their actual IP address.

## Source structure

```text
src/
├── config/
│   └── env.ts
├── controllers/
│   └── health.ts
├── database/
│   └── mongo.ts
├── middleware/
│   ├── error-handler.ts
│   ├── not-found.ts
│   ├── rate-limit.ts
│   └── require-api-key.ts
├── routes/
│   └── health.ts
├── services/
│   └── health.ts
├── shared/
│   └── http-error.ts
├── app.ts
└── server.ts
```

- `routes/` maps HTTP paths to controllers.
- `controllers/` handles request and response behavior.
- `services/` contains endpoint logic.
- `middleware/` provides API-key checks and common error handling.
- `database/` manages the MongoDB connection.
- `config/` loads and validates environment settings.

The MongoDB client uses a connection pool with a maximum of 100 connections per
server.
