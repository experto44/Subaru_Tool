/* Subaru Tool — icon set + Pleiades brand mark (ported from the design). */

const ICONS = {
  dash: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  live: 'M4 19h16M4 5v14M8 15l3-4 3 3 4-6',
  codes: 'M12 3l9 16H3L12 3zm0 6v5m0 3h.01',
  graph: 'M4 4v16h16M8 14l3-3 2 2 5-6',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a7.8 7.8 0 000-2l2-1.5-2-3.4-2.4 1a7.8 7.8 0 00-1.7-1l-.4-2.6H9.1l-.4 2.6a7.8 7.8 0 00-1.7 1l-2.4-1-2 3.4L2.6 11a7.8 7.8 0 000 2l-2 1.5 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.4 2.6h5.8l.4-2.6c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.5z',
  bluetooth: 'M7 7l10 10-5 4V3l5 4L7 17',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.3-4.3',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  trash: 'M4 7h16M9 7V4h6v3m-9 0l1 13h8l1-13',
  refresh: 'M21 12a9 9 0 11-3-6.7M21 4v5h-5',
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  car: 'M5 13l1.5-5h11L19 13M5 13h14v5H5v-5zm2 5v2m10-2v2M7 16h.01M17 16h.01',
  signal: 'M2 20h2v-4H2v4zm5 0h2v-8H7v8zm5 0h2V8h-2v12zm5 0h2V4h-2v16z',
  power: 'M12 3v9M6.4 6.4a8 8 0 1011.2 0',
  warn: 'M12 3l9 16H3L12 3zm0 6v5m0 3h.01',
  filter: 'M3 5h18M6 12h12M10 19h4',
  star: 'M12 3l2.5 6 6.5.5-5 4.2L17.5 21 12 17.3 6.5 21 8 13.7 3 9.5 9.5 9z',
  record: 'M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0',
  drag: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 19h16',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0-14v5l3 2',
}

export function Icon({ name, size = 20, stroke = 'currentColor', fill = 'none', sw = 1.8, style }) {
  const filled = name === 'dash' || name === 'record'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path
        d={ICONS[name]}
        fill={filled ? stroke : fill}
        stroke={filled ? 'none' : stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function starPath(cx, cy, r) {
  let p = ''
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * 0.42
    p += (i === 0 ? 'M' : 'L') + (cx + Math.cos(ang) * rad).toFixed(2) + ' ' + (cy + Math.sin(ang) * rad).toFixed(2) + ' '
  }
  return p + 'Z'
}

export function StarCluster({ size = 26, color = 'var(--accent)' }) {
  const stars = [
    [50, 14, 4.4],
    [30, 40, 3],
    [64, 34, 3.4],
    [78, 54, 2.6],
    [44, 62, 2.4],
    [60, 76, 2.1],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      {stars.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r * 1.9} fill={color} opacity="0.16" />
          <path d={starPath(x, y, r)} fill={color} />
        </g>
      ))}
    </svg>
  )
}
