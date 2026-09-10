// PDFs the visitor picks from their own device. Nothing is sent anywhere: the
// file bytes go into IndexedDB (localStorage is far too small for a PDF) and a
// small metadata record goes into localStorage, so shelves can render without
// waiting on IO — the same synchronous-cache trick history.js uses.
import { useSyncExternalStore } from 'react'
import { getBook } from './books.js'
import { forgetBook } from './history.js'

const META_KEY = 'bn-uploads'
const EVENT = 'bn-uploads-change'
const DB_NAME = 'booknest'
const STORE = 'uploads'
const SLUG_PREFIX = 'upload:'
const EMPTY = []

export const UPLOAD_CATEGORY = 'My Uploads'

// ---- IndexedDB (the file itself) -----------------------------------------

let dbPromise = null

function openDb() {
  dbPromise ??= new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser has no storage for uploaded files.'))
      return
    }
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    // Private-browsing modes refuse to open a database at all.
    req.onerror = () => reject(req.error ?? new Error('Storage is unavailable.'))
  }).catch((e) => {
    dbPromise = null // let a later attempt retry rather than cache the failure
    throw e
  })
  return dbPromise
}

/** Runs one request against the store and resolves once the transaction commits. */
async function withStore(mode, run) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = run(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(req?.result)
    tx.onabort = () => reject(tx.error ?? new Error('Storage transaction failed.'))
    tx.onerror = () => reject(tx.error ?? new Error('Storage transaction failed.'))
  })
}

// ---- Metadata (localStorage, mirrored in memory) --------------------------

let cache = null

function readMeta() {
  if (cache) return cache
  try {
    const raw = JSON.parse(localStorage.getItem(META_KEY) ?? '[]')
    cache = Array.isArray(raw) ? raw.filter((u) => u && typeof u.id === 'string') : EMPTY
  } catch {
    cache = EMPTY // unparseable, or storage blocked (private mode)
  }
  return cache
}

function writeMeta(list) {
  cache = list
  try {
    localStorage.setItem(META_KEY, JSON.stringify(cache))
  } catch {
    // The cover thumbnails are the bulky part — drop them and keep the library.
    // The in-memory copy keeps its covers, so they only disappear on reload.
    try {
      localStorage.setItem(
        META_KEY,
        JSON.stringify(cache.map(({ cover, ...rest }) => rest)),
      )
    } catch { /* storage blocked entirely — the session keeps working in memory */ }
  }
  window.dispatchEvent(new Event(EVENT))
}

function newId() {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// ---- Public API -----------------------------------------------------------

/** Uploads, newest first. */
export function getUploads() {
  return readMeta()
}

export function getUpload(id) {
  return readMeta().find((u) => u.id === id) ?? null
}

/** History and bookmarks are keyed by slug; `upload:` can never clash with a filename. */
export function uploadSlug(id) {
  return SLUG_PREFIX + id
}

export function isUploadSlug(slug) {
  return typeof slug === 'string' && slug.startsWith(SLUG_PREFIX)
}

export function uploadIdFromSlug(slug) {
  return isUploadSlug(slug) ? slug.slice(SLUG_PREFIX.length) : null
}

/** Shapes an upload like a catalogue book so cards and the reader can share code. */
export function toBook(meta) {
  return {
    ...meta,
    slug: uploadSlug(meta.id),
    href: `/uploads/${encodeURIComponent(meta.id)}`,
    category: UPLOAD_CATEGORY,
    uploaded: true,
  }
}

/** A history slug resolved against both the catalogue and this device's uploads. */
export function resolveBook(slug) {
  if (!isUploadSlug(slug)) return getBook(slug) ?? null
  const meta = getUpload(uploadIdFromSlug(slug))
  return meta ? toBook(meta) : null
}

/**
 * Stores the file and records it. Returns the new id — the reader route for it
 * is `/uploads/<id>`.
 */
export async function addUpload(file, { title, author = '', pages = null, cover = null } = {}) {
  const id = newId()
  try {
    await withStore('readwrite', (store) => store.put(file, id))
  } catch (e) {
    // There is no size limit of our own; this is the browser refusing the file.
    if (e?.name === 'QuotaExceededError') {
      throw new Error('This browser has no room left to store a PDF that big.')
    }
    throw new Error('This browser would not store the file. Private browsing blocks it.')
  }
  writeMeta([
    { id, title, author, pages, cover, name: file.name, size: file.size, addedAt: Date.now() },
    ...readMeta(),
  ])
  return id
}

/** The stored File, or null when it is gone (cleared site data, another device). */
export async function getUploadFile(id) {
  return (await withStore('readonly', (store) => store.get(id))) ?? null
}

/** Forgets an upload completely: the file, the record and the bookmark. */
export async function removeUpload(id) {
  writeMeta(readMeta().filter((u) => u.id !== id))
  forgetBook(uploadSlug(id))
  try {
    await withStore('readwrite', (store) => store.delete(id))
  } catch { /* the record is gone either way; an orphan blob is harmless */ }
}

// ---- React binding --------------------------------------------------------

function subscribe(onChange) {
  const onStorage = (e) => {
    if (e.key === META_KEY) { cache = null; onChange() }
  }
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onStorage)
  }
}

/** Uploads on this device, re-rendering when one is added or removed. */
export function useUploads() {
  return useSyncExternalStore(subscribe, getUploads, () => EMPTY)
}
