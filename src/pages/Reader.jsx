import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { asset, getBook } from '../lib/books.js'
import { loadDearFlip } from '../lib/dearflip.js'
import { BackIcon, DownloadIcon } from '../components/Icons.jsx'

export default function Reader() {
  const { slug } = useParams()
  const book = getBook(slug)
  const holderRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!book) return
    let disposed = false
    let flipbook = null

    loadDearFlip()
      .then(($) => {
        if (disposed || !holderRef.current) return
        const el = document.createElement('div')
        holderRef.current.appendChild(el)
        flipbook = $(el).flipBook(asset(book.pdf), {
          height: '100%',
          webgl: true,
          autoEnableOutline: false,
          backgroundColor: 'transparent',
          duration: 700,
          showDownloadControl: true,
          allControls: 'altPrev,pageNumber,altNext,play,outline,thumbnail,zoomIn,zoomOut,fullScreen,download',
        })
      })
      .catch((e) => {
        console.error('DearFlip failed to load', e)
        setError('The flipbook viewer failed to load.')
      })

    return () => {
      disposed = true
      try { flipbook?.dispose?.() } catch { /* noop */ }
      if (holderRef.current) holderRef.current.innerHTML = ''
    }
  }, [book])

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
      {/* meta header */}
      <div className="flex flex-wrap items-center gap-5">
        <Link
          to="/books"
          className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-soft text-sky-deep transition-transform hover:-translate-x-0.5"
          title="Back to all books"
        >
          <BackIcon />
        </Link>
        <img src={asset(book.cover)} alt="" className="h-20 w-14 rounded-xl object-cover shadow-card" />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-extrabold leading-tight text-ink">{book.title}</h2>
          <p className="text-sm font-bold text-ink-soft">
            {book.author}
            <span className="mx-2 inline-block rounded-full bg-sky-soft px-3 py-0.5 text-xs font-extrabold text-sky-deep">
              {book.category}
            </span>
            {book.year}
          </p>
        </div>
        <a
          href={asset(book.pdf)}
          download
          className="flex items-center gap-2 rounded-full bg-sky-deep px-5 py-2.5 text-sm font-bold text-white shadow-card transition-transform hover:-translate-y-0.5"
        >
          <DownloadIcon size={17} /> Download PDF
        </a>
      </div>

      {book.description && (
        <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-ink-soft">
          {book.description}
        </p>
      )}

      {/* flipbook */}
      <div className="df-container mt-6 rounded-3xl border border-line bg-sky-soft p-2 sm:p-4">
        {error ? (
          <div className="grid h-[50vh] place-items-center text-center">
            <div>
              <p className="font-extrabold text-ink">{error}</p>
              <a href={asset(book.pdf)} className="mt-2 inline-block text-sm font-bold text-sky-deep underline">
                Open the PDF directly instead
              </a>
            </div>
          </div>
        ) : (
          <div ref={holderRef} className="h-[70vh] min-h-96 [&>div]:h-full" />
        )}
      </div>

      <p className="mt-3 text-center text-xs font-semibold text-ink-soft">
        Drag a page corner or use the arrows to flip through the book.
      </p>
    </div>
  )
}
