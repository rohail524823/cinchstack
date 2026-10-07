// Indexable pages and their real last-modified dates, shared by sitemap.xml, llms.txt and the check gate.
import { registry } from './pages.mjs';
import { datesFor } from './meta.mjs';
import { changelog } from './data.mjs';
import { lastChecked } from './dataset.mjs';

export const NOINDEX = new Set(['/thanks/', '/alternatives/']);

const maxDate = (...ds) => ds.filter(Boolean).sort().at(-1) ?? null;

export async function indexablePages() {
  const reg = await registry();
  const out = [];
  const byPath = new Map();
  for (const [path, r] of reg) {
    if (NOINDEX.has(path)) continue;
    // A prose page's lastmod is the same date as its JSON-LD dateModified and visible "Updated" line:
    // the last editorial change, from git (docs/plan/05-seo.md, "Dates"). A price change moves the
    // page's "Prices verified" date and adds a /changes/ entry, which dates /changes/ and /data/.
    const lastmod = r.entry ? datesFor(r.entry).modified : null;
    const row = { path, kind: r.kind, slug: r.slug, h1: r.h1, title: r.title, lastmod };
    out.push(row);
    byPath.set(path, row);
  }
  // Hubs and data pages take the newest date of what they list.
  const newest = (pred) => maxDate(...out.filter(pred).map((x) => x.lastmod));
  for (const row of out) {
    if (row.lastmod) continue;
    if (row.path === '/tools/') row.lastmod = newest((x) => x.kind === 'pricing' || x.kind === 'tools');
    else if (row.path === '/compare/') row.lastmod = newest((x) => x.kind === 'compare');
    else if (row.path === '/stacks/') row.lastmod = newest((x) => x.kind === 'stacks');
    else if (row.path === '/changes/') row.lastmod = maxDate(changelog[0]?.date, lastChecked());
    else if (row.path === '/data/') row.lastmod = lastChecked();
    else if (row.path === '/') row.lastmod = newest((x) => x.path !== '/');
  }
  for (const row of out) if (!row.lastmod) row.lastmod = newest(() => true);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

// AI and search crawlers named in robots.txt. RFC 9309: a crawler that finds its own group
// follows only that group, so each group repeats the full disallow list.
export const CRAWLERS = [
  'Googlebot', 'Bingbot', 'Google-Extended', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User',
  'CCBot', 'Applebot', 'Applebot-Extended', 'Amazonbot', 'meta-externalagent', 'FacebookBot',
  'DuckAssistBot', 'MistralAI-User', 'cohere-ai', 'YouBot', 'Bytespider', 'DuckDuckBot',
];
// /thanks/ is not disallowed: crawlers must be able to fetch it to read its noindex.
export const DISALLOW = ['/.netlify/', '/api/'];
