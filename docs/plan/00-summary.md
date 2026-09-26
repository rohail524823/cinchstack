# CinchStack — the plan on one page

**Date:** 26 September 2026 · **Owner:** Rohail · **Builder:** Claude Code
**Read this first. Everything else in this folder is detail behind a line here.**

---

## What CinchStack is

A site that tells people running an online business **which software stack is best for them, and what it will really cost.** Three things it does better than anyone else:

1. **Real pricing.** What a tool actually costs at your size, once every required add-on is counted — verified against the vendor's own page, dated, and re-checked every week.
2. **Honest comparison.** Head-to-heads built from that pricing data, not from templates.
3. **Stack recommendations.** For a coaching business, a Shopify store, an agency, a dentist — the whole stack, with the total monthly bill at three team sizes.

**Motto:** *The stack that's best for you.*

It earns through affiliate programs. It is not an affiliate site. The test for every page: **would a reader who will never click a paid link still find this the most useful page on the topic?** If no, the page is not published.

## Who it is for

Owners and operators of small online businesses — agencies, coaches and course creators, Shopify merchants, local service businesses, freelancers, early-stage SaaS — who are choosing software or switching it. They have a decision to make and a card to pay with.

## The launch eight

| Layer | Tool | Program | Status |
|---|---|---|---|
| Run | **GoHighLevel** | 40% recurring + 5% tier-2 | ✅ approved 19 Aug |
| Run | **HubSpot** | 30% recurring | apply in phase 2 |
| Sell | **Shopify** | up to $150/merchant, 400-day | apply in phase 2 (Impact) |
| Sell | **Systeme.io** | 60% lifetime | apply in phase 2 |
| Site | **Webflow** | 50% of first year | apply in phase 2 (PartnerStack) |
| Grow | **Semrush** | $200/sale + $10/trial | apply in phase 2 (Impact) |
| Grow | **Klaviyo** | verify program | apply in phase 2 |
| Organize | **Notion** | 50% for 12 months | apply in phase 2 (PartnerStack) |

Five layers, eight tools, and every tool has pricing confusing enough that explaining it is a real service. Tier-two additions (ClickFunnels, Kajabi, Kit, Squarespace, monday.com, Hostinger…) slot into the same structure. Full reasoning in `02-the-eight.md`.

## Why this will work — evidence, not hope

- **The sister site proves the method.** bestaicertifications.com went 0 → ~460 affiliate clicks/month in six weeks and earned 8,159 Bing Copilot citations, using the exact page system this plan copies. Its failure was monetization ($1.41/sale), not traffic. Its full playbook is in the repo we reverse-engineered.
- **Freshness is the lever for AI citation.** Content under three months old is ~3× more likely to be cited by AI Overviews; pages untouched six months lose eligibility. A site whose core pages are re-verified weekly is structurally what AI cites.
- **Pricing is the one fact AI cannot know.** Vendors hide it; models have stale training data. A dated, verified pricing table is the freshest, most factual, most citable content on any software topic.
- **GHL is approved and pays 40% forever.** $300–500/month is three to four Unlimited customers, or eight to thirteen Starter. Everything else is upside.

## Build first, apply second

Every program that declined the sister site did so when it was 7–9 weeks old with no traffic. Coursera stated the bar: **1,000 monthly visitors.** So:

- **Phase 1 (weeks 1–6):** build all ~50 launch pages. GHL links are live and paid. Every other tool gets a plain, honest link marked *"no program yet — do not wrap."*
- **Phase 2 (when Search Console shows ~1,000 monthly visitors):** apply to the other seven on Impact and PartnerStack, using an account that already carries an approved, earning history. Each approval turns an existing plain link into a paid one. Nothing is rewritten.

## Revenue path

| Month | Target | What has to be true |
|---|---|---|
| 1 | Site live, ~50 pages indexed | Pricing pages show top-20 impressions in GSC |
| 2 | 1,000 monthly visitors | Apply to the seven programs |
| 3 | First GHL paid conversion | ≥$50 earned inside GHL's 120-day window |
| 4–6 | **$300–500/month** | 3–4 GHL Unlimited or equivalent mix; 3+ programs approved |
| 12 | $1,000+/month | Recurring base compounding; tier-two tools added |

## Kill criteria — set now, checked on the day

- **Day 30:** if no pricing page has impressions in the organic top 20, the domain cannot rank in this space. We change niche, not tactics.
- **Day 60:** if fewer than 500 monthly visitors and no upward slope, we pause new pages and diagnose before writing more.
- **Day 120:** if GHL has earned under $50 in the window, it forfeits — we decide then whether the site keeps GHL at the center or shifts weight to an approved recurring program.

## Decisions already made (so you don't have to)

1. Static site on **Astro**, deployed to Netlify from `main`. One build step, not ninety-four repair tools.
2. **Every fact lives once**, in JSON. Pages are templates. A price appears in prose only as a token rendered from data.
3. Design language kept from the current `index.html` (paper palette, Bricolage Grotesque + IBM Plex), rebuilt lean.
4. **Six scoring factors** for software, two blind passes, lower-of-two for tools that pay us, "Not scored" when evidence is thin, reasoning published beside every score.
5. **Newsletter = price-change alerts.** The sender is built before the form is shown. The weekly price diff *is* the email.
6. **IndexNow only on real content change**, never on every push — the sister site went to zero on Bing after firing it on 155 URLs per deploy.
7. **Plain links, not affiliate links, wherever a tool has not approved us.** The sister site has 732 buttons pointing at a vendor who said no. We will never have one.
8. GHL's mandatory disclosure text, earnings-claim ban and coupon ban are **gates in CI**, not guidelines.
9. `index.html` stays live untouched until the Astro site replaces it — it carries the Impact verification tag.

## The folder

| file | holds |
|---|---|
| `01-positioning.md` | identity, promise, voice, trust model, what it is not |
| `02-the-eight.md` | the launch tools, why each, pricing-confusion score, program, comparison pairs, tier two |
| `03-architecture.md` | URL map, page types, hubs, linking, the ~50-page launch inventory |
| `04-content-system.md` | data model, page skeletons, Quick answer, FAQ, tables, provenance, scoring, editorial rules |
| `05-seo.md` | technical SEO, schema per page type, dates from git, sitemap, robots, gates |
| `06-aeo-geo-bing.md` | answer-first, dataset, changelog, llms.txt, AI crawlers, Bing, IndexNow policy, citation measurement |
| `07-tech-stack.md` | Astro, repo layout, build, Netlify, CI, price-check job, newsletter sender, costs |
| `08-publishing-workflow.md` | how each page is produced and verified, cadence, week-by-week launch sequence |
| `09-affiliate-programs.md` | phase-2 applications, per-program record, link wrapping, disclosures, compliance gates, negotiation |
| `10-growth.md` | newsletter, dataset distribution, communities, link earning, cross-site, do-not-do |
| `11-measurement-kill.md` | GSC/Bing/GA4 setup, KPIs by month, kill criteria, review cadence |
| `12-risks.md` | risk register |
