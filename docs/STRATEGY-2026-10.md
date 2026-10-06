# CinchStack strategy, October 2026 revision

**Date:** 6 October 2026 · **Replaces:** the "build first, apply second" revenue path in `docs/plan/00-summary.md` (kept for history).
**Built from:** eleven research reports written on 6 October 2026, covering:
- the inbox and Impact decisions;
- affiliate programs that pay Pakistan (marketing, web, ops and AI tools) and the networks behind them;
- revenue models besides affiliate links;
- search demand and competitors;
- a full content audit and a design audit.

The reports are summarised here. Their findings marked UNVERIFIED are flagged where used.

---

## 1. What changed

The September plan assumed eight affiliate programs would approve once the site had about 1,000 visits a month. On 6 October:

- **Approved:** GoHighLevel (40% recurring, Tipalti payouts ready) and Systeme.io (60% lifetime, paid links allowed only on its own pages).
- **Declined:** Shopify, Squarespace, Wix, Semrush, HubSpot, FlexOffers and the PartnerStack Network.
- **Closed or invitation-only:** Klaviyo and Notion.

**Why the declines happened.** Most were automatic, and the cause is the publisher's country, not its traffic.
- Impact gives brands a ready-made workflow, "Reject non-qualifying partners". It declines small partners from outside the countries a brand serves.
- Squarespace's agency confirmed the location reason in writing.
- More traffic will not get past that rule soon.

**Payment is not the problem.** Impact pays PKR by wire. PartnerStack's direct deposit (Airwallex), Dub, Tipalti, CJ and Awin all reach a Pakistani bank or Payoneer.

The bottleneck is **approval by brands that filter on country**. So the plan now:
- leans on income that doesn't need a brand's approval;
- picks programs that approve from anywhere.

## 2. The model: three earners, one audience

The buyers are **agencies, local service businesses, and coaches or course creators**:
- they buy GoHighLevel and Systeme.io;
- they hire someone to set those tools up.

Everything below serves those three groups.

1. **Setup services (near-term income).**
   - **What:** Rohail's own work, sold at `/services/`. Five packages, from a $200 Stack Check to a $1,200 CRM migration or AI voice receptionist, with an optional $120/month care plan.
   - **Why it leads:** one $400–$1,200 job equals 10–30 months of a single GoHighLevel Starter referral (40% of $97 = $38.80 a month).
   - **Getting paid:** by Payoneer, bank wire or an Upwork Direct Contract.
   - **Proof:** his public Upwork record (Top Rated, 121 jobs, $100K+).
   - **The rule that keeps the reviews honest:** setup costs the same for every tool. Service offers sit only in a labelled box after the verdict.
2. **Affiliate commissions from programs that approve from anywhere (a slow-building annuity).**
   - **Paying now:** GoHighLevel and Systeme.io.
   - **Next, for tools already on the site,** so their pages turn paid as soon as each approves:
     - SE Ranking: instant, lifetime 30%, Payoneer
     - ClickFunnels: Tipalti
     - Framer: Dub
     - Zoho: wire
     - Pipedrive: PartnerStack external link
     - Automattic
   - **Then:** hosting.com and Hostinger.
   - The application list with links is in `docs/OPERATIONS.md` §2.
3. **An audience the site owns (12-month asset).**
   - The price-change email (`docs/plan/10-growth.md`). The Monday check already produces its content.
   - It also feeds the other two earners.
   - A labelled sponsor slot only at about 2,000 subscribers.

**Not now:**
- **Display ads:** they earn $5–16 a month at 1,000 visits and contradict our own "no advertising" pages.
- **Paid reviews or placements:** these break the method and the FTC's 2024 reviews rule.
- **GoHighLevel SaaS-mode resale:** it needs Stripe, which isn't available in Pakistan.
- **A US company:** it costs about $900 in year one.
- **A paid dataset or API.**

## 3. Content: shift effort, don't delete

- **Money cluster: build here.**
  - GoHighLevel, Systeme.io, and the tools they are compared with: HubSpot, ClickFunnels, Kajabi, Pipedrive, Zoho CRM, ActiveCampaign.
  - These are now the "core" tools on the homepage.
- **Frozen clusters: maintain, don't expand.**
  - SEO (Semrush, Ahrefs, SE Ranking), website builders (Webflow, Framer, Squarespace, Wix), ecommerce (Shopify, WooCommerce), workspace (Notion, ClickUp), ecommerce email (Klaviyo, Mailchimp).
  - Their prices update themselves through tokens and the Monday check.
  - Unfreeze a tool only when its program approves (SE Ranking, Framer and Zoho are the likely first).
  - Prune by data at the day-90 review: noindex or merge pages with no impressions and no route to revenue.
- **Where a new site can win:** the buyer-intent long tail with thin results pages, not head terms.
  - Example of a head term: "gohighlevel" has about 90,500 US searches a month. Only 25% of gohighlevel.com's visits are from the US, and many searches are job-seekers.
  - "gohighlevel price" and "review" are each up 300% year on year in the US.

### Next pages, in order

The P1 list comes from the demand report: each page carries a GoHighLevel or Systeme.io paid link and a route to `/services/`.

1. GoHighLevel real monthly cost: a static cost matrix by texts and emails, plus a "hidden costs" section.
2. GoHighLevel SMS, phone and email costs: LC Phone, A2P 10DLC registration, email per 1,000.
3. GoHighLevel AI pricing: AI Employee, Voice AI, Conversation AI.
4. GoHighLevel plans compared: $97 vs $297 vs $497, and SaaS mode, with **no income claims**.
5. GoHighLevel + n8n: API v2, webhooks, private integration tokens. This is the owner's core skill.
6. HubSpot → GoHighLevel migration guide, which links the CRM migration package.
7. How much an AI receptionist costs: SaaS vs GoHighLevel Voice AI vs a custom build.
8. GoHighLevel for roofers and contractors; for real estate agents; HIPAA and the $297 add-on (dental, med spa).
9. Systeme.io free plan: exact limits and the $10,000 lifetime-sales cap. It names no competitor, so paid links are allowed.
10. Missed-call text-back: costs and setup.

**Rules that shape these pages:**
- No earnings claims.
- No trial, coupon or bonus wording near HighLevel links unless HighLevel authorises it in writing (a draft asking is in Gmail).
- No sentence reused on more than three pages: the build enforces it, so each vertical page needs real substance.
- No first-hand claims without a trial record.

## 4. Shipped on 6 October 2026

- **New services offer:**
  - `/services/` with five packages, an enquiry form that records how the client found us (Upwork compliance) and Service structured data.
  - "Our own services" rules on `/how-we-earn/`; checkable background on `/about/`.
  - A labelled service box after the FAQ on content pages, kept out of editorial text by a build gate.
- **New homepage:**
  - Aimed at agencies, local businesses and course creators.
  - Business chips, a line-by-line real bill for a 5-person agency, and "sticker price against the real bill" cards.
  - The core tools re-pointed at the money cluster.
  - A services block.
  - The weekly check date in place of the stale manual date.
- **Credibility fixes:**
  - The alternatives pages' "one answer" now compares only tools that do the same job (it used to recommend Shopify to people leaving GoHighLevel).
  - HubSpot's $1,100 bill now says "with texting".
  - Stack titles keep brand casing.
  - GoHighLevel's WhatsApp note is in the past tense.
  - Klaviyo's expired introductory prices are re-captured: Social Marketing $38 → $50, the site's first logged price change.
  - HubSpot and Semrush are recorded as declined.
- **Conversion fixes:**
  - Paid "See plans" links in comparison verdict rows where GoHighLevel is the pick.
  - A GoHighLevel link under "Who should stay" on its alternatives page.
  - Systeme.io buttons on pages where its terms forbid paid links now open our Systeme.io review (which carries the paid link) instead of a plain link that earned nothing.
  - Clearer button labels.
- **Design fixes:**
  - Amber darkened to pass WCAG AA.
  - "How we checked this" collapsed to one line per tool, with sources one click away. On alternatives pages it was up to 77% of the words.
  - Bylines show the automated re-check date.
  - Stack-bill footnotes stay inline on mobile, and mobile navigation is one scrollable row.
  - Stack cards in a 3-column grid; FAQ markers and labels fixed.

## 5. Owner's to-do list, in order

1. **Gmail drafts:** send the HighLevel one (trial wording, extended trial, referral slug). Paste the Systeme.io one into https://systeme.io/support/contact-us.
2. **Apply to programs 1–6** in `docs/OPERATIONS.md` §2. SE Ranking takes five minutes and needs no approval. Tell Claude Code the result of each.
3. **Business email:** set up `rohail@cinchstack.com` (Namecheap email forwarding to Gmail is enough). Then re-apply to the PartnerStack Network with it and a matching LinkedIn headline. This unlocks Webflow, Kit, GetResponse and others.
4. **HighLevel Certified Admin directory** ($97/month): it listed 456 admins who got 1,031 leads in November 2025, and 78% received at least one. It is the most likely source of paying setup clients while the site has little traffic. Ask HighLevel first whether it needs a separate subscription.
5. **Service prices:** check them against your real hours on past Upwork jobs and edit `src/data/services.json` if needed. Also confirm the promise of a reply within two business days.
6. **Monthly:** update the Upwork "as of" figures in `services.json` when they change.

## 6. Measures and kill criteria

| When | Check | If it fails |
|---|---|---|
| Day 30 (about 26 October) | Any money-cluster page in the organic top 20 (Search Console) | The domain can't rank in this space: shift effort to the HighLevel directory and Upwork, and keep the site as a portfolio. |
| Day 60 | 500+ monthly visits and rising; at least one services enquiry | Rewrite the services offer (packages and anchors), not the pages. |
| Day 120 | GoHighLevel has earned $50+ inside its 120-day window; the first paid services job is done | Decide whether GoHighLevel stays at the centre or weight moves to whichever approved program converts. |
| Monthly | Clicks by `placement` (GA4 `affiliate_click`, `outbound_plain`), form submissions by "How did you find us?" | Move buttons and boxes to the placements that work. |

## 7. Conflicts between the reports (resolve before acting on them)

- **MailerLite's payout method.** The marketing-programs report says Tipalti. The demand report says its terms list final payouts "exclusively via PayPal". Read the current terms before building MailerLite pages.
- **GetResponse, Brevo and other PartnerStack programs.** One report says the vendor's own external application link avoids the Network gate. Another treats the whole platform as blocked. Try the external links for Pipedrive and GetResponse; the result settles it.
- **HighLevel trial links.** HighLevel's help centre says 30-day trial links are for affiliates with 100+ active customers. Expect a no to the extended-trial question, and keep plain "See plans" wording until HighLevel answers.
