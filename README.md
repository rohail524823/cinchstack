# CinchStack

**The stack that's best for you.**

CinchStack tells people running an online business which software stack fits them, and what it will really cost — verified against the vendors' own pricing pages, dated, and re-checked every week.

- **Real pricing** at three team sizes, hidden costs included.
- **Honest comparisons** built from that data, not from templates.
- **Stack recommendations** for six kinds of business, with the total monthly bill.

It is funded by affiliate commissions from some of the tools it covers. Which ones, and how, is on `/how-we-earn/`. A tool that pays us is never scored higher for it — the method takes the *lower* of two blind scores for any tool that does.

## Status

**Built and launching.** The site is an Astro build driven entirely by the data in `src/data/`. Owner tasks, the weekly jobs and how to change things safely are in [`docs/OPERATIONS.md`](docs/OPERATIONS.md). The plan behind it is in [`docs/plan/`](docs/plan/); start with [`00-summary.md`](docs/plan/00-summary.md).

## Open data

The pricing dataset behind the site is free to reuse under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/):

- **Files:** [`pricing.csv`](https://cinchstack.com/data/pricing.csv) (one row per plan), [`scenarios.csv`](https://cinchstack.com/data/scenarios.csv) (the real monthly bill per team size) and [`pricing.json`](https://cinchstack.com/data/pricing.json) (everything, with add-ons, usage fees and sources), described at [cinchstack.com/data](https://cinchstack.com/data/). They rebuild whenever a price changes.
- **Source records:** one JSON file per tool in [`src/data/pricing/`](src/data/pricing/), each figure with its vendor URL and check date. The dated copies of vendor pages in [`snapshots/`](snapshots/) are the evidence; they are the vendors' own text and not part of the CC BY dataset.
- **Cite as:** CinchStack, "Software pricing dataset", https://cinchstack.com/data/, licensed CC BY 4.0.

## Stack

Astro · TypeScript · JSON data with zod schemas · one CSS file · zero client JS on content pages · Netlify · GitHub Actions for weekly price verification.

## Repository

```
src/data/        every fact, once: pricing, tools, scores, comparisons, stacks, alternatives, FAQs, programs, changelog
src/content/     editorial prose (MDX) that adds what data can't say
src/components/  plans table, real-cost bills, stack bill, quick answer, provenance, FAQ, score panel
src/pages/       routes; a page exists only when its prose and its data both exist
scripts/         check (all gates), lint-content, validate-data, verify-prices, snapshot, lastmod
snapshots/       dated text copies of every vendor page a price came from
docs/            operations manual, plan, and the research and writing briefs
```

## Principles, in one screen

1. Every fact lives once, in data. Pages are templates. A price appears in prose only as a token rendered from data.
2. Every price has a source URL and a date. A weekly job re-checks it. Changes are public on `/changes/`.
3. A link is paid only when the program has approved us. Everything else is a plain link that says so.
4. One disclosure line per page, above the fold. Independence stated once, not seven times.
5. If a CI gate can't be satisfied by the build that produced the page, the design is wrong — not the page.
6. Would a reader who will never click a paid link still find this the most useful page on the topic? If not, it isn't published.
