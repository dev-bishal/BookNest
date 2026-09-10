// Reads an uploaded PDF before it is stored, using the copy of PDF.js that
// already ships with DearFlip. DearFlip reuses window.pdfjsLib when it finds
// one, so loading it here costs the reader page nothing later.
import { asset } from './books.js'

const THUMB_WIDTH = 280
const PDF_MAGIC = '%PDF-'

let loading = null

function loadPdfJs() {
  loading ??= new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib)
    const s = document.createElement('script')
    s.src = asset('dearflip/js/libs/pdf.min.js')
    s.addEventListener('load', () => {
      if (!window.pdfjsLib) return reject(new Error('PDF.js loaded without defining pdfjsLib'))
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = asset('dearflip/js/libs/pdf.worker.min.js')
      resolve(window.pdfjsLib)
    })
    s.addEventListener('error', () => reject(new Error('PDF.js failed to load')))
    document.body.appendChild(s)
  }).catch((e) => {
    loading = null // a flaky network shouldn't disable uploads for the session
    throw e
  })
  return loading
}

/** Cheap header check, so an .exe renamed to .pdf fails fast and clearly. */
export async function looksLikePdf(file) {
  try {
    const head = await file.slice(0, PDF_MAGIC.length).text()
    return head === PDF_MAGIC
  } catch {
    return false
  }
}

/** First page, rendered small and flattened onto white for use as a cover. */
async function renderCover(doc) {
  const page = await doc.getPage(1)
  const unscaled = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: THUMB_WIDTH / unscaled.width })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const canvasContext = canvas.getContext('2d')
  canvasContext.fillStyle = '#ffffff' // pages are usually transparent, not white
  canvasContext.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvasContext, viewport }).promise
  return canvas.toDataURL('image/jpeg', 0.72)
}

/**
 * Opens the file to prove it is readable and to pick up what the shelves need.
 * Throws PDF.js's own error (PasswordException, InvalidPDFException, …) so the
 * caller can explain what went wrong.
 */
export async function inspectPdf(file) {
  const pdfjsLib = await loadPdfJs()
  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjsLib.getDocument({ data }).promise
  try {
    return { pages: doc.numPages, cover: await renderCover(doc) }
  } finally {
    doc.destroy()
  }
}
