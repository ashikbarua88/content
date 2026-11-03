import { T, text, rect, svg, r1 } from "./svg.js";
import D from "../data/figures/namarupa.json";
// The nāma–rūpa model at a glance: two currents between mind and matter, matter renewing itself, and
// Nibbāna outside both. Words in src/data/figures/namarupa.json.
const head = (x, y, dir, col) => T("polygon", { points: dir > 0 ? `${x},${y} ${x - 9},${y - 5} ${x - 9},${y + 5}` : `${x},${y} ${x + 9},${y - 5} ${x + 9},${y + 5}`, style: `fill:${col}` });
const arc = (x1, x2, y, bow, col, dir) => T("path", { d: `M${x1} ${y} Q${(x1 + x2) / 2} ${y + bow} ${x2} ${y}`, style: `fill:none;stroke:${col};stroke-width:2` }) + head(dir > 0 ? x2 : x1, y, dir, col);
export function draw() {
  const W = 680, L0 = 16, L1 = 200, R0 = 480, R1 = 664, top = 18, h = 300;
  let s = "";
  const box = (x0, x1, b, col, soft) => rect(x0, top, x1 - x0, h, `fill:var(${soft});stroke:var(${col});stroke-width:1.5`, { rx: 14 }) +
    text((x0 + x1) / 2, top + 32, b.t, `fg-m fg-b`, { "text-anchor": "middle", style: `fill:var(${col})` }) +
    b.s.map((l, i) => text((x0 + x1) / 2, top + 56 + i * 17, l, "fg-s fg-mu", { "text-anchor": "middle" })).join("");
  s += box(L0, L1, D.mind, "--nama", "--nama-soft") + box(R0, R1, D.matter, "--rupa", "--rupa-soft");
  // a citta with its factors; a group of matter
  const cx = (L0 + L1) / 2, cy = top + 190;
  s += T("circle", { cx, cy, r: 14, style: "fill:var(--nama)" }) + [...Array(7)].map((_, i) => { const a = i * Math.PI * 2 / 7; return T("circle", { cx: r1(cx + Math.cos(a) * 34), cy: r1(cy + Math.sin(a) * 25), r: 5, style: "fill:var(--nama-2)" }); }).join("");
  const mx = (R0 + R1) / 2;
  s += [...Array(8)].map((_, i) => rect(mx - 28 + (i % 4) * 15, cy - 14 + Math.floor(i / 4) * 15, 12, 12, "fill:var(--rupa-mark)", { rx: 2 })).join("");
  // matter → mind (upper, pointing left) and mind → matter (lower, pointing right); title above each arrow, gloss below
  const lane = (items, y0, col, dir) => items.map((it, i) => { const y = y0 + i * 62;
    return arc(L1 + 8, R0 - 8, y, dir > 0 ? 6 : -6, `var(${col})`, dir) + text(W / 2, y - 11, it.t, "fg-s fg-b", { "text-anchor": "middle" }) + text(W / 2, y + 20, it.s, "fg-xs fg-mu", { "text-anchor": "middle" }); }).join("");
  s += text(W / 2, top + 14, "MATTER → MIND", "fg-xs fg-b fg-rp", { "text-anchor": "middle" }) + lane(D.toMind, top + 52, "--rupa", -1);
  s += text(W / 2, top + 168, "MIND → MATTER", "fg-xs fg-b fg-nm", { "text-anchor": "middle" }) + lane(D.toMatter, top + 206, "--nama", 1);
  // matter renews itself
  const b0 = top + h;
  s += T("path", { d: `M${R1 - 30} ${b0} C${R1 - 10} ${b0 + 34} ${R0 + 10} ${b0 + 34} ${R0 + 30} ${b0 + 3}`, style: "fill:none;stroke:var(--temp);stroke-width:2" }) +
    T("polygon", { points: `${R0 + 30},${b0 + 1} ${R0 + 27},${b0 + 11} ${R0 + 37},${b0 + 8}`, style: "fill:var(--temp)" }) +
    text(mx, b0 + 48, D.loop.t, "fg-s fg-b", { "text-anchor": "middle" }) + text(mx, b0 + 64, D.loop.s, "fg-xs fg-mu", { "text-anchor": "middle" });
  // Nibbāna, outside both, known by mind only as an object
  const ny = b0 + 30, nx = W / 2 - 10, nw = 220;
  s += rect(nx - nw / 2, ny, nw, 50, "fill:var(--nib-soft);stroke:var(--nib);stroke-width:1.5", { rx: 12 }) + text(nx, ny + 21, D.nib.t, "fg-s fg-b fg-nb", { "text-anchor": "middle" }) + text(nx, ny + 38, D.nib.s, "fg-xs fg-mu", { "text-anchor": "middle" });
  s += T("path", { d: `M${nx - nw / 2} ${ny + 25} L${cx} ${ny + 25} L${cx} ${b0 + 12}`, style: "fill:none;stroke:var(--nib);stroke-width:1.5;stroke-dasharray:5 4" }) +
    T("polygon", { points: `${cx},${b0 + 3} ${cx - 5},${b0 + 12} ${cx + 5},${b0 + 12}`, style: "fill:var(--nib)" }) +
    text(L0, ny + 44, D.nibArrow, "fg-xs fg-mu");
  return svg(W, ny + 70, "Mind on the left and matter on the right. Matter gives mind its bases and its objects; mind produces matter, now as mind-born matter and from the past as kamma-born matter; temperature and nutriment keep renewing matter; Nibbāna stands outside both, known only as the object of path and fruition.", s);
}
