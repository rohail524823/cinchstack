# Content brief for cinchstack.com

You are writing one page of cinchstack.com. Read this whole file before you write a word.

## What the site is

CinchStack helps people who run a small online business choose their software, and shows what it will really cost. Motto: **the stack that's best for you.** The reader is the owner of a marketing agency, a coach or course creator, an online store, a local service business, a freelancer or an early-stage SaaS company. They are busy, not technical, and about to spend money. They want a straight answer, the real number, and the catch.

Every price on the site comes from a saved, dated copy of the vendor's own page (`snapshots/<tool>/`) and lives in `src/data/pricing/<tool>.json`. The page template renders the tables, the bills, the score, the sources and the FAQ from data. **Your prose adds what the data cannot say:** which plan a given business actually needs, what pushes the bill up, the traps the vendor's page does not make obvious, when to pick something else, and a clear verdict.

## Files you write

| Page kind | Prose file | Data files you also write |
|---|---|---|
| Pricing page | `src/content/pricing/<tool>.mdx` | `src/data/faq/pricing--<tool>.json` |
| Tool review hub | `src/content/tools/<tool>.mdx` | `src/data/faq/tools--<tool>.json` |
| Comparison | `src/content/compare/<a>-vs-<b>.mdx` | `src/data/comparisons/<a>-vs-<b>.json`, `src/data/faq/compare--<a>-vs-<b>.json` |
| Alternatives | `src/content/alternatives/<tool>.mdx` | `src/data/alternatives/<tool>.json`, `src/data/faq/alternatives--<tool>.json` |
| Stack | `src/content/stacks/<business>.mdx` | `src/data/stacks/<business>.json`, `src/data/faq/stacks--<business>.json` |

Never edit `src/data/pricing/*`, `src/data/tools/*`, `src/data/scores/*`, components, or anyone else's page. If you find an error in the pricing data, say so in your final report; do not fix it yourself.

Run `node scripts/lint-content.mjs <your .mdx>` and `node scripts/validate-data.mjs <your data files>` until both pass. **Do not run `astro build` or `npm run build`** — other writers are working in the same folder at the same time.

## Your sources, in order of trust

Start with the fact sheets in `.factpacks/` (regenerate with `node scripts/factpack.mjs` if missing): `INDEX.md` lists every tool with verified data, and `<tool>.md` summarises its plans (with the ids tokens need), costs, the three real bills, fine print, unverifiable points, strengths, weaknesses and sources. They are generated from the data below, so they are the fastest accurate way in.

1. `src/data/pricing/<tool>.json` and `src/data/tools/<tool>.json` for every tool you mention. Read the scenarios, the add-ons, the usage fees, `billingNotes`, `unverified` and `extraCosts`.
2. The saved vendor pages in `snapshots/<tool>/*.txt` for context and detail (plan features, limits, policies).
3. The vendor's own website and help centre, via WebFetch or WebSearch, for non-price facts (features, export, contracts). If you rely on one for a claim that matters, prefer the vendor's own docs and be conservative.
4. Nothing else. Never take a price or a fact from a review site, a blog or memory. If you cannot confirm something, leave it out.

## Numbers — the rule the build enforces

- **In MDX, use tokens for figures:** `<Price tool="hubspot" plan="starter" />` (monthly; add `field="annualMonthly"` for the yearly-billing monthly price), `<Real tool="hubspot" size="small" />` (the real monthly bill for solo / small / growing; add `year` for twelve months), `<Stack id="agency" size="small" />` (a whole stack's monthly total), `<Checked tool="hubspot" />` (the date the prices were verified). Plan ids and sizes must exist in the data; the linter checks.
- A literal dollar amount in prose, the quick answer, FAQ answers or your data JSON is allowed **only if it exactly equals a figure in the data**: a plan price, a yearly-billing monthly price, twelve times either, an add-on price, a usage rate, an extra-cost amount, a scenario total or line, or a stack total. The linter rejects anything else.
- Do not compute new dollar figures in text (differences, savings, per-user splits, ranges). Say "about twice as much", "the gap widens as the team grows", or point to the table. If one derived figure is truly essential, declare it in frontmatter `extraFigures: [{ value: "1,164", why: "Starter billed yearly: 12 × $97" }]` with the arithmetic.
- Non-dollar numbers (contacts, seats, percentages, days) must also match the data or the vendor page.
- Every price statement is dated by the page itself; in prose you may say "when we checked on <Checked tool="x" />".

## Voice

- Plain English. Short sentences. Active voice. Say the thing, then the reason.
- "We" means CinchStack. Attribute vendor claims: "HubSpot's pricing page says…", "Shopify's help centre states…".
- Be specific and decisive: "Pick Starter unless you manage more than three client accounts." Not "it depends on your needs".
- Honest about weaknesses of every tool, including tools that might pay us. Name the best alternative when a tool is the wrong fit.
- **Never claim first-hand use.** No "we tested", "we signed up", "in our experience", "hands-on". Our evidence is the vendor's published pages and documentation. You may say "the pricing page shows", "the help article explains".
- No hype or filler: never "powerful", "seamless", "robust", "game-changer", "cutting-edge", "unleash", "supercharge", "best-in-class", "world-class", "in today's fast-paced world", "look no further", "it's worth noting", "whether you're a… or a…".
- No earnings or results promises ("make money", "grow your revenue by"), no coupons, promo codes or discounts unless the vendor publishes them on the saved page.
- Use the word "independent" at most once per page.
- No sentence reused from another page. Write each page fresh; the linter flags reused sentences.
- US spelling. Numbers as digits. Dates like "26 September 2026".

## Structure

- Frontmatter:
  - `title`: 20–66 characters, primary query first. Pricing: "HubSpot pricing 2026: what it really costs a small team". Review: "HubSpot review 2026: who it suits and what it costs". Comparison: "GoHighLevel vs HubSpot: cost and fit for small teams". Alternatives: "HubSpot alternatives that cost less for small teams". Stack: "Best software stack for a marketing agency (2026)". Only the year 2026.
  - `description`: 110–165 characters, specific, with one real figure from the data where natural.
  - `h1`: optional; omit to use the default.
  - `quickAnswer`: **60–120 words**, plain text, no tokens. First sentence names the tool (both tools on a comparison) and states a dated number: "As of 26 September 2026, …". Include the entry paid plan price on pricing pages. Give the verdict for a named kind of business. It must make sense quoted alone, with no pronoun that needs earlier context. Every dollar figure must match the data.
  - `published: 2026-09-26`
  - `related`: optional list of up to 3 extra internal paths for "Keep reading".
- Body: **3–7 H2 sections** (`##`), no H1. Phrase H2s as the questions people search where natural ("Which HubSpot plan does a small team need?"). Each section must stand on its own if quoted. Use `###` sparingly. Short paragraphs, lists where they help.
- Headings the template already renders are reserved and the linter rejects them as H2s: "Which should you pick?", "What each one really costs", "… side by side", "How we score them", "What the whole stack costs", "Free tools we would add", "What to skip", "What it does well, and where it falls short", "What <tool> really costs", "Compare <tool>", "<tool> plans and prices", "Billing rules worth knowing", "If you want one answer". Write more specific questions instead.
- Do not repeat what the page already renders from data (the plans table, the three bills, add-on tables, sources, the score). Refer to them ("the bills above"). Do not use these as H2s: "Frequently asked questions", "How we checked this", "What you will really pay", "Add-ons, usage and other costs", "Keep reading".
- Comparison and stack pages must include one section headed **"Where most advice gets this wrong"** with an original, defensible point.
- Links: use `<T id="tool" />` to mention and link a tool (it links its pricing page when that page exists, plain text otherwise; `to="hub"` or `to="alternatives"` for others). Markdown links only to pages in `docs/prompts/launch-pages.json` or `/methodology/`, `/how-we-earn/`, `/data/`, `/changes/`. Always with a trailing slash. Never link to vendor sites in prose; the template adds the vendor buttons.
- Do not mention numeric scores in prose; the score panel renders them.

## Length

Say everything true and useful, then stop. Targets for the MDX body: pricing 700–1,100 words, review hub 600–1,000, comparison 900–1,300, alternatives 600–900, stack 900–1,300. Length is not the goal; usefulness is.

## FAQ file

`src/data/faq/<kind>--<slug>.json`:

```json
{ "page": "<kind>/<slug>", "items": [ { "q": "How much does HubSpot cost for a small business?", "a": "…" } ] }
```

- 5–8 questions phrased the way people type them into Google or ask an assistant. Pricing-page FAQs are about cost, plans, billing, trials and fees; review-hub FAQs are about fit, features, limits, setup and switching; comparison FAQs are about choosing between the two; stack FAQs are about the business's setup. Do not ask a question another page of the same tool already answers. Look at what people actually ask (WebSearch the main query and note the "People also ask"-style questions, vendor community threads). Do not repeat the quick answer.
- Each answer **90–160 words**, complete on its own (name the tool, no "as mentioned above"), with at least one number when the question is about cost. Plain text, paragraphs separated by a blank line (`\n\n`) if needed. Literal dollar figures must match the data.

## Page-kind specifics

### Pricing page (`pricing/<tool>`)
The template shows, above your prose: quick answer, at-a-glance box, plans table, the three real bills. Below it: add-ons, usage, extra costs, billing notes, sources, FAQ. Suggested sections: which plan each kind of business needs; what pushes the bill up (the specific add-ons/usage/limits from the data); whether yearly billing is worth it; the catches the pricing page does not make obvious (from `billingNotes`, `extraCosts`, `unverified`, snapshot fine print); how the cost compares with the obvious alternatives (with `<T>` links).

### Tool review hub (`tools/<tool>`)
The template shows the score panel, an at-a-glance box, your prose, then a strengths and weaknesses box built from `tools/<tool>.json`, the real-cost table, and links to comparisons. Do not restate the strengths and weaknesses as lists; explain the two or three that matter most to a buyer, with context. Your prose: what the tool is and who it is for, what it does well, where it falls short, who should not buy it, how it fits into a stack (link the relevant `/stacks/<business>/` pages), and a verdict by business type.

### Comparison (`compare/<a>-vs-<b>`)
Data file per `comparisonSchema` in `src/lib/schemas.mjs`: `id`, `a`, `b`, `layer`, 5–12 `dimensions` `{ label, a, b, edge: "a"|"b"|"tie" }` (short, concrete cell text; cost cells may cite data figures), and `verdicts` for at least 4 of the six businesses `{ business, pick: "a"|"b"|"neither", why }` (one sentence each). The template renders the verdicts, the cost-at-three-sizes table, your dimensions table, your prose, both scores and both sources. Prose: the short answer, where A wins, where B wins, how the bills diverge as a business grows, switching cost, "Where most advice gets this wrong".

### Alternatives (`alternatives/<tool>`)
Data per `alternativesSchema`: 3–7 `reasons` people leave the tool (specific: "The bill jumps when your contact list passes a tier", not "too expensive"), each with 1–3 `picks` `{ tool, why }`. Picks must be tools that exist in `src/data/tools/`. Prose: when to stay, what to check before switching, how to migrate.

### Stack (`stacks/<business>`)
Data per `stackSchema`: `id`, `label`, `profile` (who this is for, 1–2 sentences), `sizeLabels` `{ solo, small, growing }` (e.g. "Solo consultant", "5-person agency", "15-person agency"), 3–5 `layers` `{ layer, role, pick, why, alternatives: [{ tool, when }], overrides? }`, `extras` (free tools worth adding, with official URLs), `skip` (what not to buy yet, and why). Picks and alternatives must be tools in `src/data/tools/`. **Pick on fit and total cost for this business, never on commission.** Each layer's bill defaults to that tool's standard scenario for the size; use `overrides.<size> = { amount, note }` only when this business clearly needs a different plan than the standard scenario, and the amount must be a figure from the data (a plan price or scenario total). If one tool covers two layers, list the second layer with the same pick and override amounts of 0 with the note "Included in <tool>". Prose: how the stack fits together, what to buy first, how the bill grows, what to skip, "Where most advice gets this wrong".

## Finish

Run the linter and validator until they pass. Your final message is a short report: files written, word count, anything in the data you think is wrong, anything you left out because you could not verify it.
