import { svg, text, rect, line, wrap, lines } from "./svg.js";
import D from "../data/figures/library.json";
// Plate 1: the canonical shelf of seven books, then the shelves that grew beneath it.
const LAYERS = [
  ["Commentaries", "5th c. CE", ["Atthasālinī", "Sammohavinodanī", "Pañcappakaraṇa-aṭṭhakathā", "Visuddhimagga"]],
  ["Subcommentaries", "after the 5th c.", ["Mūlaṭīkā", "Anuṭīkā"]],
  ["Manuals", "c. 10th–12th c.", ["Abhidhammattha Saṅgaha", "Abhidhammāvatāra", "Vibhāvinī-ṭīkā"]],
  ["Burmese revival", "1890s", ["Paramatthadīpanī (Ledi Sayadaw)"]],
  ["In English", "1949–2010", ["Nyanaponika 1949", "Nārada 1956", "Bodhi (ed.) 1993", "Karunadasa 2010"]],
];
export function draw() {
  let s = "", y = 30;
  s += text(0, 14, "THE CANON · ABHIDHAMMA PIṬAKA · c. 3rd–1st c. BCE", "fg-s fg-b fg-mu");
  const w = 680 / 7;
  D.books.forEach((b, i) => {
    const x = i * w;
    s += rect(x + 3, y, w - 6, 150, `fill:${b.key ? "var(--nama)" : "var(--nama-soft)"};stroke:var(--nama)`, { rx: 4 });
    s += text(x + w / 2, y + 22, String(i + 1), `fg-l fg-b ${b.key ? "fg-on" : "fg-nm"}`, { "text-anchor": "middle" });
    s += lines(x + w / 2, y + 44, wrap(b.pali, 11), 15, `fg-s fg-it ${b.key ? "fg-on" : ""}`, { "text-anchor": "middle" });
    s += lines(x + w / 2, y + 96, wrap(b.en, 13), 13, `fg-xs ${b.key ? "fg-on" : "fg-mu"}`, { "text-anchor": "middle" });
  });
  s += text(0, y + 170, "← analysis: breaking wholes into dhammas", "fg-s fg-nm");
  s += text(680, y + 170, "synthesis: relating them by condition →", "fg-s fg-nm", { "text-anchor": "end" });
  y += 196;
  LAYERS.forEach(([name, when, items]) => {
    s += line(0, y, 680, y, "stroke:var(--line)");
    s += text(0, y + 20, name, "fg-m fg-b"); s += text(0, y + 36, when, "fg-xs fg-mu");
    let x = 160;
    items.forEach((t) => { const tw = t.length * 6.6 + 18; s += rect(x, y + 8, tw, 24, "fill:var(--faint);stroke:var(--line)", { rx: 12 }) + text(x + 9, y + 24, t, "fg-s fg-it"); x += tw + 8; });
    y += 46;
  });
  s += line(0, y, 680, y, "stroke:var(--line)");
  s += text(0, y + 22, "A parallel shelf, in the north: the Sarvāstivāda's seven books, the Mahāvibhāṣā, Vasubandhu's Abhidharmakośa, and Yogācāra's hundred dharmas.", "fg-s fg-mu");
  return svg(680, y + 32, "The Abhidhamma library: the seven canonical books, then the commentaries, subcommentaries, manuals, the Burmese revival and English works, with a parallel northern shelf", s);
}
