// Small helpers for drawing the site's figures as svg strings, at build time.
// Colours come only from the CSS tokens (var(--nama) …), so every figure follows light, dark and print.
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => ` ${k}="${esc(v)}"`).join("");
export const T = (tag, o = {}, inner) => (inner === undefined ? `<${tag}${attrs(o)}/>` : `<${tag}${attrs(o)}>${inner}</${tag}>`);
export const r1 = (n) => Math.round(n * 10) / 10;
/** text(x, y, string, class, extra attributes) — the string is escaped. */
export const text = (x, y, s, cls = "fg-s", o = {}) => T("text", { x: r1(x), y: r1(y), class: cls, ...o }, esc(s));
export const rect = (x, y, w, h, style, o = {}) => T("rect", { x: r1(x), y: r1(y), width: r1(w), height: r1(h), style, ...o });
export const line = (x1, y1, x2, y2, style = "stroke:var(--line)") => T("line", { x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2), style });
export const circle = (cx, cy, r, style) => T("circle", { cx: r1(cx), cy: r1(cy), r: r1(r), style });
/** Split a string into lines of at most `n` characters, on spaces. */
export function wrap(s, n) {
  const out = []; let cur = "";
  for (const w of String(s).split(" ")) { if ((cur + " " + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) out.push(cur); return out;
}
export const lines = (x, y, arr, lh, cls, o) => arr.map((s, i) => text(x, y + i * lh, s, cls, o)).join("");
/** The outer svg. `label` is the figure's description for screen readers. */
export const svg = (w, h, label, body) => `<svg class="fig" viewBox="0 0 ${w} ${r1(h)}" role="img" aria-label="${esc(label)}">${body}</svg>`;
export const legend = (x, y, items) => items.map(([style, label], i) => rect(x + i * 150, y - 9, 11, 11, style, { rx: 2 }) + text(x + i * 150 + 16, y, label, "fg-s fg-mu")).join("");
