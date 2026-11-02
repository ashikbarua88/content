// Copies the atlas, its PDF and the nāma–rūpa model into public/ so the site links to them.
import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../.."), pub = path.resolve(here, "../public");
mkdirSync(pub, { recursive: true });
cpSync(path.join(src, "atlas"), path.join(pub, "atlas"), { recursive: true });
for (const f of ["abhidhamma-atlas.pdf", "nama-rupa-model.html"]) cpSync(path.join(src, f), path.join(pub, f));
console.log("companions copied to public/");
