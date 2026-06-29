# Challenge 2 — Todo Application

A multi-page React frontend talking to an Express + file-storage CRUD backend.

```
challenge-2/
├── backend/                 Express API (CRUD, JSON-file storage)
│   ├── server.js            App entry point
│   ├── routes/todos.js      All /api/todos routes
│   ├── utils/db.js          File-based read/write with serialized writes
│   ├── data/todos.json      The "database" — a flat JSON array, seeded with sample todos
│   └── package.json
├── frontend/                 Vite + React, two real HTML pages (not an SPA)
│   ├── index.html            Page 1 entry — the todo list
│   ├── todo.html             Page 2 entry — a single todo's detail view
│   ├── vite.config.js        Multi-page build config (two rollup inputs)
│   └── src/
│       ├── list/              List page: App.jsx, main.jsx, list.css
│       ├── detail/            Detail page: App.jsx, main.jsx, detail.css
│       └── shared/            api.js (fetch client), theme.css (design tokens), format.js
└── docs/
    ├── API.md                 Full endpoint reference
    └── FEATURES.md             Everything implemented, page by page
```

See **`docs/FEATURES.md`** for what each page does, and **`docs/API.md`** for the full endpoint reference.

## Why multi-page instead of SPA

Quick summary (full reasoning in `docs/FEATURES.md`): Vite is configured with **two separate HTML entry points** (`index.html` and `todo.html`), each booting its own independent React root from its own bundle. There's no client-side router — clicking between pages is a plain `<a href>` and triggers a real browser page load. `npm run build` proves this out: it emits two separate HTML files and two separate JS/CSS chunks, not one SPA bundle.

## Running it locally

You need two terminals — one for the API, one for the frontend.

### 1. Backend

```bash
cd backend
npm install
npm start          # listens on http://localhost:4000
```

The API seeds itself from `data/todos.json` (a few sample todos are already in there). There's nothing else to configure — no database to spin up.

Optional: copy `.env.example` if you want to override the port (`PORT=5000 npm start`, or set it in a `.env` file — `dotenv` isn't wired in by default since `process.env.PORT` is read directly, so either export it in your shell or add `node --env-file=.env server.js` if you'd rather use a file).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # points VITE_API_URL at the backend; edit if you changed the port
npm run dev             # http://localhost:5173
```

Open `http://localhost:5173/` — Vite's dev server serves `index.html` at the root automatically. The detail page lives at `http://localhost:5173/todo.html?id=...` and is reached by clicking into any todo from the list (it's not meant to be opened cold without an `id`).

### 3. Production build (optional)

```bash
cd frontend
npm run build      # outputs dist/index.html, dist/todo.html, dist/assets/*
npm run preview    # serves the built dist/ folder locally to sanity check it
```

If you deploy the built `dist/` folder behind a static file server, make sure the server serves `index.html` for `/` and `todo.html` for `/todo.html` directly (no SPA "fallback to index.html on every route" rewrite needed or wanted — that would defeat the multi-page setup).

## Tech choices, briefly

- **Storage**: a flat JSON file rather than a real database, per the brief ("save the data in a file or in a database, either is fine"). All file access goes through `backend/utils/db.js`, which is the only file that would need to change to swap in SQLite/Postgres/Mongo later — every route only ever calls `readTodos()`/`writeTodos()`.
- **No client-side router** in the frontend, deliberately — see above.
- **Native `fetch`** for the API client, no axios — nothing here needs more than fetch gives you for free, and `src/shared/api.js` keeps the wrapping (error parsing, query string building) in one place.
- **Optimistic UI** for the completion checkbox (instant visual feedback, re-syncs from the server if the request fails) since it's the highest-frequency interaction in a todo app.

## Tested

The full CRUD lifecycle was exercised against the running backend with `curl` (create/read/update/patch/delete, validation errors, filtering, search, 404s), and the full UI flow was exercised against the running frontend+backend in a real headless browser (create a todo through the form, search/filter it, click through to the detail page via an actual page navigation, edit it, toggle completion, delete it with the confirm dialog, and confirm a redirect back to the list — plus loading a detail page with a bad id to confirm the error state renders).
