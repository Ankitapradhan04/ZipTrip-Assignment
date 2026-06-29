# API Reference

Base URL (local dev): `http://localhost:4000/api`

All request/response bodies are JSON. All endpoints are prefixed with `/api/todos` unless noted.

## Todo object shape

```json
{
  "id": "8f14e45f-ceea-4d8f-b69a-0fc7cf3b5a01",
  "title": "Build the todo detail page",
  "description": "Single todo view, reads ?id= from the URL.",
  "completed": false,
  "priority": "high",
  "dueDate": "2026-06-28",
  "tags": ["frontend", "react"],
  "createdAt": "2026-06-22T08:45:00.000Z",
  "updatedAt": "2026-06-22T08:45:00.000Z"
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | Server-generated, never client-settable. |
| `title` | string | Required, non-empty. |
| `description` | string | Optional, defaults to `""`. |
| `completed` | boolean | Defaults to `false` on create. |
| `priority` | `"low" \| "medium" \| "high"` | Defaults to `"medium"`. |
| `dueDate` | string (ISO date) or `null` | Optional. |
| `tags` | string[] | Optional, defaults to `[]`. |
| `createdAt` | string (ISO datetime) | Server-generated, immutable. |
| `updatedAt` | string (ISO datetime) | Server-updated on every change. |

---

## `GET /api/health`

Liveness check.

**Response `200`**
```json
{ "status": "ok" }
```

---

## `GET /api/todos`

List todos. All query parameters are optional and combine (AND'd together).

| Query param | Values | Effect |
|---|---|---|
| `completed` | `true` \| `false` | Filter by completion state |
| `priority` | `low` \| `medium` \| `high` | Filter by priority |
| `search` | any string | Case-insensitive match against `title` or `description` |
| `sort` | `dueDate` \| `priority` \| `createdAt` | Sort the result set |

**Example**
```
GET /api/todos?completed=false&priority=high&sort=dueDate
```

**Response `200`** — array of todo objects.

---

## `GET /api/todos/:id`

Fetch a single todo.

**Response `200`** — the todo object.
**Response `404`**
```json
{ "error": "Todo with id \"abc\" not found" }
```

---

## `POST /api/todos`

Create a todo.

**Request body**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "medium",
  "dueDate": "2026-07-01",
  "tags": ["errands"]
}
```
Only `title` is required — everything else falls back to its default.

**Response `201`** — the created todo object (with generated `id`, `createdAt`, `updatedAt`, `completed: false`).

**Response `400`** (validation failure)
```json
{ "errors": ["title is required and must be a non-empty string"] }
```

---

## `PUT /api/todos/:id`

Full update — replaces the editable fields. `title` is required in the body (same validation as create).

**Request body** — same shape as `POST`, plus optionally `completed`.

**Response `200`** — the updated todo object.
**Response `400` / `404`** — same shape as above.

---

## `PATCH /api/todos/:id`

Partial update — send only the fields you want to change. The most common use is toggling completion:

```json
{ "completed": true }
```

Any subset of editable fields is accepted; omitted fields are left untouched. `id`, `createdAt` can never be changed via this (or any) endpoint.

**Response `200`** — the updated todo object.
**Response `400` / `404`** — same shape as above.

---

## `DELETE /api/todos/:id`

Deletes a todo.

**Response `200`** — the deleted todo object (useful for "undo" UIs, not currently used in the frontend but available).
**Response `404`** — same shape as above.

---

## Error shape conventions

- Validation errors → `400` with `{ "errors": [...] }` (array, can be multiple).
- Not found → `404` with `{ "error": "..." }` (singular).
- Anything unexpected → `500` with `{ "error": "Internal server error" }`.
- Unknown route under `/api` → `404` with `{ "error": "No route for GET /api/whatever" }`.

## Storage

Data is persisted to `backend/data/todos.json` as a flat JSON array. Reads/writes go through `backend/utils/db.js`, which serializes writes through a promise queue so two requests arriving close together can't race and overwrite each other's changes. Swapping in a real database later only requires re-implementing `readTodos()`/`writeTodos()` in that one file — every route already only talks to those two functions.
