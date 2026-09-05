# BookNest — Library PDF Book Reader

A PDF book library with a flipbook reader, built with **React + Vite + Tailwind CSS 4**, content managed with **Decap CMS**, flipbooks powered by **DearFlip**, and deployed to **GitHub Pages**.

## Pages

| Route | Page |
|---|---|
| `/` | Home — continue reading, latest added, and a shelf of recently added books per category |
| `/books` | All books — search, category/year filters, pagination |
| `/book/:slug` | Reader — DearFlip flipbook, resumes at your last page |

Clean URLs (no #) — the build copies `index.html` to `404.html` so GitHub Pages serves the app for deep links and refreshes.

## Development

```bash
npm install
npm run dev        # site on http://localhost:5173
```

## Editing content (Decap CMS, local backend)

```bash
npm run cms        # decap proxy on :8081 (keep running)
npm run dev        # in a second terminal
```

Then open **http://localhost:5173/admin/index.html** and click **Login** (no
credentials needed — the proxy edits files directly). If you instead see an
email/password form, the `npm run cms` proxy isn't running.

Note: in the Vite dev server use `/admin/index.html`; on the deployed site
`/admin/` works as-is. Edits are written directly to files in this repo —
commit and push to publish.

Books are added from **Books → New Book**: the *Cover image* and *PDF file* fields
both upload real files (covers land in `public/covers/`, PDFs in `public/pdfs/`).

### Editing the category list

Categories live in `src/content/settings/categories.json` and are edited under
**Settings → Categories** in the CMS. The list drives the header nav, the category
filter, the per-category shelves on the home page, and the *Category* dropdown on
each book — so adding or renaming one there updates the whole site on the next build.

A category removed from that list stays selectable in the filter for as long as a
book still uses it, so no book becomes unreachable.

### Adding a book by hand

1. Drop the PDF into `public/pdfs/` (keep them small — this repo ships 3 demo PDFs of ~6 KB each).
2. Drop a portrait cover (2:3 ratio) into `public/covers/`.
3. Create `src/content/books/<slug>.json`:

```json
{
  "title": "My Book",
  "author": "Someone",
  "category": "Science",
  "year": 2026,
  "description": "…",
  "cover": "covers/my-book.svg",
  "pdf": "pdfs/my-book.pdf",
  "trending": false,
  "featured": true,
  "dateAdded": "2026-08-29"
}
```

The site picks up every JSON file in that folder at build time — no registry to update.

## Deployment

Push to `main` on GitHub with Pages set to **GitHub Actions** (repo Settings → Pages → Source).
The workflow in `.github/workflows/deploy.yml` builds and deploys automatically.
The workflow sets `BASE_PATH` to `/<repo-name>/` automatically, so it works at any repo subpath.

## DearFlip

Downloading is switched off in the reader (`enableDownload: false`, and `download`
is dropped from `allControls`), so the PDF is read in the flipbook only.

Reading progress is stored per book in `localStorage` under `bn-history` — the
reader reopens on the page you left off, and the home page shows a
**Continue Reading** shelf. It never leaves the visitor's browser.

The DearFlip assets live in `public/dearflip/` (copied from `dearflip-js-flipbook-master/dflip/`).
They are loaded lazily — jQuery and the flipbook script only load when a reader page is opened.
Mind DearFlip's license terms for commercial use.
