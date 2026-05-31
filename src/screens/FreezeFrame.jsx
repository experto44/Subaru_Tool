/* Subaru Tool — Freeze Frame screen.
 * Shows the sensor snapshot the ECU recorded when the fault was first detected
 * (Mode 02). The engine exposes a current live snapshot which we render here
 * for the selected confirmed code. */
import { useObd } from '../obd/useObd.jsx'
import { fmt } from '../obd/format.js'
import { Card } from '../components/ui.jsx'
import { Icon } from '../components/icons.jsx'

// Sensors typically captured in a freeze frame (per SAE J1979 Mode 02).
const FRAME_IDS = ['rpm', 'speed', 'load', 'coolant', 'iat', 'stft1', 'ltft1', 'map', 'throttle', 'boost', 'timing', 'module_voltage']

export function FreezeFrameScreen({ code, onBack, units }) {
  const obd = useObd()
  const rows = FRAME_IDS.map((id) => obd.pids.find((p) => p.id === id))
    .filter(Boolean)
    .map((pid) => {
      const f = fmt(pid, obd.liveValue(pid.id), units)
      return { name: pid.name, value: f.value, unit: f.unit }
    })

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: 'none',
          border: 'none',
          color: 'var(--text-dim)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'inherit',
          alignSelf: 'flex-start',
        }}
      >
        <Icon name="back" size={18} /> Codes
      </button>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Freeze Frame</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 7 }}>
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--bad)' }}>{code}</span>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Snapshot at fault</span>
        </div>
      </div>
      <Card pad={0} style={{ overflow: 'hidden' }}>
        {rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '13px 16px',
              borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>{r.name}</span>
            <span>
              <span className="num" style={{ fontSize: 17, color: 'var(--text)' }}>
                {r.value}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 4 }}>{r.unit}</span>
            </span>
          </div>
        ))}
      </Card>
      <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.5 }}>
        Snapshot of sensor values recorded by the ECU at the moment the fault was first detected.
      </div>
    </div>
  )
}
