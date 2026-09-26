// Affiliate link handling. A link is paid ONLY when the tool's program is approved and we hold a
// link template. Everything else is a plain link. Authors never choose; the data does.
import { program, paysUs, tool } from './data.mjs';

/**
 * @returns {{ href: string, paid: boolean, rel: string, marker: string }}
 */
export function resolveLink(toolId, { href, page = '/' } = {}) {
  const t = tool(toolId);
  const dest = href ?? t.url;
  const p = program(toolId);
  if (paysUs(toolId) && new RegExp(p.match).test(dest)) {
    const url = p.template
      .replaceAll('{url_enc}', encodeURIComponent(dest))
      .replaceAll('{url}', dest)
      .replaceAll('{page}', encodeURIComponent(page));
    return { href: url, paid: true, rel: 'sponsored nofollow noopener', marker: `AFFILIATE: ${p.label}` };
  }
  const why = p ? (p.status === 'approved' ? 'program approved but no link on file' : `program ${p.status}`) : 'no program';
  return { href: dest, paid: false, rel: 'noopener', marker: `plain link — ${why}; do not wrap` };
}
