# Running CinchStack

This is the owner's manual. It covers the few things only you can do, the jobs that run by themselves, and how to change the site safely.

## Things only you can do

### 1. GoHighLevel affiliate links (live since 27 September 2026)

GoHighLevel is the one approved program, and its buttons are now paid links. The HighLevel affiliate account (portal: `gohighlevel.firstpromoter.com`, payouts through Tipalti) is shared with your other sites, so CinchStack's links keep the account's referral code and add a **Sub ID** naming the page each link sits on:

```
https://www.gohighlevel.com/pricing?fp_ref=bestaicertifications30&fp_sid=cinchstack-tools-gohighlevel-pricing
```

- In the portal, **Reports → Sub Ids** shows signups and commissions per Sub ID. Every CinchStack Sub ID starts with `cinchstack-`, so this site's results never mix with the other sites', and you can see which page earns.
- Don't use **Customize Token**: it changes the referral code for every site at once and breaks the links already placed elsewhere.
- The link format lives in one place: the `template` of `"gohighlevel"` in `src/data/programs.json` (`{url}?fp_ref=…&fp_sid={sid}`). `{sid}` becomes the page's Sub ID and `{url}` the GoHighLevel page the button names. No page needs editing.
- What readers see: amber buttons with `rel="sponsored"`, a "Paid link: we earn a commission if you buy." note under every amber button, a disclosure at the top of every page that has one, HighLevel's required wording under it, and `/how-we-earn/` listing the program as live. In Google Analytics, clicks arrive as `affiliate_click`; star it as a key event once it shows up in **Admin → Events**.
- **HighLevel's rules (Program Policies, June 2026):**
  - The disclosure must sit as close as possible to each link, which is why every amber button has its own note; the build fails if one is missing.
  - No coupons, discounts, free-trial offers or other incentives unless HighLevel authorizes them in writing.
  - Comparisons with competitors must be truthful and fair and make clear we don't speak for HighLevel.
  - HighLevel reviews affiliate content for compliance.
- **Attribution:** last click within 90 days.
- **After your second referral**, HighLevel requires a live conversation with one of its team about your affiliate practices before it pays further commissions. Watch for their email and book it promptly.
- **Payouts:** through Tipalti, set up and complete since 28 August 2026 (HighLevel's email that day: "You are now ready to receive payment"; registration includes the tax form). Log in at https://suppliers.tipalti.com/HighLevel/account/Login with rohail.nisar786@gmail.com ("Forgot password?" there if needed) to see your payment method, tax form and payments. Don't reuse the registration link from the invitation email; it was one-time. Commissions are paid monthly, typically on the 15th, once they pass $50; if they don't reach $50 within 120 days, they may be forfeited. Payout questions: affiliatepayments@gohighlevel.com.
- **Portal check (29 September 2026):** referral ID and the `fp_sid` Sub ID parameter confirmed; cinchstack.com added to the profile's Website field beside noderow.com; no clicks, commissions or payouts yet, so **Reports → Sub Ids** stays empty until the first real click.

### 1b. Systeme.io affiliate links (live since 27 September 2026)

Joining is automatic with a free systeme.io account; your affiliate ID is in `src/data/programs.json` (`"systeme-io"`). It pays 60% of every sale for as long as the customer stays subscribed, on the 10th of each month once you pass $30. **Payouts:** PayPal doesn't pay out to Pakistan, so choose wire transfer. systeme.io only lets you add it after your first affiliate sale.

- **Where the links are paid (since 6 October 2026):** only on Systeme.io pages that name no other tool, today `/tools/systeme-io/free-plan/` (listed in `rules.paidOnlyOn` in `src/data/programs.json`). The affiliate agreement says affiliates "may not use any other competitor trademarks in your promotion of systeme.io", and the Systeme.io review and pricing pages compare it with Kajabi, ClickFunnels and GoHighLevel by name, so they carry plain links for now. The build fails if a paid Systeme.io link appears anywhere else, and the content linter fails any Systeme.io guide that names another tracked tool.
- **The question is with Systeme.io:** emailed to support@systeme.io on 6 October 2026 (their desk acknowledged it and promised a reply within 24 hours; the reply arrives in your Gmail). If they say honest comparison pages are fine, delete `"paidOnlyOn"` from the program's `rules`: every Systeme.io button on the site becomes paid. If they say only pages without competitor names, keep it as it is and add new competitor-free Systeme.io guides to the list.
- systeme.io has no Sub IDs. Google Analytics `affiliate_click` events show which page sent each click.

### 1c. Your own setup services (live since 6 October 2026)

`/services/` sells your setup and automation work: five packages, a free 30-minute call, then a fixed quote. Prices, deliverables and the proof line live in `src/data/services.json`; change them there and the page, the cards and the structured data follow. The strategy behind it is in `docs/STRATEGY-2026-10.md`.

- **Enquiries** arrive through Netlify Forms (**Forms → services**), emailed to the Netlify account's address like the contact form. The page promises a reply within two business days.
- **Upwork rules (keep them exactly):**
  - Never link `/services/` or cinchstack.com from your Upwork profile or portfolio. Linking the other way (CinchStack → Upwork profile) is fine.
  - A client who found you on CinchStack is yours to invoice directly. The form's required "How did you find us?" answer, with its timestamp, is your record. If someone says they found you on Upwork, continue on Upwork.
  - Existing Upwork clients stay on Upwork.
  - Plain text "Top Rated on Upwork" only, no Upwork logo. Update the "as of" figures in `services.json` when they change.
- **Getting paid:**
  - Default: a Payoneer payment request. Ask US clients to pay by ACH (1%) rather than card.
  - Larger invoices (about $2,000 or more): a bank wire. Ask your bank for an ePRC with the IT purpose code.
  - Clients who want escrow: send an Upwork Direct Contract from your account (5% fee, or 0% on Freelancer Plus).
  - Not usable for services: Stripe, PayPal, Wise receiving, Lemon Squeezy, Paddle.
- **Measuring it:** a sent services form fires the Google Analytics event `generate_lead` (with the package and the "how did you find us" answer, never the message or contact details). In GA4 **Admin → Events**, mark `generate_lead` as a key event once it first appears.
- **The same-price rule** is published on `/how-we-earn/#our-own-services`: setup costs the same whichever tool the client picks. The "Our own paid service" box sits after the FAQ on tool, pricing, compare, stack and alternatives pages, and a build gate keeps it out of editorial text, scores, tables and picks.

### 2. Affiliate programs: status and what to apply to next (updated 6 October 2026)

**Why most applications failed.** Impact lets each brand switch on a ready-made workflow, "Reject non-qualifying partners", that automatically declines small partners from outside the brand's chosen countries. Shopify, Squarespace and Wix declined within minutes, and Squarespace's agency confirmed the reason in writing: location. Traffic won't fix that rule soon, so don't keep re-applying to those brands. Semrush ("Business model mismatch") and HubSpot (generic list) declined too. PartnerStack's Network also declined, and that blocks its Marketplace buttons.

| Program | Status | Next step |
|---|---|---|
| GoHighLevel | **Approved**, paid links live | See section 1. Questions about trial wording, an extended-trial page and a CinchStack referral slug were emailed to the affiliate manager (Devesh Khatri) on 6 October 2026. Until HighLevel answers in writing, no trial wording appears near its links. |
| Systeme.io | **Approved**, paid links on its competitor-free pages | See section 1b. The comparison-page question was emailed to support@systeme.io on 6 October 2026. |
| HubSpot, Semrush, Shopify, Squarespace, Wix | Declined | Don't re-apply until something real has changed (traffic of your own, or an invitation from the brand). |
| Klaviyo | Agency and tech partners only | No affiliate program to join. |
| Notion | Closed to new partners | Check again in 2027. |
| Webflow, Kit, ActiveCampaign | PartnerStack | Locked until the PartnerStack Network approves you. Re-apply to the Network with a @cinchstack.com email address and a matching LinkedIn profile. |

**Apply to these now.** They pay into a Pakistani bank, Payoneer or Tipalti, and they don't go through Impact's location filter. Programs for tools already on the site come first, because the pages that will carry their links already exist.

| # | Program | Why | Sign-up | Paid by |
|---|---|---|---|---|
| 1 | **SE Ranking** (on the site) | 30% of every payment for the customer's lifetime; no approval: join from the Affiliate Program tab inside any SE Ranking account, even a trial | https://seranking.com/sign-up.html | Payoneer, $50 minimum, every 14 days |
| 2 | **ClickFunnels** (on the site) | 30% recurring | https://www.clickfunnels.com/affiliate-program | Tipalti (the same payee setup as HighLevel). Forfeits commissions under $100 per 120 days. |
| 3 | **Framer** (on the site) | 50% for 12 months | https://www.framer.com/community/?settings=open&settingsTab=links | Dub → Pakistani bank, $200 minimum |
| 4 | **Zoho** (Zoho CRM is on the site) | 15–20% for 12 months; in-house | https://www.zoho.com/affiliate/signup.html | Wire, $100 minimum |
| 5 | **Pipedrive** (on the site) | 20% for 12 months. Use this external link, not the PartnerStack Marketplace button. | https://dash.partnerstack.com/application?company=pipedrive&group=risingaffiliatet3 | PartnerStack direct deposit (Airwallex lists Pakistan) to a PKR account |
| 6 | **Automattic** (WooCommerce is on the site) | "No minimum traffic required" | https://app.impact.com/campaign-mediapartner-signup/Automattic-Inc.brand?type=dm&io=vQ3rTDgl1c8sLLE2AjebfUHsFZrQnzSBZlKopA6Fk3cAprN9qQSpWq7BCfuwlxkV | Impact wire (PKR) |
| 7 | **hosting.com** | 50%, up to $400 per hosting sale; fills the hosting line on WordPress/WooCommerce pages | https://hosting.firstpromoter.com/signup/42825 | Bank wire on request, $100 minimum |
| 8 | **Hostinger** | Up to 40% of first purchases; n8n self-hosting pages | https://affiliates.hostinger.com/users/signup/ | Bank transfer, $500 minimum |

After a program approves you, tell Claude Code; it adds the program to `src/data/programs.json` with its link template, and the existing buttons turn into paid links. Tools not yet on the site (MailerLite, GetResponse, Thinkific, Teachable, beehiiv, Circle, Kartra) get pages only after the programs above are running. The reports behind these lists are summarised in `docs/STRATEGY-2026-10.md`.

- A decline that arrives within minutes comes from a brand's automatic rules, so re-applying with the same profile gets the same answer.
- Every program you apply to gets a record in `src/data/programs.json` with its real status. `/how-we-earn/` shows declined and never-applied programs alike as "Not joined", because neither pays us.
- **Scores:** the methodology promises the lower of the two blind scores for any tool whose program we have joined or may join. When a tool gets a program record for the first time, set its score in `src/data/scores/<tool>.json` to the lower pass score and say so in `method`. Squarespace went from 4.2 to 4.1 this way.
- When a program approves you, set its `status` to `"approved"`, its `approvedOn` date, and its `template` link in `src/data/programs.json`. Nothing else needs to change.
- Never enter tax, bank or ID details on a form you reached from a link in an email you didn't expect; open the network's site directly.

### 3. Search engines (done 27 September 2026)

- **Google Search Console**: domain property `cinchstack.com`, verified by a TXT record at Namecheap (leave that record in place). Sitemap submitted; indexing requested for the homepage, stacks, top pricing pages, a comparison and `/data/`.
- **Bing Webmaster Tools**: imported from Search Console, sitemap submitted by hand, and the 14 newer pricing pages submitted directly. Bing also feeds Copilot and ChatGPT search, so it matters as much as Google.
- **IndexNow** stays off until Bing shows healthy indexing (see `docs/plan/06-aeo-geo-bing.md`).
- Search Console lets you request indexing for about 10 URLs a day. New pages are found through the sitemap anyway; requesting just speeds it up.

### 3b. Search and AI visibility: what's left (checked 28 September 2026)

The site itself is done: every page type has its structured data (software offers, reviews, FAQs, breadcrumbs, the dataset, the author profile), `robots.txt` names 25 crawler groups, including the AI assistants', and `llms.txt`, `agents.json` and the CC BY dataset at `/data/` are live. What's left happens outside the code:

| When | Task | Who |
|---|---|---|
| Daily until done | Request indexing in Search Console for the pages not yet indexed (about 10 a day). | You |
| Weekly | Search Console **Pages** and **Performance**; Bing Webmaster **Site Explorer** and **Search Performance**, including the AI queries export. | You |
| From about 11 October | If Bing shows pages indexed, switch on IndexNow for changed pages only, at most 10 per run (`docs/plan/06-aeo-geo-bing.md`). | Claude Code |
| Once, then kept in sync | Mirror the `/data/` dataset to Hugging Face, a public GitHub repo, Kaggle and data.world, each linking back. It's the plan's main way to earn links and AI citations. | Claude Code can publish the first two with your go-ahead; Kaggle and data.world need you. |
| About an hour a week | Answer "what does X cost" and "X vs Y" questions on Reddit and vendor forums with the real, dated figure; link a page only when it adds something. When a vendor changes a price, email writers still quoting the old one (no ask). | You |
| Monthly, 10 minutes | Ask ChatGPT, Claude, Gemini, Perplexity and Copilot "what does [tool] cost" and "[A] vs [B] pricing"; note which cite CinchStack. | You |
| When you next edit bestaicertifications.com | Link its About page to cinchstack.com. CinchStack's About page already links back. | You |

Optional later: a social-preview image per page (every page uses one image today), `llms-full.txt`, and the price-change newsletter (`docs/plan/10-growth.md`).

### 4. Contact form (done 27 September 2026)

The "Report a wrong price" form uses Netlify Forms. Form detection is on, and each submission is emailed to the Netlify account's address. Submissions also appear in Netlify under **Forms → contact**.

### 5. Analytics (on since 27 September 2026)

Google Analytics 4 property "CinchStack", Measurement ID `G-YVPC1K7T3X`: event data kept 14 months, Google signals off, linked to Search Console. A custom channel group, "Channels incl. AI assistants", separates visits from ChatGPT, Perplexity, Claude, Gemini, Copilot and similar.

One line controls it: `GA_ID` in `src/lib/site.mjs`.

- **Empty** (off): no script ships, and the `Content-Security-Policy` in `netlify.toml` must keep `script-src 'none'`.
- **Set to your `G-…` Measurement ID** (on): every page loads `/site.js` (the only script on the site), and the policy must allow Google's tag: `script-src 'self' https://*.googletagmanager.com`, plus the `connect-src` and `img-src` hosts listed in `scripts/check.mjs`.

The build fails if the two disagree, so analytics can't be half on.

What `/site.js` does, as the privacy notice explains to readers:

- Visitors whose device time zone is in the EEA, the UK or Switzerland (or can't be read) see a notice, and nothing loads until they choose Allow.
- Everyone else is measured by default and can turn it off at `/privacy/#analytics`.
- A browser that sends Global Privacy Control is never measured.
- Google signals and ad personalization are off, and cookies expire after 13 months at most.
- Clicks on vendor buttons are sent as `affiliate_click` (paid links) or `outbound_plain` (plain links), each with `tool`, `placement` and `page`.

In GA4, `tool`, `placement` and `page` are registered as event-scoped custom dimensions (Tool, Placement, Clicked from page), so reports can show which button on which page sent a reader to a vendor. Key events: star `outbound_plain` in **Admin → Events** once it appears there (a reader clicked through to a vendor), and `affiliate_click` once a paid link is live.

Checking your own site in a browser counts as a visit. To stop that, open `/privacy/#analytics` in each browser you use and choose **Turn analytics off**.

In browser developer tools, Google's measurement requests may show as failed or aborted. They are sent without waiting for a reply, so that is expected; the Realtime report is the real test. Don't star the built-in `click` event: it counts every outbound link, including source links, so it overstates buying intent.

### 6. Price-change alerts (ready to switch on)

The site can offer "Get an email when these prices change" on every pricing page, every guide and `/changes/`, plus a matching paragraph in the privacy notice. It stays hidden until there is a working list to send from, so the site never promises an email nobody sends.

To switch it on (about 20 minutes, free):

1. In your existing Systeme.io account, create a contact tag such as `price-alerts` and a simple opt-in page with an email field (Systeme.io's free plan includes 2,000 contacts and unlimited email sends; check that its email footer shows an unsubscribe link and your business address before the first send).
2. Send the opt-in page's URL to Claude Code. It goes into `ALERTS_URL` in `src/lib/site.mjs`, and the button, its Analytics event (`alerts_click`) and the privacy paragraph appear on the next deploy.
3. When the Monday check finds a change (it opens a GitHub issue) and the change is logged on `/changes/`, send one short email to the `price-alerts` tag in Systeme.io: the tool, the old and new price, the date, and a link to the pricing page. Claude Code can draft it from the changelog entry.

## Jobs that run by themselves

| Job | When | What it does |
|---|---|---|
| Netlify build | every push to `main` | Builds the site and runs every quality gate. If a gate fails, the old site stays live. |
| CI | every push and pull request | The same build, on GitHub, so problems show before merging. |
| Live deploy check | every push to `main` | Waits for cinchstack.com to serve the pushed commit (from `/version.txt`), then loads key pages. If the deploy never goes live, the run fails and GitHub emails you. This replaces Netlify's deploy-failed email, which needs a paid plan. |
| Weekly price check | Mondays 07:00 UTC | Re-opens every vendor page a price came from and confirms the price is still there. Writes the result to `src/data/_checks.json`, which each pricing page shows. If a price has disappeared, it opens a GitHub issue labelled `price-change`. |

The weekly check never changes a price by itself. A changed price needs a person (or Claude Code) to capture the new page, update the record and log the change.

## Handling a price change

When the weekly check opens an issue, or a reader reports a wrong price:

1. Capture the vendor page: `node scripts/snapshot.mjs <tool> <url> --label pricing`.
2. Update `src/data/pricing/<tool>.json` from the new snapshot. Add a line to `history`.
3. Add an entry to `src/data/changelog.json` with `kind: "price-change"`, the old and new price, and the source URL. It appears on `/changes/`, in the RSS feed and on the homepage.
4. Run `npm run validate` and `npm run build`. The build fails if any prose still quotes the old price, so you will see every page that needs a word changed.

The easiest way to do all of this is to paste the issue into Claude Code and ask it to follow this section.

### Dated claims to revisit

Some pages quote a price that a vendor has already said will change on a set date. The weekly check can't catch these, because the old figure stays on the vendor's page. Reword them once the date passes.

| After | Page | What changes |
|---|---|---|
| No end date given; check monthly | `/tools/hubspot/pricing/` (and `src/data/pricing/hubspot.json`, solo scenario) | HubSpot's "limited-time" $10 Starter seat for new customers. When it ends, the solo bill uses the $20 list seat. |
| No end date given; check monthly | `/tools/clickfunnels/pricing/` | ClickFunnels' "Unlimited Funnels — Limited Time" label. |
| No end date given; check monthly | `/tools/klaviyo/pricing/` | Klaviyo's $19-off first month on the 500-profile Email tier. |

Recently closed: Kajabi's Expert Agent introductory rate (ended 30 September 2026, reworded 1 October); Klaviyo's introductory add-on prices (ended 30 September 2026; Social Marketing is now $50, recorded 6 October); GoHighLevel's WhatsApp billing change (in force since 1 October 2026, reworded 6 October).

## Adding a tool or a page

- **A tool**: follow `docs/prompts/pricing-research.md` to create `src/data/pricing/<tool>.json` and `src/data/tools/<tool>.json`. Add a pricing page by writing `src/content/pricing/<tool>.mdx` and `src/data/faq/pricing--<tool>.json` using `docs/prompts/content-writing.md`.
- **A comparison, stack or alternatives page**: same brief. A page exists only when both its prose and its data exist, so nothing half-finished goes live.
- **A cost guide** (`/tools/<tool>/<topic>/`): write `src/content/guides/<tool>--<topic>.mdx` (with its own `h1`) and `src/data/faq/guides--<tool>--<topic>.json`, same brief. The tool's pricing and review pages and the homepage list it automatically. `<UsageMatrix />` renders GoHighLevel's usage bill for texts × emails from the recorded rates. A guide for a tool whose program limits paid links (Systeme.io) must name no other tool, and its path must be added to that program's `paidOnlyOn` for its links to be paid.
- Run `node scripts/lint-content.mjs <file.mdx>` while writing, then `npm run dates` and `npm run build` before committing.

## The quality gates, briefly

`npm run build` fails when any page:

- quotes a dollar figure that is not in the pricing data,
- shows a paid link without a disclosure above it, without a "Paid link" note beside it, or without `rel="sponsored"`,
- shows amber styling on a link that does not pay,
- has a broken internal link or a link to a missing section,
- has an FAQ or breadcrumb that differs from its structured data,
- makes a first-hand claim ("we tested"), an earnings claim, a coupon claim, or uses hype words,
- repeats a sentence used on more than three pages,
- is missing from the sitemap, or sits more than three clicks from the homepage.

These rules exist so that the site stays trustworthy as it grows. If a rule blocks something you believe is right, change the rule in `scripts/check.mjs` deliberately, not the page around it.

## Useful commands

```bash
npm run dev            # local preview at http://localhost:4321
npm run build          # full build plus every gate
npm run validate       # check the data files only
npm run dates          # refresh page dates from git before committing content
npm run verify-prices  # the weekly price check, run by hand
node scripts/lint-content.mjs --all   # check every draft page
```
