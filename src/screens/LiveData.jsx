/* Subaru Tool — Live Data list (all supported sensors, searchable & grouped). */
import { useMemo, useState } from 'react'
import { useObd, useSubscribe } from '../obd/useObd.jsx'
import { fmt, statusOf } from '../obd/format.js'
import { Card, Chip, SectionLabel } from '../components/ui.jsx'
import { Icon } from '../components/icons.jsx'
import { Sparkline } from '../components/gauges.jsx'

function LiveRow({ pid, units, fav, onFav }) {
  const obd = useObd()
  const val = obd.liveValue(pid.id)
  const f = fmt(pid, val, units)
  const st = statusOf(pid, val)
  const col = st === 'bad' ? 'var(--bad)' : st === 'warn' ? 'var(--warn)' : 'var(--accent)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => onFav(pid.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: fav ? 'var(--warn)' : 'var(--text-faint)', display: 'flex', padding: 0 }}
      >
        <Icon name="star" size={17} fill={fav ? 'var(--warn)' : 'none'} sw={1.8} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {pid.name}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
          {pid.pid} · {pid.group}
        </div>
      </div>
      <Sparkline pid={pid} width={70} height={26} color={col} />
      <div style={{ textAlign: 'right', minWidth: 78 }}>
        <span className="num" style={{ fontSize: 19, color: st === 'ok' ? 'var(--text)' : col }}>
          {f.value}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 3 }}>{f.unit}</span>
      </div>
    </div>
  )
}

export function LiveDataScreen({ units }) {
  const obd = useObd()
  const pids = obd.pids
  const groups = ['All', ...Array.from(new Set(pids.map((p) => p.group)))]
  const [group, setGroup] = useState('All')
  const [q, setQ] = useState('')
  const [favs, setFavs] = useState(() => new Set(pids.filter((p) => p.fav).map((p) => p.id)))

  function toggleFav(id) {
    const n = new Set(favs)
    n.has(id) ? n.delete(id) : n.add(id)
    setFavs(n)
  }

  const list = useMemo(
    () =>
      pids.filter(
        (p) =>
          (group === 'All' || p.group === group) &&
          (p.name.toLowerCase().includes(q.toLowerCase()) || p.pid.toUpperCase().includes(q.toUpperCase()))
      ),
    [pids, group, q]
  )
  const sorted = [...list].sort((a, b) => (favs.has(b.id) ? 1 : 0) - (favs.has(a.id) ? 1 : 0))

  // Poll every sensor currently visible in the list.
  useSubscribe(list.map((p) => p.id))

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap' }}>Live Data</div>
        <Chip tone="accent">{pids.length} PIDs</Chip>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '9px 13px',
        }}
      >
        <Icon name="search" size={17} stroke="var(--text-faint)" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sensors or PID…"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit' }}
        />
      </div>
      <div className="chip-row">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            style={{
              border: 'none',
              cursor: 'pointer',
              borderRadius: 999,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              background: g === group ? 'var(--accent)' : 'var(--surface-2)',
              color: g === group ? '#fff' : 'var(--text-dim)',
            }}
          >
            {g}
          </button>
        ))}
      </div>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        {sorted.map((p) => (
          <LiveRow key={p.id} pid={p} units={units} fav={favs.has(p.id)} onFav={toggleFav} />
        ))}
        {sorted.length === 0 && (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-faint)', fontSize: 14 }}>No sensors match.</div>
        )}
      </Card>
    </div>
  )
}
