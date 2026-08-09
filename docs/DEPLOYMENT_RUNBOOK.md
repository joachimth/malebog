# Malebog deployment runbook

## GitHub Pages

1. Run the full validation commands from `docs/OPERATIONS.md`.
2. Push to `main`.
3. Confirm the Pages workflow build and deploy jobs are green.
4. Verify the published root returns HTTP 200.
5. Verify a clean route such as `/editor/1` renders the SPA fallback. GitHub Pages may report HTTP 404 for clean deep links while serving the correct `404.html` body.

## Replit/server deployment

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Run `npm ci` and `npm run check`.
3. Run `npm run build` and `node --check dist/index.cjs`.
4. Start with `npm start`.
5. Verify `/healthz`, `/readyz`, `/api/motifs`, and an invalid motif id.
6. Confirm graceful shutdown is handled by SIGTERM.

Do not run database pushes or production mutations as part of static Pages validation. Motif seeding is protected by a PostgreSQL transaction lock and can safely run on repeated server starts.
