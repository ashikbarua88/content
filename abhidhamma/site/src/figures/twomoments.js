import { svg, text, rect, wrap, lines } from "./svg.js";
import D from "../data/figures/twomoments.json";
// Plate 14b: the same mango seen twice, wanted and given away, compared row by row.
export function draw() {
  let s = "", y = 30;
  s += text(170, 14, "WANTED", "fg-xs fg-b", { style: "fill:var(--bad)" }) + text(430, 14, "GIVEN AWAY", "fg-xs fg-b fg-nb");
  D.rows.forEach((r) => {
    const a = wrap(r.greed, 38), b = wrap(r.gift, 38), h = Math.max(a.length, b.length) * 13 + 16;
    const same = /^the same|^identical/i.test(r.gift);
    s += rect(0, y, 680, h - 3, same ? "fill:var(--faint)" : "fill:var(--sheet);stroke:var(--line)", { rx: 4 });
    s += text(8, y + 15, r.row, "fg-s fg-b");
    s += lines(170, y + 15, a, 13, "fg-xs");
    s += lines(430, y + 15, b, 13, `fg-xs ${same ? "fg-mu" : ""}`);
    if (!same) s += rect(424, y + 4, 3, h - 11, "fill:var(--nib)");
    y += h;
  });
  y += 14;
  s += rect(0, y - 9, 12, 10, "fill:var(--faint)") + text(18, y, "the same in both", "fg-xs fg-mu") + rect(140, y - 9, 3, 10, "fill:var(--nib)") + text(150, y, "where the two moments part", "fg-xs fg-mu");
  return svg(680, y + 8, "Two moments of seeing the same mango, one where it is wanted and one where it is given away, compared row by row: identical up to the javanas, different from then on", s);
}
