import { svg, text, rect, line, wrap, lines } from "./svg.js";
import D from "../data/figures/doors.json";
// Plate 2b: six doors; the twelve bases count organ and object, the eighteen elements add the consciousness.
export function draw() {
  let s = "", cw = 680 / 6, y0 = 44;
  s += text(0, 14, "12 BASES = organ + object · 18 ELEMENTS = organ + object + consciousness", "fg-xs fg-b fg-mu");
  D.doors.forEach((d, i) => {
    const x = i * cw + 4, w = cw - 8, mind = d.en === "mind";
    s += text(x + w / 2, y0 - 10, d.en.toUpperCase(), "fg-s fg-b", { "text-anchor": "middle" });
    const box = (yy, h, style, a, b, cls = "") => rect(x, yy, w, h, style, { rx: 6 }) + lines(x + w / 2, yy + 18, wrap(String(a).replace(/-/g, "- "), 15).map((l) => l.replace(/- /g, "-")), 13, `fg-s ${cls}`, { "text-anchor": "middle" }) + (b ? text(x + w / 2, yy + h - 8, b, `fg-xs fg-it ${cls}`, { "text-anchor": "middle" }) : "");
    s += box(y0, 84, `fill:${mind ? "var(--nama-soft)" : "var(--rupa-soft)"};stroke:${mind ? "var(--nama)" : "var(--rupa)"}`, d.organ, d.pali);
    s += box(y0 + 92, 84, "fill:var(--faint);stroke:var(--line)", d.object, d.objPali);
    s += box(y0 + 196, 96, "fill:var(--nama)", d.consciousness, d.cittas, "fg-on");
  });
  s += line(0, y0 + 186, 680, y0 + 186, "stroke:var(--muted);stroke-dasharray:4 3");
  s += text(680, y0 + 182, "above: the twelve bases", "fg-xs fg-mu", { "text-anchor": "end" });
  s += text(680, y0 + 308, "with the row below: the eighteen elements", "fg-xs fg-mu", { "text-anchor": "end" });
  return svg(680, y0 + 316, "Six doors, each with its organ, its object and the consciousness that arises there; organ and object make the twelve bases, and with consciousness the eighteen elements", s);
}
