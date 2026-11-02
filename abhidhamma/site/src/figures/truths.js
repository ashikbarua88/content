import { svg, text, rect, wrap, lines } from "./svg.js";
import D from "../data/figures/truths.json";
const TR = { vir: ["virtue", "var(--rupa-mark)"], con: ["concentration", "var(--nama-2)"], wis: ["wisdom", "var(--nib)"] };
// Plate 13b: the four truths with their task and its completion (SN 56.11), and the eight path
// factors named as the mental factors they are, with the training each belongs to.
export function draw() {
  let s = "", y = 22;
  [["THE TRUTH", 0], ["ITS TASK", 200], ["DONE", 360], ["IN THE ABHIDHAMMA", 480]].forEach(([t, x]) => { s += text(x, 12, t, "fg-xs fg-b fg-mu"); });
  D.truths.forEach((t, i) => {
    const ab = wrap(t.abhidhamma, 30), h = Math.max(36, ab.length * 13 + 16);
    s += rect(0, y, 680, h - 4, i === 3 ? "fill:var(--nib-soft)" : "fill:var(--faint)", { rx: 4 });
    s += text(10, y + 16, t.en, "fg-s fg-b") + text(10, y + 29, t.pali, "fg-xs fg-it fg-mu");
    s += text(200, y + 18, t.task, "fg-s") + text(360, y + 18, t.done, "fg-s fg-nb") + lines(480, y + 16, ab, 13, "fg-xs");
    y += h;
  });
  y += 26; s += text(0, y, "THE PATH: EACH FACTOR IS A MENTAL FACTOR", "fg-xs fg-b fg-mu"); y += 10;
  D.path.forEach((p) => {
    const [tr, c] = TR[p.key];
    s += rect(0, y, 4, 24, `fill:${c}`, { rx: 2 });
    s += text(12, y + 16, p.en, "fg-s fg-b") + text(150, y + 16, p.pali, "fg-xs fg-it fg-mu") + text(290, y + 16, "→ " + p.factor, "fg-s") + text(680, y + 16, tr, "fg-xs fg-b", { "text-anchor": "end", style: `fill:${c}` });
    y += 28;
  });
  return svg(680, y + 4, "The four noble truths with their tasks, their completion and what each is in Abhidhamma terms; then the eight path factors, each named as a mental factor and assigned to virtue, concentration or wisdom", s);
}
