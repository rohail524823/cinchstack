// The data contract. Every fact on the site lives in src/data and must pass these schemas.
// Shared by Astro (content.config.ts) and by the node scripts (validate-data, check).
import { z } from 'zod';

export const LAYERS = ['sell', 'site', 'grow', 'run', 'organize'];
export const LAYER_LABELS = {
  sell: 'Sell', site: 'Site', grow: 'Grow', run: 'Run', organize: 'Organize',
};
export const LAYER_QUESTIONS = {
  sell: 'How do I take money?',
  site: 'Where does my business live online?',
  grow: 'How do people find me and come back?',
  run: 'How do I manage leads, clients and automation?',
  organize: "Where does the team's knowledge live?",
};
export const BUSINESSES = ['agency', 'course-creator', 'shopify-store', 'local-service', 'freelancer', 'saas-startup'];
export const SIZES = ['solo', 'small', 'growing'];
// Each scenario's own label says what it counts (seats, contacts, editors); see sizeBasis() in data.mjs.
export const SIZE_LABELS = { solo: 'Solo', small: 'Small team', growing: 'Growing team' };
export const FACTORS = ['realCost', 'pricingHonesty', 'smallTeamFit', 'doesTheJob', 'freedomToLeave', 'trackRecord'];

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase-kebab id');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');
const money = z.number().nonnegative();
const srcIdx = z.number().int().nonnegative();

export const sourceSchema = z.object({
  url: z.string().url(),
  label: z.string().min(3),
  checkedOn: isoDate,
  snapshot: z.string().optional(), // path relative to repo root, under snapshots/
});

export const planSchema = z.object({
  id,
  name: z.string(),
  monthly: money.nullable(), // USD when billed month-to-month; null = not offered monthly or custom quote
  annualMonthly: money.nullable(), // effective USD/month when billed annually; null if not offered
  priceUnit: z.enum(['per-month', 'per-seat-month', 'per-site-month', 'per-workspace-month', 'custom']),
  seatsIncluded: z.number().int().positive().nullable().optional(),
  note: z.string().optional(),
  limits: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  source: srcIdx,
});

export const addOnSchema = z.object({
  id,
  name: z.string(),
  price: money,
  unit: z.string(), // "per month", "per 1,000 extra contacts per month"
  appliesTo: z.array(id).optional(),
  note: z.string().optional(),
  source: srcIdx,
});

export const usageSchema = z.object({
  id,
  name: z.string(),
  rate: money,
  unit: z.string(), // "per outbound SMS segment (US)"
  note: z.string().optional(),
  source: srcIdx,
});

export const extraCostSchema = z.object({
  id,
  label: z.string(),
  amount: z.number().nullable(), // number in USD, or percent when kind is percent-of-sales
  display: z.string(), // "$3,000 one-time", "2% of each sale"
  kind: z.enum(['one-time', 'monthly', 'per-transaction', 'percent-of-sales', 'other']),
  note: z.string().optional(),
  source: srcIdx,
});

export const scenarioSchema = z.object({
  size: z.enum(SIZES),
  label: z.string(), // "Solo operator, 2,000 contacts"
  assumptions: z.string(),
  planId: id,
  billing: z.enum(['monthly', 'annual']),
  lines: z.array(z.object({ label: z.string(), amount: z.number() })).min(1),
  monthly: z.number(), // must equal the sum of lines
  confidence: z.enum(['high', 'medium', 'low']),
  // true when the vendor does not publish its price at this size in a form we could capture:
  // the bill is the lowest it can be, and is shown as "from $X" and never used to call a tool cheaper.
  floor: z.boolean().optional(),
  note: z.string().optional(),
});

export const pricingSchema = z.object({
  tool: id,
  currency: z.literal('USD'),
  checkedOn: isoDate,
  method: z.string(),
  sources: z.array(sourceSchema).min(1),
  freeTier: z.object({ exists: z.boolean(), summary: z.string() }),
  trial: z.object({
    days: z.number().int().nonnegative().nullable(),
    cardRequired: z.boolean().nullable(),
    summary: z.string(),
    source: srcIdx.optional(),
  }),
  plans: z.array(planSchema).min(1),
  addOns: z.array(addOnSchema).default([]),
  usage: z.array(usageSchema).default([]),
  extraCosts: z.array(extraCostSchema).default([]),
  billingNotes: z.array(z.string()).default([]),
  regional: z.object({ pricedByCountry: z.boolean(), note: z.string() }),
  scenarios: z.array(scenarioSchema).length(3),
  unverified: z.array(z.string()).default([]),
  history: z.array(z.object({ date: isoDate, change: z.string() })).min(1),
});

export const toolSchema = z.object({
  id,
  name: z.string(),
  vendor: z.string(),
  tier: z.enum(['core', 'secondary']),
  layer: z.enum(LAYERS),
  category: z.string(),
  url: z.string().url(),
  pricingUrl: z.string().url(),
  oneLiner: z.string().max(170),
  summary: z.string(),
  bestFor: z.array(z.enum(BUSINESSES)),
  notFor: z.array(z.string()).default([]),
  pros: z.array(z.string()).min(3).max(6),
  cons: z.array(z.string()).min(3).max(6),
  founded: z.number().int().optional(),
  hq: z.string().optional(),
  affiliate: z.object({ program: z.string().nullable() }),
});

const factorScores = z.object(Object.fromEntries(FACTORS.map((f) => [f, z.number().min(1).max(5)])));
export const scoreSchema = z.object({
  tool: id,
  overall: z.number().min(1).max(5).nullable(), // null = Not scored
  notScoredReason: z.string().optional(),
  factors: factorScores.nullable(),
  reasons: z.object(Object.fromEntries(FACTORS.map((f) => [f, z.string()]))).nullable(),
  basis: z.string(),
  scoredOn: isoDate,
  paysUs: z.boolean(),
  method: z.string(),
});

export const programSchema = z.object({
  label: z.string(),
  network: z.string(),
  status: z.enum(['approved', 'applied', 'not-applied', 'declined', 'none']),
  approvedOn: isoDate.nullable(),
  template: z.string().nullable(), // e.g. https://x.pxf.io/c/ID/1/2?u={url_enc}&subId1={page}
  match: z.string(), // regex for destination hosts this program covers
  terms: z.string(),
  recurring: z.boolean().nullable(),
  paysOnTrial: z.boolean().nullable(),
  cookieDays: z.number().int().nullable(),
  payoutRail: z.string().nullable(),
  rules: z.object({
    mandatoryDisclosure: z.string().nullable(),
    noEarningsClaims: z.boolean(),
    noUnauthorizedOffers: z.boolean(),
    noBrandBidding: z.boolean(),
  }),
  rateHistory: z.array(z.object({ date: isoDate, note: z.string() })).default([]),
  notes: z.string().optional(),
});

export const comparisonSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+-vs-[a-z0-9-]+$/),
  a: id,
  b: id,
  layer: z.enum(LAYERS),
  dimensions: z.array(z.object({
    label: z.string(),
    a: z.string(),
    b: z.string(),
    edge: z.enum(['a', 'b', 'tie']),
  })).min(5).max(12),
  verdicts: z.array(z.object({
    business: z.enum(BUSINESSES),
    pick: z.enum(['a', 'b', 'neither']),
    why: z.string(),
  })).min(3),
});

export const stackSchema = z.object({
  id: z.enum(BUSINESSES),
  label: z.string(), // "Marketing agency"
  profile: z.string(),
  sizeLabels: z.object({ solo: z.string(), small: z.string(), growing: z.string() }),
  layers: z.array(z.object({
    layer: z.enum(LAYERS),
    role: z.string(), // "CRM, funnels and client automation"
    pick: id,
    why: z.string(),
    alternatives: z.array(z.object({ tool: id, when: z.string() })).default([]),
    overrides: z.object({
      solo: z.object({ amount: money, note: z.string() }).optional(),
      small: z.object({ amount: money, note: z.string() }).optional(),
      growing: z.object({ amount: money, note: z.string() }).optional(),
    }).optional(),
  })).min(3),
  extras: z.array(z.object({ name: z.string(), url: z.string().url(), note: z.string() })).default([]),
  skip: z.array(z.object({ what: z.string(), why: z.string() })).default([]),
});

export const alternativesSchema = z.object({
  tool: id,
  reasons: z.array(z.object({
    reason: z.string(), // "It gets expensive past 10,000 contacts"
    picks: z.array(z.object({ tool: id, why: z.string() })).min(1).max(3),
  })).min(3).max(7),
});

export const faqSchema = z.object({
  page: z.string(),
  items: z.array(z.object({ q: z.string().min(8), a: z.string().min(40) })).min(4).max(10),
});

export const changelogSchema = z.array(z.object({
  date: isoDate,
  tool: id,
  kind: z.enum(['initial-record', 'price-change', 'plan-change', 'correction', 'terms-change']),
  summary: z.string(),
  old: z.string().optional(),
  new: z.string().optional(),
  source: z.string().url().optional(),
}));

// Cross-file integrity rules that zod alone cannot express.
export function pricingIntegrity(p) {
  const errors = [];
  const planIds = new Set(p.plans.map((x) => x.id));
  const nSrc = p.sources.length;
  const checkSrc = (where, i) => { if (i !== undefined && i >= nSrc) errors.push(`${where}: source index ${i} out of range (${nSrc} sources)`); };
  p.plans.forEach((x) => checkSrc(`plan ${x.id}`, x.source));
  p.addOns.forEach((x) => checkSrc(`addOn ${x.id}`, x.source));
  p.usage.forEach((x) => checkSrc(`usage ${x.id}`, x.source));
  p.extraCosts.forEach((x) => checkSrc(`extraCost ${x.id}`, x.source));
  checkSrc('trial', p.trial.source);
  const sizes = p.scenarios.map((s) => s.size).sort().join(',');
  if (sizes !== [...SIZES].sort().join(',')) errors.push(`scenarios must be exactly one each of ${SIZES.join(', ')}; got ${sizes}`);
  for (const s of p.scenarios) {
    if (!planIds.has(s.planId)) errors.push(`scenario ${s.size}: planId ${s.planId} not in plans`);
    const sum = Math.round(s.lines.reduce((a, l) => a + l.amount, 0) * 100) / 100;
    if (Math.abs(sum - s.monthly) > 0.011) errors.push(`scenario ${s.size}: lines sum to ${sum} but monthly is ${s.monthly}`);
  }
  for (const x of p.plans) {
    if (x.priceUnit !== 'custom' && x.monthly === null && x.annualMonthly === null) errors.push(`plan ${x.id}: needs monthly or annualMonthly unless priceUnit is custom`);
  }
  return errors;
}
