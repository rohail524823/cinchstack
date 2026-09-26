# 09 — Affiliate programs: build first, apply second

## The lesson we are structurally unable to repeat

The sister site has **1,885 amber buttons; 732 of them (39%) point at Coursera, which declined the application.** A third of its outbound clicks earn nothing. Its own audit: *"Get affiliate approvals before writing. Pick topics where an approved programme is the honest answer."*

CinchStack's version, since we are building before approvals: **a link is paid only when `programs.json` says `approved`. Everything else is a plain link with a comment saying so.** Approval flips the link; nothing is rewritten. There is no state in which we depend on a vendor who hasn't said yes.

## What the inbox taught us about approvals

| Applied | Site age | Result | Stated reason |
|---|---|---|---|
| Coursera (Impact) | ~1 week | declined | "at least 1,000 monthly visitors" |
| edX (Impact) | ~8 weeks | declined | "brand alignment mismatch" |
| ActiveCampaign (PartnerStack) | ~8 weeks | declined | generic |
| n8n (PartnerStack) | ~8 weeks | declined | none given |
| DataCamp (Impact) | ~8 weeks | **approved** | — |
| Udemy (Impact) | ~8 weeks | **approved** | — |
| GoHighLevel (direct) | — | **approved** | open program |

Pattern: **selective programs decline sites with no traffic; open programs approve anyone.** Coursera named the bar. So cinchstack applies to selective programs when Search Console shows ~1,000 monthly visitors, from an Impact account that by then has one approved, earning property (bestaicertifications.com) and a second verified property (cinchstack.com — the meta tag is live).

## Phase 1 — live from day one

Only **GoHighLevel**. Every GHL link is wrapped and paid. Every other tool is a plain link.

## Phase 2 — the application plan

Trigger: GSC shows ~1,000 monthly visitors (or 300+/week for two consecutive weeks). Apply to all seven in one sitting.

| # | Program | Network | Apply where | What to say |
|---|---|---|---|---|
| 1 | Semrush | Impact | marketplace → Semrush | "Verified pricing pages and comparisons for small-business SEO; here are the three live pages that mention Semrush." Link the pricing page, the vs-Ahrefs page, the agency stack. |
| 2 | Shopify | Impact | marketplace → Shopify Affiliate | Same shape; link the pricing page, vs-WooCommerce, the Shopify store stack. |
| 3 | HubSpot | Impact (confirm) or direct | hubspot.com/partners/affiliates | Link the pricing page, vs-GHL, the SaaS stack. Mention the audience is small teams choosing between Starter and Professional. |
| 4 | Notion | PartnerStack | Notion program page | Link the pricing page, vs-ClickUp, all six stacks (every one has Notion). |
| 5 | Webflow | PartnerStack | Webflow program page | Link pricing, vs-Squarespace, vs-Framer, the freelancer stack. |
| 6 | Systeme.io | direct | systeme.io/affiliate | Link pricing, vs-GHL, vs-Kajabi, the course-creator stack. **Confirm payout rail (Payoneer/wire) before applying.** |
| 7 | Klaviyo | verify | Klaviyo partner site | Confirm an open affiliate track exists and pays Pakistan. If not: apply to **Kit** instead and add Kit as tier two. |

Every application links **specific live pages** where the tool already appears with honest, verified content. That is the difference between "I plan to promote you" (declined four times) and "here is how you already appear on a site with N monthly visitors."

### If declined
- Reply once, by email to the program's affiliate contact, with the Impact/PartnerStack ID, the live URLs, and the traffic number. Coursera's decline email lists exactly this as the appeal format; assume others want the same.
- Re-apply at the next traffic milestone (2,500/month).
- The tool stays on the site with plain links. Its pages still earn indirectly: they bring visitors who click paid links elsewhere, and they are what make the site trustworthy.

## The per-program record — `programs.json`

The sister site's `affiliate.json` + `affiliate-terms.md` were among its best assets: cookie window, renewals, coupon policy, trademark-bidding rules, notice period, per program. Ours adds the fields the SaaS world needs and the ones GHL's contract forces:

```json
{
  "gohighlevel": {
    "label": "GoHighLevel (direct)",
    "network": "direct-tipalti",
    "status": "approved",
    "approvedOn": "2026-08-19",
    "payoutRail": "Tipalti → Payoneer USD receiving account (ACH)",
    "payoutMinimum": 50,
    "forfeitureWindowDays": 120,
    "holdDays": 45,
    "cookieDays": 30,
    "recurring": true,
    "rates": {"starter": 0.40, "unlimited": 0.40, "agencyPro": 0.40, "tier2": 0.05},
    "paysOnTrial": false,
    "match": "https://(www\\.)?gohighlevel\\.com/[^\"'\\s<>]*",
    "template": "<affiliate link template from portal>",
    "rules": {
      "mandatoryDisclosure": "I am an independent entity from HighLevel. I am not an agent or employee of HighLevel and have no authority to make any binding commitment on behalf of HighLevel.",
      "noEarningsClaims": true,
      "noUnauthorizedOffers": true,
      "noBrandBidding": true,
      "noTrademarkInDomain": true
    },
    "rateHistory": [{"date": "2026-08-19", "note": "joined at 40% recurring"}],
    "contact": "devesh.khatri@gohighlevel.com"
  }
}
```

Every gate that touches money reads this file.

## Link mechanics

Copied from the sister site's `affiliate.py`, which its audit rated [TRANSFER AS-IS]:

- Component `<AffiliateLink tool="…" placement="…">` resolves the program from `tools/<tool>.json → affiliate.program`, checks `status === "approved"`, and either wraps (template + `subId1` = page path) or renders plain with the marker comment.
- Never wraps inside JSON-LD.
- Cannot double-wrap.
- `rel="sponsored nofollow noopener" target="_blank"` on paid; `rel="noopener"` on plain.
- Amber class applied by the component only for approved hosts. Authors cannot set it. CSS has nothing to neutralise.
- GA4 `affiliate_click` with `tool`, `placement` (`paid-pick`, `pricing-table`, `end-cta`, `end-cta-pricing`), `page`.

## Disclosure — where and what

- **One line, first thing in the article, above the fold on a 375-px phone**, on every page with a paid link: *"Amber buttons are affiliate links to tools that pay us a commission if you sign up. Plain buttons are not. [How we earn](/how-we-earn/)."* The sister site's DataCamp approval required exactly this placement and measured the fold by hand; ours is checked by a Playwright screenshot in CI at 375×667.
- **GHL pages additionally carry GHL's mandated sentence**, rendered from `programs.json`, in the disclosure block. Gate: any page with a GHL paid link and no mandated sentence fails.
- `/how-we-earn/` lists every program, its cookie window, whether it pays on trial or purchase, and the colour rule: **"A button can only be amber if the destination is one of the programs listed here. This is enforced by the build, not by discipline."** — true of ours, which was not quite true of the sister site's.
- Independence stated once per page, maximum.

## Compliance gates (CI, fail = no deploy)

| Gate | Source |
|---|---|
| Paid links carry `sponsored nofollow noopener` | all programs |
| Disclosure line present, first, above the fold | all programs; DataCamp precedent |
| GHL mandated disclosure on every GHL page | GHL agreement §marketing |
| No earnings-claim lexicon anywhere near a paid link | GHL agreement; FTC |
| No coupon/discount/promo/free-trial offer language near a paid link unless `programs.json` authorizes that exact offer | GHL agreement; DataCamp precedent (`coupon_bleed`) |
| No vendor trademark in any URL path segment other than the tool identifier | GHL agreement; our stricter rule |
| ≥ 150 words of prose per paid button | sister-site policy, tightened from 120 |
| Amber only on approved hosts | component-enforced |
| Every price near a paid link matches data and carries a date | ours |

## Negotiation — approval is the start

The sister site renegotiated DataCamp a month after joining, with its own Impact numbers and seven sample pages; granted in four days. Template for every program at the 60–90-day mark:

> Subject: Tier review request — partner <ID>, <site>
> Numbers first: <clicks>, <actions>, <conversion %>, over <dates>. Here are the N pages where you appear: <URLs>. We'd like to discuss <cookie window / rate / trial bounty>. Happy to share GSC data.

Record every outcome in `rateHistory`.

## The money you can't withdraw yet

Both accounts had payout blockers on the sister site (Impact "Not Qualified to Pay"; GHL's 120-day forfeiture). Checklist, done before the first paid link is live:
- Impact: identity + bank complete (done 24 Aug).
- GHL: Tipalti method set up (done). W-8 submitted? Confirm in portal.
- Payoneer: USD receiving account active (inactive ones were closed in 2025 — confirm).
- PartnerStack: AirWallex direct deposit set up on the day of the first application.
