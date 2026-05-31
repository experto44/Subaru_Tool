/* Subaru Tool — Capacitor Bluetooth Classic (SPP/RFCOMM) transport.
 *
 * This is the transport that makes the app behave EXACTLY like Active OBD on
 * real hardware: it talks to classic-Bluetooth ELM327 dongles (OBDLink MX+,
 * Vgate iCar, KONNWEI, generic "OBDII") over the Serial Port Profile, which
 * is what the vast majority of OBD adapters use.
 *
 * It lazy-loads the `@e-is/capacitor-bluetooth-serial` plugin so the web build
 * (which doesn't bundle it) still compiles. Install for Android with:
 *
 *   npm i @e-is/capacitor-bluetooth-serial
 *   npx cap sync android
 */

let BluetoothSerial = null
async function loadPlugin() {
  if (BluetoothSerial) return BluetoothSerial
  const mod = await import(/* @vite-ignore */ '@e-is/capacitor-bluetooth-serial')
  BluetoothSerial = mod.BluetoothSerial
  return BluetoothSerial
}

export class CapacitorBtTransport {
  constructor(address, name) {
    this.kind = 'classic'
    this.address = address
    this.name = name || address || 'OBD adapter'
    this._cb = null
    this._listener = null
  }

  static async available() {
    try {
      await loadPlugin()
      return true
    } catch {
      return false
    }
  }

  /** Discover paired/nearby classic adapters. Returns [{name, address}]. */
  static async list() {
    const BT = await loadPlugin()
    const res = await BT.list()
    return (res && (res.devices || res.result || res)) || []
  }

  onData(cb) {
    this._cb = cb
  }

  async connect() {
    const BT = await loadPlugin()
    await BT.connect({ address: this.address })
    this._listener = await BT.addListener('onRead', (data) => {
      const text = typeof data === 'string' ? data : data.value || ''
      if (this._cb) this._cb(text)
    })
    if (BT.startReading) await BT.startReading()
    return true
  }

  async write(str) {
    const BT = await loadPlugin()
    await BT.write({ value: str })
  }

  async disconnect() {
    const BT = await loadPlugin()
    try {
      if (this._listener) this._listener.remove()
    } catch {
      /* ignore */
    }
    try {
      await BT.disconnect()
    } catch {
      /* ignore */
    }
  }
}
