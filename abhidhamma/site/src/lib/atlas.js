// The site's shared helpers. Words come from the content collections in src/content/;
// tables (link types, plate titles, chapter references) from src/data/structure.json;
// drawings from the atlas (src/data/pictures.json, made by tools/extract.mjs).
import { getCollection } from "astro:content";
import S from "../data/structure.json";
import PICS from "../data/pictures.json";

export const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
export const u = (p = "") => base + p.replace(/^\//, "");
// index.html is named explicitly: the dev server does not serve folder indexes from public/.
export const atlasUrl = (sheet) => u("atlas/index.html" + (sheet ? "#" + sheet : ""));

export function fold(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
export function slugify(s) { return fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/* ---------- content ---------- */
const byOrder = (a, b) => a.data.order - b.data.order;
const C = (await getCollection("concepts")).sort(byOrder);
const P = await getCollection("parts");
const LV = await getCollection("levels");
const ST = await getCollection("stories");
const GL = await getCollection("glossary");
const LK = await getCollection("links");

export const SLUG = Object.fromEntries(C.map((e) => [e.data.id, e.id]));
const partOf = Object.fromEntries(P.map((p) => [p.id, p.data]));
// The three groups of concepts, and the four parts of the readings.
export const GROUPS = ["what", "unfolds", "way"].map((k) => ({ key: k, t: partOf[k].title, d: partOf[k].desc, ids: C.filter((e) => e.data.part === k).map((e) => e.data.id) }));
export const READING_PARTS = ["what", "unfolds", "way", "back"].map((k) => ({ key: k, t: partOf[k].title, d: partOf[k].desc }));

export const levels = Object.fromEntries(LV.map((l) => [l.data.n, { name: l.data.name, q: l.data.question }]));
// Stories by level, in the shape the pages use: k kind, t title, src source, s story, r reading, q question, p plates.
export const stories = {};
ST.forEach(({ data: s }) => { (stories[s.level] = stories[s.level] || []).push({ k: s.kind, t: s.title, src: s.source, s: s.story, r: s.reading, q: s.question, p: s.plates }); });
export const storyKinds = S.storyKinds;
export const cmaMap = Object.fromEntries(S.cmaMap.map(([p, t, refs]) => [p, { t, refs }]));
export const plates = S.plates;

/* ---------- glossary ---------- */
const norm = (s) => s.toLowerCase().normalize("NFC").replace(/[“”"]/g, "").trim();
export const glossary = GL.map((g) => ({ term: g.data.term, gloss: g.data.gloss, plate: g.data.plate, id: "g-" + g.id }))
  .sort((a, b) => fold(a.term).localeCompare(fold(b.term)));
const G = new Map();
glossary.forEach((g) => { const k = norm(g.term); G.set(k, g); const head = k.split(" · ")[0]; if (!G.has(head)) G.set(head, g); });
export function gloss(term) {
  const k = norm(term);
  return G.get(k) || G.get(k.replace(/s$/, "")) || G.get(k.replace(/ā$/, "a")) || null;
}
// Wrap each italic Pāli word that the glossary knows in a term with its gloss (CSS only, no script).
export function withGlosses(html) {
  return html.replace(/<i>([^<]+)<\/i>/g, (m, w) => { const g = gloss(w); return g ? termHtml(w, g) : m; });
}
export function termHtml(w, g) {
  return '<span class="term" tabindex="0"><i lang="pi">' + w + '</i><span class="gloss" role="tooltip"><b>' + esc(g.term) + "</b> " + esc(g.gloss) + "</span></span>";
}

/* ---------- concepts ---------- */
export const concepts = C.map((e) => {
  const d = e.data;
  return {
    id: d.id, slug: e.id, title: d.title, label: d.label, pali: d.pali, def: d.def,
    long: (e.rendered?.html || "").replace(/^<p>|<\/p>\s*$/g, ""),
    level: d.level, levelName: levels[d.level]?.name, plates: d.plates,
    picture: PICS[d.id], pictureSource: d.pictureSource, canon: d.canon,
    reflect: { q: d.question, a: d.answer },
  };
});
export const concept = (id) => concepts.find((c) => c.id === id);
export const conceptUrl = (id) => u("concepts/" + SLUG[id] + "/");

const LINKS = LK.sort((a, b) => Number(a.id.split("-")[1]) - Number(b.id.split("-")[1])).map((l) => l.data);
export const links = LINKS;
export const linkTypes = S.linkTypes;
export function connections(id) {
  const out = [], inn = [];
  LINKS.forEach((l) => {
    const type = (S.linkTypes[l.type] || [, l.type])[1];
    if (l.from === id) out.push({ other: concept(l.to), label: l.label, text: l.text, type });
    if (l.to === id) inn.push({ other: concept(l.from), label: l.label, text: l.text, type });
  });
  return { out, inn };
}

// Stories whose plates overlap the concept's plates, best overlap first.
export function storiesFor(id, max = 3) {
  const ps = new Set(concept(id).plates.map(String));
  const all = Object.values(stories).flat().map((s) => ({ ...s, hits: (s.p || []).filter((p) => ps.has(String(p))).length }));
  return all.filter((s) => s.hits).sort((a, b) => b.hits - a.hits).slice(0, max);
}

export function plateTitle(p) { return (S.plates[p] && S.plates[p].t) || cmaMap[p]?.t || "Plate " + p; }

// "SN 35.95" → a link to SuttaCentral. References it cannot place are left as text.
export function scLink(ref) {
  return ref.replace(/\b(DN|MN|SN|AN|Ud|It|Dhp|Sn|Thig|Thag) ?(\d+(?:\.\d+)?)/g, (m, b, n) =>
    `<a href="https://suttacentral.net/${b.toLowerCase()}${n}">${m}</a>`);
}
