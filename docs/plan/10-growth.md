# 10 — Growth beyond search

Search is the primary channel and the proven skill. Everything here is what makes search work faster, or what still works if search wobbles. Nothing here costs money.

## 1. The price-change newsletter — the one growth asset that compounds

**Promise on the form:** "One email when a price you care about changes. Nothing else."

**Why it is the right newsletter:**
- The content is produced by a job we already run (the Monday verification). Zero extra writing.
- It is the only email in the reader's inbox that is *worth* opening the week it arrives — a price change is a decision trigger.
- Every email links a pricing page, which is where the paid links are.
- It is unfakeable freshness: a subscriber who gets "Webflow raised CMS from $23 to $29 on 7 October" trusts every other number on the site.

**Build order (the sister site's lesson, inverted):** sender first, form second. See `07-tech-stack.md`. The form appears on pages only after the first real send. The form copy renders the job's own stats: "N alerts sent covering M changes since launch."

**Segmentation, later:** subscribe to one tool, one layer, or everything. Launch is "everything" only.

## 2. The dataset — links without asking

`/data/` with CC BY 4.0, `Dataset` schema and a citation block is the link-earning asset. Distribution, all free, all kept in sync by `publish-dataset.ts`:
- Kaggle dataset (the sister site got real downloads from one stale upload with no promotion)
- Hugging Face Datasets
- data.world
- A public GitHub repo `cinchstack/pricing-data` with a README that links back

Every quarter, one "State of small-business software pricing" post from the accumulated changelog: how many changes, which vendors raised, average increase. That post is the only "content marketing" we do, and it is data nobody else has.

## 3. Communities — answer, don't post

Rules-compliant, one hour a week, logged in `growth/community-log.md`:
- Subreddits: r/gohighlevel, r/hubspot, r/shopify, r/webflow, r/Notion, r/smallbusiness, r/Entrepreneur, r/marketing, r/SaaS.
- Find questions of the form "what does X cost / X vs Y / is X worth it". Answer with the real numbers **in the comment**, dated, and link the page only when it adds something the comment didn't. Never link-drop.
- Same on Indie Hackers, the vendors' own communities (GHL's Facebook group, Webflow forum), and Quora once a fortnight.
- Track: which answers get upvoted, which bring clicks (UTM `?src=reddit`).

## 4. Being where AI assistants look

Covered in `06-aeo-geo-bing.md`. The growth-relevant point: **every dataset mirror, every community answer with a dated number, and every changelog entry is a fresh, factual, attributable statement.** That is what answer engines pull. There is no separate "GEO campaign"; the operating model is the campaign.

## 5. Cross-site — the one link we control

bestaicertifications.com is a live, indexed site with an author entity that matches ours. Two honest cross-links:
- Its `/about/` author box → cinchstack.com ("also runs CinchStack, a software-pricing site").
- Our `/about/` → bestaicertifications.com.
No more than that. Two sites linking each other everywhere reads as a network.

## 6. Personalised outreach — only with a correction in hand

The sister site's outreach template — name one real error on the recipient's page, offer the correct figure, make no ask — got a reply on one of five emails. Ours is fed by the verification job: **when a vendor changes a price, every third-party page still showing the old price is a correction opportunity.** Five emails a month, each with a real error, no ask, to writers who cite pricing. Logged.

## 7. What we do not do

- **No paid ads, ever.** The model doesn't support it and GHL forbids brand bidding anyway.
- **No link buying, swaps or guest-post packages.**
- **No social media accounts at launch.** A dead Twitter account is worse than none. Revisit at 5,000 visitors/month.
- **No YouTube.** Not this year.
- **No "become an affiliate" content.** We sell software to businesses.
- **No content about content** — no "how we built this site" posts. Nobody buying HubSpot cares.
- **No launch on Product Hunt.** Wrong audience; the research fleet found it a graveyard for tools like this.
