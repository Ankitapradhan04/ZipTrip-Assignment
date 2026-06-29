# Ziptrip Tech Assignment

Solutions for both challenges in the brief.

- **`challenge-1/`** — the five JS/HTML/CSS questions. Each JS question has a runnable file with several different implementations; the CSS selector and layout questions are answered in `challenge-1/README.md` (with a live demo for the flexbox/grid/float layout comparison).
- **`challenge-2/`** — the full todo application: an Express CRUD API with JSON-file storage, and a multi-page React frontend (two real HTML pages, no client-side router). Setup instructions are in `challenge-2/README.md`; full feature and API documentation is in `challenge-2/docs/`.

## Quick start

```bash
# Challenge 1 — run any of the JS solutions directly
cd challenge-1
node q1-pattern.js
node q2-reverse-string.js
node q3-remove-duplicates.js
# Q4/Q5 (CSS) are answered in challenge-1/README.md — open
# challenge-1/q5-flexbox-demo.html in a browser for the live layout demo.

# Challenge 2 — two terminals
cd challenge-2/backend  && npm install && npm start    # terminal 1
cd challenge-2/frontend && npm install && cp .env.example .env && npm run dev   # terminal 2
```

Everything in `challenge-2` was tested end-to-end before being checked in: the API with `curl` against every CRUD endpoint, validation path, and error case, and the UI in a real headless browser exercising create → search → click-through to the detail page (a genuine full-page navigation) → edit → toggle complete → delete → redirect back to the list.
