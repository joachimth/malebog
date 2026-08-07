# Malebog

Malebog is a React/Vite digital coloring book. The Replit app keeps its Express/PostgreSQL server build, while the GitHub Pages build embeds the existing seed motif catalog in the frontend and runs without a server or database.

## Local development (Replit/server build)

```bash
npm ci
npm run dev
```

The normal production build remains available with `npm run build` and starts with `npm start`.

## Local GitHub Pages build

The Pages build uses the `/malebog/` base path and writes static files to `dist-pages/`:

```bash
npm ci
npm run check
npm run build:pages
cp dist-pages/index.html dist-pages/404.html
npx vite preview --config vite.config.pages.ts
```

Open the preview URL shown by Vite. The static build does not request `/api/motifs` and does not require PostgreSQL; motifs come from the shared seed catalog.

## Published site

After GitHub Pages is enabled for the repository, the expected URL is:

<https://joachimth.github.io/malebog/>

The workflow in `.github/workflows/pages.yml` builds and publishes the site on pushes to `main`.
