# Subaru Tool

A modern, responsive **OBD-II diagnostic app for Subaru vehicles** — a technical
re-implementation of the *Active OBD* Android app, rebuilt with a fresh, refined
UI that works in both **portrait and landscape** (phone and tablet).

It connects to a Subaru over an **ELM327 Bluetooth adapter**, reads **live data
and sensors**, and **reads / clears trouble codes** — exactly like Active OBD —
while presenting everything in a new visual design.

> The UI was designed in a separate prototype (the uploaded *Subaru Tool*
> design). This project ports that design into a real, buildable app and wires it
> to a working OBD engine that mirrors Active OBD's functionality.

## Features

- **Live Dashboard** — configurable widget grid (ring / bar / value / temperature
  cluster / AWD torque split). Reorder, retype, add or remove any supported sensor.
- **Live Data** — every supported PID, searchable and grouped (Engine, Temps,
  Air/Fuel, Turbo, Drivetrain, System), with rolling sparklines and favourites.
- **Trouble Codes** — reads stored (Mode 03), pending (Mode 07) and permanent
  (Mode 0A) DTCs with human descriptions, readiness monitors, MIL status, and
  one-tap **Clear codes** (Mode 04).
- **Freeze Frame** — sensor snapshot recorded at the moment of fault.
- **Graphs & Logging** — plot up to 4 live channels with a recording session.
- **Settings** — metric/imperial units, three themes (Carbon / Daylight / Sport),
  accent colour, adapter & vehicle info.
- **Responsive** — bottom tab bar in portrait, side rail in landscape/tablet,
  with safe-area (notch / gesture bar) handling.

## Supported sensors

Every sensor Active OBD supports for Subaru is represented:

- **Standard SAE J1979** PIDs: engine load, RPM, vehicle speed, timing advance,
  throttle/pedal positions, coolant / intake / ambient / catalyst / oil temps,
  MAP, MAF, short/long fuel trims (B1/B2), fuel & rail pressure, O2 sensors,
  commanded EGR / EVAP / equivalence ratio, barometric pressure, fuel level,
  control-module voltage, run time, distances, warm-ups, and more.
- **Subaru SSM / extended** PIDs: boost / manifold relative pressure, engine oil
  temperature, AT/CVT fluid temperature, wideband A/F ratio, **knock correction**,
  **fine knock learning**, ignition advance multiplier (IAM), MAF voltage, tumble
  generator valve (TGV), wastegate duty, **AWD front/rear torque distribution**,
  and gear position.

See [`src/obd/pids.js`](src/obd/pids.js) for the full catalogue and decode
formulas.

## Architecture

```
src/
  obd/                     # the OBD engine (no UI)
    pids.js                # PID catalogue + decode formulas (standard + Subaru SSM)
    dtc.js                 # DTC + readiness-monitor decoding (Mode 03/07/0A, PID 01)
    dtcDatabase.js         # human DTC descriptions + severity
    elm327.js              # ELM327 driver: AT handshake, queueing, response parsing
    format.js              # value formatting + unit conversion
    useObd.jsx             # React context: polling loop, codes, vehicle, API
    dashboardConfig.js     # default dashboard layout
    transports/
      demo.js              # built-in Subaru ECU simulator (no hardware)
      webBluetooth.js      # BLE adapters (Web Bluetooth, browser)
      capacitorBt.js       # classic Bluetooth SPP adapters (Android, Capacitor)
  components/              # icons, UI atoms, gauges, navigation chrome
  screens/                # Connect, Dashboard, LiveData, Codes, FreezeFrame, Graphs, Settings, Customize
  hooks/                  # usePersist, useOrientation
  App.jsx                 # responsive shell + navigation
```

The UI never talks to hardware directly — it reads from `useObd()`. Swapping the
**transport** is the only difference between the in-browser demo and a real car.

## Connection methods

| Method | Where | Adapter type |
| --- | --- | --- |
| **Demo mode** | any browser | built-in simulator (no hardware) |
| **Bluetooth LE** | browser (Chrome/Edge, HTTPS) | BLE ELM327 dongles |
| **Bluetooth Classic (SPP)** | Android build | standard ELM327 dongles (OBDLink, Vgate, KONNWEI, generic) |

Most OBD dongles are **classic Bluetooth**, which browsers cannot reach — those
work through the Android (Capacitor) build below.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173  (use Demo mode)
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Android build (real adapters)

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npm i @e-is/capacitor-bluetooth-serial     # classic Bluetooth SPP plugin
npm run build
npx cap add android
npx cap sync android
npx cap open android                        # build/run in Android Studio
```

Grant the Bluetooth (and, on older Android, Location) permissions, pair your
ELM327 in Android settings, then open the app and pick it from **Paired adapters**.

## Credit / scope

Functional reference: *Active OBD* (`com.activeobd.app`). This project reproduces
its diagnostic behaviour (ELM327 protocol, Subaru sensor set, DTC read/clear) under
a new, original UI. It is not affiliated with ActiveOBD.com or Subaru.
