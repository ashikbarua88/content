import { svg, text, rect, circle, legend } from "./svg.js";
import D from "../data/figures/cittas.json";
// Plate 3: the 89 cittas, by plane and class, coloured by the feeling each carries.
const FEEL = { J: ["var(--f-joy)", "joy"], E: ["var(--f-eq)", "equanimity"], D: ["var(--f-dis)", "displeasure"], P: ["var(--f-pain)", "bodily pain"], S: ["var(--f-ple)", "bodily pleasure"], V: ["var(--nib-soft)", "as its jhāna"] };
const MANGO = [28, 20, 25, 26, 29, 3];
const PLAN = [
  ["Sense sphere · unwholesome", [["greed-rooted", 1, 8], ["hate-rooted", 9, 10], ["delusion-rooted", 11, 12]]],
  ["Sense sphere · rootless", [["unwholesome results", 13, 19], ["wholesome results", 20, 27], ["functional", 28, 30]]],
  ["Sense sphere · beautiful", [["wholesome", 31, 38], ["resultant", 39, 46], ["functional", 47, 54]]],
  ["Fine-material", [["wholesome", 55, 59], ["resultant", 60, 64], ["functional", 65, 69]]],
  ["Immaterial", [["wholesome", 70, 73], ["resultant", 74, 77], ["functional", 78, 81]]],
  ["Supramundane", [["path", 82, 85], ["fruit", 86, 89]]],
];
export function draw() {
  let s = "", y = 6; const cw = 30, ch = 24;
  PLAN.forEach(([plane, groups]) => {
    s += text(0, y + 14, plane.toUpperCase(), "fg-xs fg-b fg-mu"); y += 22;
    let x = 0;
    groups.forEach(([name, a, b]) => {
      const w = (b - a + 1) * cw;
      if (x + w > 680) { x = 0; y += ch + 26; }
      s += text(x, y + 9, name, "fg-xs fg-mu");
      for (let n = a; n <= b; n++) {
        const c = D.cittas[n - 1], [fill] = FEEL[c[2]] || ["var(--faint)"];
        const cx = x + (n - a) * cw;
        // The feeling fills are the same in both themes, so their numbers keep a fixed ink that reads on them.
        const ink = c[2] === "D" ? "fill:#fff" : c[2] === "V" ? "" : "fill:var(--cell-ink)";
        s += rect(cx, y + 14, cw - 3, ch, `fill:${fill};stroke:var(--line)`, { rx: 4 }) + text(cx + (cw - 3) / 2, y + 30, String(n), "fg-xs", { "text-anchor": "middle", style: ink || undefined });
        if (MANGO.includes(n)) s += rect(cx - 2, y + 12, cw + 1, ch + 4, "fill:none;stroke:var(--ink);stroke-width:1.8", { rx: 5 });
      }
      x += w + 18;
    });
    y += ch + 30;
  });
  y += 4;
  Object.values(FEEL).forEach(([c, name], i) => { const x = (i % 3) * 200, yy = y + Math.floor(i / 3) * 20; s += rect(x, yy - 10, 14, 12, `fill:${c};stroke:var(--line)`, { rx: 2 }) + text(x + 20, yy, name, "fg-xs fg-mu"); });
  y += 44;
  s += rect(0, y - 11, 16, 14, "fill:none;stroke:var(--ink);stroke-width:1.8", { rx: 3 }) + text(22, y, "ringed: the six cittas of the mango moment", "fg-xs fg-mu");
  return svg(680, y + 10, "The 89 kinds of citta as numbered cells, grouped by plane and class and coloured by the feeling each carries; the six cittas of the mango moment are ringed", s);
}
