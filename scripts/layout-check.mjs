#!/usr/bin/env node
// Mobile layout gate, run in CI after the build (not in the Netlify build, which has no browser).
// Serves dist/ and opens every page in Chrome at a 360px phone width:
//   - the page must not scroll sideways;
//   - no table wrapper may scroll sideways, except one marked as a scrolling region (role="region");
//   - every primary nav link must be fully visible.
// On five sample pages, with the web fonts held back 800ms, layout shift (CLS) must stay under 0.1.
// Usage: node scripts/layout-check.mjs   (CHROME_PATH=/path/to/chrome to pick the browser)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const DIST = 'dist';
const WIDTH = 360;
const CLS_MAX = 0.1;
const CLS_PAGES = ['/tools/gohighlevel/pricing/', '/tools/gohighlevel/', '/compare/gohighlevel-vs-hubspot/', '/tools/gohighlevel/real-estate/', '/stacks/agency/'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.json': 'application/json' };

if (!fs.existsSync(DIST)) { console.error('dist/ not found. Run the build first.'); process.exit(2); }
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(('/' + path.relative(DIST, dir).split(path.sep).join('/') + '/').replace('//', '/'));
    else if (e.name === '404.html' && path.resolve(dir) === path.resolve(DIST)) pages.push('/404.html');
  }
})(DIST);
pages.sort();
// CLS sample pages that are not built fail the check instead of being skipped silently.
const clsPages = CLS_PAGES.filter((x) => pages.includes(x));
const missingCls = CLS_PAGES.filter((x) => !pages.includes(x));

const ROOT = path.resolve(DIST);
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(ROOT, url);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (url.endsWith('/')) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const exe = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => p && fs.existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : { channel: 'chrome' });
const fails = [];
for (const m of missingCls) fails.push(`${m}: CLS sample page is not built (update CLS_PAGES)`);

// 1. sideways scrolling and nav visibility at phone width
const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 800 }, isMobile: true, hasTouch: true });
await ctx.route('**/site.js', (r) => r.abort()); // no analytics or consent notice in the check
const page = await ctx.newPage();
for (const p of pages) {
  await page.goto(base + p, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => {
    const out = { page: document.documentElement.scrollWidth - document.documentElement.clientWidth, wraps: [], nav: [] };
    document.querySelectorAll('.tbl-wrap:not([role="region"])').forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1) out.wraps.push(`${(el.previousElementSibling?.textContent ?? '').trim().slice(0, 50)}… (${el.scrollWidth}px in ${el.clientWidth}px)`);
    });
    const nav = document.querySelector('.nav');
    if (nav) {
      const box = nav.getBoundingClientRect();
      nav.querySelectorAll('a').forEach((a) => { const b = a.getBoundingClientRect(); if (b.left < Math.max(0, box.left) - 1 || b.right > Math.min(innerWidth, box.right) + 1) out.nav.push(a.textContent.trim()); });
    }
    return out;
  });
  if (r.page > 0) fails.push(`${p}: page scrolls sideways by ${r.page}px at ${WIDTH}px`);
  for (const w of r.wraps) fails.push(`${p}: table scrolls sideways at ${WIDTH}px: ${w}`);
  if (r.nav.length) fails.push(`${p}: nav link(s) cut off at ${WIDTH}px: ${r.nav.join(', ')}`);
}
await ctx.close();

// 2. layout shift when the web fonts arrive late
for (const width of [412, 1280]) {
  const c = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 500 });
  await c.route('**/site.js', (r) => r.abort());
  await c.route('**/*.woff2', async (r) => { await new Promise((ok) => setTimeout(ok, 800)); await r.continue(); });
  const pg = await c.newPage();
  await pg.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  for (const p of clsPages) {
    await pg.goto(base + p, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(300);
    const cls = await pg.evaluate(() => window.__cls);
    if (cls >= CLS_MAX) fails.push(`${p}: layout shift ${cls.toFixed(3)} at ${width}px with late fonts (max ${CLS_MAX})`);
  }
  await c.close();
}

await browser.close();
server.close();
if (fails.length) {
  console.log(`\n${fails.length} layout failure(s):`);
  fails.forEach((f) => console.log(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`✓ layout check passed: ${pages.length} pages at ${WIDTH}px, late-font CLS under ${CLS_MAX} on ${clsPages.length} sample pages.`);
