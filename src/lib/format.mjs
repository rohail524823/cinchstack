// Formatting helpers. Every figure the site prints goes through here, so formats never drift.

export function money(n, { decimals } = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  let d = decimals;
  if (d === undefined) {
    if (abs > 0 && abs < 1) d = abs < 0.01 ? 4 : abs < 0.1 ? 3 : 2;
    else d = Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2;
  }
  const s = abs.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${n < 0 ? '−' : ''}$${s}`;
}

export function perMonth(n) {
  return n === null || n === undefined ? '—' : `${money(n)}/mo`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
export function isoDay(d) {
  return (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10);
}

export const UNIT_LABEL = {
  'per-month': 'per month',
  'per-seat-month': 'per seat / month',
  'per-site-month': 'per site / month',
  'per-workspace-month': 'per workspace / month',
  custom: 'custom quote',
};

export function planPrice(plan, which = 'monthly') {
  if (plan.priceUnit === 'custom') return 'Custom quote';
  const v = plan[which];
  if (v === null || v === undefined) return which === 'monthly' ? 'Annual only' : 'Monthly only';
  if (v === 0) return 'Free';
  return money(v);
}

export function stars(score) {
  return Math.max(0, Math.min(100, Math.round((score / 5) * 100)));
}

export function oneDecimal(n) {
  return n === null || n === undefined ? '—' : (Math.round(n * 10) / 10).toFixed(1);
}

export function pct(n) {
  return `${Math.round(n * 100)}%`;
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function wordCount(s) {
  return String(s).trim().split(/\s+/).filter(Boolean).length;
}

/** A data-rendered figure as an HTML string (for places that take raw HTML). */
export function figHtml(v, suffix = '', floor = false) {
  if (v === null || v === undefined) return '—';
  return `${floor ? '<span class="floor">from </span>' : ''}<data value="${v}" data-fig>${money(v)}${suffix}</data>`;
}
