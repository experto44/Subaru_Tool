/* Subaru Tool — Trouble Codes screen.
 * Reads stored/pending/permanent DTCs and readiness monitors from the ECU,
 * and clears codes (Mode 04) with confirmation. */
import { useState } from 'react'
import { useObd } from '../obd/useObd.jsx'
import { Card, Chip, SectionLabel, Btn } from '../components/ui.jsx'
import { Icon } from '../components/icons.jsx'

const statusTone = { confirmed: 'bad', pending: 'warn', permanent: 'accent' }
const monState = {
  ready: ['good', 'Ready'],
  'not-ready': ['warn', 'Not ready'],
  'not-supported': ['default', 'N/A'],
}

export function CodesScreen({ onClear, onViewFreeze }) {
  const obd = useObd()
  const codes = obd.codes
  const monitors = obd.monitors
  const hasCodes = codes.length > 0
  const [rescanning, setRescanning] = useState(false)

  async function rescan() {
    setRescanning(true)
    await obd.readCodes()
    setRescanning(false)
  }

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Trouble Codes</div>

      <Card
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderColor: hasCodes ? 'rgba(255,84,104,.4)' : 'rgba(47,211,145,.4)',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 15,
            display: 'grid',
            placeItems: 'center',
            background: hasCodes ? 'rgba(255,84,104,.14)' : 'rgba(47,211,145,.14)',
            color: hasCodes ? 'var(--bad)' : 'var(--good)',
          }}
        >
          <Icon name={hasCodes ? 'warn' : 'check'} size={26} sw={2.2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            {hasCodes ? `${codes.length} fault${codes.length > 1 ? 's' : ''} stored` : 'No fault codes'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>
            MIL {obd.mil || hasCodes ? 'ON · check engine' : 'OFF · emissions OK'}
          </div>
        </div>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: hasCodes ? 'var(--bad)' : 'var(--good)',
            boxShadow: `0 0 10px ${hasCodes ? 'var(--bad)' : 'var(--good)'}`,
          }}
        />
      </Card>

      {hasCodes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {codes.map((c) => (
            <Card key={c.code + c.status} pad={14} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '.02em' }}>
                  {c.code}
                </span>
                <Chip tone={statusTone[c.status]}>{c.status}</Chip>
                <span style={{ flex: 1 }} />
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: c.severity === 'high' ? 'var(--bad)' : c.severity === 'med' ? 'var(--warn)' : 'var(--text-faint)',
                  }}
                />
              </div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>{c.desc}</div>
              {c.status === 'confirmed' && onViewFreeze && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => onViewFreeze(c.code)}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontFamily: 'inherit',
                    }}
                  >
                    Freeze frame <Icon name="chevron" size={15} />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn tone="neutral" icon="refresh" onClick={rescan} disabled={rescanning} style={{ flex: 1 }}>
          {rescanning ? 'Scanning…' : 'Re-scan'}
        </Btn>
        {hasCodes && (
          <Btn tone="bad" icon="trash" onClick={onClear} style={{ flex: 1 }}>
            Clear codes
          </Btn>
        )}
      </div>

      <div>
        <SectionLabel style={{ marginBottom: 11 }}>Readiness monitors</SectionLabel>
        {monitors.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>Reading monitor status…</div>
        ) : (
          <div className="mon-grid">
            {monitors.map((m) => {
              const [tone, label] = monState[m.state] || monState['not-supported']
              const c = { good: 'var(--good)', warn: 'var(--warn)', default: 'var(--text-faint)' }[tone]
              return (
                <div
                  key={m.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 11,
                    padding: '9px 11px',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: c, flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text)',
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {m.name}
                  </span>
                  <span style={{ fontSize: 11, color: c, fontWeight: 600 }}>{label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
