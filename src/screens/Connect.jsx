/* Subaru Tool — Connect screen.
 *
 * Lets the user pick a transport and connect. Three transport kinds, mirroring
 * how Active OBD reaches different adapters:
 *   • Classic Bluetooth (SPP/RFCOMM)  — real ELM327 dongles on Android
 *   • BLE (Web Bluetooth)             — BLE-class dongles in a browser
 *   • Demo                            — built-in ECU simulator, no hardware
 *
 * The handshake progress mirrors the ELM init (ATZ, protocol detect, ECU/VIN). */
import { useEffect, useState } from 'react'
import { useObd } from '../obd/useObd.jsx'
import { DemoTransport } from '../obd/transports/demo.js'
import { WebBluetoothTransport } from '../obd/transports/webBluetooth.js'
import { CapacitorBtTransport } from '../obd/transports/capacitorBt.js'
import { Card, Chip, SectionLabel, Btn } from '../components/ui.jsx'
import { Icon, StarCluster } from '../components/icons.jsx'

const STEPS = ['Opening Bluetooth link', 'ELM327 handshake (ATZ)', 'Detecting protocol', 'Reading ECU · VIN']

export function ConnectScreen() {
  const obd = useObd()
  const connecting = obd.status === 'connecting'
  const [classicList, setClassicList] = useState([])
  const [scanning, setScanning] = useState(false)
  const [classicAvail, setClassicAvail] = useState(false)
  const [stepI, setStepI] = useState(0)

  const bleAvail = WebBluetoothTransport.available

  useEffect(() => {
    let alive = true
    CapacitorBtTransport.available().then((ok) => {
      if (!alive) return
      setClassicAvail(ok)
      if (ok) scanClassic()
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!connecting) {
      setStepI(0)
      return
    }
    const iv = setInterval(() => setStepI((s) => Math.min(STEPS.length - 1, s + 1)), 700)
    return () => clearInterval(iv)
  }, [connecting])

  async function scanClassic() {
    setScanning(true)
    try {
      const devices = await CapacitorBtTransport.list()
      setClassicList(
        devices.map((d) => ({
          name: d.name || d.address,
          address: d.address || d.id,
        }))
      )
    } catch {
      setClassicList([])
    }
    setScanning(false)
  }

  function connectDemo() {
    obd.connect(new DemoTransport())
  }
  function connectBle() {
    obd.connect(new WebBluetoothTransport())
  }
  function connectClassic(d) {
    obd.connect(new CapacitorBtTransport(d.address, d.name))
  }

  return (
    <div className="screen-pad" style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: '100%', maxWidth: 560, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 18 }}>
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          {connecting && <span className="ping" />}
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 26,
              display: 'grid',
              placeItems: 'center',
              background: 'var(--accent-soft)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <StarCluster size={50} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.01em' }}>
            {connecting ? 'Connecting…' : 'Connect adapter'}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-dim)', marginTop: 4 }}>
            {connecting ? 'Linking to your vehicle…' : 'Pair an OBD-II adapter to begin'}
          </div>
        </div>
      </div>

      {obd.status === 'error' && (
        <Card style={{ borderColor: 'rgba(255,84,104,.4)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: 'var(--bad)', display: 'flex' }}>
            <Icon name="warn" size={22} sw={2} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Connection failed</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2 }}>{obd.error}</div>
          </div>
        </Card>
      )}

      {connecting ? (
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: i <= stepI ? 1 : 0.38 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  background: i < stepI ? 'var(--good)' : i === stepI ? 'var(--accent)' : 'var(--surface-2)',
                  color: i <= stepI ? '#04201a' : 'var(--text-faint)',
                }}
              >
                {i < stepI ? (
                  <Icon name="check" size={14} sw={2.6} />
                ) : (
                  <span className={i === stepI ? 'spin' : ''} style={{ fontSize: 12, fontWeight: 700, color: i === stepI ? '#fff' : 'inherit' }}>
                    {i === stepI ? '◌' : i + 1}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: i === stepI ? 600 : 400 }}>{s}</span>
            </div>
          ))}
        </Card>
      ) : (
        <>
          {/* Classic Bluetooth adapters (Android) */}
          {classicAvail && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionLabel>Paired adapters</SectionLabel>
                <button
                  onClick={scanClassic}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <span className={scanning ? 'spin' : ''} style={{ display: 'inline-flex' }}>
                    <Icon name="refresh" size={15} />
                  </span>
                  {scanning ? 'Scanning…' : 'Refresh'}
                </button>
              </div>
              {classicList.map((a) => (
                <Card
                  key={a.address}
                  pad={14}
                  onClick={() => connectClassic(a)}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer' }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', color: 'var(--accent)' }}>
                    <Icon name="bluetooth" size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{a.name}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>{a.address}</div>
                  </div>
                  <Icon name="chevron" size={18} stroke="var(--text-faint)" />
                </Card>
              ))}
              {!classicList.length && !scanning && (
                <div style={{ fontSize: 12.5, color: 'var(--text-faint)', padding: '4px 2px' }}>
                  No paired devices. Pair your ELM327 in Android Bluetooth settings, then Refresh.
                </div>
              )}
            </div>
          )}

          {/* Other connection methods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionLabel>Connection method</SectionLabel>
            {bleAvail && (
              <Card pad={14} onClick={connectBle} style={{ display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', color: 'var(--accent)' }}>
                  <Icon name="bluetooth" size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Bluetooth LE adapter</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>Pick a BLE ELM327 dongle</div>
                </div>
                <Icon name="chevron" size={18} stroke="var(--text-faint)" />
              </Card>
            )}
            <Card pad={14} onClick={connectDemo} style={{ display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(47,211,145,.14)', color: 'var(--good)' }}>
                <Icon name="power" size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Demo mode</span>
                  <Chip tone="good">No hardware</Chip>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>Built-in Subaru ECU simulator</div>
              </div>
              <Icon name="chevron" size={18} stroke="var(--text-faint)" />
            </Card>
          </div>

          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--text-faint)', paddingTop: 6, lineHeight: 1.5 }}>
            Supports ELM327 over ISO 15765-4 CAN, ISO 14230-4 KWP, SAE J1850 ·<br />Subaru SSM extended sensors
          </div>
        </>
      )}
    </div>
  )
}
