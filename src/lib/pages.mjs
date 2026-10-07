// The page registry: every page that exists, its path, kind and heading.
// Links to pages not in the registry are rendered as plain text ("parked") until the page ships.
import { getCollection } from 'astro:content';
import { tools, stacks, comparisons, alternatives, toolIds, programs } from './data.mjs';

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

// ---------- link candidates shared by Keep reading and the generated link blocks ----------

/** Every guide of one tool, in registry order: /tools/<id>/<topic>/. */
export async function guidesFor(id) {
  const reg = await registry();
  return [...reg.values()].filter((r) => r.kind === 'guides' && guideParts(r.slug)[0] === id).map((r) => pathFor(r.id));
}

/** Guides of OTHER tools whose topic names this tool ("migrate-from-hubspot" names hubspot). */
export async function guidesNaming(id) {
  const reg = await registry();
  const want = id.split('-');
  const names = (topic) => { const w = topic.split('-'); return w.some((_, i) => want.every((x, j) => w[i + j] === x)); };
  return [...reg.values()].filter((r) => {
    if (r.kind !== 'guides') return false;
    const [t, topic] = guideParts(r.slug);
    return t !== id && names(topic);
  }).map((r) => pathFor(r.id));
}

/** Every published comparison that includes this tool. */
export async function comparesFor(id) {
  const reg = await registry();
  return Object.values(comparisons).filter((c) => (c.a === id || c.b === id) && reg.has(`/compare/${c.id}/`)).map((c) => `/compare/${c.id}/`);
}

// A program that bars other tools' names on its promotional pages (Systeme.io, rules.paidOnlyOn).
const restricted = (id) => Boolean(programs[tools[id]?.affiliate?.program ?? id]?.rules?.paidOnlyOn);

/**
 * The generated blocks on a tool's pricing page and review (docs/plan/03-architecture.md,
 * "Internal linking"): every comparison of the tool plus its alternatives page, and every guide
 * for the tool. They sit outside Keep reading, so its 5-8 link cap never cuts a comparison or a guide.
 */
export async function toolLinks(id) {
  const reg = await registry();
  const link = (p) => ({ href: p, label: reg.get(p).h1 });
  const compare = (await comparesFor(id)).map(link);
  const alt = reg.has(`/alternatives/${id}/`) ? link(`/alternatives/${id}/`) : null;
  const guides = (await guidesFor(id)).map(link);
  // Another tool's guide about this one (moving from HubSpot to GoHighLevel, on HubSpot's pages).
  const naming = restricted(id) ? [] : (await guidesNaming(id)).map(link);
  return { compare, alt, guides, naming };
}

// Alternatives pages: which of the tool's own guides a switcher most needs (the plan choice and the
// usage bill). A tool not listed here gets its first three guides.
const ALT_GUIDES = {
  gohighlevel: ['plans-compared', 'sms-and-calling-costs', 'ai-pricing'],
};

/** Hub-to-spoke "Keep reading" candidates for a page, filtered to pages that exist. */
export async function relatedFor(entryId, extra = []) {
  const [kind, slug] = entryId.split('/');
  const out = [];
  const push = (p) => { if (!out.includes(p)) out.push(p); };
  const reg = await registry();
  const self = pathFor(entryId);
  // Curated guides in a stack's or comparison's data (its `guides` array) lead its Keep reading.
  const curated = kind === 'stacks' ? stacks[slug]?.guides : kind === 'compare' ? comparisons[slug]?.guides : null;
  for (const p of curated ?? []) {
    if (reg.get(p)?.kind !== 'guides') throw new Error(`${kind}/${slug}.json lists guide ${p}, which is not a published guide`);
    push(p);
  }
  // A comparison's frontmatter extras follow both pricing pages and both reviews (below), so the
  // cap never cuts a page the plan requires every comparison to link.
  if (kind !== 'compare') extra.forEach(push);
  const cmpFor = (id) => Object.values(comparisons).filter((c) => c.a === id || c.b === id).map((c) => `/compare/${c.id}/`);
  const stacksFor = (id) => Object.values(stacks).filter((s) => s.layers.some((l) => l.pick === id)).map((s) => `/stacks/${s.id}/`);
  // Pricing pages and reviews list every guide and comparison in their own generated blocks
  // (toolLinks), so Keep reading spends its slots on the hub, comparisons, alternatives and stacks.
  if (kind === 'pricing') { push(`/tools/${slug}/`); cmpFor(slug).forEach(push); push(`/alternatives/${slug}/`); stacksFor(slug).forEach(push); }
  if (kind === 'tools') { push(`/tools/${slug}/pricing/`); cmpFor(slug).forEach(push); push(`/alternatives/${slug}/`); stacksFor(slug).forEach(push); }
  if (kind === 'compare') {
    const c = comparisons[slug];
    [c.a, c.b].forEach((t) => push(`/tools/${t}/pricing/`));
    [c.a, c.b].forEach((t) => push(`/tools/${t}/`));
    extra.forEach(push);
    [c.a, c.b].forEach((t) => push(`/alternatives/${t}/`));
    Object.values(comparisons).filter((x) => x.id !== slug && x.layer === c.layer).forEach((x) => push(`/compare/${x.id}/`));
  }
  if (kind === 'alternatives') {
    push(`/tools/${slug}/pricing/`); push(`/tools/${slug}/`);
    const own = await guidesFor(slug);
    const best = ALT_GUIDES[slug]?.map((topic) => `/tools/${slug}/${topic}/`).filter((p) => own.includes(p)) ?? own;
    best.slice(0, 3).forEach(push);
    if (!restricted(slug)) (await guidesNaming(slug)).forEach(push);
    for (const r of alternatives[slug]?.reasons ?? []) for (const p of r.picks) push(`/tools/${p.tool}/pricing/`);
  }
  if (kind === 'guides') {
    const [t] = guideParts(slug);
    push(`/tools/${t}/pricing/`);
    // Three siblings from a window that starts right after this guide and wraps around, so every
    // guide is linked by the guides before it, not only the first ones in registry order.
    const sibs = (await guidesFor(t)).filter((p) => p !== self);
    const at = (await guidesFor(t)).indexOf(self);
    const rotated = at < 0 ? sibs : [...sibs.slice(at), ...sibs.slice(0, at)];
    let added = 0;
    for (const p of rotated) { if (added >= 3) break; if (!out.includes(p)) { push(p); added += 1; } }
    push(`/tools/${t}/`);
    // A program that bars other tools' names on its promotional pages (Systeme.io): its guides link
    // only to that tool's own pages and our method pages, never to comparisons naming competitors.
    if (restricted(t)) {
      const ok = (p) => p.startsWith(`/tools/${t}/`) || ['/methodology/', '/how-we-earn/', '/about/'].includes(p);
      return out.filter((p) => ok(p) && p !== self && reg.has(p)).slice(0, 8).map((p) => ({ href: p, label: reg.get(p).h1 }));
    }
    push(`/alternatives/${t}/`); cmpFor(t).forEach(push);
  }
  if (kind === 'stacks') {
    for (const l of stacks[slug].layers) push(`/tools/${l.pick}/pricing/`);
    Object.keys(stacks).filter((s) => s !== slug).forEach((s) => push(`/stacks/${s}/`));
  }
  return out.filter((p) => p !== self && reg.has(p)).slice(0, 8).map((p) => ({ href: p, label: reg.get(p).h1 }));
}

export async function publishedToolPages() {
  const reg = await registry();
  return toolIds.filter((id) => reg.has(`/tools/${id}/pricing/`) || reg.has(`/tools/${id}/`));
}
