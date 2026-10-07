#!/usr/bin/env node
// Tells IndexNow engines (Bing, which feeds ChatGPT search and Copilot) about pages as a slow drip:
// at most 10 URLs per submission, at least 48 hours apart, and only URLs never sent before or whose
// sitemap lastmod is later than the day they were last sent. Run by hand, never on a push or rebuild:
// a sister site lost its Bing impressions the day after it began sending ~155 URLs on every deploy
// (docs/plan/06-aeo-geo-bing.md). Every submission is logged in src/data/_indexnow.json.
// Usage: node scripts/indexnow.mjs [--dry-run] [--force] <url-or-path> ...   (1 to 10 URLs)
//   --dry-run  run every check and print the payload, but send nothing and log nothing
//   --force    skip only the 48-hour gap
// Behind a proxy, set NODE_USE_ENV_PROXY=1 so Node's fetch goes through it.
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { SITE, INDEXNOW_KEY } from '../src/lib/site.mjs';

const LOG = 'src/data/_indexnow.json';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY_URL = `${SITE}/${INDEXNOW_KEY}.txt`;
const MAX_URLS = 10;
const GAP_HOURS = 48;
const ACCEPTED = [200, 202];
const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const FORCE = args.includes('--force');
const usage = (msg) => {
  if (msg) console.error(msg);
  console.error('usage: node scripts/indexnow.mjs [--dry-run] [--force] <url-or-path> ...   (1 to 10 URLs)');
  process.exit(2);
};
const unknown = args.filter((a) => a.startsWith('--') && a !== '--dry-run' && a !== '--force');
if (unknown.length) usage(`unknown option ${unknown.join(', ')}`);

// Paths resolve against the site; full URLs must be on it.
const urls = [];
for (const a of args.filter((x) => !x.startsWith('--'))) {
  let u;
  try { u = new URL(a, `${SITE}/`); } catch { usage(`not a URL or path: ${a}`); }
  if (u.origin !== SITE) usage(`${a} is not on ${SITE}`);
  if (u.search || u.hash) usage(`${a}: leave out the query and the fragment`);
  if (!urls.includes(u.href)) urls.push(u.href);
}
if (!urls.length) usage();
if (urls.length > MAX_URLS) usage(`${urls.length} URLs given; send at most ${MAX_URLS} per submission.`);

let log;
try { log = JSON.parse(fs.readFileSync(LOG, 'utf8')); } catch (e) { console.error(`${LOG}: ${e.message}`); process.exit(2); }
if (!Array.isArray(log)) { console.error(`${LOG} must hold an array`); process.exit(2); }
const accepted = log.filter((e) => ACCEPTED.includes(e.status));

let failed = 0;
const ok = (msg) => console.log(`✓ ${msg}`);
const bad = (msg) => { failed++; console.log(`✗ ${msg}`); };
const note = (msg) => console.log(`- ${msg}`);

// A request that fails outright (no HTTP answer) is tried once more before it counts as a failure.
async function get(url, tries = 2) {
  try {
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
    return { status: r.status, headers: r.headers, body: await r.text() };
  } catch (e) {
    if (tries > 1) return get(url, tries - 1);
    const hint = (process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY ? ' (behind a proxy, set NODE_USE_ENV_PROXY=1)' : '';
    return { status: 0, error: `request failed: ${e.cause?.code ?? e.message}${hint}` };
  }
}
const answered = (r) => r.error ?? `answered ${r.status}${r.headers?.get('location') ? ` -> ${r.headers.get('location')}` : ''}`;

// 1. Spacing: at least 48 hours since the last accepted submission.
const lastAt = accepted.map((e) => e.at).sort().at(-1);
const hours = lastAt ? (Date.now() - Date.parse(lastAt)) / 3.6e6 : Infinity;
if (!lastAt) ok('spacing: no accepted submission yet');
else if (hours >= GAP_HOURS) ok(`spacing: last accepted submission ${lastAt}, ${Math.floor(hours)} hours ago`);
else if (FORCE) note(`spacing: last accepted submission ${lastAt} was ${hours.toFixed(1)} hours ago; --force skips the ${GAP_HOURS}-hour gap`);
else bad(`spacing: last accepted submission ${lastAt} was ${hours.toFixed(1)} hours ago; wait until ${iso(Date.parse(lastAt) + GAP_HOURS * 3.6e6)} or pass --force`);

// 2. Every URL is in the live sitemap. A URL already sent is dropped unless its lastmod is later
// than the day it was last sent.
const sm = await get(`${SITE}/sitemap.xml`);
const lastmod = new Map();
if (sm.status === 200) for (const m of sm.body.matchAll(/<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)) lastmod.set(m[1].trim(), m[2]?.trim() ?? null);
const haveSitemap = lastmod.size > 0;
if (haveSitemap) ok(`live sitemap: ${lastmod.size} URLs`);
else bad(`live sitemap ${SITE}/sitemap.xml: ${sm.status === 200 ? 'lists no URLs' : answered(sm)}`);

const send = [];
for (const u of urls) {
  if (haveSitemap && !lastmod.has(u)) {
    const alt = u.endsWith('/') ? u.slice(0, -1) : `${u}/`;
    bad(`${u} is not in the live sitemap${lastmod.has(alt) ? ` (did you mean ${alt}?)` : ''}`);
    continue;
  }
  const sent = accepted.filter((e) => e.urls?.includes(u)).map((e) => e.at).sort().at(-1);
  const mod = lastmod.get(u) ?? null;
  if (haveSitemap && sent && !(mod && mod > sent.slice(0, 10))) {
    note(`dropped ${u}: sent ${sent.slice(0, 10)}, and its sitemap lastmod ${mod ?? '(none)'} is not later`);
    continue;
  }
  send.push(u);
}

// 3. Every page answers 200 without a redirect, names itself as canonical and is not noindex.
const NOINDEX = /\b(noindex|none)\b/i;
async function checkPage(u) {
  const r = await get(u);
  if (r.status !== 200) return `${answered(r)}, want 200 with no redirect`;
  const problems = [];
  const xrt = r.headers.get('x-robots-tag') ?? '';
  if (NOINDEX.test(xrt)) problems.push(`X-Robots-Tag "${xrt}"`);
  const { document } = parseHTML(r.body);
  const canon = [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.getAttribute('href'));
  if (!canon.length) problems.push('no canonical');
  else if (canon.length > 1 || canon[0] !== u) problems.push(`canonical is ${canon.join(', ')}`);
  for (const m of document.querySelectorAll('meta[name]')) {
    const name = m.getAttribute('name');
    if (/^(robots|bingbot)$/i.test(name) && NOINDEX.test(m.getAttribute('content') ?? '')) problems.push(`meta ${name} "${m.getAttribute('content')}"`);
  }
  return problems.join('; ');
}
const results = await Promise.all(send.map(checkPage));
send.forEach((u, i) => (results[i] ? bad(`${u}: ${results[i]}`) : ok(`${u}: 200, self-canonical, indexable${lastmod.get(u) ? `, lastmod ${lastmod.get(u)}` : ''}`)));

// 4. The key file is live, so engines can confirm we own the host.
const key = await get(KEY_URL);
if (key.status === 200 && key.body === INDEXNOW_KEY) ok(`key file ${KEY_URL} holds the key`);
else bad(`key file ${KEY_URL}: ${key.status === 200 ? `content ${JSON.stringify(key.body.slice(0, 60))} is not the key` : answered(key)}; deploy public/${INDEXNOW_KEY}.txt first`);

const payload = { host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: KEY_URL, urlList: send };
if (DRY && send.length) console.log(`\nPOST ${ENDPOINT}\ncontent-type: application/json; charset=utf-8\n${JSON.stringify(payload, null, 2)}\n`);
if (failed) { console.log(`${failed} check(s) failed. Nothing sent.`); process.exit(1); }
if (!send.length) { console.log('Nothing to send: every URL was already sent and has not changed since.'); process.exit(0); }
if (DRY) { console.log(`Dry run: all checks passed for ${send.length} URL(s). Nothing sent or logged.`); process.exit(0); }

let res;
try {
  res = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(30000) });
} catch (e) {
  console.log(`IndexNow request failed (${e.cause?.code ?? e.message}). Nothing logged.`);
  process.exit(1);
}
const body = await res.text();
log.push({ at: iso(Date.now()), urls: send, status: res.status });
fs.writeFileSync(LOG, JSON.stringify(log, null, 2) + '\n');
if (ACCEPTED.includes(res.status)) console.log(`IndexNow answered ${res.status}: ${send.length} URL(s) accepted, logged in ${LOG}. Commit the log.`);
else {
  console.log(`IndexNow answered ${res.status}: not accepted, logged in ${LOG}.`);
  if (body) console.log(body);
  process.exit(1);
}
