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
    **Authorized on 6 October 2026:** Devesh Khatri, the affiliate manager, replied in writing that trial wording on our buttons is fine ("something like 'Start your Free Trial now'") and that every affiliate has a 30-day trial link, the **HighLevel Bootcamp** link in the dashboard (`https://www.gohighlevel.com/highlevel-bootcamp`). So the closing button on GoHighLevel's pricing page, review page and cost guides now reads "Start your 30-day free trial" and goes to that page with our referral code and Sub ID, with a note on what the trial charges (payment details at signup, usage fees during the trial, monthly billing after it). The wording, link and note live in `trialOffer` in `src/data/programs.json`, with his words in `authorized` and a dated copy of the page in `snapshots/gohighlevel/`. Comparison and stack pages keep the neutral "See GoHighLevel's plans and prices" buttons, so both tools in a comparison get the same kind of button. Comparison and alternatives tables may state the trial facts neutrally ("a 14-day trial from the pricing page, or 30 days through HighLevel's Bootcamp page") with no link, button or call to action beside them.
  - Keep the referral code `bestaicertifications30`. HighLevel's **Customize Token** would rename it, but sign-ups through links with the old code would stop counting, and the code is also on your other sites.
  - Comparisons with competitors must be truthful and fair and make clear we don't speak for HighLevel.
  - HighLevel reviews affiliate content for compliance.
- **Attribution:** last click within 90 days.
- **After your second referral**, HighLevel requires a live conversation with one of its team about your affiliate practices before it pays further commissions. Watch for their email and book it promptly.
- **Payouts:** through Tipalti, set up and complete since 28 August 2026 (HighLevel's email that day: "You are now ready to receive payment"; registration includes the tax form). Log in at https://suppliers.tipalti.com/HighLevel/account/Login with your usual Gmail address ("Forgot password?" there if needed) to see your payment method, tax form and payments. Don't reuse the registration link from the invitation email; it was one-time. Commissions are paid monthly, typically on the 15th, once they pass $50; if they don't reach $50 within 120 days, they may be forfeited. Payout questions: affiliatepayments@gohighlevel.com.
- **Reviewed by HighLevel (7 October 2026):** Devesh Khatri, the affiliate manager, looked at the live changes (the 30-day trial button, the note under it, keeping the referral code) and replied "Everything looks great!". He offered a call on Monday 12 October to help scale up: book it at speakwith.us/deveshkhatri. It's worth taking, and HighLevel requires a live conversation about affiliate practices after your second referral anyway.
- **Portal check (29 September 2026):** referral ID and the `fp_sid` Sub ID parameter confirmed; cinchstack.com added to the profile's Website field beside noderow.com; no clicks, commissions or payouts yet, so **Reports → Sub Ids** stays empty until the first real click.

### 1b. Systeme.io affiliate links (live since 27 September 2026)

Joining is automatic with a free systeme.io account; your affiliate ID is in `src/data/programs.json` (`"systeme-io"`). It pays 60% of every sale for as long as the customer stays subscribed, on the 10th of each month once you pass $30. **Payouts:** PayPal doesn't pay out to Pakistan, so choose wire transfer. systeme.io only lets you add it after your first affiliate sale.

- **Where the links are paid (since 6 October 2026):** only on Systeme.io pages that name no other tool, today `/tools/systeme-io/free-plan/` (listed in `rules.paidOnlyOn` in `src/data/programs.json`). The affiliate agreement says affiliates "may not use any other competitor trademarks in your promotion of systeme.io", and the Systeme.io review and pricing pages compare it with Kajabi, ClickFunnels and GoHighLevel by name, so they carry plain links for now. The build fails if a paid Systeme.io link appears anywhere else, and the content linter fails any Systeme.io guide that names another tracked tool.
- **The question is with Systeme.io:** emailed to support@systeme.io on 6 October 2026 (their desk acknowledged it and promised a reply within 24 hours; the reply arrives in your Gmail). If they say honest comparison pages are fine, delete `"paidOnlyOn"` from the program's `rules`: every Systeme.io button on the site becomes paid. If they say only pages without competitor names, keep it as it is and add new competitor-free Systeme.io guides to the list.
- systeme.io has no Sub IDs. Google Analytics `affiliate_click` events show which page sent each click.

### 1c. Your own setup services (live since 6 October 2026)

`/services/` sells your setup and automation work: five packages, a free 30-minute call, then a fixed quote. Prices, deliverables and the proof line live in `src/data/services.json`; change them there and the page, the cards and the structured data follow. The strategy behind it is in `docs/STRATEGY-2026-10.md`.

- **Enquiries** arrive through Netlify Forms (**Forms → services**). Netlify emails them to you only once form notifications are switched on (section 4); until then, nobody is told when one arrives. The page promises a reply within two business days.
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
| GoHighLevel | **Approved**, paid links live | See section 1. Devesh Khatri (affiliate manager) answered in writing on 6 October 2026: trial wording allowed, 30-day Bootcamp trial link available to every affiliate, referral code can be renamed but old links would stop counting. The 30-day trial button is live on GoHighLevel's own pages. He also invited you to HighLevel's affiliate strategy sessions (speakwith.us/deveshstrategy). On 7 October he reviewed the changes ("Everything looks great!") and offered a call on Monday 12 October (speakwith.us/deveshkhatri). |
| Systeme.io | **Approved**, paid links on its competitor-free pages | See section 1b. The comparison-page question was emailed to support@systeme.io on 6 October 2026; no answer by 7 October, checked again on 9 October. |
| HubSpot | Declined 30 September; reply sent 6 October 2026 | HubSpot's decline email invited more detail, so a reply went with the four live HubSpot pages and an honest note on traffic. No answer by 7 October; checked again on 9 October. |
| Semrush, Shopify, Squarespace, Wix | Declined | Don't re-apply until something real has changed (traffic of your own, or an invitation from the brand). |
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

**Answers to paste into the applications** (written 7 October 2026; keep them true as the site changes):

- **Website:** https://cinchstack.com
- **What the site is:** "CinchStack publishes what small-business software really costs: plan prices, add-ons and usage fees read from each vendor's own pricing page, with the date, and the real monthly bill at three team sizes. It covers 22 tools across CRM, e-commerce, websites, SEO, email and project management, and its dataset is open under CC BY 4.0."
- **How you will promote us:** "On [tool]'s pricing page, review and comparison pages, as clearly marked affiliate buttons beside dated price figures. Every page with a paid link carries a disclosure at the top. No coupon sites, no paid search on your brand, no email or social spam."
- **Traffic:** "A new site (launched 26 September 2026), so traffic is still small and comes from search. I'm applying now so the pages that already cover [tool] can carry your link." Don't inflate this; programs check.
- **Audience:** "Small-business owners buying software. Prices are shown in US dollars."
- **Other sites:** bestaicertifications.com (same editor).
- **Payout:** choose the Pakistan-friendly method in the table above. Never enter tax or bank details on a page reached from an unexpected email.

After a program approves you, tell Claude Code; it adds the program to `src/data/programs.json` with its link template, and the existing buttons turn into paid links. Tools not yet on the site (MailerLite, GetResponse, Thinkific, Teachable, beehiiv, Circle, Kartra) get pages only after the programs above are running. The reports behind these lists are summarised in `docs/STRATEGY-2026-10.md`.

- A decline that arrives within minutes comes from a brand's automatic rules, so re-applying with the same profile gets the same answer.
- Every program you apply to gets a record in `src/data/programs.json` with its real status. `/how-we-earn/` shows declined and never-applied programs alike as "Not joined", because neither pays us.
- **Scores:** the methodology promises the lower of the two blind scores for any tool whose program we have joined or may join. When a tool gets a program record for the first time, set its score in `src/data/scores/<tool>.json` to the lower pass score and say so in `method`. Squarespace went from 4.2 to 4.1 this way.
- When a program approves you, set its `status` to `"approved"`, its `approvedOn` date, and its `template` link in `src/data/programs.json`. Nothing else needs to change.
- Never enter tax, bank or ID details on a form you reached from a link in an email you didn't expect; open the network's site directly.

### 3. Search engines (done 27 September 2026)

- **Google Search Console**: domain property `cinchstack.com`, verified by a TXT record at Namecheap (leave that record in place). Sitemap submitted; indexing requested for the homepage, stacks, top pricing pages, a comparison and `/data/`.
- **Bing Webmaster Tools**: imported from Search Console, sitemap submitted by hand, and the 14 newer pricing pages submitted directly. Bing also feeds Copilot and ChatGPT search, so it matters as much as Google.
- **IndexNow runs as a hand-run drip since 7 October 2026** (decided that day; the reasoning is in `docs/plan/06-aeo-geo-bing.md`). `node scripts/indexnow.mjs <url-or-path> …` sends at most 10 URLs, at least 48 hours after the last batch, and only URLs never sent before or changed since. It first checks that each URL is live, canonical and in the sitemap, and that the key file `/7e1d5a9fc48a3143406369871a0b9f1b.txt` is deployed. `--dry-run` shows the payload without sending. Every batch is logged in `src/data/_indexnow.json`; commit the log after a run. Nothing sends automatically on a push.
- **"Page with redirect" in Search Console (email of 7 October 2026)** is expected. `cinchstack-site.netlify.app`, `main--cinchstack-site.netlify.app` and `www.` redirect to `cinchstack.com` on purpose, and so do paths without their trailing slash. No action needed.
- **What the engines held on 6 October 2026** (verified audit; Bing read through Yahoo and DuckDuckGo, Google through Startpage, because both block scripted queries):
  - **Bing:** exactly one URL, the homepage, and still the 19-30 August holding page ("Notify me"). Bing has not recrawled it since, although the sitemap and the 14 pricing pages were submitted on 27 September. Nothing on the site blocks Bingbot.
  - **Google:** about 30 URLs: home, trust pages, hubs, the 6 stacks, 7 reviews, 6 comparisons and one pricing page (HubSpot's). Missing: the GoHighLevel pricing page, the other 21 pricing pages, all 8 alternatives pages and the 11 guides (published 6 October).
  - **Your steps:** in Bing Webmaster Tools, confirm the site is still verified, run URL Inspection on `https://cinchstack.com/` and then Request indexing, check that the sitemap shows Success with 80 URLs, and record the status Bing gives the 14 pricing pages before submitting more. In Search Console, run URL Inspection on `/tools/gohighlevel/pricing/` and record the status, then request indexing about 10 a day in this order: GoHighLevel pricing, plans-compared, sms-and-calling-costs, ai-pricing, add-ons, the other GoHighLevel guides, the Systeme.io free-plan guide, then the alternatives pages.
- Search Console lets you request indexing for about 10 URLs a day. New pages are found through the sitemap anyway; requesting just speeds it up.

### 3b. Search and AI visibility: what's left (checked 28 September 2026)

The site itself is done: every page type has its structured data (software offers, reviews, FAQs, breadcrumbs, the dataset, the author profile), `robots.txt` names 25 crawler groups, including the AI assistants', and `llms.txt`, `agents.json` and the CC BY dataset at `/data/` are live. What's left happens outside the code:

| When | Task | Who |
|---|---|---|
| Daily until done | Request indexing in Search Console for the pages not yet indexed (about 10 a day). | You |
| Weekly | Search Console **Pages** and **Performance**; Bing Webmaster **Site Explorer** and **Search Performance**, including the AI queries export. | You |
| Every 2 days or more, until Bing holds the sitemap | IndexNow drip: the next 10 most useful URLs Bing doesn't hold yet (section 3). First batch sent 7 October 2026. Check Bing through Yahoo and DuckDuckGo before each batch and record what it holds here. | Claude Code |
| Once, then kept in sync | Mirror the `/data/` dataset, each copy linking back. It's the plan's main way to earn links and AI citations. | GitHub: `github.com/rohail524823/cinchstack-data` (public, CC BY 4.0, with `CITATION.cff`), published 7 October 2026. Its own workflow copies `/data/` every day and commits any change, so it needs nothing from this repository and keeps working once this one is private. Hugging Face: ready, waiting for one token (section 3c). Kaggle and data.world: not now (decided 7 October 2026). Revisit once Search Console shows the site ranking. |
| About an hour a week | Answer "what does X cost" and "X vs Y" questions on Reddit and vendor forums with the real, dated figure; link a page only when it adds something. When a vendor changes a price, email writers still quoting the old one (no ask). | You |
| Monthly, 10 minutes | Ask ChatGPT, Claude, Gemini, Perplexity and Copilot "what does [tool] cost" and "[A] vs [B] pricing"; note which cite CinchStack. | You |
| When you next edit bestaicertifications.com | Link its About page to cinchstack.com. CinchStack's About page already links back. | You |

Done on 7 October 2026: a social-preview image per page, built from the data at build time, and `/llms-full.txt`, the full text of every indexable page for AI assistants. Price changes already have an RSS feed (`/changes/rss.xml`, linked from `/changes/` and from every page's head; it is deliberately not listed as a sitemap, because its change dates differ from the pages' `lastmod`). The emailed newsletter waits until the site has about 500 visits a month (section 6).

### 3c. Dataset mirror on Hugging Face (ready to switch on)

The public GitHub copy, `github.com/rohail524823/cinchstack-data`, is already live and needs nothing from you (section 3b). The Hugging Face copy is optional, but it reaches a different audience of data and AI users.

`.github/workflows/dataset-mirror.yml` copies what cinchstack.com/data/ serves to a Hugging Face dataset after every successful live deploy check, with a dataset card (`scripts/assets/dataset-card.md`) that links back. It is off until it has a token. To switch it on (about 3 minutes):

1. On huggingface.co, signed in as `rohailnisar`: **Settings → Access Tokens → Create new token**, type **Write**. Copy it.
2. On GitHub, in `rohail524823/cinchstack`: **Settings → Secrets and variables → Actions → New repository secret**, name `HF_TOKEN`, paste the token.
3. **Actions → Dataset mirror → Run workflow** (or wait for the next deploy). It creates `huggingface.co/datasets/rohailnisar/cinchstack-software-pricing` and keeps it in step with the site from then on. A repository variable `HF_DATASET` publishes it under another name instead.

### 4. Contact form (done 27 September 2026)

The "Report a wrong price" form uses Netlify Forms. Form detection is on, and submissions are stored in Netlify under **Forms → contact**.

**Email alerts for both forms are not switched on yet.** A labelled test sent through the services form on 6 October 2026 never reached Gmail, and no CinchStack form email has ever arrived. To switch them on (one minute): Netlify → the cinchstack project → **Project configuration** (Site configuration on older screens) → **Notifications** → **Emails and webhooks** → **Form submission notifications** → **Add notification** → **Email notification**; event **New form submission**, form **Any form**, your Gmail address. Then delete the test entry ("Claude Code test (please ignore)") under **Forms → services**, and look through both forms' lists, including the spam tab, for anything missed since 27 September.

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

**Decided 7 October 2026: not yet.** An email list needs readers first, and the RSS feed at `/changes/rss.xml` already lets anyone follow changes. Switch it on once Analytics shows about 500 visits a month.

To switch it on (about 20 minutes, free):

1. In your existing Systeme.io account, create a contact tag such as `price-alerts` and a simple opt-in page with an email field (Systeme.io's free plan includes 2,000 contacts and unlimited email sends; check that its email footer shows an unsubscribe link and your business address before the first send).
2. Send the opt-in page's URL to Claude Code. It goes into `ALERTS_URL` in `src/lib/site.mjs`, and the button, its Analytics event (`alerts_click`) and the privacy paragraph appear on the next deploy.
3. When the Monday check finds a change (it opens a GitHub issue) and the change is logged on `/changes/`, send one short email to the `price-alerts` tag in Systeme.io: the tool, the old and new price, the date, and a link to the pricing page. Claude Code can draft it from the changelog entry.

### 7. Access for Claude Code (optional, added 7 October 2026)

Claude Code already reaches Gmail, GitHub, Hugging Face (read only) and DataForSEO. Three more grants would let it check indexing, enquiries and traffic itself instead of asking you. Connectors and environment variables load when a session starts, so add them, then start a new session. Never paste a key into the chat.

| Add | How | What Claude Code can then do | Still yours |
|---|---|---|---|
| **Netlify connector** | claude.ai → Settings → Connectors → Netlify | Read form enquiries and deploys directly | The email-alert switch in section 4, unless the connector turns out to offer it |
| **Google service account**, as the environment variable `GOOGLE_SERVICE_ACCOUNT_JSON` | In Google Cloud, create a project, enable the **Search Console API** and the **Google Analytics Data API**, create a service account and download a JSON key. Add the service account's email in Search Console (**Settings → Users and permissions**, Restricted) and in GA4 (**Admin → Property access management**, Viewer). Then put the key in the environment's settings: the cloud environment menu in the session's title bar → **Edit** → environment variables. | See which pages Google has indexed, the queries each page shows for, and the `affiliate_click` and `generate_lead` counts | **Request indexing**: Google's API has no such call, so that click stays manual |
| **Bing Webmaster API key**, as `BING_WEBMASTER_API_KEY` | Bing Webmaster Tools → **Settings → API access → API key**; store it the same way | Read what Bing holds and its crawl errors directly instead of through Yahoo; that reading decides when IndexNow goes on (section 3b) | — |
| **DataForSEO credit** | The connector is added, but the balance is empty (it answers 402) | Track rankings, and whether ChatGPT, Perplexity and Google's AI answers mention CinchStack | — |

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
