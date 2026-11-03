import { svg, text, rect, line, wrap, lines } from "./svg.js";
import { strip } from "./common.js";
// Plate 10: the hinge between two lives.
export function draw() {
  let s = "", y = 30; const cw = 52;
  const cells = ["b", "ma", "ja", "ja", "ja", "ja", "ja", "cu", "ps", "b", "b"];
  s += text(0, 16, "near death, the javanas run five times; their impulse is weakened", "fg-xs fg-mu");
  s += strip(14, y, cells, cw, 30, false);
  const NAME = { b: ["life-", "continuum"], ma: ["adverting"], ja: ["javana"], cu: ["death"], ps: ["rebirth-", "linking"] };
  cells.forEach((c, i) => { s += lines(14 + i * cw + (cw - 3) / 2, y + 46, NAME[c], 11, "fg-xxs fg-mu", { "text-anchor": "middle" }); });
  const hx = 14 + 8 * cw - 1.5;
  s += line(hx, y - 14, hx, y + 80, "stroke:var(--ink);stroke-dasharray:4 3");
  s += text(hx - 6, y - 4, "end of one life", "fg-s fg-b", { "text-anchor": "end" }) + text(hx + 6, y - 4, "next life", "fg-s fg-b fg-nm");
  y += 110;
  s += text(0, y, "THE OBJECT OF THE LAST PROCESS, AND OF THE NEW LIFE'S FIRST CITTA", "fg-xs fg-b fg-mu"); y += 8;
  [["kamma", "the deed itself, recalled"], ["sign of kamma", "an image connected with the deed"], ["sign of destiny", "an image of the world about to be entered"]].forEach(([t, d], i) => {
    s += rect(i * 228, y, 220, 50, "fill:var(--faint);stroke:var(--line)", { rx: 6 }) + text(i * 228 + 12, y + 20, t, "fg-s fg-b") + text(i * 228 + 12, y + 37, d, "fg-xs fg-mu");
  });
  y += 64;
  s += lines(0, y, wrap("Nothing passes across. The rebirth-linking citta arises with no gap after death-consciousness, conditioned by the ripening kamma and by the dying citta as proximity, and takes the same object.", 110), 14, "fg-s");
  return svg(680, y + 32, "The last process of a life with five weakened javanas, death-consciousness, then rebirth-linking and the life-continuum in the next life; and the three kinds of object a dying mind may take", s);
}
