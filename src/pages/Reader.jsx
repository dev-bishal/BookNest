import { Link, useParams } from 'react-router-dom'
import { asset, getBook } from '../lib/books.js'
import BookReader from '../components/BookReader.jsx'

/**
 * Routing to another book re-renders rather than remounts, which would leave the
 * page counter and resume note showing the previous book. Keying on the slug
 * gives every book a clean mount.
 */
export default function Reader() {
  const { slug } = useParams()
  const book = getBook(slug)

  if (!book) {
    return (
      <div className="mt-16 grid place-items-center text-center">
        <p className="text-2xl font-extrabold text-ink">Book not found</p>
        <Link to="/books" className="mt-4 rounded-full bg-sky-deep px-6 py-2.5 text-sm font-bold text-white shadow-card">
          Back to all books
        </Link>
      </div>
    )
  }

  return <BookReader key={slug} book={book} source={asset(book.pdf)} />
}
