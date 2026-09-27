#!/usr/bin/env node
// Adds an "initial-record" changelog entry for every tool that does not have one yet.
// Usage: node scripts/seed-changelog.mjs
import fs from 'node:fs';
import path from 'node:path';
const FILE = 'src/data/changelog.json';
const log = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : [];
const have = new Set(log.filter((e) => e.kind === 'initial-record').map((e) => e.tool));
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
let added = 0;
for (const f of fs.readdirSync('src/data/pricing').filter((x) => x.endsWith('.json')).sort()) {
  const id = f.slice(0, -5);
  if (have.has(id)) continue;
  const p = JSON.parse(fs.readFileSync(path.join('src/data/pricing', f), 'utf8'));
  const t = JSON.parse(fs.readFileSync(path.join('src/data/tools', f), 'utf8'));
  const paid = p.plans.filter((x) => x.priceUnit !== 'custom' && (x.monthly ?? x.annualMonthly) > 0).sort((a, b) => (a.monthly ?? a.annualMonthly) - (b.monthly ?? b.annualMonthly));
  const n = p.plans.length;
  const from = paid[0] ? ` Paid plans start at ${money(paid[0].monthly ?? paid[0].annualMonthly)} a month${paid[0].monthly === null ? ' billed yearly' : ''}${paid[0].priceUnit === 'per-seat-month' ? ' per seat' : ''} (${paid[0].name}).` : '';
  log.push({ date: p.checkedOn, tool: id, kind: 'initial-record', summary: `Started tracking ${t.name}'s pricing: ${n} plan${n > 1 ? 's' : ''}, ${p.addOns.length} add-on${p.addOns.length === 1 ? '' : 's'} and ${p.usage.length} usage rate${p.usage.length === 1 ? '' : 's'} recorded from ${p.sources.length} vendor page${p.sources.length === 1 ? '' : 's'}.${from}`, source: t.pricingUrl });
  added++;
}
fs.writeFileSync(FILE, JSON.stringify(log, null, 2) + '\n');
console.log(`${added} initial records added; ${log.length} entries total`);
