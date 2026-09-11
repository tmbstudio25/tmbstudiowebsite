# TMB Studio — file organization

This zip has **three things** that go to different places:

## `website/`
Your actual site — everything here goes into your GitHub repo
(replace what's already there), alongside your existing `assets/`
folder full of real media.

Notable changes this round:
- `ngilai.html` and `lifegacha.html` are now tiny redirect stubs —
  they just forward to `project.html?slug=ngilai` / `?slug=lifegacha`
  so any old bookmarks/links still work. The real content now lives
  in Supabase and renders through `project.html`.
- `project.html` + `project-page.js` — the one shared template for
  every project, rendered dynamically by slug.
- `site-data.js` — read-only Supabase access used by `index.html`
  and `project.html` to fetch published projects.
- `content.json` is much smaller now — it only holds the home page
  video and the Who We Are carousel images. Project data moved to
  the database.

## `supabase-schema-v2.sql`
Run this in Supabase → SQL Editor → New query → Run.

**This replaces your `projects` table** (drops and recreates it —
fine since nothing had been customized there yet) with the new
shape: no chapters, no exhibition, adds a supporting-images gallery
and a real status field. It reseeds NGILAI and Life Gacha! with
their current content. `site_settings` is untouched.

## `cloudflare-worker/`
Unchanged from before — not part of the website, deploys separately
to Cloudflare via `wrangler deploy`. Nothing to redo here unless
you're setting it up fresh.
