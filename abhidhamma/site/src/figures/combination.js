import { svg, text, rect, circle, legend } from "./svg.js";
import D from "../data/figures/combination.json";
import { blockBand } from "./common.js";
// Plate 4b: the 52 mental factors (rows) against the 89 cittas (columns): read across for the
// method of association, down for the method of combination.
const GROUP = { universal: "UNIVERSALS", occasional: "OCCASIONALS", unwholesome: "UNWHOLESOME", beautiful: "BEAUTIFUL" };
export function draw() {
  const x0 = 170, cw = 5.6, rh = 11; let s = "", y = 46, g = "";
  s += blockBand(x0, cw, 32);
  D.rows.forEach((r, i) => {
    if (r.group !== g) { g = r.group; y += 6; s += text(0, y + 8, GROUP[g], "fg-xs fg-b fg-mu"); y += 11; }
    if (i % 2) s += rect(0, y, 680, rh, "fill:var(--faint)");
    s += text(6, y + 9, r.en, "fg-xxs");
    [...r.occ].forEach((ch, k) => {
      const cx = x0 + k * cw + cw / 2, cy = y + rh / 2;
      if (ch === "F") s += circle(cx, cy, 2.1, r.group === "unwholesome" ? "fill:var(--bad)" : r.group === "beautiful" ? "fill:var(--nib)" : "fill:var(--nama)");
      else if (ch === "U") s += circle(cx, cy, 1.9, "fill:none;stroke:var(--ink);stroke-width:.8");
      else if (ch === "j") s += circle(cx, cy, 1.9, "fill:var(--nama-2)");
    });
    y += rh;
  });
  y += 22;
  s += legend(0, y, [["fill:var(--nama)", "always present"], ["fill:none;stroke:var(--ink)", "may be present"], ["fill:var(--nama-2)", "by jhāna level"]]);
  return svg(680, y + 10, "A table of the 52 mental factors against the 89 cittas, a dot where a factor occurs: always, sometimes, or depending on the jhāna; the unwholesome and beautiful factors never share a column", s);
}
