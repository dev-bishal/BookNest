import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { books } from '../lib/books.js'
import BookCard from '../components/BookCard.jsx'
import ListRow from '../components/ListRow.jsx'
import { ChevronLeft, ChevronRight } from '../components/Icons.jsx'

function Column({ title, items, variant }) {
  return (
    <section>
      <h3 className="mb-4 text-center text-lg font-extrabold text-ink">{title}</h3>
      <div className="flex flex-col gap-3">
        {items.map((b) => <ListRow key={b.slug} book={b} variant={variant} />)}
      </div>
    </section>
  )
}

export default function Home() {
  const railRef = useRef(null)
  const latest = books // already sorted newest-first
  const scrollBy = (dir) =>
    railRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' })

  return (
    <div className="mt-8">
      {/* ===== My Library / latest added ===== */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-ink">Latest Added</h2>
        <div className="flex items-center gap-1 text-ink-soft">
          <button onClick={() => scrollBy(-1)} className="grid size-9 place-items-center rounded-full hover:bg-sky-soft hover:text-sky-deep" aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scrollBy(1)} className="grid size-9 place-items-center rounded-full hover:bg-sky-soft hover:text-sky-deep" aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={railRef} className="no-scrollbar -mx-1 flex gap-5 overflow-x-auto scroll-smooth px-1 pb-2 pt-1">
        {latest.map((b) => <BookCard key={b.slug} book={b} />)}

        {/* trailing "browse all" tile */}
        <Link
          to="/books"
          className="grid w-44 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-line text-center text-sm font-extrabold text-ink-soft transition-colors hover:border-sky-deep hover:text-sky-deep sm:w-48"
        >
          Browse all books →
        </Link>
      </div>

      {/* ===== lower columns ===== */}
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <Column title="Most Visited" items={[...books].sort((a, b) => a.title.localeCompare(b.title))} />
        <Column title="Trending Now" items={books.filter((b) => b.trending)} variant="play" />
        <Column title="What I Read" items={[...books].reverse()} />
      </div>
    </div>
  )
}
