# Cardio Checkup Playbook

Step-by-step process for taking a client site → SEO-optimized content in Notion.
Written from the Cardio Checkup engagement; generalize placeholders (`{client}`, `{site_url}`, `{city}`) for reuse.

## Step 0 — Scope & inputs (get before starting)
- Live site URL: `{site_url}`
- Source repo / access (needed if site is JS-rendered or bot-blocked — pull content from source, not scraping).
- **Audience** (e.g. patients vs B2B).
- **Market + language** (e.g. FR primary, EN secondary).
- **Location/city** `{city}` — required for local SEO keywords.
- Git branch for deliverables: `{branch}`.

## Step 1 — Analyze the site
- Read the live site or its source. Identify every page/view and its on-page sections.

## Step 2 — Keyword research
- Audit content → group into keyword buckets (primary / secondary / long-tail).
- Tag each bucket: search intent + funnel stage + priority.
- Confirm audience + market/language before finalizing (changes the whole set).

## Step 3 — Notion structure
- Create parent page: `[LANG]{client} website content`.
- One child page per website page, in nav order.

## Step 4 — Mirror content (faithful)
- Reproduce each page's real sections as Notion headings. No invented content.
- Data-driven tables → keep real column headers + note rows are dynamic.

## Step 5 — Clean up (client preferences)
- Remove duplicate indexes/lists.
- Remove page icons if client prefers plain.
- Move parent under client deliverables folder.

## Step 6 — Page-by-page SEO conversion
For each page, structure content as:
1. **Target Keyword** — Primary / Secondary / Long-tail
2. **Page ideology & goal**
3. **Sections & content** — full SEO + copywriting build, keywords woven into real sections.

## Step 7 — Track & ship
- Update `handoverdoc.md` after each page (status table + log).
- Commit + push to `{branch}` after each change.

## Open decisions to confirm per client
- Language order (which first).
- Replace mirror with public content vs keep mirror + append SEO.
- Which pages get full SEO (all vs public-facing subset).
