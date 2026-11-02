// Everything the site knows about the atlas, read from the JSON that tools/extract.mjs saves.
import D from "../data/atlas.json";
import PICS from "../data/pictures.json";
import SRC from "../data/sources.json";
import { reflections } from "./reflect.js";

export const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
export const u = (p = "") => base + p.replace(/^\//, "");
export const atlasUrl = (sheet) => u("atlas/" + (sheet ? "#" + sheet : ""));

export const SLUG = { T: "two-truths", CE: "cetasika", CI: "citta", RU: "rupa", NB: "nibbana", BH: "bhavanga",
  PR: "cognitive-process", JV: "javana", CO: "conditions", DO: "dependent-origination", RB: "death-and-rebirth",
  PL: "planes", KA: "kamma", SA: "calm-and-jhana", VI: "insight", PA: "path-and-fruit" };

// The three doors of the home page and the concept index.
export const GROUPS = [
  { t: "What there is", d: "The realities the analysis ends in.", ids: ["T", "CI", "CE", "RU", "NB"] },
  { t: "How it unfolds", d: "Moments, processes, conditions and lives.", ids: ["BH", "PR", "JV", "CO", "DO", "KA", "RB", "PL"] },
  { t: "The way out", d: "Calm, insight, and the moment of the path.", ids: ["SA", "VI", "PA"] },
];

// Readings add a fourth part: the two plates that look back over the whole.
export const READING_PARTS = [...GROUPS, { t: "Looking back", d: "One moment through every lens, and other schools' maps." }];

export const levels = D.levels;
export const stories = D.stories;
export const storyKinds = D.storyKinds;
export const cmaMap = Object.fromEntries(D.cmaMap.map(([p, t, refs]) => [p, { t, refs }]));
export const plates = D.plates;

/* ---------- glossary ---------- */
const norm = (s) => s.toLowerCase().normalize("NFC").replace(/[“”"]/g, "").trim();
export const glossary = [...D.glossary, ...D.glossaryExtra]
  .map(([term, gloss, plate]) => ({ term, gloss, plate, id: "g-" + slugify(term) }))
  .sort((a, b) => fold(a.term).localeCompare(fold(b.term)));
const G = new Map();
glossary.forEach((g) => { const k = norm(g.term); G.set(k, g); const head = k.split(" · ")[0]; if (!G.has(head)) G.set(head, g); });
export function gloss(term) {
  const k = norm(term);
  return G.get(k) || G.get(k.replace(/s$/, "")) || G.get(k.replace(/ā$/, "a")) || null;
}
export function fold(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
export function slugify(s) { return fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Wrap each italic Pāli word that the glossary knows in a term with its gloss (CSS only, no script).
export function withGlosses(html) {
  return html.replace(/<i>([^<]+)<\/i>/g, (m, w) => {
    const g = gloss(w);
    return g ? termHtml(w, g) : m;
  });
}
export function termHtml(w, g) {
  return '<span class="term" tabindex="0"><i lang="pi">' + w + '</i><span class="gloss" role="tooltip"><b>' + esc(g.term) + "</b> " + esc(g.gloss) + "</span></span>";
}

/* ---------- concepts ---------- */
const byId = Object.fromEntries(D.ideas.map((n) => [n.id, n]));
export const concepts = D.ideas.map((n) => ({
  id: n.id, slug: SLUG[n.id], title: n.t.split(" · ")[0], label: n.t, pali: n.s, def: n.d, long: n.long || n.d,
  level: n.lv, levelName: D.levels[n.lv]?.name, plates: n.p,
  picture: PICS[n.id], pictureSource: SRC.picture[n.id], canon: SRC.canon[n.id],
  reflect: reflections[n.id],
}));
export const concept = (id) => concepts.find((c) => c.id === id);
export const conceptUrl = (id) => u("concepts/" + SLUG[id] + "/");

export function connections(id) {
  const out = [], inn = [];
  D.links.forEach((l, i) => {
    if (l.from === id) out.push({ other: concept(l.to), label: l.label, text: l.text, type: (D.linkTypes[l.type] || [, l.type])[1] });
    if (l.to === id) inn.push({ other: concept(l.from), label: l.label, text: l.text, type: (D.linkTypes[l.type] || [, l.type])[1] });
  });
  return { out, inn };
}

// Stories whose plates overlap the concept's plates, best overlap first.
export function storiesFor(id, max = 3) {
  const ps = new Set(byId[id].p.map(String));
  const all = Object.values(D.stories).flat().map((s) => ({ ...s, hits: (s.p || []).filter((p) => ps.has(String(p))).length }));
  return all.filter((s) => s.hits).sort((a, b) => b.hits - a.hits).slice(0, max);
}

export function plateTitle(p) { return (D.plates[p] && D.plates[p].t) || cmaMap[p]?.t || "Plate " + p; }

// "SN 35.95" → a link to SuttaCentral. References it cannot place are left as text.
export function scLink(ref) {
  return ref.replace(/\b(DN|MN|SN|AN|Ud|It|Dhp|Sn|Thig|Thag) ?(\d+(?:\.\d+)?)/g, (m, b, n) =>
    `<a href="https://suttacentral.net/${b.toLowerCase()}${n}">${m}</a>`);
}
