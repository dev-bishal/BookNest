import { Link } from 'react-router-dom'
import { asset } from '../lib/books.js'
import { BookmarkIcon, FlameIcon, StarIcon } from './Icons.jsx'

/**
 * Cover card matching the mockup: star badge, Trending pill, gradient title overlay.
 * `bookmark` is a history entry — when present the card shows reading progress.
 */
export default function BookCard({ book, bookmark, className = '' }) {
  const page = bookmark?.page > 1 ? bookmark.page : null
  const pct = page && bookmark.pages
    ? Math.min(100, Math.round((page / bookmark.pages) * 100))
    : null

  return (
    <Link
      to={`/book/${book.slug}`}
      className={`group relative block w-48 shrink-0 overflow-hidden rounded-2xl shadow-card transition-transform duration-300 hover:-translate-y-1.5 sm:w-56 ${className}`}
    >
      <img
        src={asset(book.cover)}
        alt={`${book.title} cover`}
        className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* top badges */}
      <div className="absolute inset-x-2.5 top-2.5 flex items-start justify-between">
        <span className="grid size-8 place-items-center rounded-full bg-white/30 text-white backdrop-blur-sm">
          <StarIcon size={15} />
        </span>
        {book.trending && (
          <span className="flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
            <FlameIcon size={12} className="text-orange-400" /> Trending
          </span>
        )}
      </div>

      {/* bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3.5 pb-3.5 pt-10">
        <p className="text-[15px] font-extrabold leading-tight text-white">{book.title}</p>
        <p className="mt-0.5 text-xs font-semibold text-white/70">{book.author}</p>

        {page && (
          <>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-white/85">
              <BookmarkIcon size={11} />
              Page {page}{bookmark.pages ? ` of ${bookmark.pages}` : ''}
            </p>
            {pct !== null && (
              <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-white/25">
                <span className="block h-full rounded-full bg-sky-deep" style={{ width: `${pct}%` }} />
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  )
}
