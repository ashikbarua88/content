import { svg, text, rect, wrap, lines } from "./svg.js";
import D from "../data/figures/results.json";
// Plate 10b: each kind of kamma, the rebirth-linking citta it can give, and where that rebirth is.
export function draw() {
  let s = "", y = 22;
  [["KAMMA", 0], ["REBIRTH-LINKING CITTA", 250], ["WHERE", 470]].forEach(([t, x]) => { s += text(x, 12, t, "fg-xs fg-b fg-mu"); });
  D.rows.forEach((r) => {
    const a = wrap(r.cittas, 34), b = wrap(r.rebirthName, 28), c = wrap(r.planes, 30);
    const h = Math.max(a.length, b.length, c.length) * 13 + 30;
    s += rect(0, y, 4, h - 8, `fill:var(${r.colour})`, { rx: 2 });
    s += text(12, y + 14, r.kamma, "fg-s fg-b") + lines(12, y + 28, a, 13, "fg-xs fg-mu");
    s += text(232, y + 16, "→", "fg-m fg-mu");
    s += text(250, y + 14, "#" + r.rebirth, "fg-s fg-b fg-nm") + lines(250, y + 28, b, 13, "fg-xs");
    s += text(452, y + 16, "→", "fg-m fg-mu");
    s += lines(470, y + 14, c, 13, "fg-s");
    y += h;
  });
  return svg(680, y, "Each kind of kamma matched to the rebirth-linking citta it can give and the planes where that rebirth takes place", s);
}
