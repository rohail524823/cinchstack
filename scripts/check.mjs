#!/usr/bin/env node
// The launch gate. Reads the built site in dist/ and fails the build on anything that would
// mislead a reader, confuse a search engine, or break an affiliate contract.
// Usage: node scripts/check.mjs [--warn-only]
import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { loadData, knownFigures, normFig, figuresIn, BANNED } from './lib/figures.mjs';
import { pageRef, pageScope, passageFigures, passageDates, leadDates, badAsOf, ukSpellings, FAQ_CONTEXT, vagueQuestion } from './lib/scope.mjs';
import { GA_ID, INDEXNOW_KEY } from '../src/lib/site.mjs';
import { money } from '../src/lib/format.mjs';

const DIST = 'dist';
const SITE = 'https://cinchstack.com';
const WARN_ONLY = process.argv.includes('--warn-only');
const fails = [];
const warns = [];
const fail = (page, msg) => fails.push(`${page}: ${msg}`);
const warn = (page, msg) => warns.push(`${page}: ${msg}`);

if (!fs.existsSync(DIST)) { console.error('dist/ not found. Run astro build first.'); process.exit(2); }

// ---------- load data ----------
const data = loadData();
const { pricing, programs } = data;
const toolsData = data.tools;
const known = knownFigures(data);
const toolNames = Object.values(toolsData).map((t) => t.name);
// Pipeline words a reader should never see: data-file field names, "earlier pass", raw ISO dates.
const JARGON = /\b\w+\[\]|\b(?:checkedOn|annualMonthly|priceUnit|addOns|extraCosts|billingNotes|freeTier|lastReviewed|dateModified|ranOn|seatsIncluded|sizeLabels|pricedByCountry|pricingUrl|rateHistory|appliesTo|cardRequired|sameJob|notScoredReason|oneLiner|trialOffer|paidOnlyOn)\b|\bearlier pass\b|\b\d{4}-\d{2}-\d{2}\b/;

// Per-page extra figures declared in MDX frontmatter.
function pathForEntry(id) {
  const [kind, slug] = id.split('/');
  if (kind === 'guides') { const i = slug.indexOf('--'); return `/tools/${slug.slice(0, i)}/${slug.slice(i + 2)}/`; }
  return { pricing: `/tools/${slug}/pricing/`, tools: `/tools/${slug}/`, compare: `/compare/${slug}/`, alternatives: `/alternatives/${slug}/`, stacks: `/stacks/${slug}/`, pages: `/${slug}/` }[kind];
}
const extraFigs = new Map();
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
for (const f of walk('src/content').filter((x) => x.endsWith('.mdx'))) {
  const id = path.relative('src/content', f).replace(/\.mdx$/, '').split(path.sep).join('/');
  const fm = fs.readFileSync(f, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const vals = [...fm.matchAll(/-\s*value:\s*["']?([^"'\n]+)["']?/g)].map((m) => normFig(m[1]));
  extraFigs.set(pathForEntry(id), new Set(vals.filter(Boolean)));
}

// ---------- load pages ----------
const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
const pages = new Map(); // path -> {doc, file, noindex}
for (const file of htmlFiles) {
  const rel = '/' + path.relative(DIST, file).split(path.sep).join('/');
  const p = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
  const html = fs.readFileSync(file, 'utf8');
  const { document } = parseHTML(html);
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  pages.set(p, { doc: document, html, file, noindex: /noindex/.test(robots) || p === '/404.html' });
}
const exists = (p) => pages.has(p) || fs.existsSync(path.join(DIST, p.replace(/^\//, ''))) || fs.existsSync(path.join(DIST, p.replace(/^\//, ''), 'index.html'));
// A built page or file (a folder that only holds other pages, like /tools/ahrefs/, is not a page).
const built = (p) => pages.has(p) || (!p.endsWith('/') && fs.existsSync(path.join(DIST, p.replace(/^\//, ''))));

const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
const words = (s) => s.split(/\s+/).filter(Boolean).length;



const titles = new Map();
const descs = new Map();
const graphs = new Map(); // path -> JSON-LD @graph, for references from one page to a node on another
const crossRefs = []; // [page, key, @id]
const sentencePages = new Map();
const linkGraph = new Map();

for (const [p, { doc, html, noindex }] of pages) {
  if (p === '/404.html') continue;
  const main = doc.querySelector('main');
  // 1. title + description
  const title = text(doc.querySelector('title'));
  if (!title) fail(p, 'missing <title>');
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  if (!desc) fail(p, 'missing meta description');
  if (!noindex) {
    if (desc && (desc.length < 110 || desc.length > 165)) fail(p, `meta description is ${desc.length} chars (110–165)`);
    if (titles.has(title)) fail(p, `duplicate <title> with ${titles.get(title)}`); else titles.set(title, p);
    if (descs.has(desc)) fail(p, `duplicate description with ${descs.get(desc)}`); else descs.set(desc, p);
  }
  // 2. canonical
  const canon = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (!noindex && canon !== `${SITE}${p}`) fail(p, `canonical is ${canon}, expected ${SITE}${p}`);
  // 2b. unique ids (fragment links and citations depend on them)
  const ids = [...doc.querySelectorAll('[id]')].map((e) => e.getAttribute('id'));
  const dupIds = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  if (dupIds.length) fail(p, `duplicate id: ${dupIds.join(', ')}`);
  // 3. one h1
  const h1s = doc.querySelectorAll('h1');
  if (h1s.length !== 1) fail(p, `${h1s.length} <h1> elements`);
  // 4. JSON-LD
  const lds = doc.querySelectorAll('script[type="application/ld+json"]');
  let graph = [];
  if (lds.length !== 1) fail(p, `${lds.length} JSON-LD blocks (want exactly 1)`);
  try {
    const j = JSON.parse(lds[0]?.textContent ?? '{}');
    graph = j['@graph'] ?? [];
    if (!Array.isArray(graph) || !graph.length) fail(p, 'JSON-LD has no @graph');
    const ids = graph.map((n) => n['@id']).filter(Boolean);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    if (dup.length) fail(p, `duplicate @id in graph: ${[...new Set(dup)].join(', ')}`);
  } catch (e) { fail(p, `JSON-LD does not parse: ${e.message}`); }
  graphs.set(p, graph);
  const typeOf = (n) => [].concat(n['@type'] ?? []);
  const node = (type) => graph.find((n) => typeOf(n).includes(type));
  // 4b. every @id names a page that is built, and no @id reference dangles. A reference is an object
  // holding only an @id. about/mentions/isBasedOn may point at a node on another page (checked
  // after all pages are read); every other reference must resolve in this page's graph.
  {
    const defined = new Set(graph.map((n) => n['@id']).filter(Boolean));
    for (const id of defined) if (!id.startsWith(`${SITE}/`) || !built(id.slice(SITE.length).split('#')[0])) fail(p, `JSON-LD @id ${id} is not on a built page`);
    const refs = (o, key) => {
      if (Array.isArray(o)) return o.forEach((x) => refs(x, key));
      if (!o || typeof o !== 'object') return;
      if (Object.keys(o).length === 1 && typeof o['@id'] === 'string') {
        if (defined.has(o['@id'])) return;
        if (['about', 'mentions', 'isBasedOn'].includes(key)) crossRefs.push([p, key, o['@id']]);
        else fail(p, `JSON-LD ${key} -> ${o['@id']} is not defined in the page's graph`);
        return;
      }
      for (const [k, v] of Object.entries(o)) if (k !== '@id') refs(v, k);
    };
    graph.forEach((n) => refs(n, ''));
  }
  // 4c. software apps (Google's software-app result needs offers with a price and a rating): each one
  // carries a review or rating, and every offer's price is printed on the page.
  {
    const vis = text(main);
    for (const s of graph.filter((n) => typeOf(n).includes('SoftwareApplication'))) {
      if (!s.review && !s.aggregateRating) fail(p, `SoftwareApplication ${s.name} without a review or rating (link its Review, or leave the app out)`);
      const offers = [].concat(s.offers ?? []);
      if (!offers.length) fail(p, `SoftwareApplication ${s.name} without offers`);
      for (const o of offers) {
        if (o.price === undefined || o.price === null || o.price === '') { fail(p, `${s.name} offer ${o.name} without a price`); continue; }
        const v = Number(o.price);
        if (v > 0 && !new RegExp(`${money(v).replace(/[$.]/g, '\\$&')}(?!\\d|[.,]\\d)`).test(vis)) fail(p, `${s.name} offer ${o.name} at ${money(v)} is in the markup but not printed on the page`);
      }
    }
    // A list names each entry once (a stack layer is named with its layer).
    for (const l of graph.filter((n) => typeOf(n).includes('ItemList') && Array.isArray(n.itemListElement) && n.itemListElement.every((x) => x.name))) {
      const names = l.itemListElement.map((x) => x.name);
      const twice = names.filter((x, i) => names.indexOf(x) !== i);
      if (twice.length) fail(p, `ItemList ${l['@id']} names ${twice[0]} more than once`);
    }
  }
  // 5. FAQ sync
  const qs = [...doc.querySelectorAll('[data-faq-q]')].map(text);
  const faqNode = node('FAQPage');
  if (qs.length && !faqNode) fail(p, 'visible FAQ without FAQPage schema');
  if (faqNode) {
    const details = [...doc.querySelectorAll('[data-faq] details')];
    const vis = details.map((d) => ({ q: text(d.querySelector('[data-faq-q]')), a: [...d.querySelectorAll('[data-faq-a]')].map(text).join('\n\n') }));
    const sch = faqNode.mainEntity.map((m) => ({ q: m.name.replace(/\s+/g, ' ').trim(), a: m.acceptedAnswer.text.split(/\n\n+/).map((x) => x.replace(/\s+/g, ' ').trim()).join('\n\n') }));
    if (vis.length !== sch.length) fail(p, `FAQ: ${vis.length} visible vs ${sch.length} in schema`);
    vis.forEach((v, i) => { if (!sch[i] || v.q !== sch[i].q || v.a !== sch[i].a) fail(p, `FAQ item ${i + 1} differs between page and schema`); });
    vis.forEach((v) => { const n = words(v.a); if (n < 60 || n > 200) fail(p, `FAQ answer is ${n} words (aim 90–160): "${v.q}"`); else if (n < 90 || n > 160) warn(p, `FAQ answer is ${n} words: "${v.q}"`); });
  }
  // 6. breadcrumb sync
  const crumbNode = node('BreadcrumbList');
  const visCrumbs = [...doc.querySelectorAll('nav.crumbs a, nav.crumbs span:not([aria-hidden])')].map(text);
  if (crumbNode) {
    const names = crumbNode.itemListElement.map((x) => x.name);
    if (names.join(' > ') !== visCrumbs.join(' > ')) fail(p, `breadcrumbs differ: page "${visCrumbs.join(' > ')}" vs schema "${names.join(' > ')}"`);
    // Google requires item on every crumb but the last, and it must be a page that exists.
    crumbNode.itemListElement.forEach((x, i, all) => {
      if (i === all.length - 1) return;
      if (!x.item) fail(p, `breadcrumb "${x.name}" has no item URL (only the last crumb may leave it out)`);
      else if (!x.item.startsWith(`${SITE}/`) || !built(x.item.slice(SITE.length))) fail(p, `breadcrumb "${x.name}" points at ${x.item}, which is not built`);
    });
  } else if (visCrumbs.length) fail(p, 'visible breadcrumbs without BreadcrumbList');
  // 7. verified date sync
  const wp = graph.find((n) => /WebPage|AboutPage|ContactPage|CollectionPage/.test(n['@type']) && n.lastReviewed);
  const vis = doc.querySelector('time[data-verified]')?.getAttribute('datetime');
  if (vis && wp && wp.lastReviewed !== vis) fail(p, `lastReviewed ${wp.lastReviewed} ≠ visible verified date ${vis}`);
  // 8. review rating visible: each Review matches the score panel (#score-<tool>) of the tool it reviews
  for (const rev of graph.filter((n) => typeOf(n).includes('Review'))) {
    const app = graph.find((n) => n['@id'] && n['@id'] === rev.itemReviewed?.['@id']);
    const id = (app?.['@id'] ?? '').match(/\/tools\/([a-z0-9-]+)\//)?.[1];
    const shown = id ? doc.getElementById(`score-${id}`)?.getAttribute('data-score') : undefined;
    if (!app) fail(p, `Review ${rev['@id']} does not review an app in the page's graph`);
    else if (String(rev.reviewRating?.ratingValue) !== String(shown)) fail(p, `Review rating ${rev.reviewRating?.ratingValue} for ${app.name} not the visible score ${shown}`);
    else if (app.review?.['@id'] !== rev['@id']) fail(p, `SoftwareApplication ${app.name} does not link its Review (review: {"@id": "${rev['@id']}"})`);
  }
  // 9. quick answer
  const qa = doc.querySelector('[data-quick-answer] p');
  if (qa) {
    const n = words(text(qa));
    if (n < 50 || n > 130) fail(p, `quick answer is ${n} words (aim 60–120)`);
    if (/\/(tools\/[^/]+\/[^/]+|compare|stacks)\//.test(p) && !/\d/.test(text(qa))) fail(p, 'quick answer on a cost page has no number');
  }
  // 10. table leads
  for (const w of doc.querySelectorAll('.tbl-wrap')) {
    const prev = w.previousElementSibling;
    if (!prev || !['P', 'SUMMARY'].includes(prev.tagName)) fail(p, 'table without a lead sentence before it');
  }
  // 11. paid links + disclosure + words per paid button
  const paid = [...doc.querySelectorAll('a[data-paid="1"]')];
  for (const a of doc.querySelectorAll('a.btn-aff, a.aff-inline')) if (a.getAttribute('data-paid') !== '1') fail(p, 'amber styling on a link that does not pay');
  for (const a of paid) {
    if (!/\bsponsored\b/.test(a.getAttribute('rel') ?? '')) fail(p, `paid link without rel=sponsored (${a.getAttribute('data-tool')})`);
    // Programs want the disclosure right beside each link, not only at the top of the page.
    const note = a.nextElementSibling;
    if (!note?.hasAttribute('data-paid-note') || !/\bpaid link\b/i.test(note.textContent)) fail(p, `paid link without a "Paid link" note beside it (${a.getAttribute('data-tool')})`);
    const prog = programs[toolsData[a.getAttribute('data-tool')]?.affiliate?.program ?? ''];
    if (!prog || prog.status !== 'approved' || !prog.template) fail(p, `paid link for ${a.getAttribute('data-tool')} but its program is not approved with a link`);
    // A program's own required wording must be in the page's disclosure, wherever its link appears.
    const must = prog?.rules?.mandatoryDisclosure;
    if (must && ![...doc.querySelectorAll('[data-disclosure]')].some((d) => text(d).includes(must.replace(/\s+/g, ' ').trim()))) fail(p, `paid link for ${a.getAttribute('data-tool')} without the wording its program requires in the disclosure`);
    else if (prog.rules?.paidOnlyOn && !prog.rules.paidOnlyOn.some((prefix) => p.startsWith(prefix))) fail(p, `paid link for ${a.getAttribute('data-tool')} outside the pages its program allows (${prog.rules.paidOnlyOn.join(', ')})`);
  }
  if (paid.length) {
    if (!doc.querySelector('[data-disclosure]')) fail(p, 'paid links without a disclosure');
    const w = words(text(main));
    if (w / paid.length < 150) fail(p, `${Math.round(w / paid.length)} words per paid link (min 150)`);
    const disc = doc.querySelector('[data-disclosure]');
    const firstPaid = paid[0];
    if (disc && firstPaid && (disc.compareDocumentPosition(firstPaid) & 4) === 0) fail(p, 'disclosure appears after the first paid link');
  }
  // 11d. a "pays us, links here are plain" disclosure line never sits beside a paid link for that tool
  for (const el of doc.querySelectorAll('[data-pays-plain]')) {
    const tid = el.getAttribute('data-pays-plain');
    if (doc.querySelector(`a[data-paid="1"][data-tool="${tid}"]`)) fail(p, `disclosure says links to ${tid} are plain, but the page has a paid ${tid} link`);
  }
  // 11b. the editor's own paid-service box: never inside editorial text, a score, a table or a pick
  for (const box of doc.querySelectorAll('[data-svc]')) {
    if (box.closest('.prose-body, [data-prose], [data-quick-answer], table, .pick, .picks, .score, [data-score], [data-verdict]')) fail(p, 'service box inside editorial text, a score, a table or a pick');
    if (!/our own paid service/i.test(text(box))) fail(p, 'service box without its "Our own paid service" label');
  }
  // 11c. a stack pick from a tool that pays us is never shown alone (/how-we-earn/, /methodology/):
  // every pick whose program is approved, and every paid link, sits in a layer that also shows the
  // highest-scored option for that job, or says the pick is itself the highest scored.
  if (/^\/stacks\/[^/]+\/$/.test(p)) {
    const approved = (id) => { const pr = programs[toolsData[id]?.affiliate?.program ?? '']; return Boolean(pr && pr.status === 'approved' && pr.template); };
    const scoreOf = (id) => { try { return JSON.parse(fs.readFileSync(path.join('src/data/scores', `${id}.json`), 'utf8')).overall ?? null; } catch { return null; } };
    const cards = [...doc.querySelectorAll('[data-layer-pick]')];
    if (!cards.length) fail(p, 'stack page without [data-layer-pick] pick cards, so the paid-pick rule cannot be checked');
    const shownBeside = (card) => {
      const layer = card.closest('.picks');
      const top = layer?.querySelector('[data-top-option]');
      if (layer?.querySelector('[data-top-note]')) return true;
      if (!top) return false;
      const a = scoreOf(top.getAttribute('data-top-option')), b = scoreOf(card.getAttribute('data-layer-pick'));
      if (a === null || b === null || a < b) { fail(p, `"Highest-scored option" ${top.getAttribute('data-top-option')} does not outscore the pick ${card.getAttribute('data-layer-pick')}`); }
      if (!/highest-scored option/i.test(text(top))) fail(p, `top-option card for ${top.getAttribute('data-top-option')} without its "Highest-scored option" label`);
      return true;
    };
    for (const card of cards) {
      const id = card.getAttribute('data-layer-pick');
      if (!approved(id) && !card.querySelector('a[data-paid="1"]')) continue;
      if (!/our pick among tools that pay us/i.test(text(card.querySelector('.lbl')))) fail(p, `${id} pays us but its pick card is not labeled "Our pick among tools that pay us"`);
      if (!shownBeside(card)) fail(p, `paid pick ${id} shown without the highest-scored option beside it or a note that it is the highest scored`);
    }
    for (const a of paid) if (!a.closest('[data-layer-pick]')) fail(p, `paid link for ${a.getAttribute('data-tool')} outside a stack pick card, where the paid-pick rule cannot be checked`);
  }
  // 12. banned lexicon (main content, excluding the mandated disclosure text)
  if (main) {
    const clone = main.cloneNode(true);
    clone.querySelectorAll('[data-disclosure], blockquote.callout').forEach((x) => x.remove());
    const t = text(clone);
    for (const [re, why] of BANNED) { const m = t.match(re); if (m) fail(p, `${why}: "${m[0]}"`); }
  }
  // 13. prose figures must come from data
  const allowed = extraFigs.get(p) ?? new Set();
  const figText = (el) => { const c = el.cloneNode(true); c.querySelectorAll('data[data-fig], .aff-pair, [data-paid-note], .prose-cta').forEach((x) => x.remove()); return text(c); };
  for (const el of doc.querySelectorAll('.prose-body, [data-prose]')) {
    for (const f of figuresIn(figText(el))) if (f.v && !known.has(f.v) && !allowed.has(f.v)) fail(p, `prose figure ${f.raw} is not in the data (use a data token or declare it in extraFigures)`);
  }
  // 13b. The passages answer engines quote (Quick answer, FAQ answers, title, description) may only
  // use figures of the tools this page covers (or that the passage itself names), and an "as of
  // <date>" must be one of those tools' check dates (scripts/lib/scope.mjs).
  {
    const [kind, slug] = pageRef(p) ?? ['pages', p];
    const scope = pageScope(data, kind, slug, known);
    const passage = (label, t, figs = t) => {
      const ok = passageFigures(data, scope, figs);
      for (const f of figuresIn(t)) if (f.v && !ok.has(f.v) && !allowed.has(f.v)) fail(p, `${label} figure ${f.raw} is not a figure of ${scope.tools ? scope.tools.join(', ') : 'any tool'} in the data`);
      const lead = leadDates(data, scope, t);
      for (const d of badAsOf(t, lead, passageDates(data, scope, figs))) fail(p, `${label} says "as of ${d}", but the tools it dates were checked ${[...lead].join(' or ')}`);
    };
    for (const el of doc.querySelectorAll('[data-quick-answer] p')) passage('quick answer', figText(el));
    for (const d of doc.querySelectorAll('[data-faq] details')) {
      const q = text(d.querySelector('[data-faq-q]'));
      const a = [...d.querySelectorAll('[data-faq-a]')].map(figText).join(' ');
      passage(`FAQ answer "${q}"`, a, `${q} ${a}`);
    }
    if (!noindex) passage('title/description', `${title} ${desc}`);
  }
  // 13c. text hygiene, on everything a reader sees (code samples excepted):
  // US spelling; FAQ answers that stand alone when quoted; no pipeline jargon (JSON field names,
  // "earlier pass", ISO dates outside <time> and <data>) in reader-facing text.
  {
    const body = doc.querySelector('body')?.cloneNode(true);
    body?.querySelectorAll('script, style, code, pre').forEach((x) => x.remove());
    const uk = ukSpellings(`${title} ${desc} ${text(body)}`);
    if (uk.length) fail(p, `US spelling, please: ${[...new Set(uk)].join(', ')}`);
    body?.querySelectorAll('time, data').forEach((x) => x.remove());
    const jargon = text(body).match(JARGON);
    if (jargon) fail(p, `pipeline jargon in reader-facing text: "${jargon[0]}"`);
    for (const d of doc.querySelectorAll('[data-faq] details')) {
      const q = text(d.querySelector('[data-faq-q]'));
      const m = [...d.querySelectorAll('[data-faq-a]')].map(text).join(' ').match(FAQ_CONTEXT);
      if (m) fail(p, `FAQ answer must stand alone when quoted, but says "${m[0].trim()}": "${q}"`);
      if (vagueQuestion(q, toolNames)) fail(p, `FAQ question must name the tools it compares: "${q}"`);
    }
  }
  // 14. year agreement in title/h1
  const years = `${title} ${text(h1s[0])}`.match(/\b20\d\d\b/g) ?? [];
  const pageYear = (wp?.lastReviewed ?? Object.values(pricing).map((x) => x.checkedOn).sort().at(-1) ?? '').slice(0, 4);
  for (const y of years) if (pageYear && y !== pageYear) fail(p, `title/h1 says ${y} but the page was verified in ${pageYear}`);
  // 15. CSS budget + no JS
  const css = [...doc.querySelectorAll('style')].reduce((a, s) => a + s.textContent.length, 0);
  if (css > 30000) fail(p, `inline CSS ${css} bytes (max 30000)`);
  // The only script allowed is the analytics loader, and only while GA_ID switches analytics on.
  for (const s of doc.querySelectorAll('script')) {
    if (s.getAttribute('type') === 'application/ld+json') continue;
    const ok = GA_ID && s.getAttribute('src') === '/site.js' && s.getAttribute('data-ga') === GA_ID && s.hasAttribute('defer') && !s.textContent.trim();
    if (!ok) fail(p, 'page ships JavaScript other than the analytics loader');
  }
  if (GA_ID && !doc.querySelector('script[src="/site.js"]')) fail(p, 'analytics is on but this page does not load /site.js');
  // 16. duplicate sentences across pages (editorial text only, plus every table lead)
  for (const el of doc.querySelectorAll('.prose-body, [data-prose], [data-quick-answer], [data-faq-a], .table-lead')) {
    // Buttons and their "Paid link" notes are template text, not editorial sentences. Table leads
    // are not exempt: each one is built from data and must say something specific to its page.
    const ed = el.cloneNode(true);
    ed.querySelectorAll('.aff-pair, [data-paid-note], .prose-cta, .tbl-wrap').forEach((x) => x.remove());
    for (const s of text(ed).split(/(?<=[.!?])\s+/)) {
      if (words(s) < 10) continue;
      const k = s.toLowerCase();
      if (!sentencePages.has(k)) sentencePages.set(k, new Set());
      sentencePages.get(k).add(p);
    }
  }
  // 17. internal links + fragments
  const out = new Set();
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (/^(mailto:|tel:|https?:)/.test(href) || href.startsWith('//')) continue;
    if (href.startsWith('#')) {
      const id = decodeURIComponent(href.slice(1));
      if (id && !doc.getElementById(id)) fail(p, `link to missing fragment ${href}`);
      continue;
    }
    if (!href.startsWith('/')) { fail(p, `relative link ${href}`); continue; }
    const [pathPart, frag] = href.split('#');
    const clean = pathPart.split('?')[0];
    if (!exists(clean)) { fail(p, `broken internal link ${href}`); continue; }
    if (!/\.[a-z0-9]+$/i.test(clean) && !clean.endsWith('/')) fail(p, `link without trailing slash ${href}`);
    if (frag && pages.has(clean) && !pages.get(clean).doc.getElementById(decodeURIComponent(frag))) fail(p, `link to missing fragment ${href}`);
    if (pages.has(clean)) out.add(clean);
  }
  linkGraph.set(p, out);
}

// ---------- site-wide ----------
// JSON-LD references to a node on another page (about/mentions/isBasedOn) must find that node there.
for (const [p, key, id] of crossRefs) {
  const host = id.startsWith(`${SITE}/`) ? graphs.get(id.slice(SITE.length).split('#')[0]) : null;
  if (!host || !host.some((n) => n['@id'] === id)) fail(p, `JSON-LD ${key} -> ${id} is defined on no built page`);
}
for (const [s, ps] of sentencePages) if (ps.size > 3) fail([...ps].slice(0, 4).join(', '), `sentence repeated on ${ps.size} pages: "${s.slice(0, 90)}…"`);

// sitemap
const smPath = path.join(DIST, 'sitemap.xml');
const sitemap = fs.existsSync(smPath) ? fs.readFileSync(smPath, 'utf8') : '';
if (!sitemap) fail('/sitemap.xml', 'missing');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ''));
const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
if (lastmods.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d))) fail('/sitemap.xml', 'lastmod not YYYY-MM-DD');
for (const l of locs) {
  if (!pages.has(l)) fail('/sitemap.xml', `lists ${l}, which does not exist`);
  else if (pages.get(l).noindex) fail('/sitemap.xml', `lists noindex page ${l}`);
}
for (const [p, { noindex }] of pages) if (!noindex && p !== '/404.html' && !locs.includes(p)) fail(p, 'indexable page missing from sitemap');

// date sync (docs/plan/05-seo.md): sitemap lastmod = JSON-LD dateModified = the visible "Updated" date
for (const [, loc, lastmod] of sitemap.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) {
  const p = loc.replace(SITE, '');
  const pg = pages.get(p);
  if (!pg) continue;
  let graph = [];
  try { graph = JSON.parse(pg.doc.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}')['@graph'] ?? []; } catch {}
  const ld = [...new Set(graph.map((n) => n.dateModified).filter(Boolean))];
  const shown = [...new Set([...pg.doc.querySelectorAll('.byline span, p.updated')]
    .filter((el) => /Updated/.test(el.textContent))
    .map((el) => [...el.querySelectorAll('time:not([data-verified])')].at(-1)?.getAttribute('datetime'))
    .filter(Boolean))];
  for (const d of ld) if (d !== lastmod) fail(p, `sitemap lastmod ${lastmod} ≠ JSON-LD dateModified ${d}`);
  for (const d of shown) if (d !== lastmod) fail(p, `sitemap lastmod ${lastmod} ≠ visible "Updated" date ${d}`);
}

// crawl depth from the homepage
const depth = new Map([['/', 0]]);
const queue = ['/'];
while (queue.length) {
  const cur = queue.shift();
  for (const nxt of linkGraph.get(cur) ?? []) if (!depth.has(nxt)) { depth.set(nxt, depth.get(cur) + 1); queue.push(nxt); }
}
for (const l of locs) {
  if (!depth.has(l)) fail(l, 'not reachable from the homepage (orphan)');
  else if (depth.get(l) > 3) fail(l, `crawl depth ${depth.get(l)} (max 3)`);
}

// ---------- internal linking gates (docs/plan/03-architecture.md, "Internal linking") ----------
// Editorial links are the <a> inside <main> of an indexable page, minus breadcrumbs. Links from
// the homepage and the hubs are generated lists, so they do not count as inbound editorial links.
{
  const HUBS = new Set(['/', '/tools/', '/compare/', '/stacks/', '/alternatives/']);
  // 05-seo.md: the orphan gate reports at launch and fails after week four.
  const ORPHAN_FAIL_FROM = '2026-10-24';
  const today = new Date().toISOString().slice(0, 10);
  const mainLinks = new Map();
  for (const [p, { doc, noindex }] of pages) {
    if (noindex || p === '/404.html') continue;
    const set = new Set();
    for (const a of doc.querySelectorAll('main a[href]')) {
      if (a.closest('nav.crumbs')) continue;
      const href = a.getAttribute('href');
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      const clean = href.split('#')[0].split('?')[0];
      if (clean !== p && pages.has(clean) && !pages.get(clean).noindex) set.add(clean);
    }
    mainLinks.set(p, set);
  }
  const inbound = new Map();
  for (const [src, set] of mainLinks) {
    if (HUBS.has(src)) continue;
    for (const t of set) { if (!inbound.has(t)) inbound.set(t, new Set()); inbound.get(t).add(src); }
  }
  // 1. Every pricing page links every comparison of its tool and its alternatives page.
  for (const [p, set] of mainLinks) {
    const id = p.match(/^\/tools\/([a-z0-9-]+)\/pricing\/$/)?.[1];
    if (!id) continue;
    const want = Object.values(data.comparisons).filter((c) => c.a === id || c.b === id).map((c) => `/compare/${c.id}/`).filter((x) => pages.has(x));
    if (pages.has(`/alternatives/${id}/`)) want.push(`/alternatives/${id}/`);
    for (const w of want) if (!set.has(w)) fail(p, `pricing page does not link ${w} (every comparison of the tool and its alternatives page)`);
  }
  // 2. Curated guides in stack and comparison data must be published guides.
  for (const [kind, prefix] of [['stacks', '/stacks/'], ['comparisons', '/compare/']]) {
    for (const [slug, d] of Object.entries(data[kind] ?? {})) for (const g of d.guides ?? []) {
      if (!pages.has(g) || !/^\/tools\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(g) || g.endsWith('/pricing/')) fail(`${prefix}${slug}/`, `data lists guide ${g}, which is not a published guide`);
    }
  }
  // 3. Every guide has at least 3 inbound editorial links; every other indexable page at least 2
  // (content pages: report until ORPHAN_FAIL_FROM, then fail; utility pages: report only).
  const isGuide = (p) => /^\/tools\/[a-z0-9-]+\/[a-z0-9-]+\/$/.test(p) && !p.endsWith('/pricing/');
  const isContent = (p) => /^\/(tools|compare|alternatives|stacks)\/[a-z0-9-]+\//.test(p);
  for (const l of locs) {
    if (HUBS.has(l) || !pages.has(l)) continue;
    const n = inbound.get(l)?.size ?? 0;
    if (isGuide(l) && n < 3) fail(l, `guide has ${n} inbound editorial link(s) from other pages (min 3, not counting / and the hubs)`);
    else if (n < 2) (isContent(l) && today >= ORPHAN_FAIL_FROM ? fail : warn)(l, `${n} inbound editorial link(s) (min 2, not counting / and the hubs)`);
  }
}

// The Content-Security-Policy must match the analytics switch: no scripts at all while GA_ID is
// empty, and exactly our loader plus Google's tag and collection hosts while it is set.
const toml = fs.readFileSync('netlify.toml', 'utf8');
const csp = toml.match(/Content-Security-Policy = "([^"]+)"/)?.[1] ?? '';
const dir = (name) => csp.split(';').map((x) => x.trim().split(/\s+/)).find((x) => x[0] === name)?.slice(1) ?? [];
if (!csp) fail('netlify.toml', 'no Content-Security-Policy header');
else if (GA_ID) {
  const need = { 'script-src': ["'self'", 'https://*.googletagmanager.com'], 'connect-src': ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com'], 'img-src': ['https://*.google-analytics.com', 'https://*.googletagmanager.com'] };
  for (const [d, vals] of Object.entries(need)) for (const v of vals) if (!dir(d).includes(v)) fail('netlify.toml', `analytics is on but the CSP ${d} lacks ${v}`);
  if (dir('script-src').some((v) => /unsafe/.test(v))) fail('netlify.toml', 'the CSP script-src must not allow unsafe scripts');
  if (!fs.existsSync(path.join(DIST, 'site.js'))) fail('/site.js', 'analytics is on but the loader was not built');
} else if (dir('script-src').join(' ') !== "'none'") fail('netlify.toml', "analytics is off, so the CSP script-src must be 'none'");

// robots + llms
const robots = fs.existsSync(path.join(DIST, 'robots.txt')) ? fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8') : '';
if (!/Sitemap: https:\/\/cinchstack\.com\/sitemap\.xml/.test(robots)) fail('/robots.txt', 'missing or has no Sitemap line');
// IndexNow key file (scripts/indexnow.mjs): exactly the key, so engines can confirm we own the
// host, and never in the sitemap, since it is not a page.
const keyFile = path.join(DIST, `${INDEXNOW_KEY}.txt`);
if (!fs.existsSync(keyFile)) fail(`/${INDEXNOW_KEY}.txt`, 'IndexNow key file missing (public/<key>.txt)');
else if (fs.readFileSync(keyFile, 'utf8') !== INDEXNOW_KEY) fail(`/${INDEXNOW_KEY}.txt`, 'IndexNow key file must hold exactly INDEXNOW_KEY, with no trailing newline');
if (sitemap.includes(`${INDEXNOW_KEY}.txt`)) fail('/sitemap.xml', 'lists the IndexNow key file');
const llms = fs.existsSync(path.join(DIST, 'llms.txt')) ? fs.readFileSync(path.join(DIST, 'llms.txt'), 'utf8') : '';
if (!llms) fail('/llms.txt', 'missing');
const llmsUrls = [...llms.matchAll(/\]\((https:\/\/cinchstack\.com[^)]*)\)/g)].map((m) => m[1].replace(SITE, ''));
for (const u of llmsUrls) if (!exists(u)) fail('/llms.txt', `lists ${u}, which does not exist`);
if (new Set(llmsUrls).size !== llmsUrls.length) fail('/llms.txt', 'lists a URL twice');
// llms-full.txt (scripts/llms-full.mjs): one section per sitemap URL, in sitemap order, as plain text
// with no page chrome. The footer's lines must not repeat. Past 3 MB it warns; only a file that has
// grown far past that (10 MB) fails, so a growing site cannot block a price fix through this file.
const full = fs.existsSync(path.join(DIST, 'llms-full.txt')) ? fs.readFileSync(path.join(DIST, 'llms-full.txt'), 'utf8') : '';
if (!full) fail('/llms-full.txt', 'missing (npm run build writes it with scripts/llms-full.mjs)');
else {
  const heads = full.match(/^## /gm)?.length ?? 0;
  const secUrls = [...full.matchAll(/^## .+\n\nURL: (\S+)$/gm)].map((m) => m[1].replace(SITE, ''));
  if (heads !== locs.length) fail('/llms-full.txt', `${heads} page sections for ${locs.length} sitemap URLs`);
  const off = [...Array(Math.max(locs.length, secUrls.length)).keys()].find((i) => secUrls[i] !== locs[i]);
  if (off !== undefined) fail('/llms-full.txt', `section ${off + 1} has the URL line ${secUrls[off] ?? 'none'}, but sitemap URL ${off + 1} is ${locs[off] ?? 'none'}`);
  // Code fences and code spans hold literal markup on purpose (the /data/ credit line, a named <select>).
  const prose = full.replace(/^```[\s\S]*?^```$/gm, '').replace(/`[^`\n]*`/g, '');
  const tag = prose.search(/<[a-z/]/i);
  if (tag >= 0) fail('/llms-full.txt', `HTML left in the text: "${prose.slice(tag, tag + 50).split('\n')[0]}"`);
  for (const el of pages.get('/')?.doc.querySelectorAll('footer p') ?? []) {
    const t = text(el);
    if (t && full.split(t).length > 2) fail('/llms-full.txt', `the footer line "${t.slice(0, 60)}…" appears more than once`);
  }
  const size = Buffer.byteLength(full);
  const mb = `${(size / 1048576).toFixed(1)} MB`;
  if (size >= 10 * 1024 * 1024) fail('/llms-full.txt', `${mb} (max 10 MB)`);
  else if (size >= 3 * 1024 * 1024) warn('/llms-full.txt', `${mb}: past 3 MB, consider printing repeated sourcing blocks once`);
}

// ---------- report ----------
const n = pages.size;
if (warns.length) { console.log(`\n${warns.length} warning(s):`); warns.forEach((w) => console.log(`  ⚠ ${w}`)); }
if (fails.length) {
  console.log(`\n${fails.length} failure(s) across ${n} pages:`);
  fails.forEach((f) => console.log(`  ✗ ${f}`));
  if (!WARN_ONLY) process.exit(1);
} else {
  console.log(`\n✓ check passed: ${n} pages, ${locs.length} in sitemap, ${known.size} known figures, max crawl depth ${Math.max(0, ...depth.values())}.`);
}
