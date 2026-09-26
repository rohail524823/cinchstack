# 11 — Measurement and kill criteria

Set now, before anything is built, so they can't be moved when the numbers arrive. Two earlier ideas in this project died on numbers that were findable on day one; this file exists so that never happens again.

## Setup — week 1 and 2

| Tool | Action |
|---|---|
| Google Search Console | Verify by DNS; submit sitemap; request indexing for homepage + 8 pricing pages on launch day |
| Bing Webmaster Tools | Import from GSC; submit sitemap; enable the AI-queries report export |
| GA4 | One property; consent-gated in EEA/UK/CH; custom channel group "AI Assistants"; events: `affiliate_click` (tool, placement, page), `newsletter_signup`, `outbound_plain` |
| Netlify edge counter | Referrer host + path daily counts, no cookies — catches JS-blocking AI visits |
| Impact + GHL portals | Weekly export of clicks/actions/earnings by `subId1` (= page) to `growth/data/` |
| Weekly export | Every Monday after the price job: GSC pages + queries (28d), Bing performance, GA4 channels, affiliate by page → `growth/data/<date>/` (gitignored) |

## KPIs by month

| Month | Traffic | Programs | Money | Freshness |
|---|---|---|---|---|
| 1 | ≥ 1 pricing page with top-20 impressions; 30+ pages indexed in both engines | GHL live | — | 100% of pricing pages verified within 7 days |
| 2 | ~1,000 monthly visitors (GSC + Bing clicks) | apply to all 7 | first GHL trial | first `/changes/` entry from a real vendor change |
| 3 | 2,000+ | 3+ approved | first GHL paid conversion; ≥ $50 inside the 120-day window | first newsletter sent |
| 4–6 | 4,000+ | 5+ approved | **$300–500/month** recurring | dataset mirrored on 3 platforms; first AI-citation spot check with ≥ 2 engines citing us |
| 12 | 10,000+ | all 8 + tier two | $1,000+/month | quarterly pricing report published |

## Kill criteria — the numbers that stop us

**Day 30 — can the domain rank here at all?**
- Check: does any pricing page have impressions at average position ≤ 20 in GSC?
- **No → stop adding pages. Change niche, not tactics.** The sister site had top-20 impressions inside its first month; a new domain that cannot get a single pricing page into the top 20 in 30 days is fighting authority it does not have, and more pages will not fix that.

**Day 60 — is there a slope?**
- Check: ≥ 500 monthly visitors (GSC + Bing clicks, 28 days) **or** week-over-week clicks rising for 3 consecutive weeks.
- **Neither → pause new pages.** Spend two weeks on: indexing gaps, internal-link depth, Quick-answer quality on the ten pages with most impressions and fewest clicks. Resume only if the slope appears.

**Day 90 — does the anchor pay?**
- Check: at least one GHL paid conversion, or ≥ 5 GHL trials started.
- **No →** the GHL cluster is not converting despite traffic. Shift the paid-pick weight to whichever approved recurring program is converting; keep GHL pages (they still rank) but stop expanding the vertical set.

**Day 120 — GHL forfeiture.**
- Check: cumulative GHL commission ≥ $50 inside the trailing 120 days.
- **No →** commissions forfeit. Not fatal, but recorded; if it happens twice, GHL is demoted from anchor.

**Day 180 — is this a business?**
- Check: ≥ $300/month across programs, **or** ≥ 4,000 monthly visitors with 3+ programs approved (money lagging traffic is acceptable at this stage; no traffic is not).
- **Neither →** full review. Options on the table: change the eight, change the audience, or stop.

## Weekly review — 20 minutes, every Monday, logged

1. Price job result: any drift issues open? Resolve within the week.
2. GSC: top 20 pages by impressions; any page with impressions > 500 and CTR < 1% gets its Quick answer and title rewritten.
3. Bing: impressions trend; zero for 7 days → IndexNow off, issue opened.
4. Affiliate by page: which pages send clicks; which clicks convert. Feed the value rule in `08-publishing-workflow.md`.
5. New queries in GSC that no page owns → candidates for FAQ additions or new pages.
6. One line in `growth/weekly.md`: what changed, what we'll do.

## Monthly review — 1 hour

- Re-verify bot-blocked vendors by browser.
- AI-citation spot check (10 minutes, `06-aeo-geo-bing.md`).
- Score review for any tool whose pricing changed materially.
- Programs: any "terms changed" emails → `programs.json`.
- Kill-criteria checkpoint if one falls in the month.

## What we will not measure

- Vanity: page views alone, social followers, "domain authority" scores.
- Anything requiring a paid tool. The DataForSEO connector can be funded later for keyword expansion; it is not required to run the site.
