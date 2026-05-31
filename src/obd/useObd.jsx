/* Subaru Tool — OBD engine React context.
 *
 * Owns the ELM327 driver + transport, runs the live polling loop, and exposes
 * a stable API to the UI:
 *   status, connect(transport), disconnect()
 *   liveValue(id), liveHistory(id)
 *   subscribe(ids)
 *   readCodes(), clearCodes(), codes, monitors, mil, dtcCount
 *   vehicle { vin, protocol, voltage }
 *
 * The loop only polls PIDs that screens have subscribed to, round-robin, like
 * Active OBD streams the gauges currently on screen. Re-renders are driven by a
 * throttled animation frame so many gauges stay smooth and cheap. */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { Elm327 } from './elm327.js'
import { ALL_PIDS, pidById } from './pids.js'
import { decodeDtcBytes, decodeMonitors, monitorState } from './dtc.js'
import { describeDtc, severityOf } from './dtcDatabase.js'

const HISTORY = 120
const ObdContext = createContext(null)

export function ObdProvider({ children }) {
  const [status, setStatus] = useState('disconnected')
  const [error, setError] = useState('')
  const [adapter, setAdapter] = useState({ name: '', kind: '' })
  const [vehicle, setVehicle] = useState({ vin: '', protocol: '', voltage: null })
  const [codes, setCodes] = useState([])
  const [monitorInfo, setMonitorInfo] = useState({ mil: false, dtcCount: 0, monitors: [] })
  const [, setFrame] = useState(0)

  const elmRef = useRef(null)
  const valuesRef = useRef({})
  const histRef = useRef({})
  const subsRef = useRef(new Set())
  const runningRef = useRef(false)
  const rafRef = useRef(0)

  useEffect(() => {
    if (status !== 'connected') return
    let last = 0
    const tick = (ts) => {
      if (ts - last > 66) {
        last = ts
        setFrame((f) => (f + 1) % 1e9)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [status])

  const pushValue = useCallback((id, v) => {
    valuesRef.current[id] = v
    let h = histRef.current[id]
    if (!h) h = histRef.current[id] = []
    h.push(v)
    if (h.length > HISTORY) h.shift()
  }, [])

  const pollLoop = useCallback(async () => {
    if (runningRef.current) return
    runningRef.current = true
    const elm = elmRef.current
    while (runningRef.current && elm && elm.connected) {
      const ids = Array.from(subsRef.current)
      if (!ids.length) {
        await new Promise((r) => setTimeout(r, 120))
        continue
      }
      for (const id of ids) {
        if (!runningRef.current) break
        const pid = pidById(id)
        if (!pid) continue
        try {
          const v = await elm.readPid(pid)
          if (v != null) pushValue(id, v)
        } catch {
          /* keep streaming the rest */
        }
      }
      try {
        const rv = await elm.readVoltage()
        if (rv != null) setVehicle((s) => (s.voltage === rv ? s : { ...s, voltage: rv }))
      } catch {
        /* ignore */
      }
    }
    runningRef.current = false
  }, [pushValue])

  const readCodes = useCallback(async () => {
    const elm = elmRef.current
    if (!elm || !elm.connected) return
    const build = (list, statusLabel) =>
      list.map((code) => ({ code, status: statusLabel, desc: describeDtc(code), severity: severityOf(code) }))
    try {
      const stored = decodeDtcBytes(await elm.readRawService('03'))
      const pending = decodeDtcBytes(await elm.readRawService('07'))
      let permanent = []
      try {
        permanent = decodeDtcBytes(await elm.readRawService('0A'))
      } catch {
        /* 0A not supported everywhere */
      }
      const all = [
        ...build(stored, 'confirmed'),
        ...build(pending.filter((c) => !stored.includes(c)), 'pending'),
        ...build(permanent.filter((c) => !stored.includes(c) && !pending.includes(c)), 'permanent'),
      ]
      setCodes(all)
    } catch {
      /* keep prior codes on transient error */
    }
    try {
      const r = await elm.send('0101')
      const m = r.match(/41\s*01\s*([0-9A-Fa-f\s]+)/)
      if (m) {
        const bytes = (m[1].replace(/[^0-9A-Fa-f]/g, '').match(/.{1,2}/g) || []).slice(0, 4).map((t) => parseInt(t, 16))
        if (bytes.length === 4) {
          const dec = decodeMonitors(bytes)
          setMonitorInfo({
            mil: dec.mil,
            dtcCount: dec.dtcCount,
            monitors: dec.monitors.map((mo) => ({ name: mo.name, state: monitorState(mo) })),
          })
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  const clearCodes = useCallback(async () => {
    const elm = elmRef.current
    if (!elm || !elm.connected) return false
    const ok = await elm.clearDtc()
    if (ok) {
      setCodes([])
      setMonitorInfo((s) => ({ ...s, mil: false, dtcCount: 0 }))
    }
    return ok
  }, [])

  const connect = useCallback(
    async (transport) => {
      setError('')
      setStatus('connecting')
      setAdapter({ name: transport.name || 'Adapter', kind: transport.kind })
      try {
        const elm = new Elm327(transport, { log: () => {} })
        elmRef.current = elm
        const protocol = await elm.init()
        let vin = ''
        try {
          vin = await elm.readVin()
        } catch {
          /* VIN optional */
        }
        let voltage = null
        try {
          voltage = await elm.readVoltage()
        } catch {
          /* ignore */
        }
        setVehicle({ vin, protocol, voltage })
        setStatus('connected')
        pollLoop()
        readCodes()
        return true
      } catch (e) {
        setError(e.message || String(e))
        setStatus('error')
        elmRef.current = null
        return false
      }
    },
    [pollLoop, readCodes]
  )

  const disconnect = useCallback(async () => {
    runningRef.current = false
    const elm = elmRef.current
    elmRef.current = null
    valuesRef.current = {}
    histRef.current = {}
    if (elm) await elm.disconnect()
    setStatus('disconnected')
    setCodes([])
    setMonitorInfo({ mil: false, dtcCount: 0, monitors: [] })
    setVehicle({ vin: '', protocol: '', voltage: null })
  }, [])

  const subscribe = useCallback((ids) => {
    const set = subsRef.current
    ids.forEach((id) => set.add(id))
    return () => ids.forEach((id) => set.delete(id))
  }, [])

  const api = {
    status,
    error,
    adapter,
    vehicle,
    codes,
    mil: monitorInfo.mil,
    dtcCount: monitorInfo.dtcCount,
    monitors: monitorInfo.monitors,
    pids: ALL_PIDS,
    connect,
    disconnect,
    readCodes,
    clearCodes,
    subscribe,
    liveValue: (id) => valuesRef.current[id],
    liveHistory: (id) => histRef.current[id] || [],
  }

  return <ObdContext.Provider value={api}>{children}</ObdContext.Provider>
}

export function useObd() {
  const ctx = useContext(ObdContext)
  if (!ctx) throw new Error('useObd must be used within <ObdProvider>')
  return ctx
}

/** Register a set of PID ids for live polling for the lifetime of a screen. */
export function useSubscribe(ids) {
  const { subscribe } = useObd()
  const key = ids.join(',')
  useEffect(() => subscribe(ids), [key]) // eslint-disable-line react-hooks/exhaustive-deps
}
