/* Subaru Tool — shared UI atoms (ported from the design). */
import { Icon } from './icons.jsx'

export function Card({ children, style, className = '', onClick, pad = 16 }) {
  return (
    <div
      className={'card ' + className}
      onClick={onClick}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: pad, ...style }}
    >
      {children}
    </div>
  )
}

export function Chip({ children, tone = 'default', style }) {
  const tones = {
    default: ['var(--surface-2)', 'var(--text-dim)'],
    accent: ['var(--accent-soft)', 'var(--accent)'],
    good: ['rgba(47,211,145,.14)', 'var(--good)'],
    warn: ['rgba(255,176,32,.16)', 'var(--warn)'],
    bad: ['rgba(255,84,104,.16)', 'var(--bad)'],
  }
  const [bg, fg] = tones[tone] || tones.default
  return (
    <span
      style={{
        background: bg,
        color: fg,
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 999,
        letterSpacing: '.03em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function SectionLabel({ children, style }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-faint)', ...style }}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, tone = 'accent', icon, ghost, style, size = 'md', disabled }) {
  const pads = { sm: '7px 12px', md: '11px 16px', lg: '14px 20px' }
  const tones = {
    accent: ghost ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : { background: 'var(--accent)', color: '#fff' },
    neutral: { background: 'var(--surface-2)', color: 'var(--text)' },
    bad: ghost ? { background: 'rgba(255,84,104,.14)', color: 'var(--bad)' } : { background: 'var(--bad)', color: '#fff' },
    good: { background: 'var(--good)', color: '#04201a' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        border: 'none',
        borderRadius: 12,
        padding: pads[size],
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        ...tones[tone],
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={17} sw={2} />} {children}
    </button>
  )
}

export function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      style={{
        width: 46,
        height: 27,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        padding: 3,
        background: on ? 'var(--accent)' : 'var(--surface-2)',
        transition: 'background .2s',
        display: 'flex',
        justifyContent: on ? 'flex-end' : 'flex-start',
      }}
    >
      <span style={{ width: 21, height: 21, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.4)', transition: 'all .2s' }} />
    </button>
  )
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--surface-2)', borderRadius: 11, padding: 3, gap: 2, ...style }}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value
        const label = typeof o === 'string' ? o : o.label
        const active = v === value
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              border: 'none',
              cursor: 'pointer',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--text-dim)',
              transition: 'all .15s',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function Sheet({ open, onClose, title, children, side }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'rgba(2,4,10,.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: side ? 'stretch' : 'flex-end',
        justifyContent: side ? 'flex-end' : 'center',
        animation: 'fade .2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet"
        style={{
          background: 'var(--bg-2)',
          borderTop: side ? 'none' : '1px solid var(--border-strong)',
          borderLeft: side ? '1px solid var(--border-strong)' : 'none',
          width: side ? 'min(440px, 86%)' : '100%',
          maxHeight: side ? '100%' : '88%',
          height: side ? '100%' : 'auto',
          borderRadius: side ? '0' : '22px 22px 0 0',
          display: 'flex',
          flexDirection: 'column',
          animation: side ? 'slideL .26s cubic-bezier(.2,.8,.2,1)' : 'slideUp .26s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
          <button
            onClick={onClose}
            style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 9, width: 32, height: 32, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-dim)' }}
          >
            <Icon name="x" size={17} sw={2} />
          </button>
        </div>
        <div style={{ padding: 18, overflowY: 'auto' }} className="app-scroll">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel, tone = 'bad', icon = 'warn' }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: 'rgba(2,4,10,.66)',
        backdropFilter: 'blur(3px)',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        animation: 'fade .18s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 20, padding: 22, width: 'min(360px,100%)', animation: 'pop .2s ease' }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            display: 'grid',
            placeItems: 'center',
            background: tone === 'bad' ? 'rgba(255,84,104,.14)' : 'var(--accent-soft)',
            color: tone === 'bad' ? 'var(--bad)' : 'var(--accent)',
            marginBottom: 14,
          }}
        >
          <Icon name={icon} size={24} sw={2} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 18 }}>{body}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn tone="neutral" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Btn>
          <Btn tone={tone} onClick={onConfirm} style={{ flex: 1 }}>
            {confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  )
}
