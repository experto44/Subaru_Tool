/* Subaru Tool — value formatting & unit conversion (ported from the design). */

export function fmt(pid, metricVal, units) {
  if (metricVal == null || Number.isNaN(metricVal)) {
    return { value: '—', unit: pid.unit, raw: null }
  }
  let v = metricVal
  let unit = pid.unit
  if (units === 'imperial' && pid.uconv) {
    v = pid.uconv(metricVal)
    unit = pid.uunit
  }
  const d = pid.decimals ?? 0
  let s = v.toFixed(d)
  if (d === 0 && Math.abs(v) >= 1000) s = Math.round(v).toLocaleString('en-US').replace(/,/g, ' ')
  if (pid.signed && v > 0) s = '+' + s
  return { value: s, unit, raw: v }
}

export function pctOf(pid, metricVal) {
  if (metricVal == null) return 0
  const r = (metricVal - pid.min) / (pid.max - pid.min)
  return Math.max(0, Math.min(1, r))
}

export function statusOf(pid, metricVal) {
  if (metricVal == null) return 'ok'
  if (pid.warnAbove != null && metricVal >= pid.warnAbove) return 'bad'
  if (pid.warnBelow != null && metricVal <= pid.warnBelow) return 'bad'
  if (pid.redline != null && metricVal >= pid.redline) return 'warn'
  return 'ok'
}
