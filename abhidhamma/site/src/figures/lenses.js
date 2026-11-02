import { svg, text, rect, wrap, lines } from "./svg.js";
import D from "../data/figures/lenses.json";
import { strip } from "./common.js";
const NAMES = { 2: "Two truths", 3: "Cittas", 4: "Factors", 5: "Matter", 7: "The process", 8: "Conditions", 9: "Dependent origination", 10: "Kamma", 11: "Planes", 13: "The path" };
// Plate 14: the mango moment read through ten frameworks, under its seventeen moments.
export function draw() {
  let s = "", y = 10;
  const cells = D.moments.flatMap((m) => Array.from({ length: m.to - m.from + 1 }, () => m.kind));
  s += text(0, y + 10, "THE MOMENT · 17 mind-moments, then the life-continuum", "fg-xs fg-b fg-mu"); y += 18;
  s += strip(0, y, cells, 680 / cells.length, 22, false); y += 40;
  Object.entries(D.lens).forEach(([k, v], i) => {
    const ls = wrap(v, 82), h = Math.max(30, ls.length * 14 + 12);
    if (i % 2 === 0) s += rect(0, y, 680, h, "fill:var(--faint)", { rx: 4 });
    s += text(10, y + 18, NAMES[k] || "Lens", "fg-s fg-b fg-nm");
    s += lines(170, y + 18, ls, 14, "fg-s");
    y += h + 4;
  });
  return svg(680, y + 4, "One moment of seeing and wanting a mango, its seventeen mind-moments drawn as a strip, then the same moment read through ten frameworks, one line each", s);
}
