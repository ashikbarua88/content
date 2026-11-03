import { svg, text, circle } from "./svg.js";
// Plate 6: Visuddhimagga XIV's heap of coins: a child, a villager and a money-changer look at the
// same coins, as perception, consciousness and understanding know the same object.
const P = [
  ["A child", "sees shapes and colours", "saññā · perception", "notes the surface"],
  ["A villager", "knows they are money", "viññāṇa · consciousness", "knows the object as such"],
  ["A money-changer", "knows true from false, where struck", "paññā · understanding", "penetrates its nature"],
];
export function draw() {
  let s = "";
  P.forEach(([who, sees, term, gloss], i) => {
    const x = 20 + i * 225, sc = 0.8 + i * 0.12;
    s += circle(x + 40, 40, 13 * sc, "fill:none;stroke:var(--nama);stroke-width:2");
    s += `<path d="M${x + 40 - 22 * sc} ${100} Q${x + 40} ${50 + 4 * i} ${x + 40 + 22 * sc} 100" style="fill:none;stroke:var(--nama);stroke-width:2"/>`;
    for (let k = 0; k < 4; k++) s += `<ellipse cx="${x + 70 + k * 9}" cy="${112 - k * 3}" rx="12" ry="4" style="fill:var(--rupa-mark);stroke:var(--rupa)"/>`;
    s += `<path d="M${x + 52} 44 L${x + 76} ${100}" style="stroke:var(--muted);stroke-dasharray:${i === 2 ? "none" : i === 1 ? "4 2" : "1 3"}"/>`;
    s += text(x, 140, who, "fg-m fg-b") + text(x, 156, sees, "fg-xs fg-mu") + text(x, 178, term, "fg-s fg-it fg-nm") + text(x, 193, gloss, "fg-xs");
  });
  return svg(680, 204, "Three people look at a heap of coins: a child sees shapes, as perception notes the surface; a villager knows they are money, as consciousness knows the object; a money-changer knows the true from the false, as understanding penetrates its nature", s);
}
