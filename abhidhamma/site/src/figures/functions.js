import { svg, text, rect, circle } from "./svg.js";
import D from "../data/figures/cittas.json";
import { blockBand, blockOf } from "./common.js";
const ORDER = ["RL", "BH", "AD", "SE", "HE", "SM", "TA", "TO", "RC", "IN", "DT", "JV", "RG", "DE"];
// Plate 3b: which of the fourteen functions each of the 89 cittas can perform.
export function draw() {
  const x0 = 130, cw = 5.8, rh = 22; let s = "", y = 48;
  s += blockBand(x0, cw, 34);
  ORDER.forEach((f, i) => {
    const yy = y + i * rh, n = D.cittas.filter((c) => c[3].split(" ").includes(f)).length;
    if (i % 2) s += rect(0, yy, 680, rh, "fill:var(--faint)");
    s += text(4, yy + 15, D.codes.fn[f], "fg-s");
    D.cittas.forEach((c) => { if (c[3].split(" ").includes(f)) s += circle(x0 + (c[0] - 1) * cw + cw / 2, yy + rh / 2, 2.4, blockOf(c[0]).style); });
    s += text(680, yy + 15, String(n), "fg-xs fg-b fg-mu", { "text-anchor": "end" });
  });
  y += ORDER.length * rh + 18;
  const counts = [1, 2, 3, 4, 5].map((k) => [k, D.cittas.filter((c) => c[3].split(" ").length === k).length]);
  s += text(0, y, "How many jobs each citta does: " + counts.map(([k, n]) => `${n} do ${k}`).join(" · "), "fg-xs fg-mu");
  return svg(680, y + 10, "The 89 cittas in columns against the fourteen functions in rows; a dot marks each function a citta can perform, with the count of cittas per function", s);
}
