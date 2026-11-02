// Renders atlas sheets as images, in light and dark, for readings whose drawing is too
// dense to read inline or is laid out in HTML rather than one svg. Output: public/sheets/.
// Run after changing the atlas: node tools/render-sheets.mjs
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { SHEETS } from "../src/lib/sheets.js";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright"))); }

const here = path.dirname(fileURLToPath(import.meta.url));
const atlas = pathToFileURL(path.resolve(here, "../../atlas/index.html")).href;
const out = path.resolve(here, "../public/sheets");
mkdirSync(out, { recursive: true });



const browser = await chromium.launch();
for (const theme of ["light", "dark"]) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 2 });
  await page.route(/cdnjs|unpkg|jsdelivr/, (r) => r.abort()); // three.js is not needed for flat sheets
  await page.emulateMedia({ media: "print", colorScheme: theme });
  await page.goto(atlas, { waitUntil: "networkidle" });
  await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  for (const id of SHEETS) {
    const el = page.locator("section.sheet#" + id);
    const png = await el.screenshot();
    await sharp(png).resize({ width: 1400 }).webp({ quality: 78 }).toFile(path.join(out, `${id}-${theme}.webp`));
  }
  await page.close();
}
await browser.close();
console.log("rendered", SHEETS.length, "sheets in light and dark to public/sheets/");
