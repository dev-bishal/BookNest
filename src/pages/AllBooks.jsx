import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { books } from '../lib/books.js'
import BookCard from '../components/BookCard.jsx'
import { ChevronLeft, ChevronRight } from '../components/Icons.jsx'

const PAGE_SIZE = 8

export default function AllBooks() {
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') ?? '').toLowerCase()
  const cat = params.get('cat')
  const year = params.get('year')
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1)

  const filtered = useMemo(
    () =>
      books.filter(
        (b) =>
          (!q || `${b.title} ${b.author}`.toLowerCase().includes(q)) &&
          (!cat || b.category === cat) &&
          (!year || String(b.year) === year),
      ),
    [q, cat, year],
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const goPage = (n) => {
    const next = new URLSearchParams(params)
    next.set('page', String(n))
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mt-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-extrabold text-ink">All Books</h2>
        <p className="text-sm font-bold text-ink-soft">
          {filtered.length} {filtered.length === 1 ? 'book' : 'books'}
          {cat ? ` · ${cat}` : ''}{year ? ` · ${year}` : ''}{q ? ` · “${params.get('q')}”` : ''}
        </p>
      </div>

      {slice.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border-2 border-dashed border-line py-24 text-center">
          <p className="text-lg font-extrabold text-ink">No books found</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">Try clearing the search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 justify-items-center gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          {slice.map((b) => <BookCard key={b.slug} book={b} className="w-full max-w-56" />)}
        </div>
      )}

      {/* pagination */}
      {pageCount > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => goPage(current - 1)}
            disabled={current === 1}
            className="grid size-10 place-items-center rounded-full border border-line text-ink-soft disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => goPage(n)}
              className={`size-10 rounded-full text-sm font-extrabold ${
                n === current
                  ? 'bg-sky-deep text-white shadow-card'
                  : 'border border-line text-ink-soft hover:text-sky-deep'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => goPage(current + 1)}
            disabled={current === pageCount}
            className="grid size-10 place-items-center rounded-full border border-line text-ink-soft disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  )
}
