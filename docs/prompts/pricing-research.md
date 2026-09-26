# Pricing research protocol

You are producing the verified pricing record for ONE tool on cinchstack.com, a site whose entire value is that its prices are real, current, sourced and dated. A wrong number here is worse than a missing one.

## Inputs
- Repo: /home/user/cinchstack (work only here; do not run `npm install`, do not touch files other than the ones named below).
- Schema: `src/lib/schemas.mjs` — read it first. Your JSON must pass `node scripts/validate-data.mjs src/data/pricing/<tool>.json src/data/tools/<tool>.json`.
- Existing snapshot(s): `snapshots/<tool>/*.txt` — the vendor's pricing page rendered in headless Chromium and saved as text on 2026-09-26.

## The one rule that matters
**Every number you put in `plans`, `addOns`, `usage`, `extraCosts` and every amount in `scenarios[].lines` must be traceable to a saved snapshot file listed in `sources[]`.** You may use WebSearch/WebFetch to DISCOVER pages and context, but a number only enters the data once you have saved the page it comes from with the snapshot tool and can `grep` it in the file. If a number cannot be captured into a snapshot (bot wall, login, calculator), it does NOT go into the structured fields — describe it in words in `unverified[]` (e.g. "Klaviyo's price at 10,000 profiles is shown only by an interactive calculator; could not be captured").

Scenario line amounts are the exception only in that they may be ARITHMETIC on sourced numbers (e.g. 5 seats × $20 = $100). Write the arithmetic in `assumptions` or `note`.

## Tools you have
- `node scripts/snapshot.mjs <tool> <url> --label <name> [--click "Monthly"] [--click "Annual"]` — renders the page in headless Chromium (US locale), saves visible text to `snapshots/<tool>/<date>-<label>.txt`, and saves one more file per `--click` after clicking that exact visible text (use it to flip monthly/annual toggles, open "compare all features", pick a contacts tier, etc.). Use it for: the pricing page with each billing toggle, the vendor's pricing FAQ / billing help-centre articles, add-on and usage rate pages (SMS/phone/email rates, AI add-ons, extra seats, extra contacts), onboarding-fee pages.
- `curl -sL -A "Mozilla/5.0 ..." <url>` then save relevant extracted text into `snapshots/<tool>/<date>-<label>.txt` with a first line `SOURCE: <url>` if the headless browser is blocked but raw HTML contains the prices (common: prices embedded in JSON in the HTML).
- `grep`/`rg` over snapshots to prove every figure.
- WebSearch / WebFetch for discovery only.

## What to capture
1. **Every public plan**: name, month-to-month price (`monthly`), effective monthly price when billed annually (`annualMonthly`), and the unit (flat / per seat / per site / per workspace). Watch the classic errors: annual price shown as the headline; per-seat vs flat; "starting at" prices that assume minimum seats; plans that are annual-only; prices shown before a contacts/profiles tier is selected.
2. **Add-ons** people actually need (extra seats, contacts tiers, AI add-ons, premium features sold separately).
3. **Usage-based costs** (SMS, phone minutes, email sends, AI credits, transaction fees).
4. **Extra costs**: mandatory onboarding, transaction fees when not using the vendor's payment processor, card processing, required apps, setup fees, overage.
5. **Free tier and trial**: exists? limits? card required? trial length?
6. **Billing notes**: annual-only plans, price locks, minimum seats, price changes announced for later dates.
7. **Regional pricing**: does price vary by country? Note it; we publish US list price in USD.
8. **Three scenarios** — see the standard sizes below. Pick the plan a sensible buyer at that size would actually need (check limits!), list every line that makes up the monthly bill, and make `monthly` exactly equal the sum of `lines`. Use month-to-month billing where offered; if the needed plan is annual-only, use its annual monthly equivalent and set `billing: "annual"`. Set `confidence` honestly: `high` only when every line is directly sourced; `medium` when a line depends on a usage estimate; `low` when a needed figure is unverified.

## Standard scenario sizes (use exactly these so tools in the same layer are comparable)
Company sizes are fixed: solo = 1 person, small = 5 people, growing = 15 people. Volume assumptions by layer:

| Layer | solo | small | growing |
|---|---|---|---|
| run (CRM / automation) | 1 user, 1,000 contacts, 2,000 marketing emails/mo, 200 SMS/mo | 3 users, 5,000 contacts, 20,000 emails/mo, 1,000 SMS/mo | 8 users, 25,000 contacts, 100,000 emails/mo, 5,000 SMS/mo |
| sell (store / course / funnel platform) | $3,000/mo in sales, 1 staff account | $30,000/mo in sales, 3 staff accounts | $150,000/mo in sales, 8 staff accounts |
| site (website builder) | 1 site, 1 editor, blog/CMS with ~20 pages, ~10k visits/mo | 1 site, 3 editors, CMS ~200 items, ~50k visits/mo | 1 site, 8 editors, CMS ~1,000 items, ~250k visits/mo |
| grow — SEO | 1 user, 1–3 projects, ~500 tracked keywords | 2 users, ~5 projects, ~1,500 tracked keywords | 4 users, ~15 projects, ~5,000 tracked keywords |
| grow — email | 1,000 subscribers/profiles, ~4 campaigns/mo | 10,000 subscribers, ~8 campaigns/mo | 50,000 subscribers, ~12 campaigns/mo |
| organize (docs / projects) | 1 seat | 5 seats | 15 seats |

For **sell** tools: lines = subscription + any platform transaction fee (as a % of the scenario's sales, computed) + any required paid add-on. Standard card processing (Stripe/Shopify Payments ~2.9% + 30¢) is NOT summed into `monthly` — record it in `extraCosts` and say so in `assumptions`, because every platform pays it.
For **run** tools with usage billing (SMS, email): include usage lines at the vendor's published US rate.
For tools whose plan limit falls between scenario sizes, pick the plan that covers the scenario and say which limit forced it.

## Output files
1. `src/data/pricing/<tool>.json` — per `pricingSchema`. `checkedOn` = the date of your newest snapshot. `method` = one plain sentence on how it was checked (e.g. "Read from HubSpot's pricing pages and billing help articles in a US-locale headless browser; snapshots saved."). `history` = `[{ "date": "<checkedOn>", "change": "Initial record." }]`. Every `sources[]` entry must have `snapshot` pointing at a real file.
2. `src/data/tools/<tool>.json` — per `toolSchema`. Factual, neutral, specific. `oneLiner` ≤ 170 chars. `summary` 2–3 sentences, no hype words ("powerful", "seamless", "robust", "all-in-one solution" are banned). `pros`/`cons` 3–6 each, concrete ("Free CRM with unlimited users", not "Easy to use"). `bestFor` from: agency, course-creator, shopify-store, local-service, freelancer, saas-startup. `affiliate.program` = the tool id if the tool is one of gohighlevel, hubspot, shopify, systeme-io, webflow, semrush, klaviyo, notion; otherwise `null`. Include `founded`/`hq` only if you verified them.

## Finish
Run the validator until it passes. Then return the structured summary requested by the caller. Never claim a figure you did not capture.
