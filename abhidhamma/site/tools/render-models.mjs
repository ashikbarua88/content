// Takes a picture of each level's main 3D model from the built site (dist/explore/3d/) for the
// Explore page's previews: public/models/D1.webp … D7.webp. Run after `npm run build`, then rebuild.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "../dist"), out = path.resolve(here, "../public/models");
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }
const MAIN = { D1: "d1-view", D2: "d2-tower", D3: "d3-proc", D4: "d4-helix", D5: "d5-view", D6: "d6-climb", D7: "d7-view" };
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png" };
const server = createServer(async (req, res) => {
  let f = path.join(dist, decodeURIComponent(new URL(req.url, "http://x").pathname));
  try { if ((await stat(f)).isDirectory()) f = path.join(f, "index.html"); res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); res.end(await readFile(f)); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1.5, colorScheme: "light" });
await page.goto(`http://localhost:${server.address().port}/explore/3d/`); await page.waitForTimeout(2500);
await page.addStyleTag({ content: ".top{position:static!important} .hint3{display:none!important}" });
for (const [d, id] of Object.entries(MAIN)) {
  const el = page.locator("#" + id); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
  await sharp(await el.screenshot()).resize({ width: 640 }).webp({ quality: 80 }).toFile(path.join(out, d + ".webp"));
}
await browser.close(); server.close();
console.log("rendered", Object.keys(MAIN).length, "model previews to public/models/");
