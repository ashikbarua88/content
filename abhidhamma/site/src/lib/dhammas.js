// Entries for the 52 mental factors, the 28 kinds of matter and the 24 conditions:
// the descriptions from dhamma-text.js, with counts, origins and lists from the atlas data.
import D from "../data/atlas.json";
import L from "../data/lists.json";
import { FACTOR_TEXT, MATTER_TEXT, CONDITION_TEXT } from "./dhamma-text.js";
import { u, slugify } from "./atlas.js";

const CARD = Object.fromEntries(D.dhammas.map((d) => [d.pali.split("-")[0], d]));
const cardFor = (pali) => CARD[pali] || CARD[pali.split("-")[0]] || null;

const FACTOR_GROUP = {
  universal: ["Universals", "Present in every citta, whatever its kind."],
  occasional: ["Occasionals", "Present in many cittas but not all; ethically neutral, they take the colour of the citta."],
  unwholesome: ["Unwholesome factors", "Found only in the twelve unwholesome cittas."],
  beautiful: ["Beautiful factors", "Found only in beautiful cittas, never with an unwholesome factor."],
};
const lists = D.sheet8b.cats;
const unfixed = D.sheet4b.unfixed || [];

export const factors = D.sheet4b.rows.map(([pali, en, group, , n89, n121]) => ({
  kind: "factors", pali, en, group, groupName: FACTOR_GROUP[group][0], slug: slugify(pali),
  text: FACTOR_TEXT[pali], n89, n121, card: cardFor(pali),
  lists: lists.flatMap(([name, , , items]) => items.filter((it) => it[2].split(", ").includes(pali)).map((it) => ({ list: name, en: it[0], pali: it[1] }))),
  note: (unfixed.find(([ps]) => ps.includes(pali)) || [])[1],
}));

const ORIGIN = { k: "kamma", c: "mind", u: "temperature", a: "nutriment" };
const MATTER_GROUP = [
  [0, 4, "Great elements", "The four primary qualities on which all other matter depends."],
  [4, 9, "Sensitive matter", "The five sense faculties, which objects can strike."],
  [9, 13, "Objective matter", "The objects of four senses; touch is three of the great elements."],
  [13, 15, "Sex", "The two faculties of femininity and masculinity."],
  [15, 16, "Heart", "The physical base of mind-consciousness, in the commentaries."],
  [16, 17, "Life", "The faculty that sustains kamma-born matter."],
  [17, 18, "Nutriment", "The nourishment in matter."],
  [18, 19, "Limiting", "Space, which separates groups of matter."],
  [19, 21, "Communicating", "The two intimations, of body and of speech."],
  [21, 24, "Mutable", "The qualities of healthy, workable matter."],
  [24, 28, "Characteristics", "The four marks of matter's life: arising, continuing, ageing, ending."],
];
export const matter = L.matter.map(([pali, en, o], i) => {
  const g = MATTER_GROUP.find(([a, b]) => i >= a && i < b);
  return {
    kind: "matter", pali, en, slug: slugify(pali), text: MATTER_TEXT[pali], card: cardFor(pali),
    group: g[2], groupNote: g[3], concrete: i < 18,
    origins: o.split("").map((k) => ORIGIN[k]), inseparable: o === "kcua" && [0, 1, 2, 3, 9, 11, 12, 17].includes(i),
  };
});

const MIXED = Object.fromEntries(D.sheet8b.mixed.filter((m) => m[3]).map((m) => [m[3][0], { cat: m[0], note: m[4] }]));
const SYNTH = { 2: "object", 9: "decisive support", 13: "kamma", 21: "presence" };
export const conditions = L.conditions.map(([n, pali, en, g]) => ({
  kind: "conditions", n, pali, en, slug: slugify(pali), text: CONDITION_TEXT[pali], group: L.conditionGroups[g],
  mixed: MIXED[n] || null, synthesis: SYNTH[n] || null,
}));

export const KINDS = {
  factors: { t: "The 52 mental factors", short: "Mental factors", pali: "cetasika", plate: "p4", plates: ["p4", "p4b"], concept: "CE", list: factors,
    d: "What colours each moment of knowing: seven present in every citta, six that come and go, fourteen unwholesome and twenty-five beautiful.", ch: "II §§1–9" },
  matter: { t: "The 28 kinds of matter", short: "Matter", pali: "rūpa", plate: "p5", plates: ["p5"], concept: "RU", list: matter,
    d: "Four great elements and twenty-four kinds derived from them, with the four origins that produce them.", ch: "VI §§2–15" },
  conditions: { t: "The 24 conditions", short: "Conditions", pali: "paccaya", plate: "p8", plates: ["p8", "p8b"], concept: "CO", list: conditions,
    d: "The ways one dhamma helps another, from the Paṭṭhāna, sorted by direction between mind and matter.", ch: "VIII §§11–28" },
};
export const dhammaUrl = (e) => u(`dhammas/${e.kind}/${e.slug}/`);

// Every entry by its Pāli headword, for linking from the glossary.
const BY = new Map([...factors, ...matter, ...conditions].map((e) => [slugify(e.pali), e]));
export const dhammaFor = (pali) => BY.get(slugify(pali.split(" · ")[0])) || null;
