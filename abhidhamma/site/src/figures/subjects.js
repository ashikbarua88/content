import { svg, text, rect, circle, legend } from "./svg.js";
import D from "../data/figures/subjects.json";
// Plate 12: the forty meditation subjects, the temperament each suits, and how far each can go.
const COLS = ["access", "1st", "2nd", "3rd", "4th", "5th", "immaterial"];
export function draw() {
  let s = "", y = 30;
  const x0 = 330, cw = 48;
  COLS.forEach((c, i) => { s += text(x0 + i * cw + cw / 2, 20, c, "fg-xs fg-b", { "text-anchor": "middle" }); });
  s += text(x0 + 1 * cw, 8, "jhāna (fivefold count)", "fg-xs fg-mu");
  D.groups.forEach((g) => {
    y += 8; s += text(0, y + 12, `${g.name} · ${g.count}`, "fg-s fg-b"); y += 18;
    g.items.forEach((m, i) => {
      if (i % 2) s += rect(0, y, 680, 18, "fill:var(--faint)");
      const ts = m.temper.split("+");
      ts.forEach((t, j) => { s += circle(14 + j * 9, y + 9, 4.5, `fill:${D.temperaments[t][0]}`); });
      s += text(34, y + 13, m.en, "fg-s");
      const reach = D.reach[m.reach];
      const on = reach[0] === 0 ? (reach[1] === "access" ? [0] : [6]) : reach;
      COLS.forEach((_, c) => {
        const lit = reach[0] === 0 ? on.includes(c) : c >= 1 && c <= 5 && reach.includes(c);
        s += rect(x0 + c * cw + 8, y + 4, cw - 16, 10, lit ? "fill:var(--nama)" : "fill:none;stroke:var(--line)", { rx: 3 });
      });
      y += 18;
    });
  });
  y += 20;
  const T = Object.entries(D.temperaments);
  T.forEach(([, [c, name]], i) => { const x = (i % 4) * 170, yy = y + Math.floor(i / 4) * 18; s += circle(x + 6, yy - 4, 5, `fill:${c}`) + text(x + 16, yy, name, "fg-xs fg-mu"); });
  return svg(680, y + 30, "The forty meditation subjects in seven groups, each with the temperament it suits and how far it can take the mind, from access to the fifth jhāna or the immaterial attainments", s);
}
