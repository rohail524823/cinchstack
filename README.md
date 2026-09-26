# CinchStack

**The stack that's best for you.**

CinchStack tells people running an online business which software stack fits them, and what it will really cost — verified against the vendors' own pricing pages, dated, and re-checked every week.

- **Real pricing** at three team sizes, hidden costs included.
- **Honest comparisons** built from that data, not from templates.
- **Stack recommendations** for six kinds of business, with the total monthly bill.

It is funded by affiliate commissions from some of the tools it covers. Which ones, and how, is on `/how-we-earn/`. A tool that pays us is never scored higher for it — the method takes the *lower* of two blind scores for any tool that does.

## Status

**Planning complete; build starting.** The full plan is in [`docs/plan/`](docs/plan/) — start with [`00-summary.md`](docs/plan/00-summary.md).

The current `index.html` is a holding page (it carries the Impact site-verification tag) and will be replaced by the Astro site.

## Stack

Astro · TypeScript · JSON data with zod schemas · one CSS file · zero client JS on content pages · Netlify · GitHub Actions for weekly price verification.

## Repository (target layout)

```
src/data/        every fact, once — tools, pricing, comparisons, stacks, programs, changelog
src/content/     editorial prose (MDX) that adds what data can't say
src/components/  PricingTable, CompareTable, StackBill, QuickAnswer, Provenance, Faq, …
scripts/         check (all gates), verify-prices, send-changes, publish-dataset, lastmod
docs/plan/       the plan
growth/          exports and records, never published
```

## Principles, in one screen

1. Every fact lives once, in data. Pages are templates. A price appears in prose only as a token rendered from data.
2. Every price has a source URL and a date. A weekly job re-checks it. Changes are public on `/changes/`.
3. A link is paid only when the program has approved us. Everything else is a plain link that says so.
4. One disclosure line per page, above the fold. Independence stated once, not seven times.
5. If a CI gate can't be satisfied by the build that produced the page, the design is wrong — not the page.
6. Would a reader who will never click a paid link still find this the most useful page on the topic? If not, it isn't published.
