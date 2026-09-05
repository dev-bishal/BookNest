import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { asset, getBook } from '../lib/books.js'
import { loadDearFlip } from '../lib/dearflip.js'
import { getBookmark, getEntry, recordVisit, saveBookmark } from '../lib/history.js'
import { BackIcon, BookmarkIcon, RestartIcon } from '../components/Icons.jsx'

// DearFlip's onFlip callback only fires once on load, not on later page turns, so
// the bookmark is driven by polling the instance's own page counter instead.
const POLL_MS = 400

/** Current page / page count from a DearFlip instance. */
function readProgress(fb) {
  const target = fb?.target
  return {
    page: target?._activePage ?? fb?._activePage ?? null,
    pages: target?.pageCount ?? null,
  }
}

/**
 * Routing to another book re-renders rather than remounts, which would leave the
 * page counter and resume note showing the previous book. Keying on the slug
 * gives every book a clean mount.
 */
export default function Reader() {
  const { slug } = useParams()
  return <BookReader key={slug} slug={slug} />
}

function BookReader({ slug }) {
  const book = getBook(slug)
  const holderRef = useRef(null)
  const flipbookRef = useRef(null)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(() => getBookmark(slug))
  const [pages, setPages] = useState(() => getEntry(slug)?.pages ?? null)
  const [resumedAt] = useState(() => getBookmark(slug))

  useEffect(() => {
    if (!book) return
    let disposed = false

    recordVisit(book.slug)
    // Read once at mount so re-renders don't reopen the book at a stale page.
    const openPage = getBookmark(book.slug)

    loadDearFlip()
      .then(($) => {
        if (disposed || !holderRef.current) return
        const el = document.createElement('div')
        holderRef.current.appendChild(el)
        flipbookRef.current = $(el).flipBook(asset(book.pdf), {
          height: '100%',
          webgl: true,
          autoEnableOutline: false,
          backgroundColor: 'transparent',
          duration: 700,
          openPage,                 // resume where the reader left off
          enableDownload: false,    // no PDF download from the viewer toolbar
          allControls: 'altPrev,pageNumber,altNext,play,outline,thumbnail,zoomIn,zoomOut,fullScreen',
        })
      })
      .catch((e) => {
        console.error('DearFlip failed to load', e)
        setError('The flipbook viewer failed to load.')
      })

    return () => {
      disposed = true
      try { flipbookRef.current?.dispose?.() } catch { /* noop */ }
      flipbookRef.current = null
      if (holderRef.current) holderRef.current.innerHTML = ''
    }
  }, [book])

  // Save the reader's place while the book is open.
  useEffect(() => {
    if (!book || error) return
    const id = setInterval(() => {
      const { page: p, pages: total } = readProgress(flipbookRef.current)
      if (!Number.isFinite(p)) return
      setPage(p)
      if (Number.isFinite(total)) setPages(total)
      saveBookmark(book.slug, p, Number.isFinite(total) ? total : null)
    }, POLL_MS)
    return () => clearInterval(id)
  }, [book, error])

  const goToPage = (n) => {
    const fb = flipbookRef.current
    if (typeof fb?.gotoPage === 'function') fb.gotoPage(n)
    else if (typeof fb?.target?.gotoPage === 'function') fb.target.gotoPage(n)
  }

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

  return (
    <div className="mt-8">
      {/* meta header — stacks on small screens so the title and page counter never collide */}
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-5">
        {/* one row until lg (the sidebar rail appears at sm and leaves the title too little
            width); `lg:contents` then dissolves this wrapper back into the row above */}
        <div className="flex min-w-0 items-center gap-4 lg:contents">
          <Link
            to="/books"
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-soft text-sky-deep transition-transform hover:-translate-x-0.5"
            title="Back to all books"
          >
            <BackIcon />
          </Link>
          <img src={asset(book.cover)} alt="" className="h-20 w-14 shrink-0 rounded-xl object-cover shadow-card" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-extrabold leading-tight text-ink sm:text-2xl">{book.title}</h2>
            <p className="text-sm font-bold text-ink-soft">
              {book.author}
              <span className="mx-2 inline-block rounded-full bg-sky-soft px-3 py-0.5 text-xs font-extrabold text-sky-deep">
                {book.category}
              </span>
              {book.year}
            </p>
          </div>
        </div>

        {/* bookmark: live page counter, saved automatically on every flip */}
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-2 rounded-full bg-sky-soft px-4 py-2.5 text-sm font-bold text-sky-deep"
            title="Your place is saved automatically on this device"
          >
            <BookmarkIcon size={16} />
            Page {page}{pages ? ` of ${pages}` : ''}
          </span>
          {page > 1 && (
            <button
              onClick={() => goToPage(1)}
              title="Start from the first page"
              className="grid size-10 place-items-center rounded-full border border-line text-ink-soft transition-colors hover:text-sky-deep"
            >
              <RestartIcon size={17} />
            </button>
          )}
        </div>
      </div>

      {book.description && (
        <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-ink-soft">
          {book.description}
        </p>
      )}

      {/* flipbook */}
      <div className="df-container mt-6 rounded-3xl border border-line bg-sky-soft p-2 sm:p-5">
        {error ? (
          <div className="grid h-[60vh] place-items-center text-center">
            <p className="font-extrabold text-ink">{error}</p>
          </div>
        ) : (
          <div ref={holderRef} className="h-[85vh] min-h-[600px] [&>div]:h-full" />
        )}
      </div>

      <p className="mt-3 text-center text-xs font-semibold text-ink-soft">
        {resumedAt > 1
          ? `Resumed at page ${resumedAt} — drag a page corner or use the arrows to flip.`
          : 'Drag a page corner or use the arrows to flip through the book.'}
      </p>
    </div>
  )
}
