import { changelog, tool } from '../../lib/data.mjs';
import { SITE } from '../../lib/site.mjs';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KIND = { 'initial-record': 'started tracking its pricing', 'price-change': 'price change', 'plan-change': 'plan change', correction: 'correction', 'terms-change': 'terms change' };
// A short headline built from the structured record; the full sentence stays in <description>.
const title = (c) => `${tool(c.tool).name}: ${c.old && c.new ? `${c.old} → ${c.new}` : KIND[c.kind]}`;
export function GET() {
  // Each guid stays the one the item was first published with; changing it would make feed readers show every item again.
  const items = changelog.slice(0, 60).map((c) => `<item><title>${esc(title(c))}</title><link>${SITE}/tools/${c.tool}/pricing/</link><guid isPermaLink="false">${esc(`${c.date}-${c.tool}-${c.kind}-${c.summary}`)}</guid><pubDate>${new Date(`${c.date}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(c.summary + (c.old && c.new ? ` (${c.old} → ${c.new})` : ''))}</description></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>CinchStack price changes</title><link>${SITE}/changes/</link><atom:link href="${SITE}/changes/rss.xml" rel="self" type="application/rss+xml"/><description>Software price and plan changes found on vendor pricing pages, checked weekly.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
