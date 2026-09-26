// Every dollar figure the data knows, for the rule "prose numbers must come from the data".
// Shared by scripts/check.mjs (built pages) and scripts/lint-content.mjs (drafts).
import fs from 'node:fs';
import path from 'node:path';

export const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const dirJson = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.json') && !f.startsWith('_')).map((f) => [f.replace(/\.json$/, ''), readJson(path.join(d, f))]) : []);

export function loadData(root = 'src/data') {
  return {
    pricing: Object.fromEntries(dirJson(path.join(root, 'pricing'))),
    tools: Object.fromEntries(dirJson(path.join(root, 'tools'))),
    stacks: Object.fromEntries(dirJson(path.join(root, 'stacks'))),
    comparisons: Object.fromEntries(dirJson(path.join(root, 'comparisons'))),
    alternatives: Object.fromEntries(dirJson(path.join(root, 'alternatives'))),
    faq: Object.fromEntries(dirJson(path.join(root, 'faq'))),
    programs: fs.existsSync(path.join(root, 'programs.json')) ? readJson(path.join(root, 'programs.json')) : {},
  };
}

export function normFig(s) {
  let t = String(s).replace(/[$,\s]/g, '');
  let mult = 1;
  if (/k$/i.test(t)) { mult = 1000; t = t.slice(0, -1); }
  const n = Number(t);
  return Number.isFinite(n) ? String(Math.round(n * mult * 100) / 100) : null;
}

export function stackTotals(stack, pricing) {
  const totals = { solo: 0, small: 0, growing: 0 };
  for (const l of stack.layers) for (const size of Object.keys(totals)) {
    const o = l.overrides?.[size];
    totals[size] += o ? o.amount : pricing[l.pick]?.scenarios.find((x) => x.size === size)?.monthly ?? 0;
  }
  for (const k of Object.keys(totals)) totals[k] = Math.round(totals[k] * 100) / 100;
  return totals;
}

export function knownFigures({ pricing, stacks }) {
  const known = new Set();
  const add = (n) => {
    if (typeof n !== 'number' || !Number.isFinite(n)) return;
    known.add(String(Math.round(n * 100) / 100));
    known.add(String(Math.round(n)));
  };
  for (const p of Object.values(pricing)) {
    for (const x of p.plans) { add(x.monthly); add(x.annualMonthly); if (x.monthly != null) add(x.monthly * 12); if (x.annualMonthly != null) add(x.annualMonthly * 12); }
    (p.addOns ?? []).forEach((x) => { add(x.price); add(x.price * 12); });
    (p.usage ?? []).forEach((x) => add(x.rate));
    (p.extraCosts ?? []).forEach((x) => { if (x.kind !== 'percent-of-sales') add(x.amount); });
    for (const s of p.scenarios) { add(s.monthly); add(s.monthly * 12); s.lines.forEach((l) => add(l.amount)); }
  }
  for (const s of Object.values(stacks)) {
    for (const l of s.layers) for (const o of Object.values(l.overrides ?? {})) add(o?.amount);
    Object.values(stackTotals(s, pricing)).forEach((v) => { add(v); add(v * 12); });
  }
  return known;
}

/** Dollar figures in a string, normalised. */
export function figuresIn(text) {
  return [...text.matchAll(/\$\s?(\d[\d,]*(?:\.\d+)?)(\s?[kK]\b)?/g)].map((m) => ({ raw: m[0].trim(), v: normFig(m[1] + (m[2] ? 'k' : '')) }));
}

export const BANNED = [
  [/\bwe (tested|trialed|trialled|signed up for|bought)\b/i, 'first-hand claim without a trial record'],
  [/\b(in our (testing|tests|experience)|hands-on test)\b/i, 'first-hand claim without a trial record'],
  [/\bmake money\b|\bearn \$|\bpassive income\b|\bget rich\b/i, 'earnings claim'],
  [/\b(coupon|promo code|discount code|voucher)\b/i, 'offer language (needs program authorization)'],
  [/\b(seamless(ly)?|robust|game[- ]?chang\w*|revolutionary|cutting[- ]edge|unleash|supercharge|best[- ]in[- ]class|world[- ]class|powerful)\b/i, 'hype word'],
];
