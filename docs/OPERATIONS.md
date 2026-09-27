# Running CinchStack

This is the owner's manual. It covers the few things only you can do, the jobs that run by themselves, and how to change the site safely.

## Things only you can do

### 1. Switch on the GoHighLevel affiliate link

GoHighLevel has approved you, but the site has no referral link yet, so every GoHighLevel button is a plain link that earns nothing.

1. Log in to the HighLevel affiliate portal and copy your referral link. It looks like `https://www.gohighlevel.com/?fp_ref=yourcode`.
2. Open `src/data/programs.json`, find the `"gohighlevel"` entry, and replace `"template": null` with your link in quotes:

   ```json
   "template": "https://www.gohighlevel.com/?fp_ref=yourcode",
   ```

3. Commit to `main`. Netlify rebuilds in about two minutes.

What changes on the site: GoHighLevel buttons turn amber and carry `rel="sponsored"`, a disclosure line appears at the top of every page that has one, HighLevel's required wording appears under it, and `/how-we-earn/` updates itself. You do not need to edit any page.

If the portal gives you a link that can point at any page (for example one with `{url}` in it), you can use `{url_enc}` in the template and the site will send readers to the exact GoHighLevel page they clicked.

### 2. Apply to the other programs, in this order

The plan is to apply once the site has real traffic (about 1,000 visits a month), because networks approve sites that already have readers. The order and the reasons are in `docs/plan/09-affiliate-programs.md`. When a program approves you, set its `status` to `"approved"`, its `approvedOn` date, and its `template` link in `src/data/programs.json`. Nothing else needs to change.

### 3. Tell search engines the site exists

1. **Google Search Console**: add the domain property `cinchstack.com` (DNS verification at your domain registrar), then submit `https://cinchstack.com/sitemap.xml`.
2. **Bing Webmaster Tools**: sign in and choose "Import from Google Search Console". Bing also feeds Copilot and ChatGPT search, so this matters as much as Google.
3. Leave both alone for two weeks. New sites take time to be crawled.

## Jobs that run by themselves

| Job | When | What it does |
|---|---|---|
| Netlify build | every push to `main` | Builds the site and runs every quality gate. If a gate fails, the old site stays live. |
| CI | every push and pull request | The same build, on GitHub, so problems show before merging. |
| Weekly price check | Mondays 07:00 UTC | Re-opens every vendor page a price came from and confirms the price is still there. Writes the result to `src/data/_checks.json`, which each pricing page shows. If a price has disappeared, it opens a GitHub issue labelled `price-change`. |

The weekly check never changes a price by itself. A changed price needs a person (or Claude Code) to capture the new page, update the record and log the change.

## Handling a price change

When the weekly check opens an issue, or a reader reports a wrong price:

1. Capture the vendor page: `node scripts/snapshot.mjs <tool> <url> --label pricing`.
2. Update `src/data/pricing/<tool>.json` from the new snapshot. Add a line to `history`.
3. Add an entry to `src/data/changelog.json` with `kind: "price-change"`, the old and new price, and the source URL. It appears on `/changes/`, in the RSS feed and on the homepage.
4. Run `npm run validate` and `npm run build`. The build fails if any prose still quotes the old price, so you will see every page that needs a word changed.

The easiest way to do all of this is to paste the issue into Claude Code and ask it to follow this section.

## Adding a tool or a page

- **A tool**: follow `docs/prompts/pricing-research.md` to create `src/data/pricing/<tool>.json` and `src/data/tools/<tool>.json`. Add a pricing page by writing `src/content/pricing/<tool>.mdx` and `src/data/faq/pricing--<tool>.json` using `docs/prompts/content-writing.md`.
- **A comparison, stack or alternatives page**: same brief. A page exists only when both its prose and its data exist, so nothing half-finished goes live.
- Run `node scripts/lint-content.mjs <file.mdx>` while writing, then `npm run dates` and `npm run build` before committing.

## The quality gates, briefly

`npm run build` fails when any page:

- quotes a dollar figure that is not in the pricing data,
- shows a paid link without a disclosure above it, or without `rel="sponsored"`,
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
