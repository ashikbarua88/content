#!/usr/bin/env node
/* Build the Abhidhamma Atlas from its sources in atlas/.

     node tools/build.js                 bundle atlas/ into abhidhamma-atlas.html (one self-contained page)
     node tools/build.js --pdf           also print abhidhamma-atlas.pdf (A4, one sheet per page)
     node tools/build.js --check         render every sheet and report any that overflow A4; no files written

   Options
     --three <file>   use a local copy of three.js r128 (three.min.js) when the CDN is unreachable
     --dark           print the PDF in the dark theme (default: light)

   The PDF and --check need Playwright with Chromium:  npm i -D playwright && npx playwright install chromium
   The bundle has no <html>/<head>/<body> skeleton, because the Claude artifact host adds its own;
   to read the atlas offline in a browser, open atlas/index.html instead. */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "atlas");
const OUT_HTML = path.join(ROOT, "abhidhamma-atlas.html");
const OUT_PDF = path.join(ROOT, "abhidhamma-atlas.pdf");
const args = process.argv.slice(2);
const opt = (name) => args.includes(name);
const val = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

function bundle() {
  let html = fs.readFileSync(path.join(SRC, "index.html"), "utf8");
  html = html
    .replace(/<!doctype html>\s*/i, "")
    .replace(/<\/?html[^>]*>\s*/gi, "")
    .replace(/<\/?head>\s*/gi, "")
    .replace(/<\/?body>\s*/gi, "")
    .replace(/<meta charset="utf-8">\s*/i, "")
    .replace(/<meta name="viewport"[^>]*>\s*/i, "");
  html = html.replace(/<link rel="stylesheet" href="([^"]+)" data-inline>/g, (m, href) =>
    "<style>\n" + fs.readFileSync(path.join(SRC, href), "utf8") + "</style>");
  html = html.replace(/<script src="([^"]+)" data-inline><\/script>/g, (m, src) => {
    const js = fs.readFileSync(path.join(SRC, src), "utf8");
    if (/<\/script/i.test(js)) throw new Error(src + " contains </script, which would end the inline script early");
    return "<script>\n/* " + src + " */\n" + js + "</script>";
  });
  html = html.replace("</title>", "</title>\n<!-- Built from atlas/ by tools/build.js. Edit the files in atlas/, not this one. -->");
  fs.writeFileSync(OUT_HTML, html);
  console.log("wrote", path.relative(process.cwd(), OUT_HTML), Math.round(html.length / 1024) + " KB");
}

async function render(writePdf) {
  let chromium;
  try { ({ chromium } = require("playwright")); }
  catch (e) {
    try { ({ chromium } = require(path.join(require("child_process").execSync("npm root -g").toString().trim(), "playwright"))); }
    catch (e2) { console.error("Playwright is not installed: npm i -D playwright && npx playwright install chromium"); process.exit(1); }
  }
  // software WebGL so the 3D models draw in headless Chromium
  const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
  const scheme = opt("--dark") ? "dark" : "light";
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, colorScheme: scheme });
  const three = val("--three");
  if (three) await page.route("https://cdnjs.cloudflare.com/**", (r) => r.fulfill({ path: path.resolve(three), contentType: "application/javascript" }));
  let errors = 0;
  page.on("pageerror", (e) => { errors++; console.log("page error:", e.message); });
  await page.goto("file://" + path.join(SRC, "index.html"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print", colorScheme: scheme });
  await page.waitForTimeout(500);
  const scenes = await page.evaluate(() => (window.__render3dAll ? window.__render3dAll() : 0));
  await page.waitForTimeout(300);
  // A4 at 96 dpi is 1123 px tall; each sheet's footer must end inside it
  const over = await page.evaluate(() => [...document.querySelectorAll(".sheet")].map((s, i) => {
    const r = s.getBoundingClientRect(), kids = [...s.children], last = kids[kids.length - 1], prev = kids[kids.length - 2];
    return { page: i + 1, id: s.id, scroll: s.scrollHeight, gap: prev ? Math.round(last.getBoundingClientRect().top - prev.getBoundingClientRect().bottom) : 0, end: Math.round(prev ? prev.getBoundingClientRect().bottom - r.top : 0) };
  }).filter((o) => o.scroll > 1124 || o.end > 1085));
  const sheets = await page.evaluate(() => document.querySelectorAll(".sheet").length);
  console.log(sheets + " sheets, " + scenes + " 3D scenes drawn, " + errors + " page errors");
  if (over.length) console.log("overflowing or crowded sheets:", JSON.stringify(over));
  else console.log("every sheet fits on its page");
  if (writePdf) {
    await page.pdf({ path: OUT_PDF, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log("wrote", path.relative(process.cwd(), OUT_PDF), Math.round(fs.statSync(OUT_PDF).size / 1024) + " KB");
  }
  await browser.close();
  return over.length === 0 && errors === 0;
}

(async () => {
  if (!opt("--check")) bundle();
  if (opt("--pdf") || opt("--check")) {
    const ok = await render(opt("--pdf"));
    if (!ok) process.exitCode = 1;
  }
})();
