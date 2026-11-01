# Frontend

The frontend is a React and TypeScript single-page application built with Vite.
It lives in the pnpm monorepo as `@repo/frontend` and uses Tailwind CSS v3 for
styling and Axios for HTTP requests, with React Router DOM available for
client-side routing.

## Requirements

- Node.js 22.12+
- pnpm 11.17.0

## Setup

From the monorepo root:

```sh
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Set `MONGODB_URI` and a local-only `API_KEY` in `apps/api/.env`. Use that same
local-only key for `VITE_API_KEY` in `apps/frontend/.env`. The API must be
running and connected to MongoDB for frontend API requests to succeed.

Start the entire workspace from the monorepo root:

```sh
pnpm dev
```

Or start just the frontend:

```sh
pnpm --filter @repo/frontend dev
```

Vite serves the frontend at `http://localhost:5173`.

## Environment variables

| Variable            | Description                                  | Default |
| ------------------- | -------------------------------------------- | ------- |
| `VITE_API_BASE_URL` | API base URL used by Axios                   | `/api`  |
| `VITE_API_KEY`      | Value sent in the `x-api-key` request header | None    |

`VITE_*` variables are embedded in client-side code and are visible to users.
Use only a local development key here. Never expose the API's private
production key; production deployments should authenticate through a
server-side proxy or backend-for-frontend.

## Scripts

Run these from the monorepo root:

| Command                                | Description                              |
| -------------------------------------- | ---------------------------------------- |
| `pnpm --filter @repo/frontend dev`     | Start the Vite development server        |
| `pnpm --filter @repo/frontend build`   | Type-check and create a production build |
| `pnpm --filter @repo/frontend preview` | Preview the production build             |
| `pnpm --filter @repo/frontend lint`    | Check frontend formatting                |

## Tailwind CSS

Tailwind directives are in `src/styles/index.css`; the configuration scans
`index.html` and files under `src/`. Tailwind CSS IntelliSense is recommended
for VS Code. The monorepo's `.vscode/settings.json` maps the frontend source to
its Tailwind configuration.

## Source structure

```text
src/
├── assets/
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── native-select.tsx
│       └── pagination.tsx
├── helpers/
│   └── apiClient.ts
├── lib/
│   └── utils.ts
├── services/
│   └── todo.services.ts
├── styles/
│   └── index.css
├── views/
│   └── TodoView.tsx
├── App.tsx
└── main.tsx
```

- `helpers/apiClient.ts` configures the shared Axios client, API-key request
  interceptor, and response error handling.
- `services/` is intended for API operations.
- `views/` contains page-level React views.
- `styles/` contains the Tailwind entry stylesheet.
