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
- **Payouts:** Tipalti is selected in the portal. Tax forms (W-8BEN) are completed inside Tipalti, so log in there once and confirm yours shows as submitted. Commissions are paid monthly, typically on the 15th, once they pass $50; if they don't reach $50 within 120 days, they may be forfeited.
- **Portal check (29 September 2026):** referral ID and the `fp_sid` Sub ID parameter confirmed; cinchstack.com added to the profile's Website field beside noderow.com; no clicks, commissions or payouts yet, so **Reports → Sub Ids** stays empty until the first real click.

### 1b. Systeme.io affiliate links (live since 27 September 2026)

Joining is automatic with a free systeme.io account; your affiliate ID is in `src/data/programs.json` (`"systeme-io"`). It pays 60% of every sale for as long as the customer stays subscribed, on the 10th of each month once you pass $30. **Payouts:** PayPal doesn't pay out to Pakistan, so choose wire transfer. systeme.io only lets you add it after your first affiliate sale.

- **Where the links are paid:** only on Systeme.io's own pages (`/tools/systeme-io/` and its pricing page). The affiliate agreement says affiliates "may not use any other competitor trademarks in your promotion of systeme.io". Until systeme.io confirms that honest comparison pages are fine, pages that compare Systeme.io with GoHighLevel, Kajabi and others keep plain Systeme.io links. The build fails if a paid Systeme.io link appears anywhere else.
- **To widen it** once systeme.io says comparisons are fine (ask through https://systeme.io/support/contact-us): delete `"paidOnlyOn"` from the program's `rules` in `src/data/programs.json`. Nothing else changes.
- systeme.io has no Sub IDs. Google Analytics `affiliate_click` events show which page sent each click.

### 2. The other affiliate programs (status on 27 September 2026)

The plan was to apply once the site has real traffic (about 1,000 visits a month), because networks approve sites that already have readers. Several were applied to early, on 27 September 2026, through Impact. There an application comes from the whole partner account (7439310, which holds cinchstack.com and bestaicertifications.com), so there is no per-site choice. Brands see bestaicertifications.com listed first, with Impact's own traffic estimate and Moz scores, and no figures yet for cinchstack.com.

| Program | Status | Next step |
|---|---|---|
| Semrush, HubSpot | Pending under **Discover → Invitations → Sent** | Wait. |
| Squarespace | Declined within minutes | A re-evaluation request went to squarespace@accelerationpartners.com, as their decline email invites. Wait for the answer. |
| Wix | Declined within minutes | A note went through Wix's chat on Impact. Wait for the answer. |
| Shopify | Declined within minutes | No way to appeal: no message button, and Shopify gives no feedback. Re-apply once cinchstack.com has about 1,000 visits a month. |
| Klaviyo, Automattic (WooCommerce) | No Apply button | Invitation only, or the account doesn't meet their criteria yet. Klaviyo can be asked for an invitation through its message button. |
| Webflow (PartnerStack) | Form filled in on webflow.com, not submitted | Submit it. If PartnerStack locks it the way it locked Kit's, apply to the PartnerStack Network first. |
| Kit (PartnerStack) | Locked, not submitted | PartnerStack locks new programs until you earn a first commission in a program you're already in, and your account has none (n8n and ActiveCampaign both declined it). Apply to the PartnerStack Network (**Discover Partnerships → Apply to the Network**), then apply to Kit again. |
| Notion (PartnerStack) | Not accepting new partners | Check again in a few months. |

- **Decision (27 September 2026): hold every new and repeat application until cinchstack.com itself shows about 1,000 visits a month in Search Console or Analytics.** That includes the PartnerStack Network: a declined applicant may reapply only "in the future", with no date given, and brands on PartnerStack can block a partner they decline from applying again. Review in early December 2026. Semrush and HubSpot stay pending in the meantime; don't withdraw them.
- A decline that arrives within minutes comes from a brand's automatic rules, so re-applying with the same profile gets the same answer. Impact shows a **Re-apply** button on declined brands; use it only after something has changed, above all cinchstack.com's own traffic.
- Every program you apply to gets a record in `src/data/programs.json` with its real status. `/how-we-earn/` shows declined and never-applied programs alike as "Not joined", because neither pays us.
- **Scores:** the methodology promises the lower of the two blind scores for any tool whose program we have joined or may join. When a tool gets a program record for the first time, set its score in `src/data/scores/<tool>.json` to the lower pass score and say so in `method`. Squarespace went from 4.2 to 4.1 this way.
- When a program approves you, set its `status` to `"approved"`, its `approvedOn` date, and its `template` link in `src/data/programs.json`. Nothing else needs to change. The order and the reasons are in `docs/plan/09-affiliate-programs.md`.

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

Some pages quote a price that a vendor has already said will change on a set date. The weekly check can't catch these, because the old figure stays on the vendor's page. Reword them once the date passes:

| After | Page | What changes |
|---|---|---|
| 30 Sep 2026 | `/tools/kajabi/pricing/` | Kajabi's Expert Agent introductory rate ($49 per agent a month) ends; new agents pay the $79 standard rate. |

## Adding a tool or a page

- **A tool**: follow `docs/prompts/pricing-research.md` to create `src/data/pricing/<tool>.json` and `src/data/tools/<tool>.json`. Add a pricing page by writing `src/content/pricing/<tool>.mdx` and `src/data/faq/pricing--<tool>.json` using `docs/prompts/content-writing.md`.
- **A comparison, stack or alternatives page**: same brief. A page exists only when both its prose and its data exist, so nothing half-finished goes live.
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
