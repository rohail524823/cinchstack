// Share images: every indexable page gets its own 1200x630 PNG at /og/<slug>.png, drawn at build time
// by src/pages/og/[slug].png.js from the card built here. Base.astro uses the same card for og:image
// and its alt text, so the image and the markup that describes it can never disagree. Noindex pages
// and the 404 keep the site-wide /og.png. Every figure comes from src/data through the usual helpers.
import { createHash } from 'node:crypto';
import { SITE, TAGLINE } from './site.mjs';
import { tool, price, scenario, score, cheapestPaid, noPaidPlan, sizeBasis, stacks, stackBill, comparisons, alternatives, pricing, toolIds } from './data.mjs';
import { money, longDate, oneDecimal } from './format.mjs';
import { guideParts } from './pages.mjs';
import { indexablePages } from './seo.mjs';
import { lastChecked } from './dataset.mjs';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_FALLBACK = { url: `${SITE}/og.png`, alt: "CinchStack: the software stack that's best for you, and what it really costs.", width: OG_WIDTH, height: OG_HEIGHT };

const LABELS = { pricing: 'Pricing', tools: 'Review', compare: 'Comparison', alternatives: 'Alternatives', stacks: 'Stack', guides: 'Guide' };
// Headings for the pages built without an MDX entry (the registry keeps a link label for these): the
// H1 where it says what the page is, else the page title, since a one-word hub H1 ("Comparisons")
// tells a share nothing. scripts/check.mjs fails the build if one drifts from its page's H1 or title.
const STATIC_HEADING = {
  '/': 'Know what your software will really cost before you sign up.',
  '/tools/': 'Software tools for small businesses and what they really cost',
  '/compare/': 'Software comparisons built on real prices',
  '/stacks/': 'The best software stack for your kind of business',
  '/changes/': 'Software price changes, logged as we find them',
  '/data/': 'The CinchStack pricing dataset',
};

/** "/tools/gohighlevel/pricing/" -> "tools-gohighlevel-pricing"; the homepage is "home". */
export const ogSlug = (path) => (path === '/' ? 'home' : path.split('/').filter(Boolean).join('-'));

let indexed = null;
const pages = () => (indexed ??= indexablePages().then((rows) => new Map(rows.map((r) => [r.path, r]))));

/** Every page that gets an image: the pages the sitemap lists. */
export async function ogPages() {
  const out = [...(await pages()).keys()].map((path) => ({ path, slug: ogSlug(path) }));
  const seen = new Map();
  for (const { path, slug } of out) {
    if (seen.has(slug)) throw new Error(`Share images: ${path} and ${seen.get(slug)} both map to /og/${slug}.png`);
    seen.set(slug, path);
  }
  return out;
}

// The small-team bill exactly as the page prints it: "from" on a floor, the job's basis underneath.
const bill = (id, label) => {
  const sc = scenario(id, 'small');
  return { label, prefix: sc.floor ? 'from' : '', value: money(sc.monthly), unit: '/mo', sub: sizeBasis(id, 'small') || null, money: true };
};
const oldest = (ids) => ids.map((x) => price(x).checkedOn).sort()[0];
const unique = (xs) => [...new Set(xs)];

function content(row) {
  const { kind, slug } = row;
  if (kind === 'pricing') {
    const c = cheapestPaid(slug);
    const entry = c ? { label: 'Cheapest paid plan', value: money(c.v), unit: '/mo', sub: c.p.name, money: true } : { label: 'Cheapest paid plan', ...noPaidPlan(slug) };
    return { figures: [bill(slug, 'Real bill, small team'), entry], date: price(slug).checkedOn };
  }
  if (kind === 'tools') {
    const s = score(slug)?.overall;
    const rated = s === null || s === undefined ? [] : [{ label: 'Our score', value: oneDecimal(s), unit: '/ 5', spoken: `${oneDecimal(s)} out of 5` }];
    return { figures: [...rated, bill(slug, 'Real bill, small team')], date: price(slug).checkedOn };
  }
  if (kind === 'guides') return { figures: [], date: price(guideParts(slug)[0]).checkedOn };
  if (kind === 'compare') {
    const c = comparisons[slug];
    return { figures: [c.a, c.b].map((x) => bill(x, `${tool(x).name}, small team`)), date: oldest([c.a, c.b]) };
  }
  if (kind === 'alternatives') {
    const picks = unique(alternatives[slug].reasons.flatMap((r) => r.picks.map((p) => p.tool)));
    return { figures: [bill(slug, `${tool(slug).name}, small team`), { label: 'Alternatives priced', value: String(picks.length), sub: 'each with its small-team bill' }], date: oldest([slug, ...picks]) };
  }
  if (kind === 'stacks') {
    const s = stacks[slug];
    const b = stackBill(slug);
    const total = { label: 'Real bill, whole stack', prefix: b.floors.small ? 'from' : '', value: money(b.totals.small), unit: '/mo', sub: s.sizeLabels.small, money: true };
    return { figures: [total], date: oldest(unique(s.layers.map((l) => l.pick))) };
  }
  if (row.path === '/data/') {
    const plans = Object.values(pricing).reduce((a, p) => a + p.plans.length, 0);
    // The newest check, not every price's: the page's own wording ("Last checked"), not "Prices checked".
    return { figures: [{ label: 'Tools', value: String(toolIds.length) }, { label: 'Plans', value: String(plans) }], date: lastChecked(), dateLabel: 'Last checked' };
  }
  // Home, hubs, /changes/ and the trust pages: the heading and the tagline.
  return { figures: [], date: null };
}

const spoken = (f) => `${f.label}: ${f.spoken ?? `${f.prefix ? `${f.prefix} ` : ''}${f.value}${f.unit ?? ''}`}${f.sub ? ` (${f.sub})` : ''}`;

/**
 * What the image for a page shows, or null for a page without one: its label, heading (the page H1,
 * or a hub's title), key figures, the verified date its Byline shows and how it names it, the money
 * strings it prints, its alt text and a version that changes whenever any of that does.
 */
export async function ogCard(path) {
  const row = (await pages()).get(path);
  if (!row) return null;
  const heading = STATIC_HEADING[path] ?? row.h1;
  const label = LABELS[row.kind] ?? (row.kind === 'data' ? 'Data' : null);
  const { figures, date, dateLabel = 'Prices checked' } = content(row);
  const tagline = !figures.length && !date && heading.toLowerCase() !== TAGLINE.toLowerCase() ? TAGLINE : null;
  const checked = date ? longDate(date) : null;
  const alt = [heading.replace(/\.$/, ''), tagline, ...figures.map(spoken), checked && `${dateLabel} ${checked}`].filter(Boolean).join('. ') + '.';
  // Facebook, LinkedIn and X cache a share image by its URL, so the URL carries a hash of what the
  // image says: a new price or date gives a new URL, and shares fetch the new image.
  const version = createHash('sha256').update(JSON.stringify({ label, heading, tagline, figures, date, dateLabel })).digest('hex').slice(0, 8);
  return { path, slug: ogSlug(path), label, heading, tagline, figures, date, dateLabel, checked, money: figures.filter((f) => f.money).map((f) => f.value), alt, version };
}

/** The share image for a page: {url, alt, width, height}, or null when the page has none (use OG_FALLBACK). */
export async function ogImageFor(path) {
  const card = await ogCard(path);
  return card ? { url: `${SITE}/og/${card.slug}.png?v=${card.version}`, alt: card.alt, width: OG_WIDTH, height: OG_HEIGHT } : null;
}
