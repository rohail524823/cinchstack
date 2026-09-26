import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Editorial prose only. Every fact lives in src/data; prose adds what data cannot say.
// Entry ids look like "pricing/hubspot", "tools/hubspot", "compare/gohighlevel-vs-hubspot",
// "alternatives/hubspot", "stacks/agency", "pages/methodology".
const prose = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content' }),
  schema: z.object({
    title: z.string().min(20).max(66),
    description: z.string().min(110).max(165),
    h1: z.string().optional(),
    quickAnswer: z.string().min(150).optional(),
    // YAML turns an unquoted 2026-09-26 into a Date; accept both and keep YYYY-MM-DD.
    published: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()]).transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10))),
    related: z.array(z.string().startsWith('/')).default([]),
    extraFigures: z.array(z.object({ value: z.string(), why: z.string() })).default([]),
  }),
});

export const collections = { prose };
