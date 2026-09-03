// Loads every book JSON committed by Decap CMS (or by hand) at build time.
const modules = import.meta.glob('../content/books/*.json', { eager: true })

export const CATEGORIES = ['Literature', 'Science', 'Business', 'History']

/** Prefix a public/ asset path with the deploy base (GitHub Pages subpath safe). */
export function asset(path) {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
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
