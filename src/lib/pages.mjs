// The page registry: every page that exists, its path, kind and heading.
// Links to pages not in the registry are rendered as plain text ("parked") until the page ships.
import { getCollection } from 'astro:content';
import { tools, stacks, comparisons, alternatives, toolIds } from './data.mjs';

export function pathFor(entryId) {
  const [kind, slug] = entryId.split('/');
  switch (kind) {
    case 'pricing': return `/tools/${slug}/pricing/`;
    case 'tools': return `/tools/${slug}/`;
    case 'compare': return `/compare/${slug}/`;
    case 'alternatives': return `/alternatives/${slug}/`;
    case 'stacks': return `/stacks/${slug}/`;
    case 'pages': return `/${slug}/`;
    default: throw new Error(`Unknown prose kind: ${entryId}`);
  }
}

export function defaultH1(entryId) {
  const [kind, slug] = entryId.split('/');
  if (kind === 'pricing') return `${tools[slug].name} pricing: what it really costs`;
  if (kind === 'tools') return `${tools[slug].name} review: who it's for and what it costs`;
  if (kind === 'compare') { const c = comparisons[slug]; return `${tools[c.a].name} vs ${tools[c.b].name}`; }
  if (kind === 'alternatives') return `${tools[slug].name} alternatives, priced honestly`;
  if (kind === 'stacks') return `The best software stack for a ${stacks[slug]?.label?.toLowerCase() ?? slug}`;
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
  const cmpFor = (id) => Object.values(comparisons).filter((c) => c.a === id || c.b === id).map((c) => `/compare/${c.id}/`);
  const stacksFor = (id) => Object.values(stacks).filter((s) => s.layers.some((l) => l.pick === id)).map((s) => `/stacks/${s.id}/`);
  if (kind === 'pricing') { push(`/tools/${slug}/`); cmpFor(slug).forEach(push); push(`/alternatives/${slug}/`); stacksFor(slug).forEach(push); }
  if (kind === 'tools') { push(`/tools/${slug}/pricing/`); cmpFor(slug).forEach(push); push(`/alternatives/${slug}/`); stacksFor(slug).forEach(push); }
  if (kind === 'compare') {
    const c = comparisons[slug];
    [c.a, c.b].forEach((t) => { push(`/tools/${t}/pricing/`); push(`/tools/${t}/`); });
    Object.values(comparisons).filter((x) => x.id !== slug && x.layer === c.layer).forEach((x) => push(`/compare/${x.id}/`));
  }
  if (kind === 'alternatives') {
    push(`/tools/${slug}/pricing/`); push(`/tools/${slug}/`);
    for (const r of alternatives[slug]?.reasons ?? []) for (const p of r.picks) push(`/tools/${p.tool}/pricing/`);
  }
  if (kind === 'stacks') {
    for (const l of stacks[slug].layers) push(`/tools/${l.pick}/pricing/`);
    Object.keys(stacks).filter((s) => s !== slug).forEach((s) => push(`/stacks/${s}/`));
  }
  const reg = await registry();
  const self = pathFor(entryId);
  return out.filter((p) => p !== self && reg.has(p)).slice(0, 8).map((p) => ({ href: p, label: reg.get(p).h1 }));
}

export async function publishedToolPages() {
  const reg = await registry();
  return toolIds.filter((id) => reg.has(`/tools/${id}/pricing/`) || reg.has(`/tools/${id}/`));
}
