/* Subaru Tool — Demo transport.
 *
 * Emulates an ELM327 + a Subaru ECU entirely in-app so the full application
 * (live gauges, DTC read/clear, freeze frame, monitors, VIN) works in any
 * browser with no hardware. It speaks the real ELM wire protocol, so it
 * exercises the exact same parsing path as a physical adapter. */

import { ALL_PIDS, pidByPid } from '../pids.js'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

// ---- value simulation (ported from the approved prototype) ----------------
function wander(base, amp, speed, seedPhase) {
  return (t) =>
    base +
    Math.sin(t * speed + seedPhase) * amp * 0.6 +
    Math.sin(t * speed * 2.3 + seedPhase * 1.7) * amp * 0.25 +
    (Math.random() - 0.5) * amp * 0.18
}

const SIM = {
  rpm: wander(2600, 1400, 0.7, 0.2),
  speed: wander(72, 38, 0.35, 1.1),
  coolant: wander(91, 4, 0.06, 0.4),
  boost: (t) => Math.max(-0.6, wander(0.65, 0.85, 0.6, 2.0)(t)),
  load: (t) => Math.min(100, Math.max(8, wander(48, 36, 0.5, 0.9)(t))),
  throttle: (t) => Math.min(100, Math.max(4, wander(34, 32, 0.55, 1.6)(t))),
  iat: wander(38, 6, 0.05, 2.4),
  oil_temp: wander(98, 6, 0.04, 0.7),
  cvt_temp: wander(83, 5, 0.035, 1.4),
  maf: (t) => Math.max(2, wander(46, 40, 0.6, 1.3)(t)),
  map: wander(118, 60, 0.55, 0.5),
  afr: wander(12.4, 1.8, 0.5, 1.9),
  stft1: wander(1.2, 6, 0.7, 0.3),
  ltft1: wander(-2.1, 2, 0.08, 1.2),
  timing: wander(18, 12, 0.6, 2.2),
  knock: (t) => Math.min(0, wander(-0.4, 1.2, 0.9, 2.7)(t)),
  fklc: wander(-0.5, 0.8, 0.05, 1.0),
  o2_b1s1: (t) => Math.min(1.05, Math.max(0.05, wander(0.55, 0.45, 1.4, 0.8)(t))),
  module_voltage: wander(14.1, 0.4, 0.07, 0.6),
  fuel_level: (t) => 58 - ((t * 0.02) % 20),
  cat_b1s1: wander(620, 80, 0.1, 0.9),
  abs_map: wander(99, 1, 0.02, 0.3),
  awd_f: (t) => Math.round(Math.max(5, Math.min(95, wander(42, 22, 0.9, 2.1)(t)))),
  ambient: wander(18, 1.5, 0.01, 0.5),
}

function simValue(pid, t) {
  if (SIM[pid.id]) return SIM[pid.id](t)
  const mid = (pid.min + pid.max) / 2
  const amp = (pid.max - pid.min) * 0.18
  return wander(mid, amp, 0.3, (pid.pid.charCodeAt(2) % 7) * 0.5)(t)
}

// Invert a (monotonic-increasing) decode formula to raw bytes via binary
// search — lets the demo emit byte-accurate ELM frames.
function encodeMetric(pid, value) {
  const maxRaw = Math.pow(256, pid.bytes) - 1
  let lo = 0
  let hi = maxRaw
  for (let i = 0; i < 24; i++) {
    const mid = Math.floor((lo + hi) / 2)
    const d = pid.decode(rawToBytes(mid, pid.bytes))
    if (d < value) lo = mid + 1
    else hi = mid
  }
  return rawToBytes(lo, pid.bytes)
}
function rawToBytes(raw, n) {
  const out = []
  for (let i = n - 1; i >= 0; i--) out.unshift((raw >> (i * 8)) & 0xff)
  return out
}
const hx = (n) => n.toString(16).toUpperCase().padStart(2, '0')

const DEFAULT_CODES = {
  stored: ['P0301', 'P0420', 'P0011'],
  pending: ['P0171'],
  permanent: ['P0301'],
}

function encodeDtc(code) {
  const LETTER = { P: 0, C: 1, B: 2, U: 3 }
  const a = (LETTER[code[0]] << 6) | (parseInt(code[1], 16) << 4) | parseInt(code[2], 16)
  const b = (parseInt(code[3], 16) << 4) | parseInt(code[4], 16)
  return hx(a) + hx(b)
}

export class DemoTransport {
  constructor() {
    this.kind = 'demo'
    this.name = 'Demo ECU (simulator)'
    this._cb = null
    this._t0 = now()
    this.codes = JSON.parse(JSON.stringify(DEFAULT_CODES))
  }
  onData(cb) {
    this._cb = cb
  }
  async connect() {
    this._t0 = now()
    return true
  }
  async disconnect() {
    return true
  }
  _emit(text) {
    if (this._cb) this._cb(text + '\r>')
  }
  async write(raw) {
    const cmd = raw.trim().toUpperCase()
    setTimeout(() => this._respond(cmd), 10)
  }
  _respond(cmd) {
    const t = (now() - this._t0) / 1000
    if (cmd.startsWith('AT')) {
      if (cmd === 'ATZ') return this._emit('ELM327 v1.5')
      if (cmd === 'ATRV') return this._emit('14.1V')
      if (cmd === 'ATDP') return this._emit('AUTO, ISO 15765-4 (CAN 11/500)')
      return this._emit('OK')
    }
    if (cmd === '0100') return this._emit('41 00 BE 3F A8 13')
    if (cmd === '0101') return this._emit('41 01 83 07 65 04') // MIL on, 3 DTCs, monitors
    if (cmd === '0902') {
      const vin = 'JF1VA2U69J9812345'
      const bytes = vin.split('').map((c) => hx(c.charCodeAt(0)))
      return this._emit('49 02 01 ' + bytes.join(' '))
    }
    if (cmd === '03' || cmd === '07' || cmd === '0A') {
      const list = cmd === '03' ? this.codes.stored : cmd === '07' ? this.codes.pending : this.codes.permanent
      const respMode = cmd === '0A' ? '4A' : cmd === '07' ? '47' : '43'
      if (!list.length) return this._emit(respMode + ' 00')
      const payload = list.map(encodeDtc).join(' ')
      return this._emit(`${respMode} ${hx(list.length)} ${payload}`)
    }
    if (cmd === '04') {
      this.codes = { stored: [], pending: [], permanent: [] }
      return this._emit('44')
    }
    const pid = pidByPid(cmd)
    if (pid) {
      const bytes = encodeMetric(pid, simValue(pid, t))
      const respMode = (parseInt(pid.mode, 16) + 0x40).toString(16).toUpperCase().padStart(2, '0')
      const pidByte = pid.pid.slice(2)
      return this._emit(`${respMode} ${pidByte} ${bytes.map(hx).join(' ')}`)
    }
    this._emit('NO DATA')
  }
}

export const DEMO_PID_COUNT = ALL_PIDS.length
