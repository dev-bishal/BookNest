// Reading history + bookmarks, kept in localStorage on the reader's device.
// One entry per book: the page you stopped on and when you last opened it.
import { useSyncExternalStore } from 'react'

const KEY = 'bn-history'
const EVENT = 'bn-history-change'
const LIMIT = 30
const EMPTY = []

let cache = null

function read() {
  if (cache) return cache
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    cache = Array.isArray(raw)
      ? raw.filter((e) => e && typeof e.slug === 'string')
      : EMPTY
  } catch {
    cache = EMPTY // unparseable, or storage blocked (private mode)
  }
  return cache
}

function write(entries) {
  cache = entries.slice(0, LIMIT)
  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch { /* quota exceeded or storage blocked — keep the in-memory copy */ }
  window.dispatchEvent(new Event(EVENT))
}

/** Most recently opened first. */
export function getHistory() {
  return read()
}

export function getEntry(slug) {
  return read().find((e) => e.slug === slug) ?? null
}

/** The stored bookmark for a book, or page 1 if it has never been opened. */
export function getBookmark(slug) {
  const page = getEntry(slug)?.page
  return Number.isFinite(page) && page > 0 ? page : 1
}

/** Called when a reader page opens — moves the book to the top of the history. */
export function recordVisit(slug) {
  const entries = read()
  const existing = entries.find((e) => e.slug === slug)
  write([
    { page: 1, pages: null, ...existing, slug, openedAt: Date.now() },
    ...entries.filter((e) => e.slug !== slug),
  ])
}

/** Called on every page flip — stores the bookmark against the book. */
export function saveBookmark(slug, page, pages) {
  if (!Number.isFinite(page) || page < 1) return
  const entries = read()
  const existing = entries.find((e) => e.slug === slug)
  const nextPages = Number.isFinite(pages) ? pages : (existing?.pages ?? null)
  if (existing?.page === page && existing?.pages === nextPages) return // no change
  write([
    { openedAt: Date.now(), ...existing, slug, page, pages: nextPages, savedAt: Date.now() },
    ...entries.filter((e) => e.slug !== slug),
  ])
}

export function forgetBook(slug) {
  write(read().filter((e) => e.slug !== slug))
}

export function clearHistory() {
  write(EMPTY)
}

// ---- React binding --------------------------------------------------------

function subscribe(onChange) {
  // 'storage' fires for edits made in other tabs; EVENT for edits in this one.
  const onStorage = (e) => {
    if (e.key === KEY) { cache = null; onChange() }
  }
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/** Reading history that re-renders when a bookmark is saved. */
export function useHistory() {
  return useSyncExternalStore(subscribe, getHistory, () => EMPTY)
}
