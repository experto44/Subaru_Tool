/* Subaru Tool — live gauges & data viz.
 *
 * Ported from the approved design's UI atoms, but every gauge now reads its
 * value from the live OBD engine (useObd) and registers the PID it needs for
 * polling via useSubscribe. History buffers come from the engine too, so the
 * sparkline / line charts plot real samples. */
import { useObd, useSubscribe } from '../obd/useObd.jsx'
import { fmt, pctOf, statusOf } from '../obd/format.js'

const colorFor = (st) => (st === 'bad' ? 'var(--bad)' : st === 'warn' ? 'var(--warn)' : 'var(--accent)')

function useLive(pid) {
  const obd = useObd()
  useSubscribe([pid.id])
  return obd.liveValue(pid.id)
}

/* ---------- Ring gauge ---------- */
export function RingGauge({ pid, units, size = 150, strokeW = 11 }) {
  const val = useLive(pid)
  const f = fmt(pid, val, units)
  const frac = pctOf(pid, val)
  const st = statusOf(pid, val)
  const r = (size - strokeW) / 2 - 2
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * r
  const track = 0.75 * C
  const col = colorFor(st)
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--track)" strokeWidth={strokeW} strokeDasharray={`${track} ${C - track}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={strokeW}
          strokeDasharray={`${frac * track} ${C}`}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 6px ${col})`, transition: 'stroke-dasharray .25s linear, stroke .3s' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <div className="num" style={{ fontSize: size * 0.26, color: 'var(--text)', lineHeight: 1 }}>
          {f.value}
        </div>
        <div style={{ fontSize: size * 0.082, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{f.unit}</div>
        {pid.short.toLowerCase() !== f.unit.toLowerCase() && (
          <div style={{ fontSize: size * 0.075, color: 'var(--text-faint)', marginTop: 2, letterSpacing: '.04em' }}>{pid.short}</div>
        )}
      </div>
    </div>
  )
}

/* ---------- Bar gauge ---------- */
export function BarGauge({ pid, units }) {
  const val = useLive(pid)
  const f = fmt(pid, val, units)
  const frac = pctOf(pid, val)
  const col = colorFor(statusOf(pid, val))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '.03em' }}>{pid.short}</span>
        <span>
          <span className="num" style={{ fontSize: 21, color: 'var(--text)' }}>
            {f.value}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 4 }}>{f.unit}</span>
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 6, background: 'var(--track)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${frac * 100}%`, background: col, borderRadius: 6, boxShadow: `0 0 8px ${col}`, transition: 'width .25s linear, background .3s' }} />
      </div>
    </div>
  )
}

/* ---------- Number tile ---------- */
export function NumberTile({ pid, units }) {
  const val = useLive(pid)
  const f = fmt(pid, val, units)
  const st = statusOf(pid, val)
  const col = st === 'bad' ? 'var(--bad)' : st === 'warn' ? 'var(--warn)' : 'var(--text)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{pid.short}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span className="num" style={{ fontSize: 32, color: col, lineHeight: 1 }}>
          {f.value}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{f.unit}</span>
      </div>
    </div>
  )
}

/* ---------- Temperature cluster ---------- */
export function TempCluster({ ids, units }) {
  const obd = useObd()
  useSubscribe(ids)
  const items = ids.map((id) => obd.pids.find((p) => p.id === id)).filter(Boolean)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: 4 }}>
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 2 }}>Temperatures</div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        {items.map((pid) => {
          const val = obd.liveValue(pid.id)
          const f = fmt(pid, val, units)
          const st = statusOf(pid, val)
          const col = colorFor(st)
          const frac = pctOf(pid, val)
          return (
            <div key={pid.id} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>{pid.short}</span>
                <span>
                  <span className="num" style={{ fontSize: 18, color: st === 'ok' ? 'var(--text)' : col }}>
                    {f.value}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)', marginLeft: 2 }}>{f.unit}</span>
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 4, background: 'var(--track)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${frac * 100}%`, background: col, borderRadius: 4, boxShadow: `0 0 6px ${col}`, transition: 'width .25s linear, background .3s' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Sparkline (from live history) ---------- */
export function Sparkline({ pid, width = 96, height = 30, color = 'var(--accent)' }) {
  const obd = useObd()
  const hist = obd.liveHistory(pid.id)
  if (!hist.length) return <svg width={width} height={height} />
  const N = Math.min(hist.length, 40)
  const slice = hist.slice(-N)
  const pts = slice.map((v, i) => {
    const f = pctOf(pid, v)
    return [(i / Math.max(1, N - 1)) * width, height - f * (height - 4) - 2]
  })
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const area = d + ` L ${width} ${height} L 0 ${height} Z`
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={area} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------- Multi-line chart (from live history) ---------- */
export function LineChart({ series, width = 600, height = 260 }) {
  const obd = useObd()
  const padL = 6
  const padR = 6
  const padT = 12
  const padB = 18
  const W = width - padL - padR
  const H = height - padT - padB
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={padL} x2={padL + W} y1={padT + g * H} y2={padT + g * H} stroke="var(--border)" strokeWidth="1" />
      ))}
      {series.map((s) => {
        const pid = s.pid
        const hist = obd.liveHistory(pid.id)
        if (hist.length < 2) return null
        const N = hist.length
        const pts = hist.map((v, i) => {
          const f = pctOf(pid, v)
          return [padL + (i / (N - 1)) * W, padT + (1 - f) * H]
        })
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
        return <path key={pid.id} d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${s.color}66)` }} />
      })}
    </svg>
  )
}

/* ---------- AWD Torque Split (Subaru Symmetrical AWD) ---------- */
export function CarTopDown({ frontFrac, accentF, accentR }) {
  const W = 168
  const H = 72
  const midY = H / 2
  const wW = 12
  const wH = 10
  const wRx = 2
  const wYt = 8
  const wYb = H - 8 - wH
  const axFx = 6
  const axRx = W - 6
  const bX = 20
  const bW = 128
  const bH = 46
  const bY = (H - bH) / 2
  const gF = 'drop-shadow(0 0 5px ' + accentF + ')'
  const gR = 'drop-shadow(0 0 5px ' + accentR + ')'
  const barX = 70
  const barY = midY - 4.5
  const barW = 76
  const barH = 9
  const barRx = 4.5
  const frontW = barW * frontFrac
  const rearW = barW * (1 - frontFrac)

  return (
    <svg width={W} height={H} viewBox={'0 0 ' + W + ' ' + H} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={axFx} y1={wYt + wH} x2={axFx} y2={wYb} stroke={accentF} strokeWidth="2.4" strokeLinecap="round" style={{ filter: gF, opacity: 0.72 + frontFrac * 0.28, transition: 'all .3s' }} />
      <line x1={axFx} y1={midY} x2={bX} y2={midY} stroke={accentF} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke .3s' }} />
      <rect x={bX} y={bY} width={bW} height={bH} rx={10} fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1" />
      <rect x={bX + 5} y={bY + 5} width={14} height={bH - 10} rx={4} fill="var(--track)" opacity="0.6" />
      <rect x={bX + bW - 19} y={bY + 5} width={14} height={bH - 10} rx={4} fill="var(--track)" opacity="0.4" />
      <rect x={36} y={midY - 12} width={27} height={24} rx={4} fill="var(--border-strong)" opacity="0.95" />
      <rect x={40} y={bY + 3} width={5} height={8} rx={1.5} fill="var(--track)" opacity="0.8" />
      <rect x={49} y={bY + 3} width={5} height={8} rx={1.5} fill="var(--track)" opacity="0.8" />
      <rect x={40} y={bY + bH - 11} width={5} height={8} rx={1.5} fill="var(--track)" opacity="0.72" />
      <rect x={49} y={bY + bH - 11} width={5} height={8} rx={1.5} fill="var(--track)" opacity="0.72" />
      <rect x={63} y={midY - 3} width={8} height={6} rx={2} fill="var(--track)" opacity="0.85" />
      <rect x={barX} y={barY} width={barW} height={barH} rx={barRx} fill="var(--track)" opacity="0.7" />
      <clipPath id="clip-f">
        <rect x={barX} y={barY} width={barW} height={barH} rx={barRx} />
      </clipPath>
      <rect x={barX} y={barY} width={frontW} height={barH} rx={barRx} fill={accentF} clipPath="url(#clip-f)" style={{ filter: 'drop-shadow(0 0 4px ' + accentF + ')', transition: 'width .35s cubic-bezier(.2,.8,.2,1), fill .3s' }} />
      <clipPath id="clip-r">
        <rect x={barX} y={barY} width={barW} height={barH} rx={barRx} />
      </clipPath>
      <rect x={barX + barW - rearW} y={barY} width={rearW} height={barH} rx={barRx} fill={accentR} clipPath="url(#clip-r)" style={{ filter: 'drop-shadow(0 0 4px ' + accentR + ')', transition: 'width .35s cubic-bezier(.2,.8,.2,1), fill .3s' }} />
      <rect x={barX + frontW - 1} y={barY - 1} width={2} height={barH + 2} fill="var(--bg)" style={{ transition: 'x .35s cubic-bezier(.2,.8,.2,1)' }} />
      <line x1={bX + bW} y1={midY} x2={axRx} y2={midY} stroke={accentR} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke .3s' }} />
      <line x1={axRx} y1={wYt + wH} x2={axRx} y2={wYb} stroke={accentR} strokeWidth="2.4" strokeLinecap="round" style={{ filter: gR, opacity: 0.72 + (1 - frontFrac) * 0.28, transition: 'all .3s' }} />
      <rect x={0} y={wYt} width={wW} height={wH} rx={wRx} fill={accentF} style={{ transition: 'fill .3s', filter: gF }} />
      <rect x={0} y={wYb} width={wW} height={wH} rx={wRx} fill={accentF} style={{ transition: 'fill .3s', filter: gF }} />
      <rect x={W - wW} y={wYt} width={wW} height={wH} rx={wRx} fill={accentR} style={{ transition: 'fill .3s', filter: gR }} />
      <rect x={W - wW} y={wYb} width={wW} height={wH} rx={wRx} fill={accentR} style={{ transition: 'fill .3s', filter: gR }} />
    </svg>
  )
}

export function AwdWidget() {
  const obd = useObd()
  useSubscribe(['awd_f'])
  const raw = obd.liveValue('awd_f')
  const front = raw != null ? Math.round(Math.max(5, Math.min(95, raw))) : 50
  const rear = 100 - front
  const frontFrac = front / 100
  const biasRear = rear > front + 5
  const biasF = front > rear + 5
  const accentF = biasF ? 'var(--warn)' : 'var(--accent)'
  const accentR = biasRear ? 'var(--warn)' : 'var(--accent)'

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>AWD</span>
          <span style={{ width: 1, height: 12, background: 'var(--border-strong)' }} />
          <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em', color: 'var(--accent)', textTransform: 'uppercase' }}>Symmetrical</span>
        </div>
        <span style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>Torque Split</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: '0 0 64px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Front</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span className="num" style={{ fontSize: 40, lineHeight: 1, color: accentF, textShadow: biasF ? '0 0 18px ' + accentF : 'none', transition: 'color .3s, text-shadow .3s' }}>
              {front}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-faint)', fontWeight: 600 }}>%</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CarTopDown frontFrac={frontFrac} accentF={accentF} accentR={accentR} />
        </div>
        <div style={{ flex: '0 0 64px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Rear</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span className="num" style={{ fontSize: 40, lineHeight: 1, color: accentR, textShadow: biasRear ? '0 0 18px ' + accentR : 'none', transition: 'color .3s, text-shadow .3s' }}>
              {rear}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-faint)', fontWeight: 600 }}>%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Outside / ambient temp badge ---------- */
export function OutTempBadge({ units }) {
  const obd = useObd()
  useSubscribe(['ambient'])
  const pid = obd.pids.find((p) => p.id === 'ambient')
  if (!pid) return null
  const f = fmt(pid, obd.liveValue('ambient'), units)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '5px 12px', minWidth: 58 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>Outside</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 1 }}>
        <span className="num" style={{ fontSize: 20, color: 'var(--text)', lineHeight: 1 }}>
          {f.value}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{f.unit}</span>
      </div>
    </div>
  )
}
