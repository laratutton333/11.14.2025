# AI Mapper – Netlify + Supabase Static Prototype

This folder contains a **single-page AI Mapper prototype** that:

- Runs as a static site on **Netlify**
- Uses **Supabase** (via CDN) so you can later save analysis results
- Uses a simple **demo scoring heuristic** so you can validate UX before wiring OpenAI

## Files

- `index.html` – Landing page + in-page app (SEO + GEO sections)
- `app.js` – Frontend logic, demo scoring, and Supabase insert example

## 1. Configure Supabase

1. In `app.js`, replace:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

with your real project values (these are safe for browser use).

2. In Supabase, create a table called `analyses`:

```sql
create table if not exists analyses (
  id uuid primary key default uuid_generate_v4(),
  raw_content text,
  seo_score int,
  geo_score int,
  created_at timestamptz default now()
);
```

3. Add a Row Level Security policy that allows inserts from authenticated or anon users (depending on your preference).

## 2. Deploy to Netlify

### Option A – Drag and drop

1. Zip the folder contents (or use the zip provided to you).
2. In Netlify, choose **Add new site → Deploy manually**.
3. Drag and drop the folder/zip that contains `index.html`.

Netlify will serve `index.html` at your site root.

### Option B – Git + build

1. Push these files to a GitHub repo.
2. Connect the repo in Netlify.
3. Set **build command** to `npm run build` only if you later add a build step.
   For this basic static version, you can leave build command blank and **publish directory** as the repo root.

## 3. How the demo analysis works

The current scoring logic in `app.js` looks at:

- Content length
- Rough heading markers
- How many question marks appear

and turns those into lightweight `seo` and `geo` scores. This is **just for prototyping**.

To make this real:

1. Create a Netlify function (for example `netlify/functions/analyze-content.js`).
2. Call OpenAI inside that function using `fetch` and your `OPENAI_API_KEY`.
3. From `app.js`, swap the `demoScoreContent(text)` call with a `fetch("/.netlify/functions/analyze-content")`.

This keeps your OpenAI key server-side and lets you use Supabase for auth and storage as required.

---

You can now test Supabase integration, Netlify hosting, and UX flow without running any local Node commands.
