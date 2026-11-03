// Entries for the 52 mental factors, the 28 kinds of matter and the 24 conditions.
// Words come from src/content/dhammas/*.yaml; counts and lists from src/data/structure.json.
import { getCollection } from "astro:content";
import S from "../data/structure.json";
import { u, slugify } from "./atlas.js";
import COMB from "../data/figures/combination.json";
import KAL from "../data/figures/matter.json";
import { BLOCKS } from "../figures/common.js";

const [F, M, CO, K] = await Promise.all(["factors", "matter", "conditions", "kinds"].map((c) => getCollection(c)));
F.sort((a, b) => a.data.order - b.data.order); M.sort((a, b) => a.data.order - b.data.order);
const kind = Object.fromEntries(K.map((k) => [k.id, k.data]));
const groupTitle = (k, key) => kind[k].groups.find((g) => g.key === key)?.title || key;
const cardOf = (c) => c && { card: [c.characteristic, c.function, c.manifestation, c.proximateCause], notice: c.tryIt };


// Where a factor occurs, summarised by class of citta, from its 89-place occurrence string.
const OCC = Object.fromEntries(COMB.rows.map((r) => [r.pali, r.occ]));
function occurrence(pali) {
  const occ = OCC[pali]; if (!occ) return null;
  const parts = BLOCKS.map((b) => {
    const slice = occ.slice(b.from - 1, b.to), n = b.to - b.from + 1;
    const fixed = (slice.match(/F/g) || []).length, may = (slice.match(/[Uj]/g) || []).length, all = fixed + may;
    if (!all) return null;
    return { block: b.name, n, fixed, may, text: `${all === n ? "all " + n : all + " of " + n} ${b.name}${may && !fixed ? " (sometimes)" : may ? ` (${may} sometimes)` : ""}` };
  }).filter(Boolean);
  const never = BLOCKS.filter((b) => !parts.find((p) => p.block === b.name)).map((b) => b.name);
  return { occ, parts, never };
}
// The roles a factor plays in the other lists, and the condition each role becomes.
export const ROLES = {
  root: ["a root", "hetu"], jhana: ["a jhāna factor", "jhana"], path: ["a path factor", "magga"], faculty: ["a faculty", "indriya"],
  power: ["a power", null], predominant: ["a predominant", "adhipati"], nutriment: ["a nutriment", "ahara"], requisite: ["a requisite of enlightenment", null],
};

export const factors = F.map(({ id, data: d }) => ({
  kind: "factors", pali: d.pali, en: d.en, group: d.group, groupName: groupTitle("factors", d.group), slug: id,
  text: d.text, card: cardOf(d.card), n89: S.factorCounts[d.pali]?.n89, n121: S.factorCounts[d.pali]?.n121,
  lists: S.chapter7.flatMap(([name, , , items]) => items.filter((it) => it[2].split(", ").includes(d.pali)).map((it) => ({ list: name, en: it[0], pali: it[1] }))),
  note: ((S.unfixed || []).find(([ps]) => ps.includes(d.pali)) || [])[1],
  occurrence: occurrence(d.pali), roles: d.roles || [], relatedRaw: d.related || [],
}));

const ORIGIN = { k: "kamma", c: "mind", u: "temperature", a: "nutriment" };
const MG = kind.matter.groups.map((g) => { const [a, b] = g.key.split("-").map(Number); return { a, b, ...g }; });
// The groups (kalāpa) each kind of matter belongs to, from the figure's table of the 21 groups.
const KAL_NAME = { life: "jivita", eye: "cakkhu", ear: "sota", nose: "ghana", tongue: "jivha", body: "kaya", "fem.": "itthibhava", "masc.": "purisabhava", heart: "hadaya", "b.int": "kaya-vinnatti", "v.int": "vaci-vinnatti", sound: "sadda", m: ["lahuta", "muduta", "kammannata"] };
function groupsOf(slug, inseparable) {
  if (inseparable) return { all: true, list: [] };
  const list = KAL.kalapas.flatMap((g) => g.rows.filter((r) => r.extra.some((x) => [].concat(KAL_NAME[x] || []).includes(slug))).map((r) => `${r.name} (${g.origin.toLowerCase()})`));
  return { all: false, list };
}
export const matter = M.map(({ id, data: d }, i) => {
  const g = MG.find(({ a, b }) => i >= a && i < b);
  return {
    kind: "matter", pali: d.pali, en: d.en, slug: id, text: d.text, card: cardOf(d.card),
    group: g.title, groupNote: g.desc, concrete: i < 18,
    origins: d.origins.split("").map((k) => ORIGIN[k]), inseparable: d.origins === "kcua" && [0, 1, 2, 3, 9, 11, 12, 17].includes(i),
    relatedRaw: d.related || [],
  };
});

const MIXED = Object.fromEntries(S.mixed.filter((m) => m[3]).map((m) => [m[3][0], { cat: m[0], note: m[4] }]));
const SYNTH = { 2: "object", 9: "decisive support", 13: "kamma", 21: "presence" };
export const conditions = CO.sort((a, b) => a.data.n - b.data.n).map(({ id, data: d }) => ({
  kind: "conditions", n: d.n, pali: d.pali, en: d.en, slug: id, text: d.text, group: groupTitle("conditions", d.direction),
  mixed: MIXED[d.n] || null, synthesis: SYNTH[d.n] || null, dir: d.direction, relatedRaw: d.related || [], ways: d.ways || [],
}));
matter.forEach((m) => { m.kalapas = groupsOf(m.slug, m.inseparable); });

const LIST = { factors, matter, conditions };
export const KINDS = Object.fromEntries(["factors", "matter", "conditions"].map((k) => [k, kind[k]]).map(([k, d]) => [k, {
  t: d.title, short: d.short, pali: d.pali, plate: d.plates[0], plates: d.plates, concept: d.concept, ch: d.chapter, d: d.desc, groups: d.groups, list: LIST[k],
}]));
export const dhammaUrl = (e) => u(`dhammas/${e.kind}/${e.slug}/`);

// Every entry by its Pāli headword, for linking from the glossary.
const BY = new Map([...factors, ...matter, ...conditions].map((e) => [slugify(e.pali), e]));
export const dhammaFor = (pali) => BY.get(slugify(pali.split(" · ")[0])) || null;

// Resolve each entry's related list into the entries themselves.
const ALL = { factors, matter, conditions };
for (const e of [...factors, ...matter, ...conditions]) {
  e.related = e.relatedRaw.map((r) => ({ entry: ALL[r.kind].find((x) => x.slug === r.id), how: r.how })).filter((r) => r.entry);
}
export const conditionBySlug = (slug) => conditions.find((c) => c.slug === slug);

// The readings that use an entry's Pāli headword.
const READINGS = (await getCollection("readings")).sort((a, b) => a.data.order - b.data.order);
// Factors and matter are matched by their Pāli or English name; conditions by Pāli only, since their
// English names (support, presence, object…) are ordinary words.
export function readingsFor(e) {
  const words = [e.pali.split(/[ ·(]/)[0], ...(e.kind === "conditions" ? [] : [e.en])];
  const res = words.map((w) => new RegExp(`(^|[^\\p{L}])${w.replace(/[-]/g, "[- ]?")}(?![\\p{L}])`, "iu"));
  return READINGS.filter((r) => res.some((re) => re.test(r.body || ""))).map((r) => ({ id: r.id, title: r.data.title }));
}
// The first sentence of an entry's text, for lists.
export const gist = (t) => (t.match(/^.*?[.!?](\s|$)/) || [t])[0].trim();
// Which reading draws each list's figure.
export const FIGURE_READING = { factors: ["the-52-factors", "An ensemble of fifty-two"], matter: ["how-matter-is-made", "How matter is made"], conditions: ["the-web-of-conditions", "The web of twenty-four conditions"] };

// An entry's neighbours for its graph: what it names as related, what names it, the conditions its
// roles become, and, for a condition, the factors that become it. At most twelve, nearest first.
const ROLE_COND = Object.fromEntries(Object.entries(ROLES).filter(([, [, c]]) => c).map(([r, [, c]]) => [r, c]));
export const roleCond = ROLE_COND;
export function neighbours(e) {
  const out = new Map(), key = (x) => x.kind + ":" + x.slug, short = (h) => h.replace(/^(its|a|an|the) /, "").split(/[:,]/)[0].split(" ").slice(0, 5).join(" ");
  const add = (entry, how) => { if (entry && entry !== e && !out.has(key(entry))) out.set(key(entry), { entry, short: short(how) }); };
  e.related.forEach((r) => add(r.entry, r.how));
  if (e.kind === "factors") e.roles.forEach((r) => ROLE_COND[r] && add(conditionBySlug(ROLE_COND[r]), "as " + ROLES[r][0]));
  if (e.kind === "conditions") factors.forEach((f) => f.roles.forEach((r) => ROLE_COND[r] === e.slug && add(f, ROLES[r][0])));
  // Entries that name this one: keep their wording only when it reads the same both ways.
  const SYM = /opposite|partner|counterpart|fellow|same/;
  for (const x of [...factors, ...matter, ...conditions]) x.related.forEach((r) => { if (r.entry === e) add(x, SYM.test(r.how) ? r.how : "related"); });
  return [...out.values()].slice(0, 12);
}
