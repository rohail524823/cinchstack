# 04 — Content system

The sister site's audit found the root cause of its 94 repair tools: **facts were copied into prose, so every fact change needed a tool to hunt and fix it.** CinchStack fixes this at the design level. Every fact lives once, in data. Pages are templates. Prose refers to a number only through a token that renders from data.

## The data model

All under `src/data/`. Every file is JSON, validated against a schema in CI.

### `tools/<tool>.json` — one per tool

```json
{
  "id": "hubspot",
  "name": "HubSpot",
  "vendor": "HubSpot, Inc.",
  "layer": "run",
  "url": "https://www.hubspot.com/",
  "pricingUrl": "https://www.hubspot.com/pricing/marketing",
  "oneLiner": "CRM and marketing automation that starts free and scales expensively.",
  "bestFor": ["saas-startup", "agency"],
  "notFor": ["freelancer"],
  "score": {
    "overall": 3.9,
    "factors": {
      "realCost": 2.5, "pricingHonesty": 2.0, "smallTeamFit": 4.0,
      "doesTheJob": 4.5, "freedomToLeave": 3.5, "trackRecord": 4.5
    },
    "basis": "Best-in-class CRM depth and a genuinely useful free tier; but the jump from Starter to Professional is the steepest in the category and onboarding fees are mandatory above it.",
    "scoredOn": "2026-10-03",
    "method": "two-blind-lower-of-two",
    "paysUs": false
  },
  "affiliate": {
    "program": "hubspot",
    "status": "not-applied",
    "network": "impact",
    "terms": "30% recurring",
    "approvedOn": null
  },
  "trial": {"days": 14, "cardRequired": false, "source": "…", "checkedOn": "2026-10-03"}
}
```

`score.paysUs` is derived from `affiliate.status === "approved"` at build time, never hand-set. The **lower-of-two rule** is applied by the scoring procedure, recorded in `score.method`.

### `pricing/<tool>.json` — the heart of the site

```json
{
  "tool": "hubspot",
  "currency": "USD",
  "checkedOn": "2026-10-03",
  "checkedBy": "fetch+human",
  "source": "https://www.hubspot.com/pricing/marketing",
  "sourceSnapshot": "snapshots/hubspot-pricing-2026-10-03.txt",
  "plans": [
    {
      "id": "marketing-starter",
      "name": "Marketing Hub Starter",
      "monthly": 20, "annualMonthlyEquivalent": 15,
      "billingNote": "Per seat. Includes 1,000 marketing contacts.",
      "includes": ["…"], "limits": {"contacts": 1000, "seats": 1},
      "addOns": [
        {"id": "extra-contacts", "unit": "per 1,000 contacts", "monthly": 50}
      ]
    }
  ],
  "hiddenCosts": [
    {"label": "Professional onboarding", "amount": 3000, "kind": "one-time", "note": "Mandatory for Marketing Hub Professional."}
  ],
  "sizeScenarios": [
    {"id": "solo", "label": "Solo, 2,000 contacts", "planId": "marketing-starter", "monthly": 70, "workings": "…"},
    {"id": "small", "label": "5 people, 10,000 contacts", "planId": "…", "monthly": 890, "workings": "…"},
    {"id": "mid", "label": "15 people, 50,000 contacts", "planId": "…", "monthly": 3600, "workings": "…"}
  ],
  "regional": {"pricedByCountry": false, "note": ""},
  "history": [
    {"date": "2026-10-03", "change": "initial record"}
  ]
}
```

Every number a page shows comes from here. The **three size scenarios** are what the stack pages sum. `history` feeds `/changes/`.

### Other data files

| File | Holds |
|---|---|
| `comparisons/<a>-vs-<b>.json` | the two tools, the dimensions compared, the per-business-type verdict, hand-written "where they differ" notes |
| `stacks/<business>.json` | business profile, the three sizes, the layer→tool choices, per-layer alternatives, what to skip |
| `alternatives/<tool>.json` | reasons-for-leaving → recommended alternative(s) with a sentence each |
| `faq/<slug>.json` | `{question, answerHtml}` per page; the single source for visible FAQ and FAQPage schema |
| `programs.json` | every affiliate program: network, terms, cookie, status, approvedOn, payout rail, contract rules (coupon ban, brand bidding, mandatory disclosure text), rate-change history |
| `changelog.json` | every caught change: date, tool, field, old, new, source |
| `related.json` | curated hub-to-spoke links for the "Keep reading" block |
| `entity.json` | Organization + Person (author) used in every JSON-LD graph |

## Page skeleton — fixed order, from the sister site (261 of 264 pages followed it)

```
<article>
  1  Disclosure line            (only on pages with a paid link; above the fold — gate)
  2  Quick answer               (60–120 words; must name the tool and state a number — gate)
  3  Paid pick + honest pick    ("Our pick among tools that pay us" beside the top-scored tool)
     … body: question-led H2s, data-rendered tables with a lead sentence …
  4  Mid-page CTA band          (internal: to the relevant /stacks/ page — never amber)
  5  End CTA                    (~78% depth; repeats the first paid link; links vendor pricing page)
  6  FAQ                        (5–8 questions, 90–160-word answers, from faq/*.json — schema word-for-word)
  7  Author box                 (one Person entity)
  8  Newsletter                 ("One email when a price you care about changes")
  9  Keep reading               (5–8 links from related.json)
 10  Last verified / updated    (rendered from data + git; never hand-typed)
```

## The Quick answer — the citable passage

Studies of AI Overview citations put 55% of cited passages in the first 30% of the page. The Quick answer is that passage. Rules:

- Names the tool(s) in the first sentence.
- States at least one dated number: "As of 3 October 2026, Starter is $20/seat/month."
- Gives the verdict in one sentence, with the business type it applies to.
- 60–120 words. Self-contained — makes sense if it's the only thing quoted.
- Gate: a pricing page's Quick answer must contain the entry plan price from `pricing/*.json`; a comparison's must name both tools and a winner-for-whom.

## Tables

- Every table has a **lead sentence** stating what it shows ("This table compares the real monthly bill for a 5-person team on each tool's mid plan, as of 3 October 2026."). Gate: missing lead = fail.
- Every cell carries `data-label` for the phone layout.
- **Tables are rendered from data, never typed.** A `<PricingTable tool="hubspot" scenarios="all" />` component; a `<CompareTable a="ghl" b="hubspot" />` component; a `<StackBill stack="agency" />` component.
- Boilerplate leads are banned: the sister site had 213 of 327 leads reading "The table below compares…". Ours must state the size scenario and the date.

## FAQs

- One source: `faq/<slug>.json`. Rendered visibly as `<details>` and as `FAQPage` JSON-LD from the same string. Gate: visible text ≠ schema text = fail.
- 5–8 per page. Answers 90–160 words, self-contained, at least one number where the question is about cost.
- Questions are real queries: "Does HubSpot charge for onboarding?", "Can I use GoHighLevel without paying for Twilio?".

## The provenance box — the most valuable block on a pricing site

Under every pricing table:

> **How we checked this.** Prices above were read from hubspot.com/pricing/marketing on 3 October 2026 and re-checked automatically every Monday; the last automated check passed on 10 October 2026. Where HubSpot prices by region, we show US list price and say so. If you see a different price, tell us — corrections go live the same week and appear in the [changelog](/changes/).

Every sentence in it renders from data (`checkedOn`, last job run, `regional.note`). **Nothing in a provenance box is hand-typed** — the sister site's "we re-check every price before each monthly review" was printed by a tool that checked nothing; its audit called it the top trust risk.

## Scoring — six factors for software

Adapted from the sister site's method, which is sound; the factors are rewritten for software.

| # | Factor | Question |
|---|---|---|
| 1 | **Real cost** | At a typical small-business size, how far is the real monthly bill from the sticker price once required add-ons are counted? |
| 2 | **Pricing honesty** | Can a buyer learn the real cost from the vendor's site without a sales call? |
| 3 | **Small-team fit** | Usable without an agency, a developer or a week of setup? |
| 4 | **Does the whole job** | Depth for its layer; how many other tools it removes. |
| 5 | **Freedom to leave** | Data export, contract length, cancellation, migration cost. |
| 6 | **Track record** | Uptime, support responsiveness, price-change history, years in market. |

**Procedure (recorded per tool in `scoreRecord`, never rendered):**
1. Two blind passes score each factor 1–5 with a one-sentence reason, and give an overall.
2. Both calibrate against all already-scored tools.
3. Adjudication: **if the tool pays us, take the lower overall.** Otherwise the mean; a .x5 rounds to the cautious side. Consistency pass may lower, never raise.
4. Thin evidence → **"Not scored"**, displayed as such. We never invent a number.
5. The overall is editorial, not a computed average — and `/methodology/` says so plainly.

**Rendering:** stars (width = score × 20%), a "Why we score it 3.9" panel with the published basis and the six factor scores, and "Facts for this entry last checked on <date>". Gate: one score per tool site-wide; every JSON-LD rating visible on the page.

## Editorial rules (gated where a machine can check)

| Rule | Gate |
|---|---|
| No first-hand claim ("we tested") unless a `trials/<tool>.json` record exists with dates and screenshots | lexicon scan for "we tested / we used / we signed up" without a trial record → fail |
| No earnings claims, anywhere (GHL contract, and good sense) | lexicon: "make money", "earn $", "income" near a paid link → fail |
| No discount/coupon/promo language near any paid link unless `programs.json` authorizes it | lexicon near `rel="sponsored"` → fail |
| Dated checks in prose: "when we checked on <date>" | encouraged; the date must match a `checkedOn` in data → fail if not |
| Attribution: "Shopify's pricing page says…" | style, reviewed |
| One independence mention per page, maximum | count → fail above 1 |
| No sentence repeated on more than 3 pages outside generated blocks | duplicate scan → fail |
| Words per paid button ≥ 150 | count → fail |
| Prose numbers must match data | every currency figure in prose must exist in the page's data payload → fail |

## Length

The sister site's median authored length was ~2,500 words and its audit concluded **length is not the lever**. Targets above are ceilings as much as floors. A pricing page that says everything true in 1,400 words ships at 1,400.
