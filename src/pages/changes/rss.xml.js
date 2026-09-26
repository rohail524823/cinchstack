import { changelog, tool } from '../../lib/data.mjs';
import { SITE } from '../../lib/site.mjs';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function GET() {
  const items = changelog.slice(0, 60).map((c) => `<item><title>${esc(`${tool(c.tool).name}: ${c.summary}`)}</title><link>${SITE}/tools/${c.tool}/pricing/</link><guid isPermaLink="false">${esc(`${c.date}-${c.tool}-${c.kind}-${c.summary}`)}</guid><pubDate>${new Date(`${c.date}T12:00:00Z`).toUTCString()}</pubDate><description>${esc(c.summary + (c.old && c.new ? ` (${c.old} → ${c.new})` : ''))}</description></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CinchStack price changes</title><link>${SITE}/changes/</link><description>Software price and plan changes found on vendor pricing pages, checked weekly.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
