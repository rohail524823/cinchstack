// Indexable pages and their real last-modified dates, shared by sitemap.xml, llms.txt and the check gate.
import { registry } from './pages.mjs';
import { datesFor } from './meta.mjs';
import { pricing, comparisons, stacks, alternatives, changelog } from './data.mjs';
import { lastChecked } from './dataset.mjs';

export const NOINDEX = new Set(['/thanks/', '/alternatives/']);

const maxDate = (...ds) => ds.filter(Boolean).sort().at(-1) ?? null;
const priceChanged = (id) => pricing[id]?.history.map((h) => h.date).sort().at(-1) ?? null;

export async function indexablePages() {
  const reg = await registry();
  const out = [];
  const byPath = new Map();
  for (const [path, r] of reg) {
    if (NOINDEX.has(path)) continue;
    let lastmod = null;
    if (r.entry) {
      const d = datesFor(r.entry);
      lastmod = d.modified;
      if (r.kind === 'pricing' || r.kind === 'tools') lastmod = maxDate(lastmod, priceChanged(r.slug));
      if (r.kind === 'guides') lastmod = maxDate(lastmod, priceChanged(r.slug.split('--')[0]));
      if (r.kind === 'compare') { const c = comparisons[r.slug]; lastmod = maxDate(lastmod, priceChanged(c.a), priceChanged(c.b)); }
      if (r.kind === 'stacks') lastmod = maxDate(lastmod, ...stacks[r.slug].layers.map((l) => priceChanged(l.pick)));
      if (r.kind === 'alternatives') lastmod = maxDate(lastmod, priceChanged(r.slug), ...(alternatives[r.slug]?.reasons ?? []).flatMap((x) => x.picks.map((p) => priceChanged(p.tool))));
    }
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
export const DISALLOW = ['/.netlify/', '/api/', '/thanks/'];
