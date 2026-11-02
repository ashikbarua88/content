import { svg, text, rect, wrap, lines } from "./svg.js";
const DIR = [
  ["A", "Mind → mind", "Each citta, as it ceases, gives way to the next; javanas strengthen their successors.", "var(--nama)"],
  ["B", "Mind → mind and matter", "Roots, jhāna and path factors, volition: they steady the citta, its factors and the matter it produces.", "var(--nama-2)"],
  ["C", "Mind → matter", "Later cittas sustain the body that arose before them.", "var(--rupa)"],
  ["D", "Matter → mind", "The eye, already arisen, supports the seeing that follows.", "var(--rupa-mark)"],
  ["E", "Anything → mind", "As object, or as a strong decisive support: concepts, mind, matter, Nibbāna.", "var(--nib)"],
  ["F", "Mind and matter → both", "Arising together, supporting, feeding, controlling, being present.", "var(--muted)"],
];
const SYN = { 2: "object", 9: "decisive support", 13: "kamma", 21: "presence" };
// Plate 8: the 24 conditions, sorted by the direction in which they help.
export function draw({ conditions }) {
  let s = "", y = 6;
  DIR.forEach(([k, title, note, c]) => {
    const list = conditions.filter((x) => x.dir === k);
    s += rect(0, y, 6, 60, `fill:${c}`, { rx: 2 });
    s += text(16, y + 16, title, "fg-m fg-b");
    s += lines(16, y + 32, wrap(note, 38), 13, "fg-xs fg-mu");
    let x = 290, yy = y + 4;
    list.forEach((co) => {
      const w = co.en.length * 6.4 + 46;
      if (x + w > 680) { x = 290; yy += 30; }
      const syn = SYN[co.n];
      s += rect(x, yy, w, 24, syn ? `fill:${c};stroke:${c}` : `fill:var(--sheet);stroke:${c}`, { rx: 12 });
      s += text(x + 10, yy + 16, String(co.n), `fg-xs fg-b ${syn ? "fg-on" : ""}`) + text(x + 30, yy + 16, co.en, `fg-s ${syn ? "fg-on" : ""}`);
      x += w + 6;
    });
    y = Math.max(y + 72, yy + 40);
  });
  s += rect(0, y + 4, 16, 16, "fill:var(--muted)", { rx: 8 }) + text(24, y + 17, "filled: the four into which the Manual folds all twenty-four (object, decisive support, kamma, presence)", "fg-xs fg-mu");
  return svg(680, y + 28, "The 24 conditions in six bands by direction: mind to mind, mind to mind and matter, mind to matter, matter to mind, anything to mind, and mind and matter to both; four are marked as the synthesis", s);
}
