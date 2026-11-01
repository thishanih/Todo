# Node.js TypeScript Express Monorepo

A pnpm and Turborepo workspace for a Node.js API, shared TypeScript code, and
shared TypeScript configuration.

## Repository structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   └── api/
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

- Node.js 22+
- pnpm 11.17.0

## Getting started

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
# Set the Atlas connection string and a private API key in apps/api/.env.
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

The API uses Helmet security headers and a shared JSON error handler. Unknown
routes return `404`; unexpected errors return a generic `500` response.

## Workspace commands

- `pnpm dev` — start workspace development tasks
- `pnpm build` — build all packages
- `pnpm lint` — check workspace formatting
- `pnpm format` — format workspace files
- `pnpm format:check` — verify formatting
