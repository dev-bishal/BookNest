import categoriesFile from '../content/settings/categories.json'

// Loads every book JSON committed by Decap CMS (or by hand) at build time.
const modules = import.meta.glob('../content/books/*.json', { eager: true })

/** Categories are editable in the CMS (Settings → Categories), not hard-coded here. */
export const CATEGORIES = (categoriesFile.categories ?? [])
  .map((c) => (typeof c === 'string' ? c : c?.name))
  .map((name) => String(name ?? '').trim())
  .filter(Boolean)
  .filter((name, i, all) => all.indexOf(name) === i)

/** Prefix a public/ asset path with the deploy base (GitHub Pages subpath safe). */
export function asset(path) {
  return import.meta.env.BASE_URL + String(path ?? '').replace(/^\//, '')
}

export const books = Object.entries(modules)
  .map(([path, mod]) => {
    const data = mod.default ?? mod
    const slug = path.split('/').pop().replace(/\.json$/, '')
    return { slug, ...data }
  })
  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))

export function getBook(slug) {
  return books.find((b) => b.slug === slug)
}

/** Configured categories that actually have books, in the CMS-defined order. */
export const usedCategories = CATEGORIES.filter((c) =>
  books.some((b) => b.category === c),
)

/**
 * Everything offered in the filter dropdowns: the configured list, plus any
 * category still attached to a book after being removed from the CMS list — so
 * removing a category never makes its books unreachable.
 */
export const filterCategories = [
  ...CATEGORIES,
  ...[...new Set(books.map((b) => b.category))]
    .filter((c) => c && !CATEGORIES.includes(c))
    .sort(),
]

/** Books in a category, newest first (the source list is already sorted). */
export function booksInCategory(category, limit) {
  const list = books.filter((b) => b.category === category)
  return typeof limit === 'number' ? list.slice(0, limit) : list
}
