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
   - **Proof:** the public Upwork record (Top Rated, 121 jobs, $100K+).
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

### The money pages (built 6 October 2026)

Each carries a paid link for the tool that pays us and the labelled route to `/services/`, and each was written from the pricing records and saved vendor pages, then checked claim by claim by a second editor.

| Page | Target searches |
|---|---|
| `/tools/gohighlevel/sms-and-calling-costs/` (with the texts × emails cost grid) | gohighlevel sms pricing, cost per text, a2p registration cost, cost calculator |
| `/tools/gohighlevel/ai-pricing/` | gohighlevel ai employee pricing, voice ai pricing |
| `/tools/gohighlevel/plans-compared/` | gohighlevel 97 vs 297, unlimited vs pro, saas mode pricing |
| `/tools/gohighlevel/add-ons/` (incl. the HIPAA add-on) | gohighlevel hipaa, whatsapp pricing, white label app cost |
| `/tools/gohighlevel/n8n-integration/` | gohighlevel n8n, gohighlevel api n8n |
| `/tools/gohighlevel/migrate-from-hubspot/` | hubspot to gohighlevel migration |
| `/tools/gohighlevel/ai-receptionist-cost/` | ai receptionist cost, ai receptionist pricing |
| `/tools/gohighlevel/missed-call-text-back/` | missed call text back, gohighlevel missed call text back |
| `/tools/gohighlevel/real-estate/` | gohighlevel for real estate agents, vs follow up boss |
| `/tools/gohighlevel/contractors/` | gohighlevel for roofing, crm for roofing companies, vs jobber |
| `/tools/systeme-io/free-plan/` (names no competitor, so its links are paid) | systeme io free plan, free plan limits |

**Next, when these show impressions in Search Console:** GoHighLevel vs Jobber, Podium and HoneyBook; GoHighLevel with Zapier or Make; GoHighLevel + QuickBooks; GoHighLevel WhatsApp; GoHighLevel MCP and AI agents; AI receptionist pages per trade; Zapier → n8n migration; Systeme.io payments, digital products and automations (competitor-free). The demand report's P2 list has the details.

**Rules that shape these pages:**
- No earnings claims.
- No coupon or bonus wording near HighLevel links, and trial wording only as HighLevel authorised it in writing on 6 October 2026: the 30-day Bootcamp trial, on the closing button of GoHighLevel's own pages (`trialOffer` in `programs.json`). Comparison and alternatives tables may state the 14-day and 30-day routes as plain facts, with no link, button or call to action.
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
  - Every real bill shows its basis (for example "with texting"), and the agency example reads "from $601/mo" because GoHighLevel's metered texts, calls and email come on top.
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
  - Buttons that say "See X's plans and prices" now open the vendor's pricing page, and paid inline links are amber like paid buttons.
  - Systeme.io links on comparison pages stay plain until Systeme.io answers the trademark question in writing. A shortcut that sent those readers to our paid Systeme.io page was tried and withdrawn on review.
  - No trial wording beside HighLevel's paid links (its policy bars unauthorised trial offers), until HighLevel authorised it in writing later the same day.
  - Clearer button labels.
- **Design fixes:**
  - Amber darkened to pass WCAG AA.
  - "How we checked this" collapsed to one line per tool, with sources one click away. On alternatives pages it was up to 77% of the words.
  - Bylines show the automated re-check date.
  - Stack-bill footnotes stay inline on mobile, and mobile navigation is one scrollable row.
  - Stack cards in a 3-column grid; FAQ markers and labels fixed.

- **Later the same day:**
  - Both program questions emailed: HighLevel's affiliate manager (trial wording, extended trial, referral slug) and Systeme.io support (comparison pages), which acknowledged and promised a reply within 24 hours.
  - The eleven money pages above, a new guide page type at `/tools/<tool>/<topic>/`, and guide lists on the homepage and tools hub.
  - Systeme.io paid links narrowed to its competitor-free pages until Systeme.io answers.
  - Price-change alerts built behind one switch (`ALERTS_URL`), waiting only for an opt-in page.
  - Analytics counts sent enquiries (`generate_lead`) and alerts clicks; build checks tightened (each program's required disclosure wording; buttons no longer counted as prose).
  - HighLevel's affiliate manager answered in writing: trial wording is allowed and every affiliate has a 30-day trial link (the HighLevel Bootcamp page). The closing button on GoHighLevel's pricing page, review and cost guides now reads "Start your 30-day free trial" and goes there, with a note on what the trial still charges. Comparison and stack pages keep neutral buttons. Clicks arrive in Analytics with placement `end-trial` or `guide-trial`.

## 5. Owner's to-do list, in order (decided 7 October 2026)

On 7 October 2026 Rohail asked Claude Code to decide every pending item. What follows is only what needs Rohail's own logins, signature or identity; the decisions are recorded under it.

1. **Switch on email alerts for the site's forms (one minute, first):** a labelled test enquiry sent on 6 October never reached your Gmail, so a client's enquiry would sit in Netlify unseen. Steps in `docs/OPERATIONS.md` section 4. Then delete the test entry.
2. **Book the call HighLevel's affiliate manager offered for Monday 12 October** (speakwith.us/deveshkhatri). On 7 October he reviewed the site's HighLevel changes and replied "Everything looks great!", and offered help to scale up. Ask what a higher commission tier needs, and whether HighLevel lists affiliate content anywhere. HighLevel requires a live conversation after your second referral anyway, so this covers it early.
3. **Request indexing in Google Search Console (10 minutes a day this week):** Google holds about 30 pages but not the GoHighLevel pricing page, any alternatives page or the guides. Order in `docs/OPERATIONS.md` section 3. Bing is now handled by the IndexNow drip; in Bing Webmaster Tools just confirm the site is still verified.
4. **Make the GitHub repository private** (Settings → General → Danger Zone → Change visibility), unless section 3b of `docs/OPERATIONS.md` says it is done. It republishes every page's text and 659 copies of vendor pages. The public copy of the dataset now lives in `rohail524823/cinchstack-data`, so nothing public is lost. Netlify and the Actions keep working, and the Actions use about 350 of the 2,000 free private minutes a month.
5. **Add cinchstack.com to your LinkedIn profile, and claim the LaunchIndex listing** (launchindex.net, search cinchstack.com) to correct its description, which calls the site "hands-on". bestaicertifications.com/about/ links CinchStack since 7 October.
6. **Apply to programs 1–6** in `docs/OPERATIONS.md` §2. The answers to paste are there. SE Ranking takes five minutes and needs no approval. Tell Claude Code the result of each.
7. **Business email:** set up `rohail@cinchstack.com` (Namecheap email forwarding to Gmail is enough), then re-apply to the PartnerStack Network with it and a matching LinkedIn headline. This unlocks Webflow, Kit, GetResponse and others.
8. **Optional, 3 minutes:** the `HF_TOKEN` secret for the Hugging Face copy of the dataset (`docs/OPERATIONS.md` section 3c).
9. **In Google Analytics, Admin → Events:** mark `generate_lead` (services enquiries) and `affiliate_click` as key events once each first appears.

**Decided for you on 7 October 2026:**

- **IndexNow:** switched from "wait for Bing" to a hand-run drip of at most 10 URLs every 2 days or more (`docs/plan/06-aeo-geo-bing.md`). Bing had ignored the sitemap for six weeks, and it feeds ChatGPT search and Copilot.
- **Public dataset:** published as `github.com/rohail524823/cinchstack-data`, copied from `/data/` every day by its own workflow, CC BY 4.0, with a citation file. Kaggle and data.world copies: not now.
- **Per-page preview images and `llms-full.txt`:** built, so shared links and AI answer cards show each page's own title and key figure, and AI assistants can read every page in one file.
- **HighLevel Certified Admin directory ($97 a month plus the $97 Starter subscription it requires):** not now. It needs HighLevel's certification first and costs more than the site earns today. Revisit at the day-60 review (about 25 November) or after the first paid GoHighLevel setup job.
- **Service prices and the two-business-day reply promise:** kept as they are. Upwork figures re-read on 7 October and unchanged. Claude Code can re-read them through the Upwork connector whenever asked.
- **Price-change email alerts:** not until the site has about 500 visits a month; the RSS feed covers followers until then.
- **Trial facts in comparison tables:** kept as plain facts with no link or button (`docs/OPERATIONS.md` §1).
- **Search Console's "Page with redirect" notice:** expected (the netlify.app and www hosts redirect on purpose).
- **Systeme.io and HubSpot replies:** Claude Code reads them at its check-ins and makes the change; nothing to forward.
- **HighLevel's group strategy sessions:** optional. The one-to-one call with Devesh (item 2) is the one to take.
- **First-hand experience claims:** none added. A read-only scan of all 119 Upwork contracts on 7 October 2026 found n8n builds (2 contracts) and work on Shopify export data, and no contract naming GoHighLevel, HubSpot, Zoho CRM or Pipedrive. So the site keeps offering setup on those tools without claiming past client work on them. The first paid job on each tool becomes its first experience record (`trials/<tool>.json`, `docs/plan/04-content-system.md`). The "more than ten years inside operations and finance teams" line stays, because it matches the Upwork profile the services page points readers to.

## 6. Measures and kill criteria

| When | Check | If it fails |
|---|---|---|
| Day 30 (about 26 October) | Any money-cluster page in the organic top 20 (Search Console) | The domain can't rank in this space: shift effort to the HighLevel directory and Upwork, and keep the site as a portfolio. |
| Day 60 | 500+ monthly visits and rising; at least one services enquiry | Rewrite the services offer (packages and anchors), not the pages. |
| Day 120 | GoHighLevel has earned $50+ inside its 120-day window; the first paid services job is done | Decide whether GoHighLevel stays at the centre or weight moves to whichever approved program converts. |
| Monthly | Clicks by `placement` (GA4 `affiliate_click`, `outbound_plain`), form submissions by "How did you find us?" | Move buttons and boxes to the placements that work. |

## 7. Conflicts between the reports (resolve before acting on them)

- **MailerLite's payout method.** The marketing-programs report says Tipalti. The demand report says its terms list final payouts "exclusively via PayPal". Read the current terms before building MailerLite pages. **Decided 7 October 2026: deferred.** No MailerLite pages until the programs in OPERATIONS §2 are running; read its terms then.
- **GetResponse, Brevo and other PartnerStack programs.** One report says the vendor's own external application link avoids the Network gate. Another treats the whole platform as blocked. Try the external links for Pipedrive and GetResponse; the result settles it. **Decided 7 October 2026:** the Pipedrive application (program 5 in OPERATIONS §2) uses the external link and settles it.
- **HighLevel trial links (resolved 6 October 2026).** HighLevel's help center said 30-day trial links were for affiliates with 100+ active customers, but the affiliate manager wrote that every affiliate has one (the HighLevel Bootcamp link). His written answer is what the site follows.
