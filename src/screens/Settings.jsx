/* Subaru Tool — Settings: units, theme/accent, adapter, vehicle info. */
import { useObd } from '../obd/useObd.jsx'
import { fmt } from '../obd/format.js'
import { Card, SectionLabel, Segmented, Btn } from '../components/ui.jsx'
import { Icon, StarCluster } from '../components/icons.jsx'

const THEMES = [
  { value: 'carbon', label: 'Carbon' },
  { value: 'daylight', label: 'Daylight' },
  { value: 'sport', label: 'Sport' },
]
const ACCENTS = ['#2f74ff', '#27e39b', '#ff6a3d', '#f5c518', '#c77dff']

export function SettingsScreen({ units, setUnits, theme, setTheme, accent, setAccent, onDisconnect }) {
  const obd = useObd()
  const adapter = obd.adapter
  const v = obd.vehicle
  const voltPid = obd.pids.find((p) => p.id === 'module_voltage')
  const voltage = v.voltage != null ? `${v.voltage.toFixed(2)} V` : '—'

  const rows = [
    ['VIN', v.vin || '—'],
    ['Protocol', v.protocol || '—'],
    ['Adapter voltage', voltage],
  ]

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 640, margin: '0 auto', width: '100%' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Settings</div>

      <div>
        <SectionLabel style={{ marginBottom: 10 }}>Units</SectionLabel>
        <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14.5, color: 'var(--text)' }}>Measurement system</span>
          <Segmented
            value={units}
            onChange={setUnits}
            options={[
              { value: 'metric', label: 'Metric' },
              { value: 'imperial', label: 'Imperial' },
            ]}
          />
        </Card>
      </div>

      <div>
        <SectionLabel style={{ marginBottom: 10 }}>Appearance</SectionLabel>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14.5, color: 'var(--text)' }}>Theme</span>
            <Segmented value={theme} onChange={setTheme} options={THEMES} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14.5, color: 'var(--text)' }}>Accent</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  aria-label={c}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    border: accent === c ? '2px solid var(--text)' : '2px solid transparent',
                    background: c,
                    cursor: 'pointer',
                    boxShadow: accent === c ? `0 0 10px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div>
        <SectionLabel style={{ marginBottom: 10 }}>Adapter</SectionLabel>
        <Card style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(47,211,145,.14)', color: 'var(--good)' }}>
            <Icon name="bluetooth" size={21} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{adapter.name || 'Adapter'}</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
              {adapter.kind === 'classic' ? 'Bluetooth SPP' : adapter.kind === 'ble' ? 'Bluetooth LE' : 'Demo'} · ELM327
            </div>
          </div>
          <Btn tone="bad" ghost size="sm" onClick={onDisconnect}>
            Disconnect
          </Btn>
        </Card>
      </div>

      <div>
        <SectionLabel style={{ marginBottom: 10 }}>Vehicle</SectionLabel>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>{r[0]}</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>{r[1]}</span>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: 0.7, paddingTop: 4 }}>
        <StarCluster size={20} />
        <span style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>Subaru Tool · v1.0</span>
      </div>
    </div>
  )
}
