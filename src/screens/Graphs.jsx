/* Subaru Tool — Graphs & Logging.
 * Plots up to 4 live channels and tracks a recording session. */
import { useEffect, useState } from 'react'
import { useObd, useSubscribe } from '../obd/useObd.jsx'
import { Card, Chip, Btn } from '../components/ui.jsx'
import { LineChart } from '../components/gauges.jsx'

const GRAPH_COLORS = ['var(--accent)', 'var(--good)', 'var(--warn)', '#c77dff']
const CHOICE_IDS = ['rpm', 'speed', 'boost', 'throttle', 'coolant', 'load', 'afr', 'knock']

export function GraphsScreen({ wide }) {
  const obd = useObd()
  const choices = CHOICE_IDS.map((id) => obd.pids.find((p) => p.id === id)).filter(Boolean)
  const [sel, setSel] = useState(['rpm', 'boost', 'throttle'])
  const [recording, setRecording] = useState(true)
  const [secs, setSecs] = useState(0)

  useSubscribe(sel)

  useEffect(() => {
    if (!recording) return
    const iv = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [recording])

  function toggle(id) {
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s))
  }

  const series = sel
    .map((id, i) => ({ pid: obd.pids.find((p) => p.id === id), color: GRAPH_COLORS[i % GRAPH_COLORS.length] }))
    .filter((s) => s.pid)
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap' }}>Graphs &amp; Logging</div>
        <Chip tone={recording ? 'bad' : 'default'}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span className={recording ? 'blink' : ''} style={{ width: 7, height: 7, borderRadius: 999, background: recording ? 'var(--bad)' : 'var(--text-faint)' }} />
            {recording ? 'REC ' + mm + ':' + ss : 'Stopped'}
          </span>
        </Chip>
      </div>

      <Card style={{ padding: 14 }}>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <LineChart series={series} width={wide ? 720 : 320} height={wide ? 300 : 230} />
        </div>
      </Card>

      <div className="chip-row">
        {choices.map((pid) => {
          const on = sel.includes(pid.id)
          const ci = sel.indexOf(pid.id)
          return (
            <button
              key={pid.id}
              onClick={() => toggle(pid.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                border: '1px solid',
                borderColor: on ? 'transparent' : 'var(--border)',
                cursor: 'pointer',
                borderRadius: 999,
                padding: '7px 13px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                background: on ? 'var(--surface-2)' : 'transparent',
                color: on ? 'var(--text)' : 'var(--text-dim)',
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: 3, background: on ? GRAPH_COLORS[ci % GRAPH_COLORS.length] : 'var(--track)' }} />
              {pid.short}
            </button>
          )
        })}
      </div>

      <Card style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Session</div>
          <div className="num" style={{ fontSize: 26, color: 'var(--text)' }}>
            {mm}:{ss}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Channels</div>
          <div className="num" style={{ fontSize: 26, color: 'var(--text)' }}>{sel.length}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 9 }}>
          <Btn tone={recording ? 'bad' : 'good'} onClick={() => setRecording((r) => !r)}>
            {recording ? 'Stop' : 'Record'}
          </Btn>
        </div>
      </Card>
    </div>
  )
}
