// JSON-LD builders. Rule: markup only repeats what a reader can see on the page.
import { SITE, NAME, ORG_ID, AUTHOR_ID, AUTHOR, TAGLINE } from './site.mjs';
import { tool, price, score } from './data.mjs';

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
    },
    {
      '@type': 'Person',
      '@id': AUTHOR_ID,
      name: AUTHOR.name,
      url: AUTHOR.url,
      jobTitle: AUTHOR.jobTitle,
      worksFor: { '@id': ORG_ID },
      sameAs: AUTHOR.sameAs,
      knowsAbout: ['SaaS pricing', 'Software comparison', 'Small-business software stacks'],
    },
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

export function articleNode({ url, headline, description, published, modified }) {
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
    mainEntityOfPage: url,
  };
}

export function softwareNode(toolId) {
  const t = tool(toolId);
  const p = price(toolId);
  const offers = p.plans
    .filter((pl) => pl.priceUnit !== 'custom' && (pl.monthly ?? pl.annualMonthly) !== null)
    .map((pl) => ({
      '@type': 'Offer',
      name: pl.name,
      price: String(pl.monthly ?? pl.annualMonthly),
      priceCurrency: 'USD',
      url: t.pricingUrl,
      priceValidUntil: undefined,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: pl.monthly ?? pl.annualMonthly,
        priceCurrency: 'USD',
        unitText: { 'per-seat-month': 'per seat per month', 'per-site-month': 'per site per month', 'per-workspace-month': 'per workspace per month' }[pl.priceUnit] ?? 'per month',
        billingIncrement: 1,
      },
    }));
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE}/tools/${toolId}/#software`,
    name: t.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: t.url,
    description: t.oneLiner,
    publisher: { '@type': 'Organization', name: t.vendor },
    offers,
  };
}

export function reviewNode(toolId, url) {
  const s = score(toolId);
  const t = tool(toolId);
  if (!s || s.overall === null) return null;
  return {
    '@type': 'Review',
    '@id': `${url}#review`,
    itemReviewed: { '@id': `${SITE}/tools/${toolId}/#software` },
    reviewRating: { '@type': 'Rating', ratingValue: String(s.overall), bestRating: '5', worstRating: '1' },
    positiveNotes: { '@type': 'ItemList', itemListElement: t.pros.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x })) },
    negativeNotes: { '@type': 'ItemList', itemListElement: t.cons.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x })) },
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    datePublished: s.scoredOn,
  };
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

export function webPageNode({ url, name, description, lastReviewed, type = 'WebPage' }) {
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { '@id': `${SITE}/#website` },
    ...(lastReviewed ? { lastReviewed, reviewedBy: { '@id': AUTHOR_ID } } : {}),
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: `${SITE}/`,
    name: NAME,
    description: TAGLINE,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  };
}

export function graph(...nodes) {
  const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined
  return { '@context': 'https://schema.org', '@graph': nodes.flat().filter(Boolean).map(clean) };
}
