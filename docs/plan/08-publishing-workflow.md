# 08 — Publishing workflow

How every page gets made, verified and shipped — by Claude Code, in this repo. The sister site's audit found two publishing paths that fought each other (a scheduler that shipped 7 pages in September and hand commits that shipped 56). We have **one path**.

## The unit of work is a data file, not a page

A pricing page is not "written". Its `pricing/<tool>.json` is researched and verified; the page renders from it. Prose in `content/pricing/<tool>.mdx` adds only what data can't say: context, caveats, the "where most advice gets this wrong" section, and the FAQ.

## The production protocol — every page, every time

### 1. Research (30–60 min per tool for pricing; less for other types)
- Open the vendor's pricing page **and** its pricing FAQ, help-center billing articles, and the checkout flow where reachable without payment.
- Read the last 12 months of the vendor's changelog / blog for pricing announcements.
- Read 10–20 real user complaints about the bill (Reddit, community forums, G2 "cons"). This is where hidden costs live.
- For GHL specifically: LC Phone / LC Email rate cards, AI add-on pricing, WhatsApp, premium actions, rebilling settings.

### 2. Record (data first)
- Fill `pricing/<tool>.json`: every plan, every add-on, every hidden cost, `source` URL per figure, `checkedOn` = today, `checkedBy` = `fetch+human`.
- Save the pricing-page text to `snapshots/`.
- Compute the **three size scenarios** with `workings` written out — these numbers become the stack bills.
- Fill or update `tools/<tool>.json`. Score using the two-pass procedure in `04-content-system.md`; record the `scoreRecord`.

### 3. Write (only what data can't say)
- Quick answer: 60–120 words, names the tool, states the entry price with date, gives the verdict per business type.
- Body: 5–8 question H2s. Each section either explains a data table or gives an opinion with its reasoning. No section restates the table in prose.
- "Where most advice gets this wrong": one section, genuinely contrarian, defended.
- FAQ: 5–8 questions from real queries, 90–160-word answers, into `faq/<slug>.json`.
- Zero first-hand claims unless a `trials/` record exists.

### 4. Build and check
- `npm run build` renders and runs every gate. Fix the *design* if a gate can't pass.
- Preview on the Netlify branch deploy. Read it on a phone width.

### 5. Ship
- Commit with a message naming the page and the data files it touched. Merge to `main`. Netlify deploys.
- On launch day only: request indexing in GSC and Bing for the page.

### 6. Keep alive
- Mondays: the verification job re-checks the price. A pass moves "last verified". A change becomes a changelog entry, an email, and a dataset update.
- Quarterly: re-read the prose against the data; refresh the "where advice gets it wrong" section if the market moved.

## Launch sequence — six weeks

Order matters: **pricing data comes first because everything else renders from it.**

| Week | Ships | Why this order |
|---|---|---|
| **1** | Astro scaffold · design system · data schemas · `check.ts` · CI · `/methodology/`, `/about/`, `/how-we-earn/`, `/privacy/`, `/terms/`, `/contact/` · **8 pricing JSON files verified** · **8 pricing pages** | The wedge first. Trust pages first so the site never looks half-built. |
| **2** | 8 tool hubs · `/tools/` · `/changes/` (seeded with "initial record" entries) · `/data/` with the first dataset · homepage v1 · **GSC + Bing verified, sitemap submitted, indexing requested** | Hubs give pricing pages a parent; dataset and changelog start their freshness clock. |
| **3** | 12 comparisons · `/compare/` · verification job live and run once by hand | Comparisons render from two pricing files each — cheap once data exists. |
| **4** | 8 alternatives · 6 stacks · `/stacks/` · newsletter **sender** built and tested · newsletter block enabled · `index.html` retired | Stacks are the identity feature and need all eight tools' scenarios. |
| **5** | Schema validation on every page type in Rich Results Test · Lighthouse pass · social images · llms.txt / agents.json · dataset mirrors (Kaggle, HF, GitHub) · first manual AI-citation spot check | Polish and discovery. |
| **6** | Day-30 review against kill criteria · first Reddit/community answers · IndexNow enabled (content-change only) if Bing indexing is healthy | Measure before adding. |

**Week 7 onward:** two to three new pages a week, chosen by the value rule below; weekly verification; monthly review; apply to programs the week GSC crosses ~1,000 monthly visitors.

## What to publish next — the value rule

The sister site's `queue_order.py` ranked its queue by expected value and gave +3 to a review whose product had produced paid sales — that moved one page ~68 days sooner. Ours ranks candidates by:

1. Search demand for the query (GSC impressions on related pages once live; before that, judgment).
2. Whether the lead recommendation pays us (approved program) — a boost, never a filter.
3. Inbound links already pointing at it (parked links from live pages).
4. Whether it completes a stack or a comparison pair.
5. **Whether an affiliate sale has come from an adjacent page** — the sister site's +3.

## Cadence — what the site says vs what we do

The sister site printed "new guides publish three times a week" derived from a cron that then published 7 pages in a month while hand commits shipped 56. Ours makes no cadence claim on the site. The homepage says the true thing: "Prices re-verified every Monday. Last check: <date>." — rendered from the job.

## Re-verification and refresh

| What | When | How |
|---|---|---|
| Prices | Every Monday | automated fetch + diff; human resolves flagged issues within the week |
| Bot-blocked vendors | Monthly | Claude-in-Chrome pass with a fixed prompt, dated |
| Scores | Quarterly, or when a pricing change moves the Real cost factor | two-pass re-score; changelog entry if the overall moves |
| Prose | Quarterly | re-read against data; refresh contrarian sections |
| Year in titles | 1 January | scheduled job |
| Programs | On every Impact/PartnerStack "terms changed" email | update `programs.json`; gate re-runs |

## The prompts that produce pages

The sister site's most reusable asset was its content-generation instructions — and 199 of its 234 queued articles came from a prompt that was never committed. Ours are committed:

- `docs/prompts/pricing-page.md` — the research + write protocol above, as a checklist the session follows.
- `docs/prompts/comparison.md`, `stack.md`, `alternatives.md`, `tool-hub.md`.
- `docs/prompts/score.md` — the two-pass scoring script.
- `docs/prompts/verify-by-browser.md` — the monthly Claude-in-Chrome prompt for bot-blocked vendors.
- `CLAUDE.md` — short. The rules that gate can't enforce, and nothing that the data or the check script already does. The sister site's grew to 2,628 lines; ours has a 200-line ceiling, enforced by review.

## Definition of "done" for a page

- Every gate green.
- Every number on the page exists in its data payload.
- Provenance box renders from data with today's date.
- Read once on a phone.
- Would a reader with no intention of buying still find this the most useful page on the topic? If not, it isn't done.
