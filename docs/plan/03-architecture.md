# 03 — Site architecture

## Principles

- **Flat where possible, nested only where it aids meaning.** The sister site's flat structure ranked; its one nested section (`/reviews/`) was fine.
- **Every URL is a question a real person types.** Not a taxonomy we like.
- **No page more than three clicks from the homepage.** Gate from the sister site, kept.
- **Every internal link ends in `/`. Every canonical is self-referencing.**
- **Hubs are indexable only when they earn it.** The sister site noindexed `/guides/` when it outranked its own children with zero clicks.

## URL map

| Pattern | What it is | Launch count | Words (authored) |
|---|---|---|---|
| `/` | Homepage: the promise, the six stacks, latest price changes, the eight | 1 | — |
| `/tools/<tool>/` | Tool hub: what it is, who it's for, score with reasons, real cost summary, pros/cons, links to pricing/compare/alternatives | 8 | 1,800–2,400 |
| `/tools/<tool>/pricing/` | **The wedge.** Every plan, every add-on, real monthly bill at three sizes, what changed, source and date | 8 | 1,500–2,200 + tables |
| `/compare/<a>-vs-<b>/` | Head-to-head from shared pricing data; verdict per business type | 12 | 1,800–2,400 |
| `/alternatives/<tool>/` | For switchers: the honest alternatives per reason for leaving, with real costs | 8 | 1,600–2,200 |
| `/stacks/<business>/` | **The identity feature.** The recommended stack for one business type, total monthly bill at three sizes, alternatives per layer, what to skip | 6 | 2,000–2,800 |
| `/changes/` | Public changelog of every price and plan change caught by the weekly check, dated | 1 | generated |
| `/data/` | The pricing dataset: what it is, how to cite, download (JSON + CSV), CC BY 4.0 | 1 | 800 + generated |
| `/methodology/` | The six factors, how scoring works, verification protocol, what we don't claim | 1 | 1,200 |
| `/about/` | Who runs this, why, how it's funded (short — funding detail is on `/how-we-earn/`) | 1 | 700 |
| `/how-we-earn/` | Affiliate disclosure page: every program, cookie windows, the GHL-mandated text, the colour rule | 1 | 500 |
| `/contact/`, `/privacy/`, `/terms/`, `/thanks/` | Utility | 4 | short |
| **Total** | | **52** | |

Later, not at launch: `/best/<category>/` ranked lists (once eight tools per category exist), `/stack-builder/` (interactive), `/glossary/`.

## Why these page types and not others

- **Pricing pages first** because they are the most searched, most citable, and the thing no competitor keeps current. They also generate the data every other page renders from.
- **Tool hubs** because a reader arriving from "is HubSpot worth it" needs a landing that isn't only numbers.
- **Comparisons** because "X vs Y" is the highest-intent query class in software.
- **Alternatives** because a switcher is the most valuable visitor there is.
- **Stacks** because they are the only page type on the internet that answers "what's my whole monthly bill for a business like mine" — and they are what the motto promises.
- **Changes and data** because they are the freshness engine, the citation magnet, and the newsletter content, all from one job.

## The six stacks

| URL | Business | Default stack (from the eight) | Honest non-paying inclusions |
|---|---|---|---|
| `/stacks/agency/` | Marketing agency, 3–20 | GHL or HubSpot · Webflow · Semrush · Notion | Google Workspace |
| `/stacks/course-creator/` | Coach / course creator, solo–5 | Systeme.io · Klaviyo or Kit · Notion | Zoom, Stripe |
| `/stacks/shopify-store/` | DTC store, solo–15 | Shopify · Klaviyo · Semrush · Notion | Judge.me, Google Merchant |
| `/stacks/local-service/` | Dentist / gym / HVAC / realtor, solo–10 | GHL · Webflow or Squarespace · Notion | Google Business Profile |
| `/stacks/freelancer/` | Solo consultant | Webflow or Framer · Notion · Kit | Stripe, Calendly free |
| `/stacks/saas-startup/` | 2–10 people | HubSpot free → Starter · Webflow · Semrush · Notion | Linear, Slack |

Each stack page shows the **total monthly bill at three sizes** computed from the pricing data — the single most valuable table on the site, and impossible for a chat window to produce fresh.

## Hubs and navigation

**Primary nav (5 items):** Stacks · Tools · Compare · Pricing changes · Methodology.

**Homepage sections, in order:**
1. The promise + the six stack cards (the identity, above the fold)
2. "Latest price changes" — the five most recent entries from `/changes/` (freshness, visibly)
3. The eight tools as cards with score and real-cost line
4. Featured comparisons
5. How we verify (three sentences + link to methodology)
6. Newsletter: "One email when a price you care about changes"

**Hub pages:**
- `/tools/` — grid of the eight, filterable by layer. Indexable.
- `/compare/` — all comparisons grouped by layer. Indexable at launch; noindex if it outranks its children with no clicks (the sister-site rule).
- `/stacks/` — the six. Indexable.
- `/alternatives/` — noindex, follow (pure navigation).

## Internal linking — systematic, not editorial

Generated by the build, gated in CI:

| Rule | Mechanism |
|---|---|
| Every tool card, table row and ranked block links its tool hub | build-time; gate fails on a missing link |
| Every tool hub links its pricing page in the first screen | template |
| Every pricing page links every comparison and the alternatives page for that tool | generated "Compare and alternatives" block |
| Every comparison links both tool hubs and both pricing pages | template |
| Every stack page links every tool in it | template |
| "Keep reading" block on every content page: 5–8 links, hub-to-spoke, anchor text = target's H1 | generated from a curated map in data |
| Crawl depth ≤ 3 from `/` | gate |
| A link to an unpublished page renders as plain text and becomes a link the day the target ships | build-time "parked link" (sister-site pattern) |
| No orphan: every published page has ≥ 2 inbound editorial links | gate (report at launch, fail after week 4) |

## Breadcrumbs

Real trails from real hubs: `Home › Tools › HubSpot › Pricing`, `Home › Compare › GoHighLevel vs HubSpot`, `Home › Stacks › Marketing agency`. Visible `<nav>` and `BreadcrumbList` JSON-LD generated from the same route data, so they can never disagree.

## Launch inventory — the 52 pages

**Pricing (8):** GHL, HubSpot, Shopify, Systeme.io, Webflow, Semrush, Klaviyo, Notion.
**Tool hubs (8):** same eight.
**Comparisons (12):** the table in `02-the-eight.md`.
**Alternatives (8):** one per tool.
**Stacks (6):** agency, course-creator, shopify-store, local-service, freelancer, saas-startup.
**Data & trust (10):** `/`, `/changes/`, `/data/`, `/methodology/`, `/about/`, `/how-we-earn/`, `/contact/`, `/privacy/`, `/terms/`, `/thanks/`.

Order of build is in `08-publishing-workflow.md`. Pricing pages ship first because everything else renders from their data.
