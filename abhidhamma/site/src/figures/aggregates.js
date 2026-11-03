import { svg, text, rect, wrap, lines } from "./svg.js";
import D from "../data/figures/aggregates.json";
// Plate 2: the five aggregates of the suttas, recounted as the four ultimate realities.
const REAL = { RU: ["rūpa", "matter · 28 kinds", "var(--rupa-mark)"], CE: ["cetasika", "mental factors · 52", "var(--nama-2)"], CI: ["citta", "consciousness · 89 kinds", "var(--nama)"] };
const H = { rupa: 84, vedana: 48, sanna: 48, sankhara: 104, vinnana: 116 };
export function draw() {
  let s = "", y = 30;
  s += text(0, 14, "THE FIVE AGGREGATES (suttas)", "fg-xs fg-b fg-mu") + text(430, 14, "THE FOUR ULTIMATE REALITIES (Abhidhamma)", "fg-xs fg-b fg-mu");
  const pos = {};
  D.aggregates.forEach((a) => {
    const h = H[a.key], c = REAL[a.real][2];
    s += rect(0, y, 240, h - 6, `fill:${c};opacity:.18;stroke:${c}`, { rx: 6 });
    s += text(12, y + 20, a.en, "fg-m fg-b") + text(12, y + 36, a.pali, "fg-s fg-it fg-mu");
    s += lines(120, y + 20, wrap(`like ${a.simile}`, 18), 13, "fg-xs fg-it fg-mu");
    if (h > 50) s += lines(12, y + 54, wrap(a.count, 30), 13, "fg-xs");
    (pos[a.real] = pos[a.real] || []).push([y, y + h - 6]);
    y += h;
  });
  const order = ["RU", "CE", "CI"];
  order.forEach((k) => {
    const [top] = pos[k][0], bot = pos[k][pos[k].length - 1][1], [pali, en, c] = REAL[k];
    s += rect(430, top, 250, bot - top, `fill:${c}`, { rx: 6 });
    s += text(446, top + 24, pali, "fg-l fg-it fg-on") + text(446, top + 42, en, "fg-s fg-on");
    pos[k].forEach(([a, b]) => { const m = (a + b) / 2; s += `<path d="M244 ${m} C330 ${m} 340 ${(top + bot) / 2} 426 ${(top + bot) / 2}" style="fill:none;stroke:${c};stroke-width:1.6"/>`; });
  });
  s += rect(430, y + 8, 250, 54, "fill:var(--nib-soft);stroke:var(--nib)", { rx: 6 }) + text(446, y + 30, "nibbāna", "fg-l fg-it fg-nb") + text(446, y + 48, "the unconditioned · in no aggregate", "fg-s");
  s += text(0, y + 30, "Feeling and perception are single mental factors, given", "fg-xs fg-mu") + text(0, y + 44, "aggregates of their own; formations are the other fifty.", "fg-xs fg-mu");
  return svg(680, y + 70, "The five aggregates mapped onto the four ultimate realities: form to matter, feeling, perception and formations to the mental factors, consciousness to citta; Nibbāna stands outside the aggregates", s);
}
