#!/usr/bin/env node
// Writes a compact, human-readable fact sheet per tool for writers: every plan (with the ids that
// MDX tokens need), every cost, the three real bills, the fine print and what could not be verified.
// Usage: node scripts/factpack.mjs [outDir]   (default: .factpacks/, which is gitignored)
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2] ?? '.factpacks';
fs.mkdirSync(out, { recursive: true });
const money = (n) => (n === null || n === undefined ? '—' : `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 4 })}`);
const ids = fs.readdirSync('src/data/pricing').filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const index = [];
for (const id of ids) {
  const tf = `src/data/tools/${id}.json`;
  if (!fs.existsSync(tf)) continue;
  let p, t;
  try { p = JSON.parse(fs.readFileSync(`src/data/pricing/${id}.json`, 'utf8')); t = JSON.parse(fs.readFileSync(tf, 'utf8')); } catch { console.log(`skip ${id}: data is being edited`); continue; }
  if (!p.plans || !p.scenarios || !t.pros) continue;
  const L = [];
  L.push(`# ${t.name} — fact sheet (tool id \`${id}\`)`);
  L.push(`Prices verified ${p.checkedOn}. Layer: ${t.layer}. Category: ${t.category}. Vendor: ${t.vendor}. Tier: ${t.tier}.`);
  L.push(`Site: ${t.url} · Pricing page: ${t.pricingUrl}`);
  L.push('', `**One-liner:** ${t.oneLiner}`, '', `**Summary:** ${t.summary}`);
  L.push('', `**Best for:** ${t.bestFor.join(', ') || '—'} · **Not for:** ${(t.notFor ?? []).join('; ') || '—'}`);
  L.push('', '## Plans (use these ids in `<Price tool="' + id + '" plan="…" />`)');
  L.push('| plan id | name | monthly | billed yearly (per month) | unit | limits / note |', '|---|---|---|---|---|---|');
  for (const x of p.plans) L.push(`| \`${x.id}\` | ${x.name} | ${x.priceUnit === 'custom' ? 'custom' : money(x.monthly)} | ${x.priceUnit === 'custom' ? 'custom' : money(x.annualMonthly)} | ${x.priceUnit}${x.seatsIncluded ? `, ${x.seatsIncluded} seat(s) incl.` : ''} | ${[...(x.limits ?? []), x.note].filter(Boolean).join('; ').replace(/\|/g, '/')} |`);
  L.push('', `**Free tier:** ${p.freeTier.exists ? 'yes' : 'no'}. ${p.freeTier.summary}`);
  L.push(`**Trial:** ${p.trial.summary}`);
  if (p.addOns.length) { L.push('', '## Add-ons'); for (const x of p.addOns) L.push(`- ${x.name}: ${money(x.price)} ${x.unit}${x.note ? ` — ${x.note}` : ''}`); }
  if (p.usage.length) { L.push('', '## Usage charges'); for (const x of p.usage) L.push(`- ${x.name}: ${money(x.rate)} ${x.unit}${x.note ? ` — ${x.note}` : ''}`); }
  if (p.extraCosts.length) { L.push('', '## Extra costs'); for (const x of p.extraCosts) L.push(`- ${x.label}: ${x.display} (${x.kind})${x.note ? ` — ${x.note}` : ''}`); }
  if (p.billingNotes.length) { L.push('', '## Billing fine print'); for (const x of p.billingNotes) L.push(`- ${x}`); }
  L.push('', `**Regional pricing:** ${p.regional.pricedByCountry ? 'varies by country. ' : ''}${p.regional.note}`);
  L.push('', '## The three real bills (use `<Real tool="' + id + '" size="solo|small|growing" />`)');
  for (const s of p.scenarios) {
    L.push(`- **${s.size}** — ${s.label}: **${money(s.monthly)}/mo** on plan \`${s.planId}\`, billed ${s.billing}, ${s.confidence} confidence.`);
    L.push(`  - Lines: ${s.lines.map((l) => `${l.label} ${money(l.amount)}`).join('; ')}`);
    L.push(`  - Assumptions: ${s.assumptions}${s.note ? ` Note: ${s.note}` : ''}`);
  }
  if (p.unverified.length) { L.push('', '## Could not be verified (never state these as fact)'); for (const x of p.unverified) L.push(`- ${x}`); }
  L.push('', '## Strengths (rendered on the review page)'); t.pros.forEach((x) => L.push(`- ${x}`));
  L.push('', '## Weaknesses (rendered on the review page)'); t.cons.forEach((x) => L.push(`- ${x}`));
  L.push('', '## Sources'); p.sources.forEach((s, i) => L.push(`${i}. ${s.label} — ${s.url}${s.snapshot ? ` (saved: ${s.snapshot})` : ''}`));
  fs.writeFileSync(path.join(out, `${id}.md`), L.join('\n') + '\n');
  const small = p.scenarios.find((s) => s.size === 'small');
  index.push(`| \`${id}\` | ${t.name} | ${t.layer} | ${t.category} | ${money(small?.monthly)} | ${t.tier} |`);
}
fs.writeFileSync(path.join(out, 'INDEX.md'), ['# Tools with verified data', '', 'Only these tools may appear in tokens or page data. Small-team real bill shown for orientation.', '', '| id | name | layer | category | 5-person bill | tier |', '|---|---|---|---|---|---|', ...index, ''].join('\n'));
console.log(`${index.length} fact sheets written to ${out}/`);
