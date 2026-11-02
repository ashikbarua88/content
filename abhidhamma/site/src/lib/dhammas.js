// Entries for the 52 mental factors, the 28 kinds of matter and the 24 conditions.
// Words come from src/content/dhammas/*.yaml; counts and lists from src/data/structure.json.
import { getCollection } from "astro:content";
import S from "../data/structure.json";
import { u, slugify } from "./atlas.js";

const [F, M, CO, K] = await Promise.all(["factors", "matter", "conditions", "kinds"].map((c) => getCollection(c)));
const kind = Object.fromEntries(K.map((k) => [k.id, k.data]));
const groupTitle = (k, key) => kind[k].groups.find((g) => g.key === key)?.title || key;
const cardOf = (c) => c && { card: [c.characteristic, c.function, c.manifestation, c.proximateCause], notice: c.tryIt };


export const factors = F.map(({ id, data: d }) => ({
  kind: "factors", pali: d.pali, en: d.en, group: d.group, groupName: groupTitle("factors", d.group), slug: id,
  text: d.text, card: cardOf(d.card), n89: S.factorCounts[d.pali]?.n89, n121: S.factorCounts[d.pali]?.n121,
  lists: S.chapter7.flatMap(([name, , , items]) => items.filter((it) => it[2].split(", ").includes(d.pali)).map((it) => ({ list: name, en: it[0], pali: it[1] }))),
  note: ((S.unfixed || []).find(([ps]) => ps.includes(d.pali)) || [])[1],
}));

const ORIGIN = { k: "kamma", c: "mind", u: "temperature", a: "nutriment" };
const MG = kind.matter.groups.map((g) => { const [a, b] = g.key.split("-").map(Number); return { a, b, ...g }; });
export const matter = M.map(({ id, data: d }, i) => {
  const g = MG.find(({ a, b }) => i >= a && i < b);
  return {
    kind: "matter", pali: d.pali, en: d.en, slug: id, text: d.text, card: cardOf(d.card),
    group: g.title, groupNote: g.desc, concrete: i < 18,
    origins: d.origins.split("").map((k) => ORIGIN[k]), inseparable: d.origins === "kcua" && [0, 1, 2, 3, 9, 11, 12, 17].includes(i),
  };
});

const MIXED = Object.fromEntries(S.mixed.filter((m) => m[3]).map((m) => [m[3][0], { cat: m[0], note: m[4] }]));
const SYNTH = { 2: "object", 9: "decisive support", 13: "kamma", 21: "presence" };
export const conditions = CO.sort((a, b) => a.data.n - b.data.n).map(({ id, data: d }) => ({
  kind: "conditions", n: d.n, pali: d.pali, en: d.en, slug: id, text: d.text, group: groupTitle("conditions", d.direction),
  mixed: MIXED[d.n] || null, synthesis: SYNTH[d.n] || null,
}));

const LIST = { factors, matter, conditions };
export const KINDS = Object.fromEntries(Object.entries(kind).map(([k, d]) => [k, {
  t: d.title, short: d.short, pali: d.pali, plate: d.plates[0], plates: d.plates, concept: d.concept, ch: d.chapter, d: d.desc, list: LIST[k],
}]));
export const dhammaUrl = (e) => u(`dhammas/${e.kind}/${e.slug}/`);

// Every entry by its Pāli headword, for linking from the glossary.
const BY = new Map([...factors, ...matter, ...conditions].map((e) => [slugify(e.pali), e]));
export const dhammaFor = (pali) => BY.get(slugify(pali.split(" · ")[0])) || null;
