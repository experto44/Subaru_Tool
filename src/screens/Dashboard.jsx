/* Subaru Tool — Live Dashboard.
 * Renders the user's configurable widget grid against live OBD values. */
import { useObd } from '../obd/useObd.jsx'
import { Card, Btn } from '../components/ui.jsx'
import { RingGauge, BarGauge, NumberTile, TempCluster, AwdWidget, OutTempBadge } from '../components/gauges.jsx'

function widgetFor(entry, units, pids) {
  if (entry.widget === 'temps') return <TempCluster ids={entry.pids} units={units} />
  if (entry.widget === 'awd') return <AwdWidget />
  const pid = pids.find((p) => p.id === entry.id)
  if (!pid) return null
  if (entry.widget === 'ring') return <RingGauge pid={pid} units={units} size={128} />
  if (entry.widget === 'bar') return <BarGauge pid={pid} units={units} />
  return <NumberTile pid={pid} units={units} />
}

export function DashboardScreen({ dash, units, onEdit }) {
  const obd = useObd()
  const vin = obd.vehicle.vin
  const subtitle = vin ? `VIN ${vin.slice(-8)}` : obd.vehicle.protocol || 'Subaru · live'

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>
            Live Dashboard
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OutTempBadge units={units} />
          <Btn tone="accent" ghost icon="edit" size="sm" onClick={onEdit}>
            Edit
          </Btn>
        </div>
      </div>

      <div className="dash-grid">
        {dash.map((entry, i) => {
          const isRing = entry.widget === 'ring'
          const isSquare = isRing || entry.widget === 'temps'
          const isTemps = entry.widget === 'temps'
          const isAwd = entry.widget === 'awd'
          return (
            <Card
              key={entry.id + i}
              pad={isRing ? 12 : 16}
              className={isSquare ? 'ring-cell' : isAwd ? 'awd-cell' : 'wide-cell'}
              style={{
                display: 'flex',
                alignItems: isTemps ? 'stretch' : 'center',
                justifyContent: isTemps ? 'stretch' : 'center',
                aspectRatio: isSquare ? '1 / 1' : 'auto',
                minHeight: isSquare ? 0 : isAwd ? 130 : 70,
              }}
            >
              {widgetFor(entry, units, obd.pids)}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
