import { SITE } from '../lib/site.mjs';
import { CRAWLERS, DISALLOW } from '../lib/seo.mjs';
export function GET() {
  const rules = DISALLOW.map((d) => `Disallow: ${d}`).join('\n');
  const groups = [...CRAWLERS, '*'].map((ua) => `User-agent: ${ua}\nAllow: /\n${rules}`).join('\n\n');
  // The price-change feed is a second sitemap: each item links the pricing page a change was logged for,
  // with its date (scripts/check.mjs keeps every item link a canonical sitemap URL).
  const txt = `# CinchStack welcomes search engines and AI assistants.\n# Prices and the pricing dataset (/data/) are free to cite with a link back (CC BY 4.0).\n\n${groups}\n\nSitemap: ${SITE}/sitemap.xml\nSitemap: ${SITE}/changes/rss.xml\n`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
