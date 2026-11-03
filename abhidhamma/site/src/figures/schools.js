import { svg, text, rect } from "./svg.js";
import D from "../data/figures/schools.json";
// Plate 15: three schools' lists of ultimate elements, counted the same way.
export function draw() {
  let s = "", y = 10; const x0 = 140, sc = 5.3;
  D.rows.forEach((r) => {
    s += text(0, y + 22, r.school, "fg-m fg-b") + text(0, y + 38, `${r.total} elements`, "fg-xs fg-mu");
    let x = x0;
    r.counts.forEach((n, i) => {
      if (!n) return;
      const w = Math.max(n * sc, 8), c = D.cats[i].colour;
      s += rect(x, y + 8, w - 2, 30, `fill:${c}`, { rx: 3 });
      if (w > 22) s += text(x + w / 2, y + 28, String(n), "fg-s fg-b fg-on", { "text-anchor": "middle" });
      x += w;
    });
    y += 56;
  });
  y += 8;
  D.cats.forEach((c, i) => { const x = (i % 3) * 225, yy = y + Math.floor(i / 3) * 20; s += rect(x, yy - 10, 14, 12, `fill:${c.colour}`, { rx: 2 }) + text(x + 20, yy, `${c.en} (${c.pali})`, "fg-xs fg-mu"); });
  return svg(680, y + 34, "Stacked bars of the Theravāda's 82, the Sarvāstivāda's 75 and the Yogācāra's 100 ultimate elements, divided into consciousness, mental factors, matter, dissociated formations and the unconditioned", s);
}
