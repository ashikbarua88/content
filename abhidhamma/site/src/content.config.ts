import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Readings: essays written for the screen, one per atlas plate. See CONTRIBUTING.md in this folder.
const readings = defineCollection({
  loader: glob({ base: "./src/content/readings", pattern: "**/*.mdx" }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    part: z.enum(["What there is", "How it unfolds", "The way out"]),
    order: z.number(),
    plate: z.string(),
    concepts: z.array(z.string()),
    question: z.string(),
    answer: z.string().optional(),
    sources: z.array(z.string()),
    minutes: z.number(),
  }),
});
export const collections = { readings };
