# Features

## Why multi-page, not an SPA

The brief explicitly asked for "multiple page instead of SPA." This is implemented with **Vite's multi-page build**: there are two separate HTML entry points, `index.html` (the list) and `todo.html` (a single ticket), each with its own `main.jsx` mounting its own independent React root and its own JS/CSS bundle (confirmed by `npm run build` emitting `dist/index.html`, `dist/todo.html`, and separate `main-*.js`/`todo-*.js` chunks).

Navigation between them uses plain `<a href="/todo.html?id=...">` and `<a href="/index.html">` tags — clicking them triggers a real browser navigation (full page load), not a client-side route swap. There is no React Router, no history API interception, no shared client-side state between the two pages: each page boots cold and fetches whatever it needs from the API on mount. That's the structural difference from an SPA.

## Page 1 — Todo list (`index.html`)

- **List all todos**, fetched from `GET /api/todos` on load.
- **Create a todo** via an inline form (title, optional description, priority, optional due date, optional comma-separated tags). Client-side requires a non-empty title; server-side validation errors are surfaced under the form if the API rejects the request.
- **Toggle complete/incomplete** with a checkbox on each ticket — sends `PATCH /api/todos/:id` with `{ completed }`. Updates optimistically (the checkbox flips instantly) and re-syncs from the server if the request fails.
- **Delete a todo** with a confirm prompt, from the list view directly (no need to open the detail page first).
- **Filter by status**: All / Active / Completed pill toggles, implemented via the `?completed=` query param.
- **Search** by title/description, debounced (300ms) before re-querying the API.
- **Sort**: newest first, by due date, or by priority — delegated to the API's `?sort=` param.
- **Overdue indicator**: any todo with a `dueDate` in the past that isn't completed gets a highlighted "Overdue" label instead of "Due ...".
- **Tag chips** rendered per todo.
- **Live counts**: "`N` open, `M` done · `T` total" in the page subtitle.
- **Click-through to detail**: clicking anywhere on a ticket (other than the checkbox or delete button) navigates to `todo.html?id=<id>`.
- **Empty states**: distinct messaging for "no todos at all yet" vs. "no todos match the current filter/search."

## Page 2 — Todo detail (`todo.html?id=...`)

- **Reads the todo id from the URL** via `new URLSearchParams(window.location.search).get('id')` — a real query parameter, read on page load, not passed through any in-memory router state.
- **Fetches and displays the full todo**: title, description, priority, due date (with the same overdue styling as the list), tags, and a metadata footer with a short id, the created timestamp, and the last-updated timestamp.
- **Edit in place**: an "Edit ticket" button switches the card into a form (same fields as creation); "Save changes" sends `PUT /api/todos/:id`; "Cancel" discards the draft and returns to the read view without saving.
- **Toggle complete** directly on the detail page.
- **Delete with confirmation**, then redirects back to the list page (`window.location.href = '/index.html'`) — a real navigation, consistent with the multi-page approach.
- **Error handling**: an invalid or missing `id` in the URL, or an id that doesn't exist (`404` from the API), renders a clear error message instead of a blank or broken page.

## Cross-cutting

- **Shared API client** (`src/shared/api.js`) used by both pages — one place that knows how to talk to the backend, parses error responses consistently, and exposes `list/get/create/update/patch/remove`.
- **Shared design system** (`src/shared/theme.css`) — both pages render todos as the same "ticket" card component (priority-colored spine, postage-style priority stamp, dashed-rule footer with id/dates) so the list and detail views feel like one coherent product even though they're structurally two separate pages.
- **Accessibility floor**: visible keyboard focus rings on all interactive elements, `aria-label`s on icon-only/checkbox controls, `prefers-reduced-motion` respected, responsive down to small mobile widths.
- **Resilience**: every fetch is wrapped with loading/error states; optimistic UI updates (checkbox toggles) revert and re-sync if the underlying request fails.
