// The public pricing dataset (CC BY 4.0). Built only from validated data, so it can never disagree with the pages.
import { tools, pricing, toolIds } from './data.mjs';
import { SITE, NAME } from './site.mjs';

export const LICENSE = 'https://creativecommons.org/licenses/by/4.0/';
export const CITATION = `${NAME}, "Software pricing dataset", ${SITE}/data/, licensed CC BY 4.0.`;

export function lastChecked() {
  return Object.values(pricing).map((p) => p.checkedOn).sort().at(-1) ?? null;
}

export function datasetJson() {
  return {
    name: `${NAME} software pricing dataset`,
    publisher: NAME,
    url: `${SITE}/data/`,
    license: LICENSE,
    citation: CITATION,
    currency: 'USD',
    lastChecked: lastChecked(),
    notes: 'Prices are US list prices as published on each vendor pricing page on the checkedOn date. monthly = price when billed month to month; annualMonthly = effective monthly price when billed yearly; null means not offered. Scenario totals are CinchStack estimates for the stated assumptions.',
    tools: toolIds.map((id) => {
      const t = tools[id];
      const p = pricing[id];
      const src = (i) => (i === undefined ? null : p.sources[i]?.url ?? null);
      return {
        id,
        name: t.name,
        vendor: t.vendor,
        layer: t.layer,
        category: t.category,
        website: t.url,
        pricingPage: t.pricingUrl,
        page: `${SITE}/tools/${id}/pricing/`,
        checkedOn: p.checkedOn,
        freeTier: p.freeTier,
        trial: { days: p.trial.days, cardRequired: p.trial.cardRequired, summary: p.trial.summary },
        plans: p.plans.map((x) => ({ id: x.id, name: x.name, monthly: x.monthly, annualMonthly: x.annualMonthly, priceUnit: x.priceUnit, seatsIncluded: x.seatsIncluded ?? null, limits: x.limits, note: x.note ?? null, source: src(x.source) })),
        addOns: p.addOns.map((x) => ({ id: x.id, name: x.name, price: x.price, unit: x.unit, note: x.note ?? null, source: src(x.source) })),
        usage: p.usage.map((x) => ({ id: x.id, name: x.name, rate: x.rate, unit: x.unit, note: x.note ?? null, source: src(x.source) })),
        extraCosts: p.extraCosts.map((x) => ({ id: x.id, label: x.label, display: x.display, kind: x.kind, source: src(x.source) })),
        scenarios: p.scenarios.map((s) => ({ size: s.size, label: s.label, assumptions: s.assumptions, plan: s.planId, billing: s.billing, monthly: s.monthly, floor: Boolean(s.floor), lines: s.lines, confidence: s.confidence })),
        unverified: p.unverified,
        sources: p.sources.map((s) => ({ url: s.url, label: s.label, checkedOn: s.checkedOn })),
      };
    }),
  };
}

const esc = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export function toCsv(header, rows) {
  return [header.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n') + '\n';
}

export function plansCsv() {
  const rows = [];
  for (const id of toolIds) {
    const t = tools[id];
    const p = pricing[id];
    for (const x of p.plans) rows.push([id, t.name, t.vendor, t.layer, x.id, x.name, x.monthly, x.annualMonthly, x.priceUnit, x.seatsIncluded ?? '', p.checkedOn, p.sources[x.source]?.url]);
  }
  return toCsv(['tool_id', 'tool', 'vendor', 'layer', 'plan_id', 'plan', 'monthly_usd', 'annual_monthly_usd', 'price_unit', 'seats_included', 'checked_on', 'source_url'], rows);
}

export function scenariosCsv() {
  const rows = [];
  for (const id of toolIds) {
    const t = tools[id];
    const p = pricing[id];
    for (const s of p.scenarios) rows.push([id, t.name, s.size, s.label, s.planId, s.billing, s.monthly, s.confidence, p.checkedOn]);
  }
  return toCsv(['tool_id', 'tool', 'size', 'scenario', 'plan_id', 'billing', 'monthly_usd', 'confidence', 'checked_on'], rows);
}
