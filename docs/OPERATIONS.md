# Malebog operations

## Runtime

- Node.js: 20.19+ for the current Vite toolchain. CI uses Node 22.
- Production server: `npm run build`, then `npm start`.
- Required environment: `DATABASE_URL`.
- Optional database pool settings: `DB_POOL_MAX`.

## Health checks

- `GET /healthz` confirms the process is serving HTTP.
- `GET /readyz` confirms the process can query PostgreSQL.
- Unknown `/api/*` routes return JSON 404 responses. Client routes are served by the SPA fallback.

## Validation

```bash
npm ci
npm run check
npm run build
node --check dist/index.cjs
npm run build:pages
cp dist-pages/index.html dist-pages/404.html
npm run validate:pages
```

Validation and documentation changes must not submit orders, mutate external services, or trigger trading-like cycles. Malebog database validation should use a disposable PostgreSQL database.
