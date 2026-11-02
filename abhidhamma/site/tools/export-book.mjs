// Prints dist/book/ to dist/abhidhamma-book.pdf. Runs after `astro build` (see package.json).
// Needs Playwright with Chromium. Without it the build still succeeds: the book page stays
// readable and printable from the browser, and only the ready-made PDF is missing.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../dist");
const base = (process.env.SITE_BASE || "/").replace(/\/?$/, "/");

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { try { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); } catch {} }
if (!chromium) { console.warn("export-book: Playwright not found, so no PDF this time (npm i -g playwright && npx playwright install chromium)."); process.exit(0); }

// A small static server for dist/, so the book's absolute links (/_astro/…, /js/…) resolve.
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".json": "application/json", ".pdf": "application/pdf" };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.startsWith(base)) p = "/" + p.slice(base.length);
  let f = path.join(dist, p);
  try { if ((await stat(f)).isDirectory()) f = path.join(f, "index.html"); res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); res.end(await readFile(f)); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ colorScheme: "light" });
  await page.goto(`http://localhost:${port}${base}book/`, { waitUntil: "networkidle" });
  // Load every image now, not lazily, and wait for fonts.
  await page.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach((i) => { i.loading = "eager"; });
    await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    await document.fonts.ready;
  });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: path.join(dist, "abhidhamma-book.pdf"), format: "A4", printBackground: true,
    margin: { top: "18mm", bottom: "18mm", left: "20mm", right: "20mm" }, displayHeaderFooter: true,
    headerTemplate: '<div style="font:8px sans-serif;color:#888;width:100%;text-align:center">Abhidhamma: a reading companion</div>',
    footerTemplate: '<div style="font:8px sans-serif;color:#888;width:100%;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  const { size } = await stat(path.join(dist, "abhidhamma-book.pdf"));
  console.log(`export-book: wrote dist/abhidhamma-book.pdf (${Math.round(size / 1024)} KB)`);
} finally {
  await browser.close();
  server.close();
}
