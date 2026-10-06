import { SITE, NAME, TAGLINE } from '../lib/site.mjs';
import { indexablePages } from '../lib/seo.mjs';
import { lastChecked } from '../lib/dataset.mjs';
export async function GET() {
  const pages = await indexablePages();
  const pick = (kind) => pages.filter((p) => p.kind === kind);
  const line = (p) => `- [${p.h1}](${SITE}${p.path})`;
  const sec = (h, rows) => (rows.length ? `## ${h}\n\n${rows.map(line).join('\n')}\n` : '');
  const byPath = (paths) => paths.map((x) => pages.find((p) => p.path === x)).filter(Boolean);
  const txt = [
    `# ${NAME}`,
    '',
    `> ${TAGLINE}. Independent software stack recommendations for small online businesses, with the real monthly cost of every tool at three team sizes. Prices are read from each vendor's own pricing page, saved with the date, and re-checked every Monday. Last check: ${lastChecked()}.`,
    '',
    'All prices are US list prices in USD. Each pricing page shows when it was last verified and links to its sources. The full dataset is free to reuse under CC BY 4.0; please cite CinchStack with a link to the page you used. Funding: some vendors pay CinchStack an affiliate commission; paid links are marked, and commissions never change a price, score or pick.',
    '',
    sec('Stacks by business', pick('stacks')),
    sec('Pricing: what each tool really costs', pick('pricing')),
    sec('Tool reviews', pick('tools')),
    sec('Cost guides', pick('guides')),
    sec('Comparisons', pick('compare')),
    sec('Alternatives', pick('alternatives')),
    sec('Data and method', byPath(['/data/', '/changes/', '/methodology/', '/how-we-earn/', '/about/'])),
    `## Optional\n\n- [Pricing dataset (JSON)](${SITE}/data/pricing.json)\n- [Plans (CSV)](${SITE}/data/pricing.csv)\n- [Team-size costs (CSV)](${SITE}/data/scenarios.csv)\n`,
  ].filter((x) => x !== '').join('\n');
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
