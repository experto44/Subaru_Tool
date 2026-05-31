/* Subaru Tool — Customize dashboard sheet.
 * Reorder / retype / remove widgets and add any supported sensor. */
import { useObd } from '../obd/useObd.jsx'
import { Sheet, SectionLabel } from '../components/ui.jsx'
import { Icon } from '../components/icons.jsx'

const widgetCycle = { ring: 'bar', bar: 'number', number: 'ring' }
const widgetLabel = { ring: 'Ring', bar: 'Bar', number: 'Value' }

export function CustomizeSheet({ open, onClose, dash, setDash, side }) {
  const obd = useObd()
  const pids = obd.pids
  const inDash = new Set(dash.map((d) => d.id))

  function move(i, dir) {
    const j = i + dir
    if (j < 0 || j >= dash.length) return
    const n = dash.slice()
    ;[n[i], n[j]] = [n[j], n[i]]
    setDash(n)
  }
  function remove(id) {
    setDash(dash.filter((d) => d.id !== id))
  }
  function add(id) {
    setDash([...dash, { id, widget: 'bar' }])
  }
  function cycle(i) {
    const n = dash.slice()
    n[i] = { ...n[i], widget: widgetCycle[n[i].widget] }
    setDash(n)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Customize dashboard" side={side}>
      <SectionLabel style={{ marginBottom: 10 }}>On dashboard — {dash.length}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
        {dash.map((entry, i) => {
          const pid = pids.find((p) => p.id === entry.id)
          const isCluster = entry.widget === 'temps'
          const isAwd = entry.widget === 'awd'
          const title = pid ? pid.name : isAwd ? 'AWD torque split' : 'Temperature cluster'
          const meta = pid ? `${pid.pid} · ${pid.group}` : isAwd ? 'Symmetrical AWD' : 'Oil · CVT · Coolant'
          return (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 13,
                padding: '9px 12px',
              }}
            >
              <span style={{ color: 'var(--text-faint)', display: 'flex', flexDirection: 'column' }}>
                <button onClick={() => move(i, -1)} className="reorder">
                  ▲
                </button>
                <button onClick={() => move(i, 1)} className="reorder">
                  ▼
                </button>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{meta}</div>
              </div>
              <button
                onClick={() => {
                  if (pid) cycle(i)
                }}
                disabled={!pid}
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  opacity: pid ? 1 : 0.55,
                  border: 'none',
                  borderRadius: 8,
                  padding: '5px 11px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: pid ? 'pointer' : 'default',
                  minWidth: 56,
                }}
              >
                {isCluster ? 'Temps' : isAwd ? 'AWD' : widgetLabel[entry.widget]}
              </button>
              <button
                onClick={() => remove(entry.id)}
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--bad)',
                  border: 'none',
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Icon name="x" size={15} sw={2.2} />
              </button>
            </div>
          )
        })}
      </div>
      <SectionLabel style={{ marginBottom: 10 }}>Add sensor</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pids
          .filter((p) => !inDash.has(p.id))
          .map((p) => (
            <button
              key={p.id}
              onClick={() => add(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'transparent',
                border: '1px dashed var(--border-strong)',
                borderRadius: 12,
                padding: '10px 12px',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ color: 'var(--accent)', display: 'flex' }}>
                <Icon name="plus" size={17} sw={2.2} />
              </span>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--text)' }}>{p.name}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>{p.unit || p.pid}</span>
            </button>
          ))}
      </div>
    </Sheet>
  )
}
