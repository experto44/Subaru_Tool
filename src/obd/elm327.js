/* Subaru Tool — ELM327 protocol driver.
 *
 * Speaks the ELM327 AT command set over a pluggable Transport (Bluetooth
 * Classic / BLE / Demo). Handles the init handshake, command queueing (the
 * ELM is half-duplex — one outstanding command at a time, terminated by the
 * ">" prompt), and parsing of OBD responses into raw data byte arrays.
 *
 * Transport contract:
 *   await transport.connect()
 *   await transport.write(string)        // we append \r
 *   transport.onData(cb)                 // cb(textChunk)
 *   await transport.disconnect()
 */

const PROMPT = '>'

export class Elm327 {
  constructor(transport, { log } = {}) {
    this.t = transport
    this.log = log || (() => {})
    this.buffer = ''
    this._pending = null
    this._queue = Promise.resolve()
    this.connected = false
    this.protocol = ''
    this.t.onData((chunk) => this._onData(chunk))
  }

  _onData(chunk) {
    this.buffer += chunk
    if (this.buffer.includes(PROMPT)) {
      const idx = this.buffer.indexOf(PROMPT)
      const response = this.buffer.slice(0, idx)
      this.buffer = this.buffer.slice(idx + 1)
      if (this._pending) {
        const p = this._pending
        this._pending = null
        clearTimeout(p.timer)
        p.resolve(this._clean(response))
      }
    }
  }

  _clean(s) {
    return s
      .replace(/\r/g, '\n')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && l !== PROMPT)
      .join('\n')
  }

  /** Send a raw command and await the ELM response text. Commands are
   *  serialised through an internal queue so the half-duplex ELM only ever
   *  has one outstanding request. */
  send(cmd, { timeout = 4000 } = {}) {
    const run = () =>
      new Promise((resolve, reject) => {
        this.log('>> ' + cmd)
        const timer = setTimeout(() => {
          this._pending = null
          reject(new Error('ELM timeout: ' + cmd))
        }, timeout)
        this._pending = { resolve, reject, timer }
        this.t.write(cmd + '\r').catch((e) => {
          if (this._pending) {
            clearTimeout(this._pending.timer)
            this._pending = null
          }
          reject(e)
        })
      }).then((r) => {
        this.log('<< ' + r)
        return r
      })

    // chain on the queue; swallow prior errors so one failure doesn't poison
    // the whole queue
    const result = this._queue.then(run, run)
    this._queue = result.catch(() => {})
    return result
  }

  /** Full ELM init handshake (mirrors what Active OBD does on connect). */
  async init() {
    await this.t.connect()
    await this.send('ATZ', { timeout: 6000 })
    await this.send('ATE0')
    await this.send('ATL0')
    await this.send('ATS0')
    await this.send('ATH1')
    await this.send('ATSP0')
    await this.send('0100', { timeout: 8000 })
    const dp = await this.send('ATDP')
    this.protocol = dp
    this.connected = true
    return dp
  }

  async readVoltage() {
    const r = await this.send('ATRV')
    const m = r.match(/([\d.]+)/)
    return m ? parseFloat(m[1]) : null
  }

  async readVin() {
    const r = await this.send('0902', { timeout: 6000 })
    return parseVin(r)
  }

  async readPid(pid) {
    const r = await this.send(pid.pid)
    const bytes = parseObdResponse(r, pid)
    if (!bytes || bytes.length < pid.bytes) return null
    try {
      return pid.decode(bytes)
    } catch {
      return null
    }
  }

  async readRawService(service) {
    const r = await this.send(service, { timeout: 6000 })
    return parseServiceBytes(r, service)
  }

  async clearDtc() {
    const r = await this.send('04', { timeout: 6000 })
    return /44|OK/i.test(r)
  }

  async disconnect() {
    this.connected = false
    try {
      await this.t.disconnect()
    } catch {
      /* ignore */
    }
  }
}

// ---- response parsing ------------------------------------------------------

const HEX2 = /^[0-9A-F]{2}$/i

function tokenize(line) {
  return line.replace(/[^0-9A-Fa-f]/g, '').match(/.{1,2}/g) || []
}

function isError(text) {
  return /NO DATA|UNABLE TO CONNECT|CAN ERROR|BUS INIT|ERROR|STOPPED|\?/i.test(text)
}

/** Parse a Mode 01/22 response into the data bytes AFTER the response header. */
export function parseObdResponse(text, pid) {
  if (!text || isError(text)) return null
  const respMode = (parseInt(pid.mode, 16) + 0x40).toString(16).toUpperCase().padStart(2, '0')
  const pidByte = pid.pid.slice(2)
  const lines = text.split('\n')
  for (const line of lines) {
    const toks = tokenize(line)
    for (let i = 0; i < toks.length - 1; i++) {
      if (toks[i].toUpperCase() === respMode) {
        const after = toks.slice(i + 1)
        const pidTokens = pidByte.match(/.{1,2}/g) || []
        let ok = true
        for (let k = 0; k < pidTokens.length; k++) {
          if ((after[k] || '').toUpperCase() !== pidTokens[k].toUpperCase()) {
            ok = false
            break
          }
        }
        if (ok) {
          const data = after.slice(pidTokens.length, pidTokens.length + pid.bytes)
          if (data.length >= pid.bytes && data.every((t) => HEX2.test(t))) {
            return data.map((t) => parseInt(t, 16))
          }
        }
      }
    }
  }
  return null
}

/** Parse a Mode 03/07/0A response into the DTC data bytes, supporting
 *  multi-frame CAN. */
export function parseServiceBytes(text, service) {
  if (!text || isError(text)) return []
  const respMode = (parseInt(service.slice(0, 2), 16) + 0x40).toString(16).toUpperCase().padStart(2, '0')
  const out = []
  for (const line of text.split('\n')) {
    const toks = tokenize(line).map((t) => t.toUpperCase())
    const mi = toks.indexOf(respMode)
    if (mi >= 0) {
      const rest = toks.slice(mi + 1).filter((t) => HEX2.test(t))
      out.push(...rest.map((t) => parseInt(t, 16)))
    }
  }
  return out
}

/** Parse Mode 09 PID 02 multi-frame VIN response into an ASCII string. */
export function parseVin(text) {
  if (!text || isError(text)) return ''
  const bytes = []
  for (const line of text.split('\n')) {
    const toks = tokenize(line).map((t) => t.toUpperCase())
    const mi = toks.indexOf('49')
    if (mi >= 0 && toks[mi + 1] === '02') {
      const rest = toks.slice(mi + 3)
      bytes.push(...rest)
    }
  }
  const ascii = bytes
    .map((t) => parseInt(t, 16))
    .filter((n) => n >= 0x20 && n <= 0x7e)
    .map((n) => String.fromCharCode(n))
    .join('')
  return ascii.trim()
}
