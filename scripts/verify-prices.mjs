#!/usr/bin/env node
// The weekly price check. Re-opens each vendor page that a recorded price came from and confirms
// the price is still on it. Writes src/data/_checks.json, which the pricing pages render, and
// prints a report. It never edits a price: a changed price is a job for a person, who re-snapshots
// the page, updates the record and logs the change.
// Usage: node scripts/verify-prices.mjs [tool ...]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'src/data/_checks.json';
const only = process.argv.slice(2);
const today = new Date().toISOString().slice(0, 10);
const dir = 'src/data/pricing';
const tools = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).filter((t) => !only.length || only.includes(t)).sort();

const BLOCKED = /(verify you are human|are you a robot|access denied|just a moment\.\.\.|attention required|enable javascript and cookies|request blocked|captcha)/i;
// A capture can only be re-checked by a plain page load if it was taken by one. Captures made after
// clicking a toggle, choosing a calculator tier or fetching through an API record that in their header.
function isPlainCapture(file) {
  if (/-after-click-\d+\.txt$/.test(file)) return false;
  const head = fs.readFileSync(file, 'utf8').split('\n----')[0];
  if (/^(ACTION|VIA|CLICK|SELECT):/im.test(head)) return false;
  const renderer = head.match(/^RENDERER: (.*)$/m)?.[1] ?? '';
  return !/\(|set to|selected|clicked|toggle/i.test(renderer);
}
const dollars = (s) => new Set([...s.matchAll(/\$\s?(\d[\d,]*(?:\.\d{1,4})?)/g)].map((m) => String(Math.round(Number(m[1].replace(/,/g, '')) * 10000) / 10000)));
const key = (n) => String(Math.round(n * 10000) / 10000);

const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', process.env.CHROME_PATH].find((p) => p && fs.existsSync(p));
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'], ...(proxy ? { proxy: { server: proxy, bypass: 'localhost,127.0.0.1' } } : {}) });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  locale: 'en-US', timezoneId: 'America/New_York', viewport: { width: 1366, height: 900 },
});

async function read(url) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    for (const t of ['Accept all', 'Accept All', 'Accept', 'I agree', 'Got it', 'Allow all']) {
      const b = page.getByRole('button', { name: t, exact: true });
      if (await b.count()) { try { await b.first().click({ timeout: 1500 }); break; } catch {} }
    }
    try { await page.waitForLoadState('networkidle', { timeout: 20000 }); } catch {}
    for (let y = 0; y < 12; y++) { await page.mouse.wheel(0, 1400); await page.waitForTimeout(250); }
    await page.waitForTimeout(800);
    return await page.evaluate(() => document.body.innerText);
  } finally { await page.close(); }
}

const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const results = { ...prev };
for (const tool of tools) {
  const p = JSON.parse(fs.readFileSync(path.join(dir, `${tool}.json`), 'utf8'));
  // Figures to re-check, grouped by the source page they came from. Only sources whose snapshot is
  // a plain page load (not one taken after clicking a toggle) can be re-read the same way.
  const bySource = new Map();
  // When one page was captured several times (tabs, toggles, calculator tiers), only the plain
  // default capture, the one with the shortest file name, can be compared with a plain page load.
  const sourceOf = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').match(/^SOURCE: (.*)$/m)?.[1]?.trim() : null);
  const plainFor = new Map();
  for (const x of p.sources) {
    if (!x.snapshot || !fs.existsSync(x.snapshot)) continue;
    const u = sourceOf(x.snapshot) ?? x.url;
    const cur = plainFor.get(u);
    if (!cur || x.snapshot.length < cur.length) plainFor.set(u, x.snapshot);
  }
  const isDefaultCapture = (f) => plainFor.get(sourceOf(f) ?? '') === f;
  const push = (src, label, n) => {
    if (src === undefined || n === null || n === undefined || n === 0) return;
    const s = p.sources[src];
    if (!s?.snapshot || !fs.existsSync(s.snapshot) || !isPlainCapture(s.snapshot) || !isDefaultCapture(s.snapshot)) return;
    const was = dollars(fs.readFileSync(s.snapshot, 'utf8'));
    if (!was.has(key(n))) return; // the figure was not printed as a dollar amount on that page
    if (!bySource.has(src)) bySource.set(src, []);
    bySource.get(src).push({ label, n });
  };
  p.plans.forEach((x) => { push(x.source, `${x.name} monthly`, x.monthly); push(x.source, `${x.name} billed annually`, x.annualMonthly); });
  p.addOns.forEach((x) => push(x.source, x.name, x.price));
  p.usage.forEach((x) => push(x.source, x.name, x.rate));
  let checked = 0;
  const missing = [];
  let blocked = 0;
  let mismatched = 0;
  for (const [src, figs] of bySource) {
    const url = p.sources[src].url;
    let txt = '';
    try { txt = await read(url); } catch (e) { blocked++; console.log(`  ${tool}: could not load ${url} (${e.message.split('\n')[0]})`); continue; }
    if (txt.length < 500 || BLOCKED.test(txt.slice(0, 3000))) { blocked++; console.log(`  ${tool}: blocked at ${url}`); continue; }
    const now = dollars(txt);
    // If the page now shares under half of the prices in our saved copy, it is showing a different
    // state (another tab, tier or currency) rather than new prices; do not report it as a change.
    const was = dollars(fs.readFileSync(p.sources[src].snapshot, 'utf8'));
    const shared = [...was].filter((x) => now.has(x)).length;
    if (was.size >= 4 && shared / was.size < 0.5) { mismatched++; console.log(`  ${tool}: ${url} looks different from our saved copy (${shared}/${was.size} prices shared); skipped`); continue; }
    for (const f of figs) { checked++; if (!now.has(key(f.n))) missing.push(`${f.label}: $${f.n} no longer on ${url}`); }
  }
  const status = checked === 0 ? (blocked ? 'blocked' : 'not-checkable') : missing.length ? 'changed' : 'passed';
  results[tool] = { ranOn: today, status, checked, missing, pages: bySource.size, blockedPages: blocked, skippedPages: mismatched };
  console.log(`${status.padEnd(13)} ${tool}: ${checked} figures on ${bySource.size} pages${missing.length ? `, ${missing.length} missing` : ''}${blocked ? `, ${blocked} blocked` : ''}`);
  missing.forEach((m) => console.log(`    - ${m}`));
}
await browser.close();

const sorted = Object.fromEntries(Object.keys(results).sort().map((k) => [k, results[k]]));
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');
const changed = Object.entries(sorted).filter(([, r]) => r.ranOn === today && r.status === 'changed');
if (changed.length) {
  fs.writeFileSync('price-check-report.md', `# Price check ${today}: ${changed.length} tool(s) need review\n\n${changed.map(([t, r]) => `## ${t}\n\n${r.missing.map((m) => `- ${m}`).join('\n')}\n`).join('\n')}\nRe-snapshot each page, update src/data/pricing/<tool>.json, add a changelog entry, and run the build.\n`);
  console.log(`\n${changed.length} tool(s) changed; report written to price-check-report.md`);
}
