#!/usr/bin/env node
// The launch gate. Reads the built site in dist/ and fails the build on anything that would
// mislead a reader, confuse a search engine, or break an affiliate contract.
// Usage: node scripts/check.mjs [--warn-only]
import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { loadData, knownFigures, normFig, BANNED } from './lib/figures.mjs';
import { GA_ID } from '../src/lib/site.mjs';

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
  for (const el of doc.querySelectorAll('.prose-body, [data-prose], [data-quick-answer], [data-faq-a]')) {
    const c = el.cloneNode(true);
    c.querySelectorAll('data[data-fig], .aff-pair, [data-paid-note], .prose-cta').forEach((x) => x.remove());
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
  // The only script allowed is the analytics loader, and only while GA_ID switches analytics on.
  for (const s of doc.querySelectorAll('script')) {
    if (s.getAttribute('type') === 'application/ld+json') continue;
    const ok = GA_ID && s.getAttribute('src') === '/site.js' && s.getAttribute('data-ga') === GA_ID && s.hasAttribute('defer') && !s.textContent.trim();
    if (!ok) fail(p, 'page ships JavaScript other than the analytics loader');
  }
  if (GA_ID && !doc.querySelector('script[src="/site.js"]')) fail(p, 'analytics is on but this page does not load /site.js');
  // 16. duplicate sentences across pages (editorial text only)
  for (const el of doc.querySelectorAll('.prose-body, [data-prose], [data-quick-answer], [data-faq-a]')) {
    // Buttons and their "Paid link" notes are template text, not editorial sentences.
    const ed = el.cloneNode(true);
    ed.querySelectorAll('.aff-pair, [data-paid-note], .prose-cta, .tbl-wrap, .table-lead').forEach((x) => x.remove());
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
