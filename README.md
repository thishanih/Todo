# Node.js TypeScript Express Monorepo

A pnpm and Turborepo workspace for a Node.js API, React frontend, shared
TypeScript code, and shared TypeScript configuration.

## Repository structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── .husky/
│   └── pre-commit
├── apps/
│   ├── api/
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── database/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── shared/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── .env.example
│       ├── package.json
│       ├── README.md
│       └── tsconfig.json
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── helpers/
│       │   ├── hooks/
│       │   ├── interfaces/
│       │   ├── reusable/
│       │   ├── services/
│       │   ├── styles/
│       │   ├── views/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── .env.example
│       ├── package.json
│       ├── README.md
│       └── vite.config.ts
├── packages/
│   ├── config/
│   │   ├── package.json
│   │   └── tsconfig.node.json
│   └── shared/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

## Requirements

- Node.js 22.12+
- pnpm 11.17.0

## Getting started

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
# Set the Atlas connection string and private API key in apps/api/.env.
cp apps/frontend/.env.example apps/frontend/.env
pnpm dev
```

Set `MONGODB_URI` to your MongoDB Atlas connection string, `API_KEY` to a
private key, and optionally `PORT` (defaults to `3000`). `CORS_ORIGIN` defaults
to `*`; set it to a comma-separated list of allowed origins for deployment.
The API connects to MongoDB before listening. All `/api` endpoints require the
`x-api-key` header; for example:

```sh
curl -H "x-api-key: $API_KEY" http://localhost:3000/api/health/
```

Keep `apps/api/.env` private; it is ignored by Git. Never commit database
credentials or API keys.

The React frontend runs at `http://localhost:5173` and calls the API through
Axios. Set `VITE_API_BASE_URL` and `VITE_API_KEY` in `apps/frontend/.env` to
connect it to the API. Vite embeds `VITE_*` values in
browser code, so use this only for local development or a deliberately public,
restricted key. For local testing, use the same local-only key for `API_KEY`
and `VITE_API_KEY`. Never put the API's private production key in frontend
environment variables; production deployments should authenticate through a
server-side proxy or backend-for-frontend.

The API uses Helmet security headers and a shared JSON error handler. Unknown
routes return `404`; unexpected errors return a generic `500` response.

## Limitations

- API-key access is shared rather than user-specific. The Todo model has no
  owner field, so authorized clients use the same Todo collection.
- `VITE_API_KEY` is included in client-side code and cannot be kept secret.
  Production deployments should put API access behind a server-side proxy or
  backend-for-frontend.
- The frontend page size is fixed at eight Todos, and the app requires the API
  and MongoDB to be available; there is no offline mode.

## Workspace commands

- `pnpm dev` — start workspace development tasks
- `pnpm build` — build all packages
- `pnpm lint` — check workspace formatting
- `pnpm format` — format workspace files
- `pnpm format:check` — verify formatting
- `pnpm --filter @repo/api test` — run API tests
- `pnpm --filter @repo/frontend dev` — start only the frontend

## Git hooks

Husky configures a pre-commit hook during dependency installation. Before each
commit, it runs `pnpm lint` to check formatting and `pnpm build` to build the
workspace.
