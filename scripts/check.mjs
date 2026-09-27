#!/usr/bin/env node
// The launch gate. Reads the built site in dist/ and fails the build on anything that would
// mislead a reader, confuse a search engine, or break an affiliate contract.
// Usage: node scripts/check.mjs [--warn-only]
import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { loadData, knownFigures, normFig, BANNED } from './lib/figures.mjs';

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

// Per-page extra figures declared in MDX frontmatter.
function pathForEntry(id) {
  const [kind, slug] = id.split('/');
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

const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
const words = (s) => s.split(/\s+/).filter(Boolean).length;



const titles = new Map();
const descs = new Map();
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
  const node = (type) => graph.find((n) => n['@type'] === type);
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
  } else if (visCrumbs.length) fail(p, 'visible breadcrumbs without BreadcrumbList');
  // 7. verified date sync
  const wp = graph.find((n) => /WebPage|AboutPage|ContactPage|CollectionPage/.test(n['@type']) && n.lastReviewed);
  const vis = doc.querySelector('time[data-verified]')?.getAttribute('datetime');
  if (vis && wp && wp.lastReviewed !== vis) fail(p, `lastReviewed ${wp.lastReviewed} ≠ visible verified date ${vis}`);
  // 8. review rating visible
  const rev = node('Review');
  if (rev) {
    const shown = doc.querySelector('[data-score]')?.getAttribute('data-score');
    if (String(rev.reviewRating.ratingValue) !== String(shown)) fail(p, `Review rating ${rev.reviewRating.ratingValue} not the visible score ${shown}`);
  }
  // 9. quick answer
  const qa = doc.querySelector('[data-quick-answer] p');
  if (qa) {
    const n = words(text(qa));
    if (n < 50 || n > 130) fail(p, `quick answer is ${n} words (aim 60–120)`);
    if (/\/(tools\/[^/]+\/pricing|compare|stacks)\//.test(p) && !/\d/.test(text(qa))) fail(p, 'quick answer on a cost page has no number');
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
    const prog = programs[toolsData[a.getAttribute('data-tool')]?.affiliate?.program ?? ''];
    if (!prog || prog.status !== 'approved' || !prog.template) fail(p, `paid link for ${a.getAttribute('data-tool')} but its program is not approved with a link`);
  }
  if (paid.length) {
    if (!doc.querySelector('[data-disclosure]')) fail(p, 'paid links without a disclosure');
    const w = words(text(main));
    if (w / paid.length < 150) fail(p, `${Math.round(w / paid.length)} words per paid link (min 150)`);
    const disc = doc.querySelector('[data-disclosure]');
    const firstPaid = paid[0];
    if (disc && firstPaid && (disc.compareDocumentPosition(firstPaid) & 4) === 0) fail(p, 'disclosure appears after the first paid link');
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
  for (const el of doc.querySelectorAll('.prose-body, [data-prose], [data-quick-answer], [data-faq-a]')) {
    const c = el.cloneNode(true);
    c.querySelectorAll('data[data-fig]').forEach((x) => x.remove());
    for (const m of text(c).matchAll(/\$\s?(\d[\d,]*(?:\.\d+)?)(\s?[kK]\b)?/g)) {
      const v = normFig(m[1] + (m[2] ? 'k' : ''));
      if (v && !known.has(v) && !allowed.has(v)) fail(p, `prose figure ${m[0].trim()} is not in the data (use a data token or declare it in extraFigures)`);
    }
  }
  // 14. year agreement in title/h1
  const years = `${title} ${text(h1s[0])}`.match(/\b20\d\d\b/g) ?? [];
  const pageYear = (wp?.lastReviewed ?? Object.values(pricing).map((x) => x.checkedOn).sort().at(-1) ?? '').slice(0, 4);
  for (const y of years) if (pageYear && y !== pageYear) fail(p, `title/h1 says ${y} but the page was verified in ${pageYear}`);
  // 15. CSS budget + no JS
  const css = [...doc.querySelectorAll('style')].reduce((a, s) => a + s.textContent.length, 0);
  if (css > 30000) fail(p, `inline CSS ${css} bytes (max 30000)`);
  for (const s of doc.querySelectorAll('script')) if (s.getAttribute('type') !== 'application/ld+json') fail(p, 'page ships JavaScript');
  // 16. duplicate sentences across pages (editorial text only)
  for (const el of doc.querySelectorAll('.prose-body, [data-prose], [data-quick-answer], [data-faq-a]')) {
    for (const s of text(el).split(/(?<=[.!?])\s+/)) {
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

// robots + llms
const robots = fs.existsSync(path.join(DIST, 'robots.txt')) ? fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8') : '';
if (!/Sitemap: https:\/\/cinchstack\.com\/sitemap\.xml/.test(robots)) fail('/robots.txt', 'missing or has no Sitemap line');
const llms = fs.existsSync(path.join(DIST, 'llms.txt')) ? fs.readFileSync(path.join(DIST, 'llms.txt'), 'utf8') : '';
if (!llms) fail('/llms.txt', 'missing');
const llmsUrls = [...llms.matchAll(/\]\((https:\/\/cinchstack\.com[^)]*)\)/g)].map((m) => m[1].replace(SITE, ''));
for (const u of llmsUrls) if (!exists(u)) fail('/llms.txt', `lists ${u}, which does not exist`);
if (new Set(llmsUrls).size !== llmsUrls.length) fail('/llms.txt', 'lists a URL twice');

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
