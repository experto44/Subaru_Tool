/* Subaru Tool — Web Bluetooth (BLE) transport.
 *
 * For BLE-class ELM327 adapters (e.g. Vgate iCar Pro BLE, many "OBDII BLE"
 * dongles). Uses the common Nordic-UART-style write/notify characteristics
 * exposed by these clones. Classic-Bluetooth (SPP) adapters are NOT reachable
 * from a browser — use the Android build (Capacitor transport) for those.
 *
 * Note: requires a user gesture and a secure context (https or localhost). */

const KNOWN_SERVICES = [
  '0000fff0-0000-1000-8000-00805f9b34fb', // FFF0 (most common)
  '0000ffe0-0000-1000-8000-00805f9b34fb', // FFE0 (HM-10 style)
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART
]

export class WebBluetoothTransport {
  constructor() {
    this.kind = 'ble'
    this.name = 'BLE adapter'
    this._cb = null
    this.device = null
    this.writeChar = null
    this.notifyChar = null
    this._decoder = new TextDecoder()
    this._encoder = new TextEncoder()
  }

  static get available() {
    return typeof navigator !== 'undefined' && !!navigator.bluetooth
  }

  onData(cb) {
    this._cb = cb
  }

  async connect() {
    if (!WebBluetoothTransport.available) throw new Error('Web Bluetooth not supported on this device/browser')
    this.device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: KNOWN_SERVICES,
    })
    this.name = this.device.name || 'BLE adapter'
    const server = await this.device.gatt.connect()

    let svc = null
    for (const uuid of KNOWN_SERVICES) {
      try {
        svc = await server.getPrimaryService(uuid)
        if (svc) break
      } catch {
        /* try next */
      }
    }
    if (!svc) {
      const all = await server.getPrimaryServices()
      svc = all[0]
    }
    if (!svc) throw new Error('No usable BLE service on adapter')

    const chars = await svc.getCharacteristics()
    for (const c of chars) {
      if ((c.properties.write || c.properties.writeWithoutResponse) && !this.writeChar) this.writeChar = c
      if ((c.properties.notify || c.properties.indicate) && !this.notifyChar) this.notifyChar = c
    }
    if (!this.writeChar) throw new Error('No writable characteristic found')
    if (this.notifyChar) {
      await this.notifyChar.startNotifications()
      this.notifyChar.addEventListener('characteristicvaluechanged', (e) => {
        const text = this._decoder.decode(e.target.value)
        if (this._cb) this._cb(text)
      })
    }
    return true
  }

  async write(str) {
    if (!this.writeChar) throw new Error('Not connected')
    const data = this._encoder.encode(str)
    for (let i = 0; i < data.length; i += 20) {
      const slice = data.slice(i, i + 20)
      if (this.writeChar.properties.writeWithoutResponse) {
        await this.writeChar.writeValueWithoutResponse(slice)
      } else {
        await this.writeChar.writeValue(slice)
      }
    }
  }

  async disconnect() {
    try {
      if (this.notifyChar) await this.notifyChar.stopNotifications()
    } catch {
      /* ignore */
    }
    if (this.device && this.device.gatt.connected) this.device.gatt.disconnect()
  }
}
