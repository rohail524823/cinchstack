import { SITE } from '../lib/site.mjs';
import { CRAWLERS, DISALLOW } from '../lib/seo.mjs';
export function GET() {
  const rules = DISALLOW.map((d) => `Disallow: ${d}`).join('\n');
  const groups = [...CRAWLERS, '*'].map((ua) => `User-agent: ${ua}\nAllow: /\n${rules}`).join('\n\n');
  // The price-change feed (/changes/rss.xml) is not listed as a sitemap: its item dates are change-log
  // dates, not the pages' last-modified dates, so they would contradict sitemap.xml's lastmod for the
  // same URLs. Feed readers find it through <link rel="alternate"> on / and /changes/.
  const txt = `# CinchStack welcomes search engines and AI assistants.\n# Prices and the pricing dataset (/data/) are free to cite with a link back (CC BY 4.0).\n\n${groups}\n\nSitemap: ${SITE}/sitemap.xml\n`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
