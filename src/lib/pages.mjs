// The page registry: every page that exists, its path, kind and heading.
// Links to pages not in the registry are rendered as plain text ("parked") until the page ships.
import { getCollection } from 'astro:content';
import { tools, stacks, comparisons, alternatives, toolIds } from './data.mjs';

/** "gohighlevel--sms-and-calling-costs" -> ["gohighlevel", "sms-and-calling-costs"] */
export function guideParts(slug) {
  const i = slug.indexOf('--');
  return i > 0 ? [slug.slice(0, i), slug.slice(i + 2)] : [slug, ''];
}

export function pathFor(entryId) {
  const [kind, slug] = entryId.split('/');
  switch (kind) {
    case 'pricing': return `/tools/${slug}/pricing/`;
    case 'tools': return `/tools/${slug}/`;
    case 'compare': return `/compare/${slug}/`;
    case 'alternatives': return `/alternatives/${slug}/`;
    case 'stacks': return `/stacks/${slug}/`;
    case 'pages': return `/${slug}/`;
    // Guides live under their tool: guides/gohighlevel--sms-and-calling-costs -> /tools/gohighlevel/sms-and-calling-costs/
    case 'guides': { const [t, topic] = guideParts(slug); return `/tools/${t}/${topic}/`; }
    default: throw new Error(`Unknown prose kind: ${entryId}`);
  }
}

// Lower-case only a generic first word ("Marketing agency" -> "marketing agency"), never a brand
// or acronym ("SaaS startup", "Shopify store" stay as written).
const KEEP = /^(SaaS|Shopify|WooCommerce|HubSpot)\b/;
export const lowerFirst = (s) => (KEEP.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

export function defaultH1(entryId) {
  const [kind, slug] = entryId.split('/');
  if (kind === 'pricing') return `${tools[slug].name} pricing: what it really costs`;
  if (kind === 'tools') return `${tools[slug].name} review: who it's for and what it costs`;
  if (kind === 'compare') { const c = comparisons[slug]; return `${tools[c.a].name} vs ${tools[c.b].name}`; }
  if (kind === 'alternatives') return `${tools[slug].name} alternatives, priced honestly`;
  if (kind === 'stacks') return `The best software stack for a ${lowerFirst(stacks[slug]?.label ?? slug)}`;
  if (kind === 'guides') { const [t, topic] = guideParts(slug); return `${tools[t]?.name ?? t}: ${topic.replace(/-/g, ' ')}`; }
  return slug;
}

let cache = null;
export async function registry() {
  if (cache) return cache;
  const entries = await getCollection('prose');
  const map = new Map();
  for (const e of entries) {
    const [kind, slug] = e.id.split('/');
    // Only publish pages whose data exists.
    if (kind === 'pricing' || kind === 'tools' || kind === 'alternatives') { if (!tools[slug]) continue; }
    if (kind === 'alternatives' && !alternatives[slug]) continue;
    if (kind === 'compare' && !comparisons[slug]) continue;
    if (kind === 'stacks' && !stacks[slug]) continue;
    if (kind === 'guides' && !tools[guideParts(slug)[0]]) continue;
    map.set(pathFor(e.id), { id: e.id, kind, slug, title: e.data.title, h1: e.data.h1 ?? defaultH1(e.id), entry: e });
  }
  // Static hubs and utility pages (always exist).
  const statics = [
    ['/', 'home', 'CinchStack'],
    ['/tools/', 'hub', 'Software tools and what they really cost'],
    ['/compare/', 'hub', 'Software comparisons'],
    ['/stacks/', 'hub', 'Software stacks by business'],
    ['/alternatives/', 'hub', 'Alternatives'],
    ['/changes/', 'data', 'Price changes'],
    ['/data/', 'data', 'The CinchStack pricing dataset'],
  ];
  for (const [p, kind, h1] of statics) if (!map.has(p)) map.set(p, { id: p, kind, slug: p, title: h1, h1 });
  cache = map;
  return map;
}

export async function exists(path) {
  return (await registry()).has(path);
}

export async function linkTo(path) {
  const r = await registry();
  const hit = r.get(path);
  return hit ? { href: path, label: hit.h1 } : null;
}

/** Hub-to-spoke "Keep reading" candidates for a page, filtered to pages that exist. */
export async function relatedFor(entryId, extra = []) {
  const [kind, slug] = entryId.split('/');
  const out = [];
  const push = (p) => { if (!out.includes(p)) out.push(p); };
  extra.forEach(push);
  const reg = await registry();
  // A tool's guides sit right after its review on its own pages, so they are two clicks from home.
  const guidesFor = (id) => [...reg.values()].filter((r) => r.kind === 'guides' && guideParts(r.slug)[0] === id).map((r) => pathFor(r.id));
  const cmpFor = (id) => Object.values(comparisons).filter((c) => c.a === id || c.b === id).map((c) => `/compare/${c.id}/`);
  const stacksFor = (id) => Object.values(stacks).filter((s) => s.layers.some((l) => l.pick === id)).map((s) => `/stacks/${s.id}/`);
  if (kind === 'pricing') { push(`/tools/${slug}/`); guidesFor(slug).forEach(push); cmpFor(slug).forEach(push); push(`/alternatives/${slug}/`); stacksFor(slug).forEach(push); }
  if (kind === 'tools') { push(`/tools/${slug}/pricing/`); guidesFor(slug).forEach(push); cmpFor(slug).forEach(push); push(`/alternatives/${slug}/`); stacksFor(slug).forEach(push); }
  if (kind === 'compare') {
    const c = comparisons[slug];
    [c.a, c.b].forEach((t) => { push(`/tools/${t}/pricing/`); push(`/tools/${t}/`); });
    Object.values(comparisons).filter((x) => x.id !== slug && x.layer === c.layer).forEach((x) => push(`/compare/${x.id}/`));
  }
  if (kind === 'alternatives') {
    push(`/tools/${slug}/pricing/`); push(`/tools/${slug}/`);
    for (const r of alternatives[slug]?.reasons ?? []) for (const p of r.picks) push(`/tools/${p.tool}/pricing/`);
  }
  if (kind === 'guides') {
    const [t] = guideParts(slug);
    push(`/tools/${t}/pricing/`); guidesFor(t).forEach(push); push(`/tools/${t}/`); cmpFor(t).forEach(push); push(`/alternatives/${t}/`);
  }
  if (kind === 'stacks') {
    for (const l of stacks[slug].layers) push(`/tools/${l.pick}/pricing/`);
    Object.keys(stacks).filter((s) => s !== slug).forEach((s) => push(`/stacks/${s}/`));
  }
  const self = pathFor(entryId);
  return out.filter((p) => p !== self && reg.has(p)).slice(0, 8).map((p) => ({ href: p, label: reg.get(p).h1 }));
}

export async function publishedToolPages() {
  const reg = await registry();
  return toolIds.filter((id) => reg.has(`/tools/${id}/pricing/`) || reg.has(`/tools/${id}/`));
}
