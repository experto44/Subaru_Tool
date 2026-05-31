/* Subaru Tool — navigation chrome: status strip, header, bottom tab bar
 * (portrait) and side rail (landscape / tablet). */
import { Icon, StarCluster } from './icons.jsx'

export const NAV = [
  { id: 'dash', label: 'Dashboard', icon: 'dash' },
  { id: 'live', label: 'Live Data', icon: 'live' },
  { id: 'codes', label: 'Codes', icon: 'codes' },
  { id: 'graphs', label: 'Graphs', icon: 'graph' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function isActive(route, id) {
  return route === id || (id === 'codes' && route === 'freeze')
}

export function Header({ adapter, onConn }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <StarCluster size={24} />
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.01em', color: 'var(--text)' }}>
          Subaru<span style={{ color: 'var(--accent)' }}>Tool</span>
        </span>
      </div>
      <button
        onClick={onConn}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 999,
          padding: '6px 12px 6px 10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ position: 'relative', width: 9, height: 9 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--good)' }} />
          <span className="pulse-dot" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--good)' }} />
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{adapter.name || 'Adapter'}</span>
        <span style={{ fontSize: 11, color: 'var(--good)', fontWeight: 600 }}>LIVE</span>
      </button>
    </div>
  )
}

export function TabBar({ route, setRoute }) {
  return (
    <div
      style={{
        display: 'flex',
        flexShrink: 0,
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--border)',
        padding: '8px 8px calc(8px + env(safe-area-inset-bottom, 6px))',
        gap: 2,
      }}
    >
      {NAV.map((n) => {
        const active = isActive(route, n.id)
        return (
          <button
            key={n.id}
            onClick={() => setRoute(n.id)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '6px 0',
              color: active ? 'var(--accent)' : 'var(--text-faint)',
              fontFamily: 'inherit',
            }}
          >
            <Icon name={n.icon} size={22} sw={active ? 2.1 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500 }}>{n.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function SideRail({ route, setRoute, onConn }) {
  return (
    <div
      style={{
        width: 92,
        flexShrink: 0,
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0',
        gap: 6,
      }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', marginBottom: 10 }}>
        <StarCluster size={28} />
      </div>
      {NAV.map((n) => {
        const active = isActive(route, n.id)
        return (
          <button
            key={n.id}
            onClick={() => setRoute(n.id)}
            style={{
              width: 68,
              background: active ? 'var(--accent-soft)' : 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '10px 0',
              borderRadius: 13,
              color: active ? 'var(--accent)' : 'var(--text-faint)',
              fontFamily: 'inherit',
            }}
          >
            <Icon name={n.icon} size={22} sw={active ? 2.1 : 1.8} />
            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>{n.label}</span>
          </button>
        )
      })}
      <div style={{ flex: 1 }} />
      <button
        onClick={onConn}
        title="Connection"
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--good)', fontFamily: 'inherit' }}
      >
        <span style={{ position: 'relative', width: 11, height: 11 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--good)' }} />
          <span className="pulse-dot" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--good)' }} />
        </span>
        <span style={{ fontSize: 9, fontWeight: 600 }}>LIVE</span>
      </button>
    </div>
  )
}
