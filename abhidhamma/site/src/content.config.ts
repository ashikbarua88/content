import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

// Every word on the site lives in src/content/. The schemas below make a bad edit fail the build.
const part = z.enum(["what", "unfolds", "way", "back"]);

// Readings: essays written for the screen, one per atlas plate or companion sheet.
const readings = defineCollection({
  loader: glob({ base: "./src/content/readings", pattern: "**/*.mdx" }),
  schema: z.object({
    title: z.string(), dek: z.string(),
    part: z.enum(["What there is", "How it unfolds", "The way out", "Looking back"]),
    order: z.number(), plate: z.string(), concepts: z.array(z.string()),
    question: z.string(), answer: z.string().optional(), sources: z.array(z.string()), minutes: z.number(),
  }),
});

// Concepts: the sixteen ideas. The Markdown body is the long description.
const concepts = defineCollection({
  loader: glob({ base: "./src/content/concepts", pattern: "*.md" }),
  schema: z.object({
    id: z.string(), title: z.string(), label: z.string(), pali: z.string(), def: z.string(),
    part, order: z.number(), level: z.number(), plates: z.array(z.union([z.number(), z.string()])),
    pictureSource: z.string(),
    canon: z.object({ refs: z.array(z.string()), note: z.string() }).optional(),
    question: z.string(), answer: z.string(),
  }),
});

const links = defineCollection({
  loader: file("src/content/links.yaml"),
  schema: z.object({ from: z.string(), to: z.string(), type: z.string(), label: z.string(), text: z.string() }),
});
const parts = defineCollection({
  loader: file("src/content/parts.yaml"),
  schema: z.object({ title: z.string(), desc: z.string() }),
});
const glossary = defineCollection({
  loader: file("src/content/glossary.yaml"),
  schema: z.object({ term: z.string(), gloss: z.string(), plate: z.string() }),
});
const stories = defineCollection({
  loader: file("src/content/stories.yaml"),
  schema: z.object({
    level: z.number(), kind: z.enum(["life", "jataka", "disc"]), title: z.string(), source: z.string(),
    story: z.string(), reading: z.string(), question: z.string().optional(), plates: z.array(z.string()),
  }),
});
const levels = defineCollection({
  loader: file("src/content/levels.yaml"),
  schema: z.object({ n: z.number(), name: z.string(), question: z.string() }),
});

const card = z.object({
  characteristic: z.string(), function: z.string(), manifestation: z.string(), proximateCause: z.string(), tryIt: z.string().optional(),
}).optional();
const related = z.array(z.object({ kind: z.enum(["factors", "matter", "conditions"]), id: z.string(), how: z.string() })).optional();
const role = z.enum(["root", "jhana", "path", "faculty", "power", "predominant", "nutriment", "requisite"]);
const factors = defineCollection({
  loader: file("src/content/dhammas/factors.yaml"),
  schema: z.object({ order: z.number(), pali: z.string(), en: z.string(), group: z.enum(["universal", "occasional", "unwholesome", "beautiful"]), text: z.string(), card, related, roles: z.array(role).optional() }),
});
const matter = defineCollection({
  loader: file("src/content/dhammas/matter.yaml"),
  schema: z.object({ order: z.number(), pali: z.string(), en: z.string(), origins: z.string(), text: z.string(), card, related }),
});
const conditions = defineCollection({
  loader: file("src/content/dhammas/conditions.yaml"),
  schema: z.object({ n: z.number(), pali: z.string(), en: z.string(), direction: z.enum(["A", "B", "C", "D", "E", "F"]), text: z.string(), related }),
});
const kinds = defineCollection({
  loader: file("src/content/dhammas/kinds.yaml"),
  schema: z.object({
    title: z.string(), short: z.string(), pali: z.string(), plates: z.array(z.string()), concept: z.string(), chapter: z.string(),
    desc: z.string(), groups: z.array(z.object({ key: z.string(), title: z.string(), desc: z.string().optional() })),
  }),
});

const models3d = defineCollection({
  loader: file("src/content/models3d.yaml"),
  schema: z.object({ level: z.number(), title: z.string(), lede: z.string(), sources: z.string(), html: z.string() }),
});

export const collections = { models3d, readings, concepts, links, parts, glossary, stories, levels, factors, matter, conditions, kinds };
