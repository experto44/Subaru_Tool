/* Subaru Tool — application root.
 *
 * Wires the OBD engine to the responsive UI. Real fullscreen layout that adapts
 * to the device: bottom tab bar in portrait, side rail in landscape/tablet.
 * Theme, accent and units persist; the dashboard layout persists too. */
import { useEffect, useState } from 'react'
import { ObdProvider, useObd } from './obd/useObd.jsx'
import { usePersist } from './hooks/usePersist.js'
import { useOrientation } from './hooks/useOrientation.js'
import { DEFAULT_DASH } from './obd/dashboardConfig.js'
import { Header, TabBar, SideRail } from './components/Nav.jsx'
import { ConfirmDialog } from './components/ui.jsx'
import { ConnectScreen } from './screens/Connect.jsx'
import { DashboardScreen } from './screens/Dashboard.jsx'
import { LiveDataScreen } from './screens/LiveData.jsx'
import { CodesScreen } from './screens/Codes.jsx'
import { FreezeFrameScreen } from './screens/FreezeFrame.jsx'
import { GraphsScreen } from './screens/Graphs.jsx'
import { SettingsScreen } from './screens/Settings.jsx'
import { CustomizeSheet } from './screens/Customize.jsx'

function Shell() {
  const obd = useObd()
  const layout = useOrientation()
  const wide = layout.wide
  const landscape = layout.landscape

  const [theme, setTheme] = usePersist('theme', 'carbon')
  const [accent, setAccent] = usePersist('accent', '#2f74ff')
  const [units, setUnits] = usePersist('units', 'metric')
  const [route, setRoute] = usePersist('route', 'dash')
  const [dash, setDash] = usePersist('dash_v1', DEFAULT_DASH)

  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [freezeCode, setFreezeCode] = useState(null)

  // apply theme + accent to the document root
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-soft', `color-mix(in srgb, ${accent} 15%, transparent)`)
  }, [theme, accent])

  const connected = obd.status === 'connected'

  // Pre-connection: full-bleed connect screen.
  if (!connected) {
    return (
      <div className="app-root">
        <div className="app-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          <ConnectScreen />
        </div>
      </div>
    )
  }

  let screen = null
  if (route === 'dash') screen = <DashboardScreen dash={dash} units={units} onEdit={() => setCustomizeOpen(true)} />
  else if (route === 'live') screen = <LiveDataScreen units={units} />
  else if (route === 'codes')
    screen = (
      <CodesScreen
        onClear={() => setConfirmClear(true)}
        onViewFreeze={(code) => {
          setFreezeCode(code)
          setRoute('freeze')
        }}
      />
    )
  else if (route === 'freeze') screen = <FreezeFrameScreen code={freezeCode} units={units} onBack={() => setRoute('codes')} />
  else if (route === 'graphs') screen = <GraphsScreen wide={wide} />
  else if (route === 'settings')
    screen = (
      <SettingsScreen
        units={units}
        setUnits={setUnits}
        theme={theme}
        setTheme={setTheme}
        accent={accent}
        setAccent={setAccent}
        onDisconnect={obd.disconnect}
      />
    )

  const content = (
    <div className="app-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg)' }}>
      {screen}
    </div>
  )

  return (
    <div className="app-root">
      {landscape ? (
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <SideRail route={route} setRoute={setRoute} onConn={() => setRoute('settings')} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Header adapter={obd.adapter} onConn={() => setRoute('settings')} />
            {content}
          </div>
        </div>
      ) : (
        <>
          <Header adapter={obd.adapter} onConn={() => setRoute('settings')} />
          {content}
          <TabBar route={route} setRoute={setRoute} />
        </>
      )}

      <CustomizeSheet open={customizeOpen} onClose={() => setCustomizeOpen(false)} dash={dash} setDash={setDash} side={wide} />
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={async () => {
          await obd.clearCodes()
          setConfirmClear(false)
        }}
        title="Clear all codes?"
        confirmLabel="Clear codes"
        icon="trash"
        body="This erases stored DTCs and turns off the check-engine light. Codes will return if the fault persists."
      />
    </div>
  )
}

export default function App() {
  return (
    <ObdProvider>
      <Shell />
    </ObdProvider>
  )
}
