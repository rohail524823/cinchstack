#!/usr/bin/env node
// Validate every data file (or the files given) against src/lib/schemas.mjs plus cross-file rules.
// Usage: node scripts/validate-data.mjs            -> everything
//        node scripts/validate-data.mjs src/data/pricing/hubspot.json src/data/tools/hubspot.json
import fs from 'node:fs';
import path from 'node:path';
import {
  pricingSchema, toolSchema, scoreSchema, programSchema, comparisonSchema, stackSchema,
  alternativesSchema, faqSchema, changelogSchema, servicesSchema, pricingIntegrity,
} from '../src/lib/schemas.mjs';

const ROOT = 'src/data';
const kinds = {
  pricing: pricingSchema, tools: toolSchema, scores: scoreSchema, comparisons: comparisonSchema,
  stacks: stackSchema, alternatives: alternativesSchema, faq: faqSchema,
};

function listAll() {
  const out = [];
  for (const k of Object.keys(kinds)) {
    const d = path.join(ROOT, k);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) if (f.endsWith('.json') && !f.startsWith('_')) out.push(path.join(d, f));
  }
  for (const f of ['programs.json', 'changelog.json', 'services.json']) if (fs.existsSync(path.join(ROOT, f))) out.push(path.join(ROOT, f));
  return out;
}

const files = process.argv.slice(2).length ? process.argv.slice(2) : listAll();
const toolIds = new Set(fs.existsSync(path.join(ROOT, 'tools')) ? fs.readdirSync(path.join(ROOT, 'tools')).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)) : []);
const programs = fs.existsSync(path.join(ROOT, 'programs.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'programs.json'), 'utf8')) : {};

let bad = 0;
function fail(file, msg) { bad++; console.log(`✗ ${file}: ${msg}`); }

for (const file of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { fail(file, `invalid JSON: ${e.message}`); continue; }
  const base = path.basename(file, '.json');
  const kind = path.basename(path.dirname(file));
  let schema = kinds[kind];
  if (base === 'programs') schema = null;
  if (base === 'changelog') schema = changelogSchema;
  if (base === 'services') schema = servicesSchema;
  if (base === 'programs') {
    for (const [k, v] of Object.entries(data)) {
      const r = programSchema.safeParse(v);
      if (!r.success) r.error.issues.forEach((i) => fail(file, `${k}.${i.path.join('.')}: ${i.message}`));
      if (v.status === 'approved' && v.template && !v.template.includes('{url_enc}') && !v.template.includes('{url}')) {
        // allowed: fixed referral links (e.g. ?fp_ref=code) — no destination substitution
      }
    }
    continue;
  }
  if (!schema) { fail(file, `unknown data kind "${kind}"`); continue; }
  const r = schema.safeParse(data);
  if (!r.success) { r.error.issues.forEach((i) => fail(file, `${i.path.join('.') || '(root)'}: ${i.message}`)); continue; }
  const d = r.data;
  if (kind === 'pricing') {
    if (d.tool !== base) fail(file, `tool "${d.tool}" does not match filename`);
    pricingIntegrity(d).forEach((m) => fail(file, m));
    for (const s of d.sources) if (s.snapshot && !fs.existsSync(s.snapshot)) fail(file, `snapshot missing: ${s.snapshot}`);
  }
  if (kind === 'tools') {
    if (d.id !== base) fail(file, `id "${d.id}" does not match filename`);
    if (d.affiliate.program && !programs[d.affiliate.program]) fail(file, `affiliate.program "${d.affiliate.program}" not in programs.json`);
    if (!fs.existsSync(path.join(ROOT, 'pricing', `${d.id}.json`))) fail(file, `no pricing/${d.id}.json`);
  }
  if (kind === 'scores' && d.tool !== base) fail(file, `tool mismatch`);
  if (kind === 'comparisons') {
    if (d.id !== `${d.a}-vs-${d.b}` || d.id !== base) fail(file, `id must be "<a>-vs-<b>" and match filename`);
    for (const t of [d.a, d.b]) if (!toolIds.has(t)) fail(file, `unknown tool "${t}"`);
  }
  if (kind === 'stacks') {
    if (d.id !== base) fail(file, `id mismatch`);
    for (const l of d.layers) {
      if (!toolIds.has(l.pick)) fail(file, `unknown pick "${l.pick}"`);
      for (const a of l.alternatives) if (!toolIds.has(a.tool)) fail(file, `unknown alternative "${a.tool}"`);
    }
  }
  if (kind === 'alternatives') {
    if (d.tool !== base) fail(file, `tool mismatch`);
    for (const r2 of d.reasons) for (const p of r2.picks) {
      if (!toolIds.has(p.tool)) fail(file, `unknown pick "${p.tool}"`);
      if (p.tool === d.tool) fail(file, `a tool cannot be its own alternative`);
    }
  }
  // faq/pricing--hubspot.json belongs to the page "pricing/hubspot".
  if (kind === 'faq' && d.page !== base.replace('--', '/')) fail(file, `page must be "${base.replace('--', '/')}" to match the filename (got "${d.page}")`);
}

if (bad) { console.log(`\n${bad} problem(s) in ${files.length} file(s).`); process.exit(1); }
console.log(`✓ ${files.length} data file(s) valid.`);
