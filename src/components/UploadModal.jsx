import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addUpload } from '../lib/uploads.js'
import { inspectPdf, looksLikePdf } from '../lib/pdf.js'
import { CloseIcon, FileIcon, UploadIcon } from './Icons.jsx'

/** "the-art-of-war (1).pdf" -> "The Art Of War" */
function titleFromName(name) {
  const stem = name
    .replace(/\.pdf$/i, '')
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/[_-]+/g, ' ')
  return stem.trim().replace(/\b\w/g, (c) => c.toUpperCase()) || 'Untitled PDF'
}

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024)
  return mb < 1 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${mb.toFixed(1)} MB`
}

/** Turns whatever PDF.js threw into something the reader can act on. */
function describeFailure(e) {
  if (e?.name === 'PasswordException') return 'That PDF is password-protected, so it cannot be opened here.'
  if (e?.name === 'InvalidPDFException') return 'That file is not a readable PDF — it may be damaged.'
  return 'That PDF could not be opened. Try a different file.'
}

const inputClass =
  'w-full rounded-2xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink outline-none placeholder:text-ink-soft focus:border-sky-deep'

export default function UploadModal({ onClose }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const titleInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [info, setInfo] = useState(null)   // { pages, cover } once PDF.js has read it
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [busy, setBusy] = useState(null)   // 'reading' | 'saving'
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(null)

  // Escape closes, and the page behind the dialog shouldn't scroll with it.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Once a file is accepted, the title is the next thing worth editing.
  useEffect(() => { if (file) titleInputRef.current?.focus() }, [file])

  const accept = async (picked) => {
    if (!picked || busy) return
    setError(null)
    if (!(await looksLikePdf(picked))) {
      setError('That is not a PDF file.')
      return
    }
    setFile(picked)
    setInfo(null)
    setTitle(titleFromName(picked.name))
    setBusy('reading')
    try {
      setInfo(await inspectPdf(picked))
    } catch (e) {
      console.error('Could not read the uploaded PDF', e)
      setError(describeFailure(e))
      setFile(null)
    } finally {
      setBusy(null)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file || busy) return
    setBusy('saving')
    try {
      const id = await addUpload(file, {
        title: title.trim() || titleFromName(file.name),
        author: author.trim(),
        pages: info?.pages ?? null,
        cover: info?.cover ?? null,
      })
      onClose()
      navigate(`/uploads/${id}`)
    } catch (err) {
      console.error('Could not store the uploaded PDF', err)
      setError(err.message)
      setBusy(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        onSubmit={submit}
        className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-float sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upload-title" className="text-xl font-extrabold text-ink">Upload a PDF</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              It stays on this device — nothing is sent to a server.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-2xl text-ink-soft transition-colors hover:bg-sky-soft hover:text-sky-deep"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => { accept(e.target.files?.[0]); e.target.value = '' }}
        />

        {!file ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files?.[0]) }}
            className={`mt-5 grid w-full place-items-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              dragging ? 'border-sky-deep bg-sky-soft' : 'border-line hover:border-sky-deep'
            }`}
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-sky-soft text-sky-deep">
              <UploadIcon size={24} />
            </span>
            <span className="mt-3 block text-sm font-extrabold text-ink">
              {busy === 'reading' ? 'Reading the PDF…' : 'Choose a PDF, or drop one here'}
            </span>
            <span className="mt-1 block text-xs font-semibold text-ink-soft">
              Any size · it never leaves this browser
            </span>
          </button>
        ) : (
          <>
            <div className="mt-5 flex items-center gap-4 rounded-3xl border border-line p-3">
              {info?.cover ? (
                <img src={info.cover} alt="" className="h-24 w-16 shrink-0 rounded-xl object-cover shadow-card" />
              ) : (
                <span className="grid h-24 w-16 shrink-0 place-items-center rounded-xl bg-sky-soft text-sky-deep">
                  <FileIcon size={22} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-ink">{file.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-ink-soft">
                  {formatSize(file.size)}
                  {busy === 'reading' ? ' · reading…' : info?.pages ? ` · ${info.pages} pages` : ''}
                </p>
                <button
                  type="button"
                  onClick={() => { setFile(null); setInfo(null); setError(null) }}
                  className="mt-1.5 text-xs font-extrabold text-sky-deep hover:underline"
                >
                  Choose another file
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-soft">Title</span>
                <input ref={titleInputRef} value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink-soft">Author</span>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Optional" className={inputClass} />
              </label>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:text-sky-deep"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || busy !== null}
            className="rounded-full bg-sky-deep px-6 py-2.5 text-sm font-bold text-white shadow-card transition-opacity disabled:opacity-40"
          >
            {busy === 'saving' ? 'Saving…' : 'Open in reader'}
          </button>
        </div>
      </form>
    </div>
  )
}
