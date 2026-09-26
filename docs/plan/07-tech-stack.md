# 07 — Tech stack

## Decision

**Astro** (latest 5.x), TypeScript, content collections backed by the JSON data files, hand-written CSS in one file, zero client-side JavaScript on content pages. Deployed to **Netlify** from `main`. **One build step** (`astro build`), one **check** script for all gates, one **verify** job for prices. That is the whole system.

### Why Astro over the sister site's hand-authored HTML

The sister site's `deploy/` is the site — 219 finished HTML files with facts copied in, kept honest by 94 Python tools and 1,751 lines of YAML. Its own audit names this the root cause of most of its cost: every fact change became a search-and-repair job. Astro gives us templates + data with the same static output, and the "94 tools" collapse into components and one check script.

### Why not Next.js / a CMS / WordPress

Next.js pulls in a runtime we don't need. A hosted CMS costs money and adds a dependency for a solo builder. WordPress is a plugin-security surface and a performance tax. Astro is purpose-built for exactly this: content-heavy static sites with structured data.

## Repository layout

```
cinchstack/
├── src/
│   ├── data/                    every fact, once (schemas in src/schemas/)
│   │   ├── tools/               <tool>.json
│   │   ├── pricing/             <tool>.json   ← the heart
│   │   ├── comparisons/         <a>-vs-<b>.json
│   │   ├── stacks/              <business>.json
│   │   ├── alternatives/        <tool>.json
│   │   ├── faq/                 <page-slug>.json
│   │   ├── programs.json        affiliate programs and contract rules
│   │   ├── changelog.json       every caught change
│   │   ├── related.json         curated hub→spoke links
│   │   ├── redirects.json       301s, gated
│   │   └── entity.json          Organization + Person
│   ├── content/                 prose that is genuinely editorial (MDX)
│   │   ├── tools/<tool>.mdx
│   │   ├── pricing/<tool>.mdx
│   │   ├── compare/<a>-vs-<b>.mdx
│   │   ├── alternatives/<tool>.mdx
│   │   └── stacks/<business>.mdx
│   ├── components/              PricingTable, CompareTable, StackBill, QuickAnswer,
│   │                            Disclosure, PaidPick, Provenance, Faq, ScorePanel,
│   │                            AffiliateLink, KeepReading, Newsletter, Breadcrumbs, JsonLd
│   ├── layouts/                 Base, Article
│   ├── pages/                   routes; mostly [param].astro reading collections
│   ├── lib/                     affiliate wrapping, dates-from-git, schema builders, text utils
│   ├── schemas/                 zod schemas for every data file
│   └── styles/site.css          one file, < 30 KB
├── public/                      fonts, favicon, static images
├── snapshots/                   vendor pricing-page text captured on each verification (gitignored? no — committed, small)
├── scripts/
│   ├── check.ts                 ALL gates (see 05-seo.md) — run in CI, must pass
│   ├── verify-prices.ts         weekly: fetch vendor pages, diff, write changelog, open issue
│   ├── send-changes.ts          weekly: render changelog diff → email via Resend
│   ├── publish-dataset.ts       build JSON + CSV for /data/, push mirrors
│   ├── lastmod.ts               content-change dates from git for sitemap + JSON-LD
│   └── social-images.ts         per-page OG image
├── growth/                      exports, plans, records — never published (gitignored data/)
├── docs/plan/                   this plan
├── .github/workflows/
│   ├── ci.yml                   on push/PR: build + check + lighthouse sample
│   ├── verify-prices.yml        Mondays 07:00 UTC
│   ├── send-changes.yml         Mondays 09:00 UTC (after verify)
│   └── year-rollover.yml        1 January
├── netlify.toml                 build cmd, publish dir, headers, redirects, functions
├── astro.config.mjs
└── index.html                   ← current live placeholder; deleted when the Astro site ships
```

## Data validation

Every JSON file has a **zod** schema in `src/schemas/`. `astro build` fails on invalid data — a price with no `source` or `checkedOn`, a tool with no `layer`, a comparison referencing a tool that doesn't exist. This replaces roughly thirty of the sister site's tools.

## The check script — one, not ninety-four

`scripts/check.ts` runs over `dist/` after build and enforces every gate in `05-seo.md` and `04-content-system.md`. It prints a table: gate, pages checked, failures with paths. Exit non-zero on any failure. **Design rule: if a gate cannot be satisfied by the build that produced the page, fix the design, not the page.**

## Netlify

- Build: `npm run build` (= `astro build && node scripts/check.js`). Publish: `dist/`.
- Deploys from `main` only. Branch deploys on for previews.
- Headers and redirects in `netlify.toml` (copied from the sister site, minus AdSense hosts).
- Netlify Forms for newsletter and contact capture (free, no third-party script, CSP `form-action 'self'`).
- One edge function for the referrer counter (`06-aeo-geo-bing.md`).
- **Free tier reality:** ~300 credits/month shared, ~15 GB bandwidth, ~20 deploys; hard stop, no auto-recharge. Budget **$9–20/month** from the first month traffic lands. Deploy only on merge to `main`, not on every branch push.

## The weekly price verification job

`verify-prices.yml`, Mondays 07:00 UTC:

1. For each tool, fetch `pricingUrl` (plain HTTP; fall back to a Playwright fetch in the Action only for the two or three vendors that render pricing with JS).
2. Extract the price-bearing text; save to `snapshots/<tool>-<date>.txt`.
3. Compare against the current `pricing/<tool>.json` plan prices with a tolerant matcher (currency, per-seat, annual/monthly).
4. **Match:** update `checkedOn` only. **Mismatch or fetch failure:** open/comment a GitHub issue titled "⚠️ Pricing drift: <tool>" with the diff, and set the page's provenance line to "last automated check flagged a change on <date>; under review" — never stamp a check that didn't pass (the sister site's audit found stamps that no run produced).
5. Human (Claude Code session) resolves the issue: updates JSON, adds a `changelog.json` entry with old/new/source, merges. Build regenerates the pricing page, `/changes/`, `/data/`, and the email.

**Bot-blocked vendors** (403 to a GitHub Action): logged as "could not verify automatically"; checked by hand in a monthly Claude-in-Chrome pass, exactly as the sister site does for Udemy.

## The newsletter sender — built before the form is shown

The sister site's single biggest trust gap: a form on 273 pages promising an email nothing sends. Ours ships in this order:

1. `send-changes.ts` renders the week's `changelog.json` entries into one plain email.
2. Sends via **Resend** (free tier 3,000/month, API, no Pakistan issue) to subscribers pulled from Netlify Forms via its API.
3. Unsubscribe link handled by a tiny Netlify function writing to a suppression list.
4. **Only then** does the newsletter block appear on pages — and its copy is generated from the job: "We've sent N alerts covering M price changes since <launch>."

No changes that week → no email. The promise on the form is exactly what the job does.

## Affiliate link wrapping

`src/lib/affiliate.ts`, copied in logic from the sister site's `affiliate.py`:

- `programs.json` holds per program: `match` regex, `template` with `{url_enc}` and `{page}` (→ `subId1`), `status`, `network`, contract rules.
- Only `status: "approved"` programs wrap. Everything else renders a plain link with an HTML comment `<!-- no program yet — do not wrap -->`.
- Never wraps inside JSON-LD.
- Cannot double-wrap (destination is percent-encoded).
- Adds `rel="sponsored nofollow noopener" target="_blank"` and the amber class **only** when the destination host is an approved program — CSS cannot be fooled by a hand-set class because the class is set by the component, not by authors.
- GA4 `affiliate_click` event with `tool`, `placement`, `page`.

## Cost

| Item | Monthly |
|---|---|
| Netlify | $0 → $9–20 once traffic lands |
| Domain | already owned |
| Resend | $0 (free tier) |
| GitHub Actions | $0 (public repo or within free minutes) |
| Fonts, images | $0 (self-hosted) |
| LLM usage for content | Claude Code session — already paid for |
| **Total** | **$0–20** |

## What we deliberately don't build at launch

- No interactive stack builder (phase 3; the static stack pages come first).
- No comments, no accounts, no search box (Astro Pagefind later if needed).
- No ads, no AdSense script.
- No advisor chat widget — the sister site's paid-only advisor is the kind of thing that makes a site *feel* affiliate.
