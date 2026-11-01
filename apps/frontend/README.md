# Frontend

The frontend is a React and TypeScript single-page application built with Vite.
It lives in the pnpm monorepo as `@repo/frontend` and uses Tailwind CSS v3 for
styling, React Router DOM for client-side routing, Axios for HTTP requests, and
TanStack Query for server state.

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

## Todo application

The home route provides a searchable and filterable todo list with pagination.
Users can create and edit todos in a validated dialog, toggle completion, and
delete items. Requests use the existing API key interceptor and the TodoApp API
contract:

| Action            | Request                                   |
| ----------------- | ----------------------------------------- |
| List and filter   | `GET /todos?page=&limit=&search=&status=` |
| Create            | `POST /todos`                             |
| Edit              | `PUT /todos/:id`                          |
| Toggle completion | `PATCH /todos/:id/done`                   |
| Delete            | `DELETE /todos/:id`                       |

TanStack Query retries transient list requests and exposes a manual retry
action. Loading uses a spinner with skeleton cards, mutation results use toast messages, and
an application error boundary handles unexpected rendering errors. The create
and edit dialog validates titles (up to 200 characters) and descriptions (up
to 2,000 characters) with React Hook Form and Yup. Relative timestamps use
Moment.

## Assumptions and limitations

- The API must be reachable at `VITE_API_BASE_URL` and connected to MongoDB.
- The app has no sign-in or per-user TODO lists; callers using the configured
  API key share the same TODO data.
- `VITE_API_KEY` is included in browser code and is not secret. Production
  deployments should authenticate through a server-side proxy or
  backend-for-frontend.

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
│   ├── AppErrorBoundary.tsx
│   ├── FilterSelect.tsx
│   ├── PaginationControls.tsx
│   ├── RefreshErrorAlert.tsx
│   ├── SuspenseFallback.tsx
│   └── ui/
│       ├── dialog.tsx
│       ├── button.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── native-select.tsx
│       ├── pagination.tsx
│       ├── skeleton.tsx
│       └── spinner.tsx
├── helpers/
│   ├── apiClient.ts
│   ├── queryClient.ts
│   └── utils.ts
├── hooks/
│   └── useDebounce.ts
├── interfaces/
│   └── todo.interface.ts
├── reusable/
│   └── enums.ts
├── services/
│   └── todo.services.ts
├── styles/
│   └── index.css
├── views/
│   ├── NotFoundView.tsx
│   └── todoView/
│       ├── component/
│       │   ├── TodoCard.tsx
│       │   ├── TodoEmptyState.tsx
│       │   ├── TodoListSkeleton.tsx
│       │   └── TodoLoadError.tsx
│       ├── hooks/
│       │   └── useTodos.ts
│       ├── widgets/
│       │   ├── TodoDialog.tsx
│       │   └── TodoFilters.tsx
│       └── TodoView.tsx
├── App.tsx
└── main.tsx
```

- `helpers/apiClient.ts` configures the shared Axios client, API-key request
  interceptor, and response error handling.
- `helpers/queryClient.ts` exports the configured TanStack Query client.
- `hooks/useDebounce.ts` provides a generic debounced-value hook.
- `views/todoView/hooks/useTodos.ts` owns the Todo list query and create,
  update, completion, and delete mutations.
- `services/todo.services.ts` implements the list, create, update, completion,
  and delete API calls.
- `components/` contains shared dialogs, filters, error handling, and
  shadcn/ui components, including reusable pagination controls.
- `components/FilterSelect.tsx` provides a reusable select for typed filter
  options.
- `reusable/enums.ts` defines the Todo status filter values.
- `views/todoView/component/` contains the Todo card and list states.
- `views/` contains page-level React views and local UI state.
- `styles/` contains the Tailwind entry stylesheet.
