import { svg, text, circle } from "./svg.js";
import D from "../data/figures/wheel.json";
// Plate 9: the twelve links on a ring, coloured by round, with the three periods around them.
const ROUND = { D: ["var(--bad)", "defilement"], K: ["var(--kamma)", "kamma"], R: ["var(--nama-2)", "result"] };
export function draw() {
  let s = ""; const cx = 300, cy = 250, R = 170;
  const at = (i, r = R) => { const a = -Math.PI / 2 + (i / 12) * 2 * Math.PI; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const arc = (i0, i1, r, col, label) => {
    const [x0, y0] = at(i0 - 0.45, r), [x1, y1] = at(i1 + 0.45, r), big = i1 - i0 + 0.9 > 6 ? 1 : 0, [lx, ly] = at((i0 + i1) / 2, r + 22);
    return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${big} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" style="fill:none;stroke:${col};stroke-width:6;stroke-linecap:round;opacity:.5"/>` + text(lx, ly + 4, label, "fg-s fg-b", { "text-anchor": "middle" });
  };
  s += arc(0, 1, R + 40, "var(--muted)", "past") + arc(2, 9, R + 40, "var(--ink)", "present") + arc(10, 11, R + 40, "var(--muted)", "future");
  s += circle(cx, cy, R, "fill:none;stroke:var(--line);stroke-dasharray:3 4");
  D.links.forEach((l, i) => {
    const [x, y] = at(i), cols = l.round.split("").map((k) => ROUND[k][0]);
    s += circle(x, y, 30, `fill:${cols[0]};opacity:.9`);
    if (cols[1]) s += `<path d="M${x} ${y - 30} A30 30 0 0 1 ${x} ${y + 30} Z" style="fill:${cols[1]}"/>`;
    s += text(x, y - 4, String(l.n), "fg-s fg-b fg-on", { "text-anchor": "middle" }) + text(x, y + 10, l.en.split(" ")[0], "fg-xxs fg-on", { "text-anchor": "middle" });
  });
  s += text(cx, cy - 12, "two roots", "fg-s fg-b", { "text-anchor": "middle" }) + text(cx, cy + 6, "ignorance, from the past", "fg-xs", { "text-anchor": "middle" }) + text(cx, cy + 20, "craving, into the future", "fg-xs", { "text-anchor": "middle" });
  let y = 30;
  s += text(530, y, "THE TWELVE", "fg-xs fg-b fg-mu");
  D.links.forEach((l) => { y += 17; s += text(530, y, `${l.n}. ${l.en}`, "fg-xs") ; });
  y += 30; s += text(530, y, "THREE ROUNDS", "fg-xs fg-b fg-mu");
  Object.values(ROUND).forEach(([c, n]) => { y += 18; s += circle(536, y - 4, 6, `fill:${c}`) + text(548, y, n, "fg-xs"); });
  return svg(680, 500, "The twelve links of dependent origination on a ring, coloured by the round each belongs to, defilement, kamma or result, with arcs for the past, present and future lives and the two roots at the centre", s);
}
