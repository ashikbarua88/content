import { svg, text, rect, line, circle } from "./svg.js";
import D from "../data/figures/planes.json";
import { fmtYears } from "./common.js";
// Plate 11: the 31 planes in four tiers, with lifespans on two log scales: great aeons for the
// Brahmā worlds, human years for the sense heavens.
export function draw() {
  let s = "", y = 44;
  const bx0 = 250, bx1 = 670, rh = 30;
  const xa = (v) => bx0 + ((Math.log10(v) + 1.2) / 6.2) * (bx1 - bx0);
  const xh = (v) => bx0 + ((Math.log10(v) - 6) / 4.2) * (bx1 - bx0);
  s += text(bx0, 14, "LIFESPAN · great aeons, log scale", "fg-xs fg-b fg-mu");
  [0.1, 1, 10, 100, 1000, 10000].forEach((v) => { s += line(xa(v), 22, xa(v), 30) + text(xa(v), 38, v >= 1000 ? `${v / 1000}k` : String(v), "fg-xs fg-mu", { "text-anchor": "middle" }); });
  let tier = "";
  D.planes.forEach((p, i) => {
    if (p.tier !== tier) {
      tier = p.tier;
      if (tier === "Sense heavens") {
        y += 24; s += text(bx0, y - 4, "LIFESPAN · human years, log scale", "fg-xs fg-b fg-mu");
        [1e7, 1e8, 1e9, 1e10].forEach((v, j) => { s += text(xh(v), y + 8, ["10 m", "100 m", "1 bn", "10 bn"][j], "fg-xs fg-mu", { "text-anchor": "middle" }); });
        y += 14;
      }
      y += 8; s += text(0, y + 12, tier.toUpperCase(), "fg-xs fg-b fg-mu"); y += 16;
    }
    if (i % 2) s += rect(0, y, 680, rh, "fill:var(--faint)");
    s += text(26, y + 13, p.pali, "fg-s fg-it"); s += text(26, y + 25, p.en.split(" · ")[0], "fg-xs fg-mu");
    const glyph = p.kind === "N" ? circle(10, y + 15, 5, "fill:var(--nama)") : p.kind === "R" ? rect(5, y + 10, 10, 10, "fill:var(--rupa-mark)") : circle(10, y + 15, 5, "fill:var(--nama)") + rect(10, y + 10, 5, 10, "fill:var(--rupa-mark)");
    s += glyph;
    if (p.aeons) {
      const deva = p.tier === "Sense heavens", x = deva ? xh(p.aeons) : xa(p.aeons);
      s += rect(bx0, y + 8, Math.max(2, x - bx0), rh - 16, `fill:${deva ? "var(--rupa-mark)" : p.tier === "Immaterial" ? "var(--nama)" : "var(--nama-2)"}`, { rx: 2 });
      const label = deva ? `${fmtYears(p.aeons)} yrs` : p.aeons < 1 ? p.en.split("·")[1]?.trim() || String(p.aeons) : p.aeons.toLocaleString("en-US") + " aeons";
      // Outside the bar when there is room; inside, in a colour that reads on that bar, when not.
      const inside = x > 590, onDark = inside && p.tier === "Immaterial";
      s += text(inside ? x - 6 : x + 6, y + 19, label, `fg-xs fg-b ${onDark ? "fg-on" : ""}`, { "text-anchor": inside ? "end" : "start" });
    } else s += text(bx0, y + 19, p.pali === "Manussa" ? "no fixed span: it varies with the age of the world" : "no fixed span", "fg-xs fg-mu");
    y += rh;
  });
  y += 14;
  s += circle(6, y, 5, "fill:var(--nama)") + text(16, y + 4, "mind only", "fg-xs fg-mu");
  s += rect(90, y - 5, 10, 10, "fill:var(--rupa-mark)") + text(106, y + 4, "matter only", "fg-xs fg-mu");
  s += circle(190, y, 5, "fill:var(--nama)") + rect(190, y - 5, 5, 10, "fill:var(--rupa-mark)") + text(202, y + 4, "mind and matter", "fg-xs fg-mu");
  return svg(680, y + 12, "The 31 planes of existence in tiers from the immaterial down to the woeful, each with its lifespan drawn on a log scale", s);
}
