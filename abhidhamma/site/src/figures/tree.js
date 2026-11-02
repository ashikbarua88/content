import { svg, text, rect, line, wrap, lines } from "./svg.js";
import D from "../data/figures/tree.json";
// Plate 13: the path of insight as a tree (Visuddhimagga XIV): soil, roots, a trunk of the five
// purifications of wisdom with the insight knowledges beside it, the crown; then the fetters.
export function draw() {
  let s = "", cx = 250, y = 10;
  // crown
  s += rect(cx - 230, y, 460, 66, "fill:var(--nib-soft);stroke:var(--nib)", { rx: 33 });
  s += text(cx, y + 18, "THE CROWN · its object, Nibbāna", "fg-xs fg-b fg-nb", { "text-anchor": "middle" });
  D.crown.forEach((c, i) => { const x = cx - 205 + i * 105; const dark = i === 1 || i === 2; s += rect(x, y + 26, 96, 32, dark ? "fill:var(--nib)" : "fill:var(--sheet);stroke:var(--nib)", { rx: 5 }) + text(x + 48, y + 40, c.t, `fg-xs fg-b ${dark ? "fg-on" : ""}`, { "text-anchor": "middle" }) + text(x + 48, y + 52, c.s, `fg-xs ${dark ? "fg-on" : "fg-mu"}`, { "text-anchor": "middle" }); });
  y += 84;
  // trunk, from the top down: 7 … 3
  const tw = 220;
  [...D.trunk].reverse().forEach((t) => {
    const h = t.knowledges.length > 3 ? 120 : t.knowledges.length ? 52 : 46;
    const top = t.n === "7";
    s += rect(cx - tw / 2, y, tw, h - 4, top ? "fill:var(--nama)" : "fill:var(--nama-soft);stroke:var(--nama)", { rx: 4 });
    s += text(cx, y + 18, `${t.n} · ${t.t}`, `fg-s fg-b ${top ? "fg-on" : ""}`, { "text-anchor": "middle" });
    s += lines(cx, y + 33, wrap(t.s, 34), 12, `fg-xs ${top ? "fg-on" : "fg-mu"}`, { "text-anchor": "middle" });
    if (t.knowledges.length) {
      const lx = cx + tw / 2 + 16;
      s += line(lx - 8, y + 8, lx - 8, y + h - 12, "stroke:var(--muted)");
      t.knowledges.forEach((k, i) => { s += text(lx, y + 14 + i * 13, k, "fg-xs"); });
    }
    y += h;
  });
  s += text(cx - tw / 2 - 12, y - 160, "THE TRUNK", "fg-xs fg-b fg-mu", { "text-anchor": "end" }) + lines(cx - tw / 2 - 12, y - 146, ["purifications 3 to 7:", "wisdom itself"], 12, "fg-xs fg-mu", { "text-anchor": "end" });
  // roots
  y += 6;
  D.roots.forEach((r, i) => { const x = i ? cx + 30 : cx - 230; s += rect(x, y, 200, 40, "fill:var(--sheet);stroke:var(--rupa-mark)", { rx: 20 }) + text(x + 100, y + 17, `${r.n} · ${r.t}`, "fg-s fg-b", { "text-anchor": "middle" }) + text(x + 100, y + 31, r.s, "fg-xs fg-mu", { "text-anchor": "middle" }); });
  y += 52;
  // soil
  s += rect(0, y, 500, 52, "fill:var(--rupa-soft)", { rx: 6 }) + text(10, y + 15, "SOIL · WHAT IS TO BE UNDERSTOOD", "fg-xs fg-b fg-rp");
  D.soil.forEach((t, i) => { const x = 8 + i * 82; s += rect(x, y + 22, 78, 24, "fill:var(--sheet);stroke:var(--rupa-mark)", { rx: 4 }) + lines(x + 39, y + 32, wrap(t, 13), 10, "fg-xs", { "text-anchor": "middle" }); });
  // three doors, right column
  let dy = 120;
  s += text(530, dy, "THREE DOORS", "fg-xs fg-b fg-mu"); dy += 16;
  D.doors.forEach(([mark, door]) => { s += text(530, dy, mark, "fg-s") + text(530, dy + 14, "→ " + door, "fg-s fg-b fg-nb"); dy += 36; });
  y += 72;
  // fetters
  s += text(0, y, "TEN FETTERS AND THE FOUR PATHS", "fg-xs fg-b fg-mu");
  const P = ["stream-entry", "once-return", "non-return", "arahantship"];
  P.forEach((p, i) => { s += text(300 + i * 95, y, p, "fg-xs fg-b", { "text-anchor": "middle" }); });
  y += 8;
  D.fetters.forEach((f, i) => {
    if (i % 2) s += rect(0, y, 680, 18, "fill:var(--faint)");
    s += text(6, y + 13, f.name, "fg-s");
    f.by.forEach((v, j) => {
      if (v === "f") s += rect(300 + j * 95 - 20, y + 4, 40, 10, "fill:var(--nama)", { rx: 2 });
      if (v === "w") s += rect(300 + j * 95 - 20, y + 4, 40, 10, "fill:none;stroke:var(--nama);stroke-dasharray:3 2", { rx: 2 });
    });
    y += 18;
  });
  y += 16;
  s += rect(0, y - 9, 24, 10, "fill:var(--nama)", { rx: 2 }) + text(30, y, "abandoned", "fg-xs fg-mu") + rect(110, y - 9, 24, 10, "fill:none;stroke:var(--nama);stroke-dasharray:3 2", { rx: 2 }) + text(140, y, "weakened", "fg-xs fg-mu");
  return svg(680, y + 10, "The path of insight as a tree: soil of what is to be understood, roots of virtue and mind, a trunk of five purifications with the insight knowledges, a crown of path and fruition; the three doors; and the ten fetters with the path that abandons each", s);
}
