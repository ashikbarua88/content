import { T, text, r1, esc } from "./svg.js";
// Graphs of how dhammas connect. Nodes are links to their entries, so the svg is a group, not an image.
export const KCOL = { factors: "var(--nama)", matter: "var(--rupa)", conditions: "var(--nib)" };
export const COND_COL = { hetu: "var(--bad)", jhana: "var(--kamma)", magga: "var(--nib)", indriya: "var(--nama)", adhipati: "var(--g4)", ahara: "var(--rupa)", kamma: "var(--g3)", purejata: "var(--rupa-mark)", nissaya: "var(--muted)", arammana: "var(--g2)" };
const pill = (x, y, w, label, sub, col, href, anchor = "start", strong = false, id = null) => {
  const x0 = anchor === "end" ? x - w : anchor === "middle" ? x - w / 2 : x;
  return T("a", { href, class: "gnode", ...(id ? { "data-id": id } : {}) },
    T("rect", { x: r1(x0), y: r1(y - 12), width: r1(w), height: 24, rx: 12, style: strong ? `fill:${col}` : `fill:var(--sheet);stroke:${col};stroke-width:1.4` }) +
    text(x0 + 10, y + 4, label, `fg-s fg-it ${strong ? "fg-on" : ""}`) + (sub ? text(x0 + w - 8, y + 4, sub, `fg-xxs ${strong ? "fg-on" : "fg-mu"}`, { "text-anchor": "end" }) : ""));
};
const wOf = (a, b = "") => Math.max(84, a.length * 7.2 + b.length * 5 + 34);
const curve = (x1, y1, x2, y2, col, a, b) => T("path", { class: "gedge", "data-a": a, "data-b": b, d: `M${r1(x1)} ${r1(y1)} C${r1((x1 + x2) / 2)} ${r1(y1)} ${r1((x1 + x2) / 2)} ${r1(y2)} ${r1(x2)} ${r1(y2)}`, style: `fill:none;stroke:${col};stroke-width:1.3;opacity:.7` });
export const gsvg = (w, h, label, body, attrs = "") => `<svg class="fig graph"${attrs} viewBox="0 0 ${w} ${r1(h)}" role="group" aria-label="${esc(label)}">${body}</svg>`;

/** The three lists, joined through the conditions their members become. */
export function listsGraph({ factors, matter, conditions, roleCond, url }) {
  const nid = (e) => `${e.kind[0]}-${e.slug}`;
  const condIds = ["hetu", "jhana", "magga", "indriya", "adhipati", "ahara", "kamma", "purejata", "nissaya"];
  const conds = condIds.map((id) => conditions.find((c) => c.slug === id)).filter(Boolean);
  const edges = [];
  factors.forEach((f) => { f.roles.forEach((r) => { if (roleCond[r]) edges.push([f, roleCond[r]]); }); f.related.forEach((r) => { if (r.entry.kind === "conditions" && condIds.includes(r.entry.slug)) edges.push([f, r.entry.slug]); }); });
  matter.forEach((m) => m.related.forEach((r) => { if (r.entry.kind === "conditions" && condIds.includes(r.entry.slug)) edges.push([m, r.entry.slug]); }));
  const L = [...new Set(edges.filter(([e]) => e.kind === "factors").map(([e]) => e))], R = [...new Set(edges.filter(([e]) => e.kind === "matter").map(([e]) => e))];
  const rh = 28, top = 40, h = Math.max(L.length, R.length, conds.length * 2) * rh + top + 20;
  const yL = (i) => top + i * rh + (h - top - L.length * rh) / 2, yR = (i) => top + i * rh + (h - top - R.length * rh) / 2, yC = (i) => top + i * ((h - top - 20) / conds.length) + 14;
  let s = text(0, 16, "MENTAL FACTORS", "fg-xs fg-b fg-mu") + text(340, 16, "THE CONDITIONS THEY BECOME", "fg-xs fg-b fg-mu", { "text-anchor": "middle" }) + text(680, 16, "MATTER", "fg-xs fg-b fg-mu", { "text-anchor": "end" });
  edges.forEach(([e, c]) => {
    const ci = conds.findIndex((x) => x.slug === c), col = COND_COL[c] || "var(--muted)";
    if (e.kind === "factors") s += curve(172, yL(L.indexOf(e)), 262, yC(ci), col, nid(e), `c-${c}`);
    else s += curve(418, yC(ci), 520, yR(R.indexOf(e)), col, `c-${c}`, nid(e));
  });
  L.forEach((f, i) => { s += pill(0, yL(i), 170, f.pali, f.en, KCOL.factors, url(f), "start", false, nid(f)); });
  conds.forEach((c, i) => { s += pill(340, yC(i), 156, `${c.n}. ${c.en}`, "", COND_COL[c.slug] || "var(--nib)", url(c), "middle", true, nid(c)); });
  R.forEach((m, i) => { s += pill(680, yR(i), 158, m.pali, m.en, KCOL.matter, url(m), "end", false, nid(m)); });
  return gsvg(680, h, "How the three lists connect: mental factors on the left and kinds of matter on the right, each joined to the conditions they become in the middle. Every name links to its entry.", s, " data-hover");
}

/** One entry at the centre, its neighbours around it. */
export function egoGraph(center, neighbours, url) {
  const W = 680, n = neighbours.length, cx = W / 2, rx = 250, ry = n > 8 ? 150 : 115, cy = ry + 34;
  let s = "";
  neighbours.forEach((nb, i) => {
    const a = -Math.PI / 2 + (i / n) * 2 * Math.PI, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    nb._x = x; nb._y = y;
    s += T("line", { x1: cx, y1: cy, x2: r1(x), y2: r1(y), style: `stroke:${KCOL[nb.entry.kind]};stroke-width:1.2;opacity:.55` });
  });
  neighbours.forEach((nb) => {
    const en = nb.entry.en.length > 18 ? nb.entry.en.slice(0, 17) + "…" : nb.entry.en;
    const w = wOf(nb.entry.pali, en), x = Math.min(W - w / 2 - 2, Math.max(w / 2 + 2, nb._x));
    s += pill(x, nb._y, w, nb.entry.pali, en, KCOL[nb.entry.kind], url(nb.entry), "middle");
    s += text(x, nb._y + 24, nb.short, "fg-xxs fg-mu", { "text-anchor": "middle" });
  });
  const cw = wOf(center.pali) + 20;
  s += T("rect", { x: r1(cx - cw / 2), y: cy - 16, width: r1(cw), height: 32, rx: 16, style: `fill:${KCOL[center.kind]}` }) + text(cx, cy + 5, center.pali, "fg-m fg-it fg-on", { "text-anchor": "middle" });
  return gsvg(W, cy * 2 + 10, `${center.en} at the centre, joined to the ${n} entries it connects with. Each name links to its entry.`, s);
}
