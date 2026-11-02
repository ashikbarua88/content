import { rect, text, r1 } from "./svg.js";
// The 89 cittas fall into six blocks; figures that run across all 89 use these to colour columns.
export const BLOCKS = [
  { from: 1, to: 12, name: "unwholesome", style: "fill:var(--bad)" },
  { from: 13, to: 30, name: "rootless", style: "fill:var(--muted)" },
  { from: 31, to: 54, name: "beautiful sense-sphere", style: "fill:var(--nama-2)" },
  { from: 55, to: 69, name: "fine-material", style: "fill:var(--nama)" },
  { from: 70, to: 81, name: "immaterial", style: "fill:var(--kamma)" },
  { from: 82, to: 89, name: "supramundane", style: "fill:var(--nib)" },
];
export const blockOf = (n) => BLOCKS.find((b) => n >= b.from && n <= b.to);
/** A header band naming the six blocks over an 89-column grid starting at x0 with column width cw. */
export function blockBand(x0, cw, y) {
  return BLOCKS.map((b, i) => {
    const x = x0 + (b.from - 1) * cw, w = (b.to - b.from + 1) * cw;
    return rect(x, y, w - 1, 6, b.style, { rx: 1 }) + text(x + w / 2, y - 4 - (i % 2) * 11, b.name, "fg-xs fg-mu", { "text-anchor": "middle" });
  }).join("");
}
// The cells of a process: one per mind-moment, coloured by what it does.
export const MOMENT = {
  bh: ["life-continuum, past", "fill:var(--faint);stroke:var(--line)"],
  b: ["life-continuum", "fill:var(--faint);stroke:var(--line)"],
  bu: ["vibrating, arrested", "fill:var(--faint);stroke:var(--muted)"],
  a: ["life-continuum", "fill:var(--faint);stroke:var(--line)"],
  pa: ["five-door adverting", "fill:var(--sheet);stroke:var(--nama)"],
  ma: ["mind-door adverting", "fill:var(--sheet);stroke:var(--nama)"],
  vi: ["sense consciousness", "fill:var(--nama-soft);stroke:var(--nama)"],
  pr: ["receiving, investigating, determining", "fill:var(--nama-soft);stroke:var(--nama)"],
  ja: ["javana: kamma is made", "fill:var(--nama)"],
  ta: ["registration", "fill:var(--nama-soft);stroke:var(--nama);stroke-dasharray:3 2"],
  pk: ["preliminary work", "fill:var(--nama-2)"],
  up: ["access", "fill:var(--nama-2)"],
  an: ["conformity", "fill:var(--nama-2)"],
  go: ["change of lineage", "fill:var(--nib-soft);stroke:var(--nib)"],
  ap: ["absorption", "fill:var(--kamma)"],
  mg: ["path", "fill:var(--nib)"],
  ph: ["fruition", "fill:var(--nib-soft);stroke:var(--nib)"],
  x: ["cessation: no citta", "fill:none;stroke:var(--muted);stroke-dasharray:2 2"],
  cu: ["death-consciousness", "fill:var(--sheet);stroke:var(--ink)"],
  ps: ["rebirth-linking", "fill:var(--rupa-mark)"],
};
export function strip(x, y, cells, cw = 30, ch = 22, labels = true) {
  return cells.map((c, i) => {
    const [, style] = MOMENT[c] || ["", "fill:var(--faint)"];
    const dark = ["ja", "pk", "up", "an", "ap", "mg", "ps"].includes(c);
    return rect(x + i * cw, y, cw - 3, ch, style, { rx: 4 }) + (labels ? text(x + i * cw + (cw - 3) / 2, y + ch / 2 + 4, c, `fg-xs ${dark ? "fg-on" : "fg-mu"}`, { "text-anchor": "middle" }) : "");
  }).join("");
}
export const fmtYears = (v) => (v >= 1e9 ? `${r1(v / 1e9)} billion` : `${Math.round(v / 1e6)} million`);
