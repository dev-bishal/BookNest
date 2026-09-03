// Loads the DearFlip assets (copied to public/dearflip/) exactly once.
import { asset } from './books.js'

let loading = null

function addCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

function addScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded) return resolve()
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', reject)
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.addEventListener('load', () => { s.dataset.loaded = '1'; resolve() })
    s.addEventListener('error', reject)
    document.body.appendChild(s)
  })
}

export function loadDearFlip() {
  loading ??= (async () => {
    addCss(asset('dearflip/css/dflip.min.css'))
    addCss(asset('dearflip/css/themify-icons.min.css'))
    await addScript(asset('dearflip/js/libs/jquery.min.js'))
    await addScript(asset('dearflip/js/dflip.min.js'))
    return window.jQuery
  })()
  return loading
}
