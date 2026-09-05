import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { books, booksInCategory, getBook, usedCategories } from '../lib/books.js'
import { clearHistory, useHistory } from '../lib/history.js'
import BookCard from '../components/BookCard.jsx'
import { ChevronLeft, ChevronRight, ClockIcon, TrashIcon } from '../components/Icons.jsx'

const PER_RAIL = 12

/** Horizontally scrolling shelf with prev/next buttons. */
function Rail({ title, icon, action, children }) {
  const ref = useRef(null)
  const scrollBy = (dir) =>
    ref.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })

  return (
    <section className="mt-12 first:mt-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
          {icon}{title}
        </h2>
        <div className="flex items-center gap-2">
          {action}
          <div className="flex items-center gap-1 text-ink-soft">
            <button
              onClick={() => scrollBy(-1)}
              className="grid size-9 place-items-center rounded-full hover:bg-sky-soft hover:text-sky-deep"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="grid size-9 place-items-center rounded-full hover:bg-sky-soft hover:text-sky-deep"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="no-scrollbar -mx-1 flex gap-5 overflow-x-auto scroll-smooth px-1 pb-2 pt-1"
      >
        {children}
      </div>
    </section>
  )
}

function SeeAll({ to }) {
  return (
    <Link
      to={to}
      className="rounded-full px-4 py-2 text-sm font-extrabold text-ink-soft transition-colors hover:text-sky-deep"
    >
      See all →
    </Link>
  )
}

/** Trailing dashed tile that links onward from a shelf. */
function BrowseTile({ to, label }) {
  return (
    <Link
      to={to}
      className="grid w-48 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-line px-4 text-center text-sm font-extrabold text-ink-soft transition-colors hover:border-sky-deep hover:text-sky-deep sm:w-56"
    >
      {label}
    </Link>
  )
}

export default function Home() {
  const history = useHistory()

  // History entries whose book still exists (books can be deleted in the CMS).
  const continueReading = history
    .map((entry) => ({ entry, book: getBook(entry.slug) }))
    .filter(({ book }) => book)

  return (
    <div className="mt-8">
      {continueReading.length > 0 && (
        <Rail
          title="Continue Reading"
          icon={<ClockIcon size={20} className="text-sky-deep" />}
          action={
            <button
              onClick={clearHistory}
              title="Clear reading history"
              className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:text-sky-deep"
            >
              <TrashIcon size={17} />
            </button>
          }
        >
          {continueReading.map(({ entry, book }) => (
            <BookCard key={book.slug} book={book} bookmark={entry} />
          ))}
        </Rail>
      )}

      <Rail title="Latest Added" action={<SeeAll to="/books" />}>
        {books.slice(0, PER_RAIL).map((b) => (
          <BookCard key={b.slug} book={b} />
        ))}
        <BrowseTile to="/books" label="Browse all books →" />
      </Rail>

      {/* Recently added, one shelf per category (categories come from the CMS). */}
      {usedCategories.map((cat) => {
        const items = booksInCategory(cat, PER_RAIL)
        return (
          <Rail
            key={cat}
            title={`Recently added in ${cat}`}
            action={<SeeAll to={`/books?cat=${encodeURIComponent(cat)}`} />}
          >
            {items.map((b) => (
              <BookCard key={b.slug} book={b} />
            ))}
            <BrowseTile
              to={`/books?cat=${encodeURIComponent(cat)}`}
              label={`All ${cat} books →`}
            />
          </Rail>
        )
      })}

      {books.length === 0 && (
        <div className="mt-12 grid place-items-center rounded-3xl border-2 border-dashed border-line py-24 text-center">
          <p className="text-lg font-extrabold text-ink">No books yet</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">
            Add one from the CMS at <code>/admin/</code>.
          </p>
        </div>
      )}
    </div>
  )
}
