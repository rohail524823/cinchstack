// JSON-LD builders. Rule: markup only repeats what a reader can see on the page.
import { SITE, NAME, ORG_ID, AUTHOR_ID, AUTHOR, TAGLINE } from './site.mjs';
import { tool, price, score } from './data.mjs';
import { money } from './format.mjs';

const WEBSITE_ID = `${SITE}/#website`;

export function orgNodes() {
  return [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: NAME,
      url: `${SITE}/`,
      slogan: TAGLINE,
      description: 'Independent software pricing and stack recommendations for people running an online business. Prices are read from vendor pages, dated, and re-checked weekly.',
      logo: { '@type': 'ImageObject', url: `${SITE}/apple-touch-icon.png`, width: 180, height: 180 },
      founder: { '@id': AUTHOR_ID },
      publishingPrinciples: `${SITE}/methodology/`,
      ethicsPolicy: `${SITE}/how-we-earn/`,
      // /contact/ takes price corrections and questions for the editor. Organization sameAs stays
      // empty until the brand has profiles of its own (docs/plan/06-aeo-geo-bing.md).
      contactPoint: { '@type': 'ContactPoint', contactType: 'corrections and editorial questions', url: `${SITE}/contact/`, availableLanguage: 'en' },
    },
    {
      '@type': 'Person',
      '@id': AUTHOR_ID,
      name: AUTHOR.name,
      url: AUTHOR.url,
      jobTitle: AUTHOR.jobTitle,
      description: AUTHOR.bio,
      worksFor: { '@id': ORG_ID },
      sameAs: AUTHOR.sameAs,
      knowsAbout: ['SaaS pricing', 'Software comparison', 'Small-business software stacks'],
    },
    // Every WebPage node points here (isPartOf), so it is defined on every page.
    websiteNode(),
  ];
}

export function breadcrumbNode(url, crumbs) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE}${c.href}` } : {}),
    })),
  };
}

/**
 * The page a tool's software entity lives on: its review (hub) when there is one, else its pricing
 * page. `has(path)` says whether a page is built. Other pages refer to the entity by this @id only
 * (about/mentions), without redefining it, so no page carries a second, rating-less app item.
 * An unscored tool has no app node anywhere (see softwareWithReview), so there is nothing to refer to.
 */
export function softwareRef(toolId, has) {
  if (score(toolId)?.overall == null) return null;
  const home = has(`/tools/${toolId}/`) ? `/tools/${toolId}/` : has(`/tools/${toolId}/pricing/`) ? `/tools/${toolId}/pricing/` : null;
  return home ? { '@id': `${SITE}${home}#software` } : null;
}

/** The distinct vendor pages a tool's record was read from (listed visibly under "How we checked this"). */
export function sourceUrls(toolId) {
  return [...new Set(price(toolId).sources.map((s) => s.url))];
}

const list = (x) => {
  const a = [].concat(x ?? []).filter(Boolean);
  return a.length === 0 ? undefined : a.length === 1 ? a[0] : a;
};

export function articleNode({ url, headline, description, published, modified, about, mentions, isBasedOn }) {
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline,
    description,
    url,
    datePublished: published,
    dateModified: modified,
    inLanguage: 'en',
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    // Every page with an Article also carries its WebPage node (webPageNode with article: true).
    mainEntityOfPage: { '@id': `${url}#webpage` },
    isPartOf: { '@id': WEBSITE_ID },
    about: list(about),
    mentions: list(mentions),
    isBasedOn: list(isBasedOn),
  };
}

// The price an Offer carries: month to month, or the effective monthly price of a yearly-only plan.
const offerPrice = (pl) => pl.monthly ?? pl.annualMonthly;
const isOffer = (pl) => pl.priceUnit !== 'custom' && offerPrice(pl) !== null;
const UNIT_TEXT = { 'per-seat-month': 'per seat per month', 'per-site-month': 'per site per month', 'per-workspace-month': 'per workspace per month' };

/**
 * The plans whose Offer price a reader can see in the given texts: the raw prose of the page (MDX
 * body, quick answer, FAQ, pros and cons). A plan counts when its price is written there, or when
 * a <Price> token for it prints that price. scripts/check.mjs then checks every Offer price against
 * the built page, so a wrong guess here fails the build rather than shipping.
 */
export function plansShownIn(toolId, texts, alsoShown = []) {
  const src = texts.filter(Boolean).join('\n');
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\$]/g, '\\$&');
  return price(toolId).plans.filter(isOffer).filter((pl) => {
    const v = offerPrice(pl);
    if (alsoShown.includes(pl.id)) return true;
    if (v === 0) return /\$0(?![\d.,]\d)|\bfree\b/i.test(src) || price(toolId).freeTier.exists;
    if (new RegExp(`${esc(money(v))}(?![\\d]|[.,]\\d)`).test(src)) return true;
    const tok = [...src.matchAll(new RegExp(`<Price\\s+tool="${toolId}"\\s+plan="${pl.id}"(?:\\s+field="(\\w+)")?`, 'g'))];
    return tok.some((m) => pl[m[1] ?? 'monthly'] === v);
  }).map((pl) => pl.id);
}

/**
 * A SoftwareApplication for the page at `url` (@id `${url}#software`). `plans` limits the offers to
 * the plans the page shows; leave it out only where every plan is on the page (pricing pages).
 */
export function softwareNode(toolId, { url, plans, reviewId } = {}) {
  const t = tool(toolId);
  const p = price(toolId);
  const offers = p.plans
    .filter((pl) => isOffer(pl) && (!plans || plans.includes(pl.id)))
    .map((pl) => {
      const unit = UNIT_TEXT[pl.priceUnit] ?? 'per month';
      // A plan sold only on a yearly contract: the price is its effective monthly price, billed for a year
      // (the pricing table labels it "annual only").
      const yearly = pl.monthly === null;
      return {
        '@type': 'Offer',
        name: pl.name,
        price: String(offerPrice(pl)),
        priceCurrency: 'USD',
        url: t.pricingUrl,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: offerPrice(pl),
          priceCurrency: 'USD',
          unitText: yearly ? `${unit}, billed annually` : unit,
          billingIncrement: 1,
          ...(yearly ? { billingDuration: 'P1Y' } : {}),
        },
      };
    });
  return {
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name: t.name,
    alternateName: list(t.alternateName),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: t.url,
    description: t.oneLiner,
    publisher: { '@type': 'Organization', name: t.vendor },
    offers,
    review: reviewId ? { '@id': reviewId } : undefined,
  };
}

/**
 * Our review of a tool on the page at `url`. `notes` adds the pros and cons, only where the page
 * shows them (the tool's hub). Returns null for an unscored tool.
 */
export function reviewNode(toolId, url, { notes = true } = {}) {
  const s = score(toolId);
  const t = tool(toolId);
  if (!s || s.overall === null) return null;
  return {
    '@type': 'Review',
    '@id': `${url}#review`,
    itemReviewed: { '@id': `${url}#software` },
    reviewRating: { '@type': 'Rating', ratingValue: String(s.overall), bestRating: '5', worstRating: '1' },
    ...(notes ? {
      positiveNotes: { '@type': 'ItemList', itemListElement: t.pros.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x })) },
      negativeNotes: { '@type': 'ItemList', itemListElement: t.cons.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x })) },
    } : {}),
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    datePublished: s.scoredOn,
  };
}

/**
 * The app and our review of it, linked both ways, for a page that shows the tool's score. Google's
 * software-app result needs a rating on the app, so an unscored tool gets neither node.
 */
export function softwareWithReview(toolId, url, { plans, notes = true } = {}) {
  const review = reviewNode(toolId, url, { notes });
  if (!review) return [];
  return [softwareNode(toolId, { url, plans, reviewId: review['@id'] }), review];
}

export function faqNode(url, items) {
  if (!items?.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function itemListNode(url, name, items) {
  return {
    '@type': 'ItemList',
    '@id': `${url}#list`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
  };
}

export function webPageNode({ url, name, description, lastReviewed, type = 'WebPage', article = false }) {
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    ...(article ? { mainEntity: { '@id': `${url}#article` } } : {}),
    ...(lastReviewed ? { lastReviewed, reviewedBy: { '@id': AUTHOR_ID } } : {}),
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE}/`,
    name: NAME,
    description: TAGLINE,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  };
}

/**
 * The page's own share image (src/lib/og.mjs) on the nodes that describe the page at `url`: `image`
 * on its Article and `primaryImageOfPage` on its WebPage. Pages without a generated image are left as
 * they are. Base.astro applies this to every page, so no template needs to.
 */
export function withPageImage(nodes, url, img) {
  if (!img) return nodes;
  const image = { '@type': 'ImageObject', url: img.url, width: img.width, height: img.height };
  return [nodes].flat(Infinity).filter(Boolean).map((n) => {
    if (n['@id'] === `${url}#article`) return { ...n, image };
    if (n['@id'] === `${url}#webpage`) return { ...n, primaryImageOfPage: image };
    return n;
  });
}

export function graph(...nodes) {
  const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined
  // The same node passed twice (the WebSite node on the homepage) is kept once. Two different nodes
  // with one @id are both kept, so the build's duplicate-@id gate reports them.
  const seen = new Map();
  const out = [];
  for (const n of nodes.flat(Infinity).filter(Boolean).map(clean)) {
    const id = n['@id'];
    const j = JSON.stringify(n);
    if (id && seen.get(id)?.includes(j)) continue;
    if (id) seen.set(id, [...(seen.get(id) ?? []), j]);
    out.push(n);
  }
  return { '@context': 'https://schema.org', '@graph': out };
}
