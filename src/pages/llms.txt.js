import { SITE, NAME, TAGLINE } from '../lib/site.mjs';
import { indexablePages } from '../lib/seo.mjs';
import { registry } from '../lib/pages.mjs';
import { lastChecked } from '../lib/dataset.mjs';
import { longDate } from '../lib/format.mjs';
export async function GET() {
  const pages = await indexablePages();
  const reg = await registry();
  const checked = lastChecked();
  // Pages without a prose entry (the generated data pages) get their note here.
  const NOTES = {
    '/data/': `The whole pricing dataset as JSON and CSV under CC BY 4.0, with a "What the data shows" summary of how far the small-team bill sits above the cheapest plan's price, computed from prices checked up to ${longDate(checked)}.`,
    '/changes/': 'Every price and plan change found on the vendor pricing pages we check each week, with the date, what changed and the source.',
  };
  const note = (p) => reg.get(p.path)?.entry?.data?.description ?? NOTES[p.path] ?? '';
  const pick = (kind) => pages.filter((p) => p.kind === kind);
  const line = (p) => `- [${p.h1}](${SITE}${p.path})${note(p) ? `: ${note(p)}` : ''}`;
  const sec = (h, rows) => (rows.length ? `## ${h}\n\n${rows.map(line).join('\n')}\n` : '');
  const byPath = (paths) => paths.map((x) => pages.find((p) => p.path === x)).filter(Boolean);
  const summary = `> ${TAGLINE}. Independent software stack recommendations for small online businesses, with the real monthly cost of every tool at three team sizes. Prices are read from each vendor's own pricing page, saved with the date, and re-checked every Monday. Last check: ${checked}.`;
  const info = 'All prices are US list prices in USD. Each pricing page shows when it was last verified and links to its sources. The full dataset is free to reuse under CC BY 4.0; please cite CinchStack with a link to the page you used. Funding: some vendors pay CinchStack an affiliate commission; paid links are marked, prices come from the vendors\' own pages, scores follow the published method, and when a tool pays us we publish the lower of its two scores.';
  // Only empty sections are dropped; the blank lines around the summary and the info paragraph stay,
  // so the summary is a blockquote of its own and the info is a separate paragraph.
  const sections = [
    sec('Stacks by business', pick('stacks')),
    sec('Pricing: what each tool really costs', pick('pricing')),
    sec('Tool reviews', pick('tools')),
    sec('Cost guides', pick('guides')),
    sec('Comparisons', pick('compare')),
    sec('Alternatives', pick('alternatives')),
    sec('Data and method', byPath(['/data/', '/changes/', '/methodology/', '/how-we-earn/', '/about/'])),
    `## Optional\n\n- [Full text of every page](${SITE}/llms-full.txt): the readable text of every page in the sitemap in one plain-text file, each with its URL and the date it was last updated, rebuilt with the site\n- [Pricing dataset (JSON)](${SITE}/data/pricing.json): every plan, add-on, usage rate, extra cost and team-size scenario, with sources and check dates\n- [Plans (CSV)](${SITE}/data/pricing.csv): one row per plan with the monthly and annual price\n- [Team-size costs (CSV)](${SITE}/data/scenarios.csv): CinchStack's estimate of each tool's real monthly bill at three business sizes\n`,
  ].filter(Boolean);
  const txt = `# ${NAME}\n\n${summary}\n\n${info}\n\n${sections.join('\n')}`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
