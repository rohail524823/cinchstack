// Affiliate link handling. A link is paid ONLY when the tool's program is approved and we hold a
// link template. Everything else is a plain link. Authors never choose; the data does.
import { program, paysUs, paysUsOn, tool } from './data.mjs';

/** Sub ID for the page a link sits on: "/tools/gohighlevel/pricing/" -> "cinchstack-tools-gohighlevel-pricing". */
export function subId(page) {
  const slug = page.replace(/^\/+|\/+$/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `cinchstack-${slug || 'home'}`;
}

/**
 * Fills a program's link template. Placeholders: {url} the vendor page, {url_enc} the same encoded,
 * {page} this page's path encoded, {sid} this page's Sub ID. A template of the form "{url}?a=b&c=d"
 * adds those parameters to the vendor page, keeping any query string it already has.
 */
export function fillTemplate(template, dest, page) {
  const t = template
    .replaceAll('{sid}', subId(page))
    .replaceAll('{page}', encodeURIComponent(page))
    .replaceAll('{url_enc}', encodeURIComponent(dest));
  if (t.startsWith('{url}?')) {
    const u = new URL(dest);
    for (const [k, v] of new URLSearchParams(t.slice('{url}?'.length))) u.searchParams.set(k, v);
    return u.toString();
  }
  return t.replaceAll('{url}', dest);
}

/**
 * @returns {{ href: string, paid: boolean, rel: string, marker: string }}
 */
export function resolveLink(toolId, { href, page = '/' } = {}) {
  const t = tool(toolId);
  const dest = href ?? t.url;
  const p = program(toolId);
  if (paysUsOn(toolId, page) && new RegExp(p.match).test(dest)) {
    return { href: fillTemplate(p.template, dest, page), paid: true, rel: 'sponsored nofollow noopener', marker: `AFFILIATE: ${p.label}` };
  }
  const why = !p ? 'no program'
    : paysUs(toolId) ? `program terms limit paid links to ${p.rules.paidOnlyOn.join(', ')}`
    : p.status === 'approved' ? 'program approved but no link on file' : `program ${p.status}`;
  return { href: dest, paid: false, rel: 'noopener', marker: `plain link — ${why}; do not wrap` };
}
