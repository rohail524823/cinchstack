#!/usr/bin/env node
// Checks that every structured figure in a pricing record appears in the snapshot file it cites.
// It cannot tell whether a figure is attached to the right plan or unit (that needs a reader),
// but it catches numbers that were never on the page at all.
// Usage: node scripts/trace-figures.mjs [tool ...]   (no args = every tool)
import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/data/pricing';
const only = process.argv.slice(2);
const tools = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).filter((t) => !only.length || only.includes(t)).sort();

const cache = new Map();
function numbersIn(file) {
  if (cache.has(file)) return cache.get(file);
  const set = new Set();
  if (fs.existsSync(file)) {
    const txt = fs.readFileSync(file, 'utf8');
    for (const m of txt.matchAll(/(\d[\d,]*(?:\.\d+)?)/g)) {
      const n = Number(m[1].replace(/,/g, ''));
      if (Number.isFinite(n)) set.add(Math.round(n * 10000) / 10000);
    }
    // cents written as "30¢" also count as dollars
    for (const m of txt.matchAll(/(\d+(?:\.\d+)?)\s?¢/g)) set.add(Math.round((Number(m[1]) / 100) * 10000) / 10000);
  }
  cache.set(file, set);
  return set;
}
const has = (set, n) => set.has(Math.round(n * 10000) / 10000);

let missingTotal = 0;
for (const tool of tools) {
  const p = JSON.parse(fs.readFileSync(path.join(dir, `${tool}.json`), 'utf8'));
  const missing = [];
  let checked = 0;
  const check = (label, n, src, alts = []) => {
    if (n === null || n === undefined || n === 0) return;
    const s = p.sources[src];
    if (!s?.snapshot) { missing.push(`${label}: source ${src} has no snapshot`); return; }
    const set = numbersIn(s.snapshot);
    checked++;
    if (has(set, n) || alts.some((a) => has(set, a))) return;
    // A plan has one source, but its yearly price often lives in the yearly-toggle capture of the same page.
    const elsewhere = p.sources.map((x) => x.snapshot).filter(Boolean).find((f) => { const o = numbersIn(f); return has(o, n) || alts.some((a) => has(o, a)); });
    if (elsewhere) return;
    missing.push(`${label} = ${n} not found in ${s.snapshot} or any other cited snapshot`);
  };
  for (const x of p.plans) {
    check(`plan ${x.id} monthly`, x.monthly, x.source);
    // a yearly price may be printed as the monthly equivalent or as the yearly total
    if (x.annualMonthly) check(`plan ${x.id} annualMonthly`, x.annualMonthly, x.source, [Math.round(x.annualMonthly * 12), Math.round(x.annualMonthly * 12 * 100) / 100]);
  }
  for (const x of p.addOns ?? []) check(`addOn ${x.id}`, x.price, x.source);
  for (const x of p.usage ?? []) check(`usage ${x.id}`, x.rate, x.source);
  for (const x of p.extraCosts ?? []) if (x.kind !== 'percent-of-sales' && x.amount !== null) check(`extraCost ${x.id}`, x.amount, x.source);
  missingTotal += missing.length;
  console.log(`${missing.length ? '✗' : '✓'} ${tool}: ${checked} figures traced${missing.length ? `, ${missing.length} not found` : ''}`);
  missing.forEach((m) => console.log(`    - ${m}`));
}
process.exit(missingTotal ? 1 : 0);
