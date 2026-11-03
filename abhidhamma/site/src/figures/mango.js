import { svg, text, rect, wrap, lines } from "./svg.js";
import D from "../data/figures/mango.json";
import { strip } from "./common.js";
// Plate 7: the mango simile laid along the seventeen moments of a process of seeing.
export function draw() {
  let s = "", y = 4; const cw = 680 / 18;
  const cells = D.moments.flatMap((m) => Array.from({ length: m.to - m.from + 1 }, () => m.kind));
  cells.forEach((_, i) => { s += text(i * cw + (cw - 3) / 2, y + 12, String(i + 1 <= 17 ? i + 1 : ""), "fg-xs fg-mu", { "text-anchor": "middle" }); });
  y += 18; s += strip(0, y, cells, cw, 26, false); y += 40;
  D.moments.forEach((m, i) => {
    const x0 = (m.from - 1) * cw, w = (m.to - m.from + 1) * cw - 3;
    const job = m.job.toLowerCase(), isK = m.kind === "ja", isF = m.kind === "pa" || /determining/.test(job);
    const kind = isK ? "makes kamma" : isF ? "functional: acts, no result" : "a result of past kamma";
    const sim = wrap(m.simile.replace(" †", ""), 52), h = Math.max(40, sim.length * 13 + 20);
    if (i % 2 === 0) s += rect(0, y, 680, h, "fill:var(--faint)", { rx: 3 });
    s += rect(x0, y + 4, w, 5, isK ? "fill:var(--nama)" : "fill:var(--nama-2)", { rx: 2 });
    s += text(4, y + 24, `${m.from === m.to ? m.from : `${m.from}–${m.to}`} · ${m.job}`, "fg-s fg-b") + text(4, y + 37, `#${m.citta} · ${kind}`, "fg-xs fg-mu");
    s += lines(300, y + 24, sim, 13, `fg-s fg-it ${m.added ? "fg-mu" : ""}`);
    y += h + 2;
  });
  s += text(0, y + 16, "Swallowing and lying down again (grey) were added by later teachers, such as the Vibhāvinī-ṭīkā.", "fg-xs fg-mu");
  return svg(680, y + 24, "The seventeen mind-moments of seeing a mango, drawn as a strip, then each stage with its job, its citta and the matching step of the simile: asleep, waking, seeing, taking, squeezing, smelling, eating, swallowing", s);
}
