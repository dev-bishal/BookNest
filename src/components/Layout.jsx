import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CATEGORIES, books } from '../lib/books.js'
import {
  BookIcon, ChevronDown, CompassIcon, GearIcon, GridIcon,
  HeartIcon, HomeIcon, MoonIcon, SearchIcon, SunIcon,
} from './Icons.jsx'

const YEARS = [...new Set(books.map((b) => b.year))].sort((a, b) => b - a)

function RailLink({ to, title, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={title}
      className={({ isActive }) =>
        `grid size-11 place-items-center rounded-2xl transition-colors ${
          isActive
            ? 'bg-sky-soft text-sky-deep'
            : 'text-ink-soft hover:bg-sky-soft hover:text-sky-deep'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [dark, setDark] = useState(() => localStorage.getItem('bn-theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('bn-theme', dark ? 'dark' : 'light')
  }, [dark])

  // keep the search box in sync when navigation changes the query
  useEffect(() => { setQuery(params.get('q') ?? '') }, [params])

  const activeCat = location.pathname === '/books' ? params.get('cat') : null

  const goFilter = (patch) => {
    const next = new URLSearchParams(location.pathname === '/books' ? params : undefined)
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    next.delete('page')
    navigate(`/books?${next.toString()}`)
  }

  return (
    <div className="min-h-screen sm:p-12">
      <div className="relative mx-auto w-full rounded-none bg-card shadow-float sm:rounded-[2.5rem]">
        {/* ===== Header ===== */}
        <header className="flex flex-wrap items-center gap-4 px-6 pt-6 sm:px-10">
          <Link to="/" className="text-2xl font-black tracking-[0.2em] text-ink">
            BOOK<span className="text-sky-deep">NEST</span>
          </Link>

          <nav className="order-3 flex w-full flex-wrap justify-center gap-1 sm:order-none sm:mx-auto sm:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => goFilter({ cat: activeCat === cat ? null : cat })}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                  activeCat === cat
                    ? 'bg-sky-deep text-white shadow-card'
                    : 'text-ink-soft hover:text-sky-deep'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <button
              title="Toggle dark mode"
              onClick={() => setDark((d) => !d)}
              className="grid size-10 place-items-center rounded-2xl bg-sky-soft text-sky-deep"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </header>

        {/* ===== Search row ===== */}
        <div className="mt-6 flex flex-wrap items-center gap-3 px-6 sm:px-10">
          <form
            className="flex min-w-60 flex-1 items-center gap-3 rounded-full border border-line bg-card px-5 py-3 shadow-card"
            onSubmit={(e) => { e.preventDefault(); goFilter({ q: query || null }) }}
          >
            <SearchIcon size={18} className="shrink-0 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Which book were you looking for?"
              className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink-soft"
            />
          </form>

          <div className="relative">
            <select
              value={params.get('cat') ?? ''}
              onChange={(e) => goFilter({ cat: e.target.value || null })}
              className="appearance-none rounded-full border border-line bg-card py-3 pl-5 pr-11 text-sm font-bold text-ink-soft shadow-card outline-none"
            >
              <option value="">All Category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft" />
          </div>

          <div className="relative">
            <select
              value={params.get('year') ?? ''}
              onChange={(e) => goFilter({ year: e.target.value || null })}
              className="appearance-none rounded-full border border-line bg-card py-3 pl-5 pr-11 text-sm font-bold text-ink-soft shadow-card outline-none"
            >
              <option value="">Years</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft" />
          </div>
        </div>

        {/* ===== Body: rail + page ===== */}
        <div className="flex gap-2 px-3 pb-8 sm:px-6 lg:gap-4">
          <aside className="sticky top-6 mt-10 hidden self-start rounded-3xl border border-line bg-card p-2 shadow-card sm:block">
            <div className="flex flex-col gap-2">
              <RailLink to="/" end title="Home"><HomeIcon /></RailLink>
              <RailLink to="/books" title="All Books"><GridIcon /></RailLink>
              <span className="grid size-11 cursor-not-allowed place-items-center rounded-2xl text-ink-soft/50" title="Discover (soon)"><CompassIcon /></span>
              <span className="grid size-11 cursor-not-allowed place-items-center rounded-2xl text-ink-soft/50" title="My Library (soon)"><BookIcon /></span>
              <span className="grid size-11 cursor-not-allowed place-items-center rounded-2xl text-ink-soft/50" title="Favourites (soon)"><HeartIcon /></span>
              <span className="grid size-11 cursor-not-allowed place-items-center rounded-2xl text-ink-soft/50" title="Settings (soon)"><GearIcon /></span>
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-1 sm:px-2">
            <Outlet />
          </main>
        </div>
      </div>

      <p className="px-4 py-4 text-center text-xs font-semibold text-white/80">
        BookNest · a demo PDF library — content managed with Decap CMS, flipbooks by DearFlip
      </p>
    </div>
  )
}
