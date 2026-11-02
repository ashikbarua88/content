import { svg, text, wrap, lines, rect } from "./svg.js";
import D from "../data/figures/processes.json";
import { strip, MOMENT } from "./common.js";
// Plate 7b: the other processes, each a strip of mind-moments in the colours of the mango process.
export function draw() {
  let s = "", y = 6;
  D.strips.forEach((p) => {
    s += lines(0, y + 12, wrap(p.title, 80), 13, "fg-s fg-b");
    const tl = wrap(p.title, 80).length;
    y += tl * 13 + 4;
    s += strip(0, y, p.cells, 34, 24);
    s += lines(0, y + 42, wrap(p.note || "", 95), 12, "fg-xs fg-mu");
    y += 50 + wrap(p.note || "", 95).length * 12;
  });
  y += 6;
  const used = [...new Set(D.strips.flatMap((p) => p.cells))];
  used.forEach((c, i) => { const x = (i % 4) * 170, yy = y + Math.floor(i / 4) * 20; s += rect(x, yy, 22, 14, MOMENT[c][1], { rx: 3 }) + text(x + 11, yy + 11, c, "fg-xxs", { "text-anchor": "middle" }) + text(x + 28, yy + 11, MOMENT[c][0], "fg-xs fg-mu"); });
  y += Math.ceil(used.length / 4) * 20;
  return svg(680, y + 6, "Strips of mind-moments for the mind-door processes, absorption, the path, the attainment of cessation and the process at death", s);
}
