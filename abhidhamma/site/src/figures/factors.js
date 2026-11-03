import { svg, text, rect } from "./svg.js";
import D from "../data/figures/combination.json";
// Plate 4: the 52 mental factors as an ensemble, in their families and subgroups, each with the
// number of the 89 cittas it can join.
const SUB = {
  universal: [["the seven universals", 7]], occasional: [["the six occasionals", 6]],
  unwholesome: [["in every unwholesome citta", 4], ["the greed group", 3], ["the hatred group", 4], ["sloth and torpor", 2], ["doubt", 1]],
  beautiful: [["in every beautiful citta", 19], ["abstinences", 3], ["illimitables", 2], ["wisdom", 1]],
};
const COL = { universal: "var(--nama)", occasional: "var(--nama-2)", unwholesome: "var(--bad)", beautiful: "var(--nib)" };
export function draw({ structure }) {
  let s = "", y = 8; const bx = 300, bw = 340, rh = 14;
  s += text(bx, y + 8, "cittas it can join, of 89", "fg-xs fg-b fg-mu"); y += 14;
  let i = 0;
  Object.entries(SUB).forEach(([fam, subs]) => {
    y += 10; s += text(0, y + 12, fam.toUpperCase(), "fg-s fg-b", { style: `fill:${COL[fam]}` }); y += 18;
    subs.forEach(([name, n]) => {
      s += text(10, y + 10, name, "fg-xs fg-it fg-mu"); y += 13;
      for (let k = 0; k < n; k++, i++) {
        const r = D.rows[i], c = structure.factorCounts[r.pali]?.n89 || 0;
        s += text(20, y + 10, r.en, "fg-xs") + text(160, y + 10, r.pali, "fg-xs fg-it fg-mu");
        s += rect(bx, y + 2, bw, rh - 5, "fill:var(--faint)", { rx: 2 }) + rect(bx, y + 2, (bw * c) / 89, rh - 5, `fill:${COL[fam]}`, { rx: 2 });
        s += text(bx + bw + 6, y + 10, String(c), "fg-xs fg-mu");
        y += rh;
      }
    });
  });
  return svg(680, y + 8, "The 52 mental factors in four families and their subgroups, each with a bar for how many of the 89 cittas it can join", s);
}
