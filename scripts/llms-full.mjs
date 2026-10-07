#!/usr/bin/env node
// Writes dist/llms-full.txt after astro build: the readable text of every page in the sitemap, in
// sitemap order, as one Markdown file for AI assistants (the "full" companion to /llms.txt).
// Text comes from each built page's <main> only. Navigation, breadcrumbs, buttons and CTA rows, the
// paid-service box, Keep reading lists, the author box, forms and hidden helper text are left out.
// The disclosure lines stay, so a reader of this file still learns who pays us.
// Usage: node scripts/llms-full.mjs (npm run build runs it between astro build and scripts/check.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { SITE, NAME } from '../src/lib/site.mjs';
import { longDate } from '../src/lib/format.mjs';

const DIST = 'dist';
const OUT = path.join(DIST, 'llms-full.txt');
const read = (f) => (fs.existsSync(path.join(DIST, f)) ? fs.readFileSync(path.join(DIST, f), 'utf8') : '');
const die = (msg) => { console.error(`llms-full: ${msg}`); process.exit(1); };

// Everything in <main> that is not reading text.
const DROP = [
  'script', 'style', 'svg', 'noscript', 'template', 'iframe', 'img', 'form', 'button', 'input', 'select', 'textarea',
  'nav', '.cta-row', 'a.btn', '.aff-pair:has(a.btn)', '.svc-box', 'aside.author', '[hidden]', '[aria-hidden="true"]', '.hp', '.skip',
].join(', ');
const BLOCK = new Set(['address', 'article', 'aside', 'blockquote', 'caption', 'dd', 'details', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure',
  'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'tbody',
  'td', 'tfoot', 'th', 'thead', 'tr', 'ul']);
const BR = String.fromCharCode(0xe000); // a <br>: a private-use character, so whitespace collapsing keeps it

const dropped = (n) => n.nodeType !== 1 || n.matches(DROP);
const isBlock = (n) => BLOCK.has(n.localName) || [...n.children].some(isBlock);
// Collapse whitespace; a <br> becomes `br` (a new line in a paragraph, a space elsewhere).
const clean = (s, br = ' ') => esc(s.replace(/\s+/g, ' ').replaceAll(` ${BR}`, BR).replaceAll(`${BR} `, BR).replaceAll(BR, br).trim());
// Page text sometimes names an HTML element ("the contacts <select> menu"); Markdown's &lt; keeps that
// from reading as a tag.
const esc = (s) => s.replace(/<(?=[A-Za-z/!?])/g, '&lt;');

// ---------- inline text ----------
function inline(el) {
  let s = '';
  let prev = null; // the last element appended, if no text has followed it
  for (const n of el.childNodes) {
    if (n.nodeType === 3) {
      // "<strong>Real cost:</strong>For a…": a label's colon always gets its space.
      const t = n.textContent;
      s += prev && /:$/.test(s) && /^[^\s]/.test(t) ? ` ${t}` : t;
      if (t.trim()) prev = null;
      continue;
    }
    if (dropped(n)) continue;
    const t = inlineEl(n);
    if (n.classList.contains('sub') && s.trim()) {
      // A .sub note sits on its own line under a figure or name. A lower-case note after a figure or
      // a lower-case word reads on ("$80.83 per month", "30 days through the trial link"); after a name
      // it is set apart ("HubSpot — the tool you are replacing", "Starter — $970 billed yearly"), and a
      // second note is set apart from the first ("… 200 texts a month · medium confidence").
      const readOn = /^\s*\p{Ll}/u.test(t) && !/(^|\s)\p{Lu}\S*\s*$/u.test(s);
      const sep = prev?.classList.contains('sub') ? ' · ' : readOn ? ' ' : ' — ';
      s = s.replace(/\s+$/, '') + sep + t;
    } else if (n.classList.contains('paid-note')) s = `${s.replace(/\s+$/, '')} ${t}`;
    else s += t;
    prev = n;
  }
  return s;
}
function inlineEl(n) {
  const tag = n.localName;
  if (tag === 'br') return BR;
  if (tag === 'a') return link(n);
  if (tag === 'code') return `\`${clean(n.textContent)}\``;
  if (tag === 'sup' && n.classList.contains('fn')) return `[${clean(n.textContent)}]`;
  // A block inside inline content (a paragraph in a table cell, say) reads as its own phrase.
  if (BLOCK.has(tag)) return ` ${inline(n)} `;
  return inline(n);
}
// Links keep their target as an absolute URL, except paid links (their tracking codes are not for
// citing; the "(paid link)" note beside them stays) and links within the same page.
function link(a) {
  const text = clean(inline(a));
  const href = a.getAttribute('href') ?? '';
  if (!text || !href || href.startsWith('#') || a.getAttribute('data-paid') === '1') return text;
  const url = href.startsWith('/') ? `${SITE}${href}` : href;
  return /^https?:\/\//.test(url) ? `[${text.replace(/([[\]])/g, '\\$1')}](${url})` : text;
}

// ---------- blocks ----------
// Walks a container and pushes Markdown blocks (strings, or {head, rows} for tables) onto `out`.
function render(el, out) {
  let buf = '';
  const flush = () => { const t = clean(buf, '\n'); if (t) out.push(t); buf = ''; };
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { buf += n.textContent; continue; }
    if (dropped(n) || (n.localName === 'summary' && el.localName === 'details')) continue;
    if (!isBlock(n)) { buf += inlineEl(n); continue; }
    flush();
    if (n.localName === 'a') blockLink(n, out);
    else block(n, out);
  }
  flush();
}
function block(n, out) {
  const tag = n.localName;
  const h = /^h([1-6])$/.exec(tag)?.[1];
  if (h === '1') return; // the page H1 heads the page's own section
  if (h) { out.push(`${'#'.repeat(Math.min(6, Number(h) + 1))} ${clean(inline(n))}`); return; }
  if (tag === 'p') {
    // The byline's parts are separate spans: by, updated, prices verified, re-read.
    const t = n.classList.contains('byline') ? [...n.children].map((c) => clean(inline(c))).filter(Boolean).join(' · ') : clean(inline(n), '\n');
    if (t) out.push(t);
    return;
  }
  if (tag === 'ul' || tag === 'ol') { const t = list(n, 0); if (t) out.push(t); return; }
  if (tag === 'dl') {
    const rows = [...n.querySelectorAll('dt')].map((dt) => {
      let dd = dt.nextElementSibling;
      while (dd && dd.localName !== 'dd') dd = dd.nextElementSibling;
      return `- ${clean(inline(dt))}: ${dd ? clean(inline(dd)) : ''}`.trim();
    });
    if (rows.length) out.push(rows.join('\n'));
    return;
  }
  if (tag === 'table') { table(n, out); return; }
  if (tag === 'details') {
    const sum = [...n.children].find((c) => c.localName === 'summary');
    const q = sum ? clean(inline(sum)) : '';
    // FAQ questions read as headings; "Show N more" is only a control, so its rows simply follow on.
    if (q && n.closest('.faq')) out.push(`#### ${q}`);
    else if (q && !n.classList.contains('more')) out.push(`**${q}**`);
    render(n, out); // skips the summary
    return;
  }
  if (tag === 'blockquote') {
    const inner = [];
    render(n, inner);
    const t = inner.map(str).join('\n\n');
    if (t) out.push(t.split('\n').map((l) => (l ? `> ${l}` : '>')).join('\n'));
    return;
  }
  // Preformatted text (the HTML credit line on /data/) stays line for line but unfenced: inside a code
  // fence Markdown would show "&lt;" itself rather than the "<" it stands for.
  if (tag === 'pre') { const t = esc(n.textContent.trim()); if (t) out.push(t); return; }
  if (tag === 'hr') return;
  render(n, out);
}

// A link wrapped around a whole card: its text becomes blocks, and the card's own "… →" line (or,
// failing that, its heading) carries the link.
function blockLink(a, out) {
  const inner = [];
  render(a, inner);
  const href = a.getAttribute('href') ?? '';
  const url = href.startsWith('/') ? `${SITE}${href}` : href;
  const i = inner.findIndex((b) => typeof b === 'string' && b.endsWith('→'));
  const j = i >= 0 ? i : inner.findIndex((b) => typeof b === 'string' && b.startsWith('#'));
  if (j >= 0 && /^https?:\/\//.test(url)) {
    const [, hashes = '', text] = /^(#+ )?(.*)$/s.exec(inner[j]);
    inner[j] = `${hashes}[${text}](${url})`;
  }
  out.push(...inner);
}

function list(el, level) {
  const lines = [];
  let i = Number(el.getAttribute('start') ?? 1);
  for (const li of el.children) {
    if (li.localName !== 'li' || dropped(li)) continue;
    const marker = el.localName === 'ol' ? `${i++}.` : '-';
    const nested = [...li.children].filter((c) => (c.localName === 'ul' || c.localName === 'ol') && !dropped(c));
    const kids = [...li.children].filter((c) => !nested.includes(c) && !dropped(c));
    const loose = [...li.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
    let text;
    if (kids.length === 2 && !loose) {
      // A label and its value in two elements (a bill line, a score factor, a dated change).
      const [a, b] = kids.map((k) => clean(inline(k)));
      text = a && b ? `${a.replace(/:$/, '')}${a.includes(':') ? ' —' : ':'} ${b}` : a || b;
    } else {
      const copy = li.cloneNode(true);
      for (const c of [...copy.children]) if (c.localName === 'ul' || c.localName === 'ol') c.remove();
      text = clean(inline(copy));
    }
    if (text) lines.push(`${'  '.repeat(level)}${marker} ${text}`);
    for (const sub of nested) { const t = list(sub, level + 1); if (t) lines.push(t); }
  }
  return lines.join('\n');
}

// Tables become pipe tables with their header row, so every figure keeps its column label. A table
// that follows one with the same header (the rows behind "Show N more") joins it.
function table(t, out) {
  const cells = (tr) => {
    const row = [];
    for (const c of tr.children) {
      if (!/^t[hd]$/.test(c.localName) || dropped(c)) continue;
      row.push(clean(inline(c)).replace(/\|/g, '\\|'));
      for (let k = 1; k < Number(c.getAttribute('colspan') ?? 1); k++) row.push('');
    }
    return row;
  };
  const caption = t.querySelector('caption');
  if (caption) out.push(clean(inline(caption)));
  const trs = [...t.querySelectorAll('tr')].filter((tr) => tr.closest('table') === t);
  const headRows = trs.filter((tr) => tr.parentElement.localName === 'thead');
  let head = headRows.length ? cells(headRows.at(-1)) : null;
  const rows = trs.filter((tr) => tr.parentElement.localName !== 'thead').map(cells).filter((r) => r.some(Boolean));
  if (!head) head = rows.shift() ?? [];
  if (!head.length) return;
  const prev = out.at(-1);
  if (prev?.head && prev.head.join('|') === head.join('|')) prev.rows.push(...rows);
  else out.push({ head, rows });
}
function str(b) {
  if (typeof b === 'string') return b;
  const w = Math.max(b.head.length, ...b.rows.map((r) => r.length));
  const pad = (r) => [...r, ...Array(w - r.length).fill('')];
  const line = (r) => `| ${pad(r).map((c) => c || ' ').join(' | ')} |`;
  return [line(b.head), `| ${Array(w).fill('---').join(' | ')} |`, ...b.rows.map(line)].join('\n');
}

// ---------- pages ----------
const sitemap = read('sitemap.xml');
if (!sitemap) die('dist/sitemap.xml not found. Run astro build first.');
const urls = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({ url: /<loc>([^<]+)<\/loc>/.exec(m[1])?.[1], lastmod: /<lastmod>([^<]+)<\/lastmod>/.exec(m[1])?.[1] ?? null }));
if (!urls.length || urls.some((u) => !u.url?.startsWith(SITE))) die('dist/sitemap.xml lists no URLs, or one without a cinchstack.com <loc>');

const sections = [];
for (const { url, lastmod } of urls) {
  const rel = url.replace(SITE, '').replace(/^\//, '');
  const html = read(path.join(rel, 'index.html')) || read(rel);
  if (!html) die(`${url} is in the sitemap but was not built`);
  const { document } = parseHTML(html);
  const main = document.querySelector('main');
  if (!main) die(`${url} has no <main>`);
  const h1 = clean(main.querySelector('h1')?.textContent ?? document.querySelector('title')?.textContent ?? '');
  // The date the page itself shows as last updated (the same one check.mjs holds to the sitemap).
  const shown = [...main.querySelectorAll('.byline span, p.updated')]
    .filter((el) => /Updated/.test(el.textContent))
    .map((el) => [...el.querySelectorAll('time:not([data-verified])')].at(-1))
    .find(Boolean);
  const updated = shown ? clean(shown.textContent) : longDate(lastmod);
  const out = [];
  render(main, out);
  sections.push([`## ${h1}`, `URL: ${url}\nUpdated: ${updated}`, ...out.map(str)].join('\n\n'));
}

// ---------- header ----------
// The summary and info lines are the ones /llms.txt opens with, read from the built file.
const llms = read('llms.txt').split('\n');
const s = llms.findIndex((l) => l.startsWith('> '));
const info = s < 0 ? null : llms.slice(s + 1).find((l) => l.trim() && !l.startsWith('#'));
if (s < 0 || !info) die('could not read the summary and info lines from dist/llms.txt');
let license = '';
try { license = JSON.parse(read('data/pricing.json')).license ?? ''; } catch {}
const header = [
  `# ${NAME}: full text of every page`,
  llms[s],
  info,
  `This file is generated at build time from the pages listed in ${SITE}/sitemap.xml, one section per page in sitemap order: the page's heading, its URL, the date it was last updated, then its text. The short index is ${SITE}/llms.txt.`,
  `The pricing dataset at ${SITE}/data/ is published under CC BY 4.0${license ? ` (${license})` : ''}.`,
].join('\n\n');

const txt = `${header}\n\n${sections.join('\n\n')}\n`;
fs.writeFileSync(OUT, txt);
console.log(`llms-full: wrote ${OUT}: ${sections.length} pages, ${(Buffer.byteLength(txt) / 1024).toFixed(0)} KB.`);
