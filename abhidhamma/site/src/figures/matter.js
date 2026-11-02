import { svg, text, rect, circle, line } from "./svg.js";
import D from "../data/figures/matter.json";
const ORIG = [["k", "kamma"], ["c", "mind"], ["u", "temperature"], ["a", "nutriment"]];
// Plate 5: the 28 kinds of matter by their origins, then the 21 groups (kalāpa) by origin.
export function draw({ matter }) {
  let s = "", y = 40;
  const x0 = 250, cw = 70;
  ORIG.forEach(([, n], i) => { s += text(x0 + i * cw + cw / 2, 26, n, "fg-s fg-b", { "text-anchor": "middle" }); });
  s += text(x0 + 4 * cw + 10, 26, "no origin of its own", "fg-xs fg-mu");
  let group = "";
  matter.forEach((m, i) => {
    if (m.group !== group) { group = m.group; y += 6; s += text(0, y + 10, group.toUpperCase(), "fg-xs fg-b fg-mu"); y += 14; }
    if (i % 2) s += rect(0, y - 1, 680, 18, "fill:var(--faint)");
    s += text(10, y + 12, m.pali, "fg-s fg-it"); s += text(110, y + 12, m.en, "fg-xs fg-mu");
    ORIG.forEach(([k], j) => { if (m.origins.includes({ k: "kamma", c: "mind", u: "temperature", a: "nutriment" }[k])) s += circle(x0 + j * cw + cw / 2, y + 8, 5, "fill:var(--rupa-mark)"); else s += circle(x0 + j * cw + cw / 2, y + 8, 2, "fill:var(--line)"); });
    if (!m.origins.length) s += text(x0 + 4 * cw + 10, y + 12, "a mark of matter", "fg-xs fg-mu");
    if (m.inseparable) s += text(680, y + 12, "inseparable", "fg-xs fg-rp", { "text-anchor": "end" });
    y += 18;
  });
  y += 30;
  s += line(0, y - 14, 680, y - 14);
  s += text(0, y + 4, "THE 21 GROUPS: EIGHT INSEPARABLES, PLUS WHAT EACH GROUP ADDS", "fg-xs fg-b fg-mu"); y += 18;
  const sq = 12, st = 15, kx = 250;
  D.kalapas.forEach((g) => {
    y += 8; s += text(0, y + 10, `${g.origin} · ${g.rows.length}`, "fg-s fg-b fg-rp"); y += 16;
    g.rows.forEach((r) => {
      s += text(10, y + 10, r.name, "fg-xs");
      for (let i = 0; i < 8; i++) s += rect(kx + i * st, y, sq, sq, "fill:var(--rupa-soft);stroke:var(--rupa)", { rx: 2 });
      r.extra.forEach((_, j) => { s += rect(kx + (8 + j) * st + 6, y, sq, sq, "fill:var(--rupa-mark)", { rx: 2 }); });
      if (r.extra.length) s += text(kx + (8 + r.extra.length) * st + 14, y + 10, "+ " + [...new Set(r.extra)].map((v) => (v === "m" ? "3 mutable" : v)).join(", "), "fg-xs fg-mu");
      y += 17;
    });
  });
  return svg(680, y + 6, "The 28 kinds of matter, marked by which of the four origins produce each; then the 21 groups of matter, each the eight inseparables plus what it adds", s);
}
