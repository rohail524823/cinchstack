// Loads and validates every data file once, at build time. Invalid data fails the build.
import {
  pricingSchema, toolSchema, scoreSchema, programSchema, comparisonSchema, stackSchema,
  alternativesSchema, faqSchema, changelogSchema, pricingIntegrity, SIZES, LAYERS,
} from './schemas.mjs';

function collect(globbed, schema, kind) {
  const out = {};
  const errors = [];
  for (const [path, mod] of Object.entries(globbed)) {
    const key = path.split('/').pop().replace(/\.json$/, '');
    if (key.startsWith('_')) continue;
    const raw = mod.default ?? mod;
    const r = schema.safeParse(raw);
    if (!r.success) {
      errors.push(`${kind}/${key}.json: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      continue;
    }
    out[key] = r.data;
  }
  if (errors.length) throw new Error(`Invalid data:\n${errors.join('\n')}`);
  return out;
}

export const tools = collect(import.meta.glob('../data/tools/*.json', { eager: true }), toolSchema, 'tools');
export const pricing = collect(import.meta.glob('../data/pricing/*.json', { eager: true }), pricingSchema, 'pricing');
export const scores = collect(import.meta.glob('../data/scores/*.json', { eager: true }), scoreSchema, 'scores');
export const comparisons = collect(import.meta.glob('../data/comparisons/*.json', { eager: true }), comparisonSchema, 'comparisons');
export const stacks = collect(import.meta.glob('../data/stacks/*.json', { eager: true }), stackSchema, 'stacks');
export const alternatives = collect(import.meta.glob('../data/alternatives/*.json', { eager: true }), alternativesSchema, 'alternatives');
export const faqs = collect(import.meta.glob('../data/faq/*.json', { eager: true }), faqSchema, 'faq');
const programsRaw = import.meta.glob('../data/programs.json', { eager: true });
export const programs = Object.fromEntries(
  Object.entries(Object.values(programsRaw)[0]?.default ?? {}).map(([k, v]) => [k, programSchema.parse(v)]),
);
const changelogRaw = import.meta.glob('../data/changelog.json', { eager: true });
export const changelog = changelogSchema.parse(Object.values(changelogRaw)[0]?.default ?? [])
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.tool.localeCompare(b.tool)));
const datesRaw = import.meta.glob('../data/_dates.json', { eager: true });
export const pageDates = Object.values(datesRaw)[0]?.default ?? {};
const checksRaw = import.meta.glob('../data/_checks.json', { eager: true });
/** Results of the weekly automated price check (scripts/verify-prices.mjs), by tool. */
export const checks = Object.values(checksRaw)[0]?.default ?? {};

// Integrity across files.
{
  const errs = [];
  for (const [id, p] of Object.entries(pricing)) pricingIntegrity(p).forEach((e) => errs.push(`pricing/${id}: ${e}`));
  for (const id of Object.keys(tools)) if (!pricing[id]) errs.push(`tools/${id}: missing pricing/${id}.json`);
  if (errs.length) throw new Error(`Data integrity:\n${errs.join('\n')}`);
}

export const toolIds = Object.keys(tools).sort();
export const coreToolIds = toolIds.filter((id) => tools[id].tier === 'core');

export function tool(id) {
  const t = tools[id];
  if (!t) throw new Error(`Unknown tool "${id}"`);
  return t;
}
export function price(id) {
  const p = pricing[id];
  if (!p) throw new Error(`No pricing for "${id}"`);
  return p;
}
export function score(id) {
  return scores[id] ?? null;
}
export function program(id) {
  const key = tools[id]?.affiliate?.program;
  return key ? programs[key] ?? null : null;
}
/** A tool pays us only when its program is approved AND we hold a working link. */
export function paysUs(id) {
  const p = program(id);
  return Boolean(p && p.status === 'approved' && p.template);
}
export function scenario(id, size) {
  return price(id).scenarios.find((s) => s.size === size);
}
// What each standard business size counts for a tool's job, as in the table on /methodology/.
// Shown next to real-bill figures: a five-person business needs 2 SEO seats but 5 workspace seats.
const SIZE_BASIS = {
  run: { solo: '1 user, 1,000 contacts', small: '3 users, 5,000 contacts', growing: '8 users, 25,000 contacts' },
  sell: { solo: '1 staff, $3,000/mo in sales', small: '3 staff, $30,000/mo in sales', growing: '8 staff, $150,000/mo in sales' },
  site: { solo: '1 editor', small: '3 editors', growing: '8 editors' },
  seo: { solo: '1 user, 500 keywords', small: '2 users, 1,500 keywords', growing: '4 users, 5,000 keywords' },
  email: { solo: '1,000 subscribers', small: '10,000 subscribers', growing: '50,000 subscribers' },
  organize: { solo: '1 seat', small: '5 seats', growing: '15 seats' },
};
export function sizeBasis(id, size) {
  const t = tool(id);
  const job = t.layer === 'grow' ? (/\bseo\b/i.test(t.category) ? 'seo' : 'email') : t.layer;
  return SIZE_BASIS[job]?.[size] ?? '';
}
export function plan(id, planId) {
  return price(id).plans.find((p) => p.id === planId);
}
/** Cheapest paid plan (by month-to-month price, falling back to annual). */
export function cheapestPaid(id) {
  const paid = price(id).plans
    .map((p) => ({ p, v: p.monthly ?? p.annualMonthly }))
    .filter((x) => x.v !== null && x.v > 0 && x.p.priceUnit !== 'custom');
  // A workspace plan (Webflow's) can't publish a site on its own, so when a tool also sells site
  // plans, the cheapest way in is its cheapest site plan.
  const sites = paid.filter((x) => x.p.priceUnit === 'per-site-month');
  const entry = sites.length ? paid.filter((x) => x.p.priceUnit !== 'per-workspace-month') : paid;
  return entry.sort((a, b) => a.v - b.v)[0] ?? null;
}
/** What to show when a tool has no self-serve paid plan: free products say so, the rest are quote-only. */
export function noPaidPlan(id) {
  return price(id).freeTier.exists ? { value: 'Free', sub: 'no paid plan' } : { value: 'Custom', sub: 'quote only' };
}

export function stackBill(stackId) {
  const s = stacks[stackId];
  const rows = s.layers.map((l) => {
    const cells = Object.fromEntries(SIZES.map((size) => {
      const o = l.overrides?.[size];
      if (o) return [size, { amount: o.amount, note: o.note, override: true }];
      const sc = scenario(l.pick, size);
      return [size, { amount: sc.monthly, note: sc.label, override: false, confidence: sc.confidence, floor: Boolean(sc.floor) }];
    }));
    return { ...l, cells };
  });
  const totals = Object.fromEntries(SIZES.map((size) => [size, Math.round(rows.reduce((a, r) => a + r.cells[size].amount, 0) * 100) / 100]));
  const floors = Object.fromEntries(SIZES.map((size) => [size, rows.some((r) => r.cells[size].floor)]));
  return { rows, totals, floors };
}

export function toolsByLayer() {
  return Object.fromEntries(LAYERS.map((l) => [l, toolIds.filter((id) => tools[id].layer === l)]));
}

export function comparisonsFor(id) {
  return Object.values(comparisons).filter((c) => c.a === id || c.b === id);
}

/** Every dollar figure the data knows about, as rounded strings, for the prose-figure gate. */
export function knownFigures() {
  const set = new Set();
  const add = (n) => { if (typeof n === 'number') set.add(String(Math.round(n * 100) / 100)); };
  for (const p of Object.values(pricing)) {
    p.plans.forEach((x) => { add(x.monthly); add(x.annualMonthly); if (x.monthly !== null && x.monthly !== undefined) add(x.monthly * 12); if (x.annualMonthly !== null && x.annualMonthly !== undefined) add(x.annualMonthly * 12); });
    p.addOns.forEach((x) => add(x.price));
    p.usage.forEach((x) => add(x.rate));
    p.extraCosts.forEach((x) => add(x.amount));
    p.scenarios.forEach((s) => { add(s.monthly); add(s.monthly * 12); s.lines.forEach((l) => add(l.amount)); });
  }
  for (const id of Object.keys(stacks)) {
    const b = stackBill(id);
    Object.values(b.totals).forEach((v) => { add(v); add(v * 12); });
  }
  return set;
}
