# BookNest — Library PDF Book Reader

A PDF book library with a flipbook reader, built with **React + Vite + Tailwind CSS 4**, content managed with **Decap CMS**, flipbooks powered by **DearFlip**, and deployed to **GitHub Pages**.

## Pages

| Route | Page |
|---|---|
| `/` | Home — latest added books + list columns |
| `/books` | All books — search, category/year filters, pagination |
| `/book/:slug` | Reader — DearFlip flipbook + download |

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

The DearFlip assets live in `public/dearflip/` (copied from `dearflip-js-flipbook-master/dflip/`).
They are loaded lazily — jQuery and the flipbook script only load when a reader page is opened.
Mind DearFlip's license terms for commercial use.
