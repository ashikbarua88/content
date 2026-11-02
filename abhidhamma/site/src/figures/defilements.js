import { svg, text, rect, circle } from "./svg.js";
import F from "../data/figures/defilements.json";
// Plate 8b: chapter VII's lists of defilements, reduced to the fourteen unwholesome factors.
export function draw({ structure }) {
  const lists = structure.chapter7, x0 = 210, cw = 470 / F.factors.length; let s = "", y = 70;
  F.factors.forEach((f, i) => { const x = x0 + i * cw + cw / 2; s += text(x, 62, f.en, "fg-xs", { transform: `rotate(-50 ${x} 62)` }); });
  lists.forEach(([name, n, counts], r) => {
    if (r % 2) s += rect(0, y, 680, 26, "fill:var(--faint)");
    s += text(4, y + 17, name, "fg-s");
    counts.forEach((c, i) => { if (c) s += circle(x0 + i * cw + cw / 2, y + 13, 3 + c * 2.6, "fill:var(--bad);opacity:.85") + (c > 1 ? text(x0 + i * cw + cw / 2, y + 16.5, String(c), "fg-xxs fg-on", { "text-anchor": "middle" }) : ""); });
    y += 26;
  });
  y += 8;
  s += text(4, y + 12, "Totals (lists × items):", "fg-xs fg-b fg-mu");
  F.factors.forEach((f, i) => { s += text(x0 + i * cw + cw / 2, y + 12, String(f.times), "fg-xs fg-b", { "text-anchor": "middle" }); });
  return svg(680, y + 22, "Chapter VII's lists of defilements in rows against the fourteen unwholesome factors in columns; each circle shows how many items of a list are that factor", s);
}
