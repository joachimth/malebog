import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const outputDir = resolve(process.argv[2] ?? "dist-pages");
const errors = [];

async function readText(name) {
  try {
    return await readFile(join(outputDir, name), "utf8");
  } catch {
    errors.push(`missing required file: ${name}`);
    return "";
  }
}

const indexHtml = await readText("index.html");
const fallbackHtml = await readText("404.html");

if (indexHtml && fallbackHtml !== indexHtml) {
  errors.push("404.html must be an exact copy of index.html");
}

const assetRefs = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((ref) => ref.startsWith("/malebog/"));

for (const ref of assetRefs) {
  const assetPath = join(outputDir, ref.replace(/^\/malebog\//, ""));
  try {
    await readFile(assetPath);
  } catch {
    errors.push(`HTML asset does not exist: ${ref}`);
  }
}

const manifestText = await readText(".vite/manifest.json");
let manifest = {};
if (manifestText) {
  try {
    manifest = JSON.parse(manifestText);
  } catch {
    errors.push(".vite/manifest.json is not valid JSON");
  }
}

for (const page of ["Home", "Editor", "SavedDrawings", "not-found"]) {
  const key = Object.keys(manifest).find((candidate) =>
    candidate.endsWith(`/pages/${page}.tsx`),
  );
  if (!key) {
    errors.push(`manifest is missing route entry for ${page}`);
    continue;
  }
  const entry = manifest[key];
  if (!entry.isDynamicEntry) {
    errors.push(`route is not emitted as a dynamic entry: ${key}`);
  }
  if (!entry.file) {
    errors.push(`manifest route has no output file: ${key}`);
  }
}

const files = [];
async function collect(dir) {
  for (const name of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) await collect(path);
    else files.push(path);
  }
}
await collect(outputDir);

for (const file of files) {
  if (!/\.(?:html|js|css|json)$/.test(file)) continue;
  const text = await readFile(file, "utf8");
  for (const forbidden of ["/api/motifs", "DATABASE_URL", "SESSION_SECRET", "localhost:"]) {
    if (text.includes(forbidden)) {
      errors.push(`forbidden server reference ${forbidden} in ${relative(outputDir, file)}`);
    }
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const byteSize = async (paths) =>
  (await Promise.all(paths.map(async (file) => (await readFile(file)).byteLength)))
    .reduce((total, size) => total + size, 0);
const jsBytes = await byteSize(files.filter((file) => file.endsWith(".js")));
const cssBytes = await byteSize(files.filter((file) => file.endsWith(".css")));

console.log(`Pages artifact valid: ${files.length} files, ${jsBytes} JS bytes, ${cssBytes} CSS bytes`);
