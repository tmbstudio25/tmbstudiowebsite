# TMB Studio — file organization

This zip has **two separate folders** that go to two separate places:

## `website/`
This is your actual site — everything here goes into your GitHub repo
(the one connected to GitHub Pages / tmbstudio.my), alongside your
existing `assets/` folder full of real media.

- Copy `index.html`, `ngilai.html`, `lifegacha.html`, `main.js`,
  `style.css`, `admin.html`, `cms.js`, `content.json`, and `CNAME` into
  your repo, replacing the old versions.
- Copy `assets/cms-placeholder-bg.svg` into your existing `assets/`
  folder (don't replace the whole folder — you already have your real
  media in there).
- Commit and push as usual.

## `cloudflare-worker/`
This is **not** part of your website — it's a separate small program
that deploys to Cloudflare, not GitHub Pages. Keep it in its own
folder on your computer, away from the website files.

- `wrangler.toml` and `src/index.js` are already filled in with your
  Supabase URL, anon key, and R2 bucket details.
- From inside this folder, run `wrangler deploy` to publish it.
- It has nothing to do with `git push` — you never commit this to
  your website repo.

Once the Worker is deployed, send Claude the `workers.dev` URL it
prints, and the rest of the Supabase/Cloudflare wiring can be
finished (admin.html login screen + upload buttons, dynamic projects
list, etc).
