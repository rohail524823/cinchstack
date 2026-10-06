#!/usr/bin/env node
// Fast checks for a draft page, without building the site. Writers run it on their own files.
// Usage: node scripts/lint-content.mjs src/content/pricing/hubspot.mdx [more.mdx ...]
//        node scripts/lint-content.mjs --all
// Checks: frontmatter, quick answer, headings, banned words, every dollar figure against the data,
// MDX tokens (tool/plan/size ids), internal links, the page's FAQ file, and sentences reused on other pages.
import fs from 'node:fs';
import path from 'node:path';
import { loadData, knownFigures, normFig, figuresIn, BANNED } from './lib/figures.mjs';
import { faqSchema, comparisonSchema, stackSchema, alternativesSchema } from '../src/lib/schemas.mjs';

const data = loadData();
const known = knownFigures(data);
const SIZES = ['solo', 'small', 'growing'];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out); else if (p.endsWith('.mdx')) out.push(p);
  }
  return out;
}
const allMdx = walk('src/content');
const idOf = (f) => path.relative('src/content', f).replace(/\.mdx$/, '').split(path.sep).join('/');
const pathFor = (id) => { const [k, s] = id.split('/'); return { pricing: `/tools/${s}/pricing/`, tools: `/tools/${s}/`, compare: `/compare/${s}/`, alternatives: `/alternatives/${s}/`, stacks: `/stacks/${s}/`, pages: `/${s}/` }[k]; };

// Pages that exist or are being written now (a prose file exists), plus static hubs.
const planned = fs.existsSync('docs/prompts/launch-pages.json') ? JSON.parse(fs.readFileSync('docs/prompts/launch-pages.json', 'utf8')).pages : [];
const livePaths = new Set(['/', '/tools/', '/compare/', '/stacks/', '/alternatives/', '/changes/', '/data/', ...planned, ...allMdx.map((f) => pathFor(idOf(f)))]);

const args = process.argv.slice(2);
const files = args.includes('--all') ? allMdx : args;
if (!files.length) { console.error('usage: node scripts/lint-content.mjs <file.mdx> [...] | --all'); process.exit(2); }

const words = (s) => s.split(/\s+/).filter(Boolean).length;
const stripMdx = (body) => body
  .replace(/^import .*$/gm, '')
  .replace(/<(Price|Real|Stack|Checked)\b[^>]*\/>/g, ' ')
  .replace(/<T\b[^>]*label="([^"]*)"[^>]*\/>/g, '$1')
  .replace(/<T\b[^>]*id="([^"]*)"[^>]*\/>/g, (m, id) => data.tools[id]?.name ?? id)
  .replace(/<[^>]+>/g, ' ')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/[*_`#>|]/g, ' ');
const sentences = (t) => t.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter((s) => words(s) >= 10).map((s) => s.toLowerCase().trim());

// Sentence index over every other page's prose + FAQ answers.
const sentenceIndex = new Map();
function indexText(id, t) { for (const s of sentences(t)) { if (!sentenceIndex.has(s)) sentenceIndex.set(s, new Set()); sentenceIndex.get(s).add(id); } }
for (const f of allMdx) {
  const id = idOf(f);
  const src = fs.readFileSync(f, 'utf8');
  indexText(id, stripMdx(src.replace(/^---\n[\s\S]*?\n---/, '')));
  const [k, s] = id.split('/');
  const fq = data.faq[`${k}--${s}`];
  if (fq) indexText(id, fq.items.map((i) => i.a).join(' '));
}

let failures = 0;
for (const file of files) {
  const out = [];
  const warnList = [];
  const bad = (m) => out.push(m);
  const warn = (m) => warnList.push(m);
  if (!fs.existsSync(file)) { console.log(`✗ ${file}: not found`); failures++; continue; }
  const src = fs.readFileSync(file, 'utf8');
  const id = idOf(file);
  const [kind, slug] = id.split('/');
  const fmRaw = src.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!fmRaw) { console.log(`✗ ${file}: no frontmatter`); failures++; continue; }
  const body = src.slice(src.indexOf('---', 3) + 3);
  const fm = (k) => { const m = fmRaw.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')); return m ? m[1].trim().replace(/^["']|["']$/g, '') : null; };
  const title = fm('title'); const desc = fm('description'); const qa = fm('quickAnswer'); const pub = fm('published');
  const extras = new Set([...fmRaw.matchAll(/-\s*value:\s*["']?([^"'\n]+)["']?/g)].map((m) => normFig(m[1])).filter(Boolean));
  const figOk = (v) => known.has(v) || extras.has(v);

  // frontmatter
  if (!title || title.length < 20 || title.length > 66) bad(`title must be 20–66 chars (is ${title?.length ?? 0})`);
  if (!desc || desc.length < 110 || desc.length > 165) bad(`description must be 110–165 chars (is ${desc?.length ?? 0})`);
  if (!pub || !/^\d{4}-\d{2}-\d{2}$/.test(pub)) bad('published must be YYYY-MM-DD');
  for (const y of `${title} ${fm('h1') ?? ''}`.match(/\b20\d\d\b/g) ?? []) if (y !== '2026') bad(`title/h1 year ${y} must be the verification year 2026`);
  const tool = data.tools[slug];
  if (['pricing', 'tools', 'alternatives'].includes(kind) && !tool) bad(`no tool data for "${slug}"`);
  if (kind !== 'pages') {
    if (!qa) bad('quickAnswer is required');
    else {
      const n = words(qa);
      if (n < 60 || n > 120) (n < 50 || n > 130 ? bad : warn)(`quickAnswer is ${n} words (aim 60–120)`);
      if (!/\d/.test(qa)) bad('quickAnswer states no number');
      for (const f of figuresIn(qa)) if (!figOk(f.v)) bad(`quickAnswer figure ${f.raw} is not in the data`);
      if (tool && !qa.toLowerCase().includes(tool.name.toLowerCase())) bad(`quickAnswer must name ${tool.name}`);
      if (kind === 'compare') { const c = data.comparisons[slug]; if (c) for (const t of [c.a, c.b]) if (!qa.toLowerCase().includes(data.tools[t].name.toLowerCase())) bad(`quickAnswer must name ${data.tools[t].name}`); }
      if (kind === 'pricing' && tool) {
        const p = data.pricing[slug];
        const entry = p.plans.filter((x) => x.priceUnit !== 'custom' && (x.monthly ?? x.annualMonthly) > 0).sort((a, b) => (a.monthly ?? a.annualMonthly) - (b.monthly ?? b.annualMonthly))[0];
        if (entry) { const v = normFig(entry.monthly ?? entry.annualMonthly); if (!figuresIn(qa).some((f) => f.v === v)) bad(`quickAnswer must state the entry paid price ($${entry.monthly ?? entry.annualMonthly}, ${entry.name})`); }
      }
    }
  }
  // headings
  if (/^#\s/m.test(body)) bad('no H1 (#) in the body; the page renders its own H1');
  const h2s = [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);
  if (kind !== 'pages' && (h2s.length < 3 || h2s.length > 8)) bad(`${h2s.length} H2 sections (want 3–8)`);
  // Headings the page template already renders; a prose H2 with the same words would repeat them.
  const RESERVED = [/^(frequently asked questions|faqs?|how we checked this|keep reading|what you will really pay|add-ons, usage and other costs)\??$/i, /^which should you pick\??$/i, /^what each one really costs\??$/i, /side by side$/i, /^how we score (them|it)$/i, /^what the whole stack costs\??$/i, /^free tools we would add$/i, /^what to skip\??$/i, /^what it does well,? and where it falls short$/i, /^what .{2,40} really costs\??$/i, /^compare \S+$/i, /plans and prices$/i, /^billing rules worth knowing$/i, /^if you want one answer$/i, /^where we would start$/i];
  h2s.forEach((h) => { const t = h.replace(/<[^>]+>/g, '').trim(); if (RESERVED.some((re) => re.test(t))) bad(`H2 "${h}" repeats a heading the page template already renders; choose a more specific question`); });
  const dupH = h2s.filter((h, i) => h2s.indexOf(h) !== i); if (dupH.length) bad(`duplicate H2: ${dupH.join(', ')}`);
  // tokens
  for (const m of body.matchAll(/<(Price|Real|Stack|Checked|T)\b([^>]*)\/>/g)) {
    const attrs = Object.fromEntries([...m[2].matchAll(/(\w+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    const t = attrs.tool ?? attrs.id;
    if (m[1] === 'Stack') { if (!data.stacks[attrs.id]) bad(`<Stack id="${attrs.id}"> unknown stack`); if (!SIZES.includes(attrs.size)) bad(`<Stack size="${attrs.size}"> must be solo|small|growing`); continue; }
    if (!data.tools[t]) { bad(`<${m[1]}> unknown tool "${t}"`); continue; }
    if (m[1] === 'Price' && !data.pricing[t].plans.some((p) => p.id === attrs.plan)) bad(`<Price tool="${t}" plan="${attrs.plan}"> unknown plan; plans: ${data.pricing[t].plans.map((p) => p.id).join(', ')}`);
    if (m[1] === 'Price' && attrs.plan) { const pl = data.pricing[t].plans.find((p) => p.id === attrs.plan); const fld = attrs.field ?? 'monthly'; if (pl && pl[fld] == null) bad(`<Price tool="${t}" plan="${attrs.plan}" field="${fld}"> is null in the data`); }
    if (m[1] === 'Real' && !SIZES.includes(attrs.size)) bad(`<Real size="${attrs.size}"> must be solo|small|growing`);
  }
  for (const m of body.matchAll(/<([A-Z]\w*)\b/g)) if (!['Price', 'Real', 'Stack', 'Checked', 'T', 'Programs', 'Mandated', 'ContactForm', 'Factors', 'Coverage', 'Analytics', 'Packages', 'ServicesForm', 'Visit'].includes(m[1])) bad(`unknown component <${m[1]}>`);
  // links
  for (const m of body.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const href = m[1].split('#')[0];
    if (!href.endsWith('/') && !/\.[a-z]+$/.test(href)) bad(`link ${m[1]} needs a trailing slash`);
    else if (!livePaths.has(href) && !/^\/(methodology|how-we-earn|about|contact|privacy|terms)\/$/.test(href)) bad(`link ${m[1]} points to a page that does not exist; use <T id="…" /> for tools or link an existing page`);
  }
  if (/\]\(https?:\/\/(www\.)?cinchstack\.com/.test(body)) bad('use relative links (/stacks/…/) for our own pages');
  // prose rules
  const prose = stripMdx(body);
  const all = `${prose} ${qa ?? ''}`;
  for (const [re, why] of BANNED) { const m = all.match(re); if (m) bad(`${why}: "${m[0]}"`); }
  for (const f of figuresIn(prose)) if (!figOk(f.v)) bad(`figure ${f.raw} is not in the data; use a token (<Price/>, <Real/>, <Stack/>) or declare it in extraFigures with a reason`);
  const indep = (all.match(/\bindependen(t|ce|tly)\b/gi) ?? []).length;
  if (kind !== 'pages' && indep > 1) bad(`"independent" appears ${indep} times (max 1 per page)`);
  const n = words(prose);
  const MIN = { pricing: 550, tools: 450, compare: 700, alternatives: 450, stacks: 700 };
  if (MIN[kind] && n < MIN[kind]) bad(`body is ${n} words; a ${kind} page needs at least ${MIN[kind]} to be useful`);
  // FAQ
  if (kind !== 'pages') {
    const key = `${kind}--${slug}`;
    const fq = data.faq[key];
    if (!fq) bad(`missing src/data/faq/${key}.json`);
    else {
      const r = faqSchema.safeParse(fq);
      if (!r.success) bad(`faq/${key}.json: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      if (fq.page !== id) bad(`faq/${key}.json: "page" must be "${id}"`);
      if (fq.items.length < 5 || fq.items.length > 8) bad(`faq has ${fq.items.length} items (want 5–8)`);
      for (const it of fq.items) {
        const w = words(it.a);
        if (w < 90 || w > 160) (w < 60 || w > 200 ? bad : warn)(`faq answer ${w} words (aim 90–160): "${it.q}"`);
        for (const f of figuresIn(it.a)) if (!figOk(f.v)) bad(`faq figure ${f.raw} not in the data: "${it.q}"`);
        for (const [re, why] of BANNED) { const m = `${it.q} ${it.a}`.match(re); if (m) bad(`faq ${why}: "${m[0]}"`); }
        if (!it.q.trim().endsWith('?')) bad(`faq question should be a question: "${it.q}"`);
      }
    }
  }
  // page data
  if (kind === 'compare') { const c = data.comparisons[slug]; if (!c) bad(`missing src/data/comparisons/${slug}.json`); else { const r = comparisonSchema.safeParse(c); if (!r.success) bad(`comparison data invalid`); const txt = [...c.dimensions.flatMap((d) => [d.a, d.b]), ...c.verdicts.map((v) => v.why)].join(' '); for (const f of figuresIn(txt)) if (!figOk(f.v)) bad(`comparison data figure ${f.raw} not in the data`); for (const [re, why] of BANNED) { const m = txt.match(re); if (m) bad(`comparison data ${why}: "${m[0]}"`); } } }
  if (kind === 'stacks') { const s = data.stacks[slug]; if (!s) bad(`missing src/data/stacks/${slug}.json`); else { const txt = [s.profile, ...s.layers.flatMap((l) => [l.why, ...l.alternatives.map((a) => a.when)]), ...s.skip.map((x) => x.why), ...s.extras.map((x) => x.note)].join(' '); for (const f of figuresIn(txt)) if (!figOk(f.v)) bad(`stack data figure ${f.raw} not in the data`); for (const [re, why] of BANNED) { const m = txt.match(re); if (m) bad(`stack data ${why}: "${m[0]}"`); } for (const l of s.layers) if (!data.tools[l.pick]) bad(`stack pick "${l.pick}" has no tool data`); } }
  if (kind === 'alternatives') { const a = data.alternatives[slug]; if (!a) bad(`missing src/data/alternatives/${slug}.json`); else { const txt = a.reasons.flatMap((r) => [r.reason, ...r.picks.map((p) => p.why)]).join(' '); for (const f of figuresIn(txt)) if (!figOk(f.v)) bad(`alternatives data figure ${f.raw} not in the data`); for (const [re, why] of BANNED) { const m = txt.match(re); if (m) bad(`alternatives data ${why}: "${m[0]}"`); } for (const r of a.reasons) for (const p of r.picks) if (!data.tools[p.tool]) bad(`alternative "${p.tool}" has no tool data`); } }
  // reused sentences
  const mine = new Set([...sentences(prose), ...sentences(data.faq[`${kind}--${slug}`]?.items.map((i) => i.a).join(' ') ?? '')]);
  for (const s of mine) { const others = [...(sentenceIndex.get(s) ?? [])].filter((x) => x !== id); if (others.length >= 2) bad(`sentence also used on ${others.join(', ')}: "${s.slice(0, 80)}…"`); }

  if (out.length) { failures++; console.log(`✗ ${file} (${n} words)`); out.forEach((m) => console.log(`    - ${m}`)); }
  else console.log(`✓ ${file} (${n} words)`);
  warnList.forEach((m) => console.log(`    ⚠ ${m}`));
}
process.exit(failures ? 1 : 0);
