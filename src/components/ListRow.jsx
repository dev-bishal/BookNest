import { Link } from 'react-router-dom'
import { asset } from '../lib/books.js'
import { PlayIcon, TargetIcon } from './Icons.jsx'

/** Small horizontal row card (Most Visited / What I Read columns in the mockup). */
export default function ListRow({ book, variant = 'target' }) {
  return (
    <Link
      to={`/book/${book.slug}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-card transition-transform hover:-translate-y-0.5"
    >
      <img
        src={asset(book.cover)}
        alt=""
        className="h-14 w-10 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-ink">{book.title}</p>
        <p className="truncate text-xs font-semibold text-ink-soft">{book.author}</p>
      </div>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-soft text-sky-deep">
        {variant === 'play' ? <PlayIcon size={14} /> : <TargetIcon size={17} />}
      </span>
    </Link>
  )
}
