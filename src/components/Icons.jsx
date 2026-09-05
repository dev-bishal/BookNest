// Lightweight inline icon set (stroke style matches the mockup's rounded look)
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const Icon = ({ d, size = 20, children, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} {...base} {...props}>
    {d ? <path d={d} /> : children}
  </svg>
)

export const HomeIcon = (p) => (
  <Icon {...p} d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />
)
export const CompassIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </Icon>
)
export const GridIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Icon>
)
export const BookIcon = (p) => (
  <Icon {...p} d="M12 5.5C10.5 4 8.5 3.5 6 3.5c-1 0-2 .15-3 .5v15c1-.35 2-.5 3-.5 2.5 0 4.5.5 6 2 1.5-1.5 3.5-2 6-2 1 0 2 .15 3 .5v-15c-1-.35-2-.5-3-.5-2.5 0-4.5.5-6 2Zm0 0V20" />
)
export const HeartIcon = (p) => (
  <Icon {...p} d="M12 20.5S3.5 15.5 3.5 9.5a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2c0 6-8.5 11-8.5 11Z" />
)
export const GearIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3.25" />
    <path d="M12 2.75v2.5m0 13.5v2.5M4 12H1.5M22.5 12H20m-1.6-6.4-1.8 1.8M7.4 16.6l-1.8 1.8m0-12.8 1.8 1.8m9.2 9.2 1.8 1.8" />
  </Icon>
)
export const BellIcon = (p) => (
  <Icon {...p} d="M18 9a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Zm-4.5 9a1.8 1.8 0 0 1-3 0" />
)
export const MoonIcon = (p) => (
  <Icon {...p} d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
)
export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5" />
  </Icon>
)
export const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.5-4.5" />
  </Icon>
)
export const ChevronDown = (p) => <Icon {...p} d="m6 9 6 6 6-6" />
export const ChevronLeft = (p) => <Icon {...p} d="m15 5-7 7 7 7" />
export const ChevronRight = (p) => <Icon {...p} d="m9 5 7 7-7 7" />
export const StarIcon = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M12 2.5l2.6 6 6.4.5-4.9 4.2 1.5 6.3L12 16l-5.6 3.5 1.5-6.3L3 9l6.4-.5z" />
  </Icon>
)
export const FlameIcon = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M12 22c-4 0-7-2.9-7-6.8 0-2.7 1.6-4.6 3-6.2 1.2-1.4 2.3-2.6 2.5-4.5 0-.6.7-.9 1.1-.5 1.9 1.6 3 3.6 3.2 5.6.6-.6 1-1.4 1.2-2.3.1-.5.8-.7 1.1-.3 1.7 1.9 2.9 4.4 2.9 6.8C20 19.1 16 22 12 22Z" />
  </Icon>
)
export const TargetIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </Icon>
)
export const PlayIcon = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M8.5 5.8v12.4c0 .8.9 1.3 1.6.9l9.7-6.2c.6-.4.6-1.4 0-1.8L10.1 4.9c-.7-.4-1.6.1-1.6.9Z" />
  </Icon>
)
export const BackIcon = (p) => <Icon {...p} d="M19 12H5m0 0 6-6m-6 6 6 6" />
export const DownloadIcon = (p) => (
  <Icon {...p} d="M12 3v11m0 0 4-4m-4 4-4-4M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />
)
export const BookmarkIcon = (p) => (
  <Icon {...p} d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1Z" />
)
export const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 2" />
  </Icon>
)
export const RestartIcon = (p) => (
  <Icon {...p} d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5V11h6.5" />
)
export const TrashIcon = (p) => (
  <Icon {...p} d="M4 6.5h16M9.5 6.5V4.5h5v2M6.5 6.5 7.4 20h9.2l.9-13.5" />
)
