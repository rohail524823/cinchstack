import { SITE, NAME } from '../lib/site.mjs';
import { CRAWLERS } from '../lib/seo.mjs';
import { lastChecked, LICENSE } from '../lib/dataset.mjs';
export function GET() {
  const body = {
    name: NAME,
    url: `${SITE}/`,
    description: 'Independent software stack recommendations and verified software prices for small online businesses.',
    policy: {
      crawling: 'allowed',
      allowedAgents: CRAWLERS,
      training: 'allowed',
      citation: 'Please cite CinchStack by name with a link to the specific page, and include the date the price was last verified, which is shown on every pricing page.',
      dataLicense: LICENSE,
    },
    data: { dataset: `${SITE}/data/`, json: `${SITE}/data/pricing.json`, csv: `${SITE}/data/pricing.csv`, lastChecked: lastChecked() },
    trust: {
      methodology: `${SITE}/methodology/`,
      funding: 'Some vendors pay CinchStack an affiliate commission. Paid links are marked and listed at /how-we-earn/. Commissions never change prices, scores or picks.',
      fundingPage: `${SITE}/how-we-earn/`,
      firstHandExperience: 'Prices come from vendor pricing pages, not from paid accounts. A page claims hands-on use only where it gives a dated record of that use.',
      corrections: `${SITE}/contact/`,
      changelog: `${SITE}/changes/`,
    },
  };
  return new Response(JSON.stringify(body, null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
