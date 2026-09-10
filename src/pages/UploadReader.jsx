import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUpload, getUploadFile, toBook, useUploads } from '../lib/uploads.js'
import BookReader from '../components/BookReader.jsx'

/** Keying on the id gives every upload a clean mount, as /book/:slug does. */
export default function UploadReader() {
  const { id } = useParams()
  return <StoredPdf key={id} id={id} />
}

function StoredPdf({ id }) {
  useUploads() // re-render if this upload is removed in another tab
  const meta = getUpload(id)
  const [source, setSource] = useState(null)
  const [error, setError] = useState(null)

  // The PDF lives in IndexedDB; DearFlip reads it through a blob: URL, which
  // has to outlive the flipbook and be revoked when the reader closes.
  useEffect(() => {
    let url = null
    let disposed = false

    getUploadFile(id)
      .then((file) => {
        if (disposed) return
        if (!file) {
          setError('This upload is no longer stored in this browser.')
          return
        }
        url = URL.createObjectURL(file)
        setSource(url)
      })
      .catch((e) => {
        console.error('Could not read the stored PDF', e)
        if (!disposed) setError('This browser would not open the stored file.')
      })

    return () => {
      disposed = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [id])

  if (!meta) {
    return (
      <div className="mt-16 grid place-items-center px-6 text-center">
        <p className="text-2xl font-extrabold text-ink">Upload not found</p>
        <p className="mt-2 max-w-md text-sm font-semibold text-ink-soft">
          Uploads are stored in this browser only, so they are gone if the site data was
          cleared — or were never here if you opened this link on another device.
        </p>
        <Link to="/" className="mt-4 rounded-full bg-sky-deep px-6 py-2.5 text-sm font-bold text-white shadow-card">
          Back home
        </Link>
      </div>
    )
  }

  return <BookReader book={toBook(meta)} source={source} sourceError={error} backTo="/" />
}
