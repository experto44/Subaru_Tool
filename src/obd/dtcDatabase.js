/* Subaru Tool — DTC description database.
 *
 * A curated set of the most common generic (SAE J2012) and Subaru-specific
 * trouble codes. `describeDtc()` falls back to a structured generic
 * description (system + subsystem) for any code not in the table, so every
 * code read from the ECU shows a meaningful label. */

export const DTC_DB = {
  // ---- Fuel & air metering ----
  P0011: 'Intake Camshaft Position Timing Over-Advanced (Bank 1)',
  P0021: 'Intake Camshaft Position Timing Over-Advanced (Bank 2)',
  P0026: 'Intake Valve Control Solenoid Circuit Range/Performance (Bank 1)',
  P0031: 'O2 Sensor Heater Control Circuit Low (Bank 1 Sensor 1)',
  P0037: 'O2 Sensor Heater Control Circuit Low (Bank 1 Sensor 2)',
  P0101: 'Mass Air Flow Circuit Range/Performance',
  P0102: 'Mass Air Flow Circuit Low Input',
  P0103: 'Mass Air Flow Circuit High Input',
  P0106: 'Manifold Absolute Pressure Range/Performance',
  P0107: 'Manifold Absolute Pressure Circuit Low',
  P0108: 'Manifold Absolute Pressure Circuit High',
  P0111: 'Intake Air Temperature Circuit Range/Performance',
  P0112: 'Intake Air Temperature Circuit Low',
  P0113: 'Intake Air Temperature Circuit High',
  P0116: 'Engine Coolant Temperature Range/Performance',
  P0117: 'Engine Coolant Temperature Circuit Low',
  P0118: 'Engine Coolant Temperature Circuit High',
  P0121: 'Throttle/Pedal Position Sensor A Range/Performance',
  P0122: 'Throttle/Pedal Position Sensor A Circuit Low',
  P0123: 'Throttle/Pedal Position Sensor A Circuit High',
  P0125: 'Insufficient Coolant Temp for Closed Loop Fuel Control',
  P0128: 'Coolant Thermostat Below Regulating Temperature',
  P0131: 'O2 Sensor Circuit Low Voltage (Bank 1 Sensor 1)',
  P0132: 'O2 Sensor Circuit High Voltage (Bank 1 Sensor 1)',
  P0133: 'O2 Sensor Circuit Slow Response (Bank 1 Sensor 1)',
  P0134: 'O2 Sensor Circuit No Activity (Bank 1 Sensor 1)',
  P0137: 'O2 Sensor Circuit Low Voltage (Bank 1 Sensor 2)',
  P0138: 'O2 Sensor Circuit High Voltage (Bank 1 Sensor 2)',
  P0139: 'O2 Sensor Circuit Slow Response (Bank 1 Sensor 2)',
  P0171: 'System Too Lean (Bank 1)',
  P0172: 'System Too Rich (Bank 1)',
  P0174: 'System Too Lean (Bank 2)',
  P0175: 'System Too Rich (Bank 2)',
  P0181: 'Fuel Temperature Sensor A Circuit Range/Performance',

  // ---- Ignition / misfire ----
  P0300: 'Random/Multiple Cylinder Misfire Detected',
  P0301: 'Cylinder 1 Misfire Detected',
  P0302: 'Cylinder 2 Misfire Detected',
  P0303: 'Cylinder 3 Misfire Detected',
  P0304: 'Cylinder 4 Misfire Detected',
  P0305: 'Cylinder 5 Misfire Detected',
  P0306: 'Cylinder 6 Misfire Detected',
  P0327: 'Knock Sensor 1 Circuit Low (Bank 1)',
  P0328: 'Knock Sensor 1 Circuit High (Bank 1)',
  P0335: 'Crankshaft Position Sensor A Circuit',
  P0336: 'Crankshaft Position Sensor A Range/Performance',
  P0340: 'Camshaft Position Sensor A Circuit (Bank 1)',
  P0345: 'Camshaft Position Sensor A Circuit (Bank 2)',

  // ---- Emissions / catalyst / EGR / EVAP ----
  P0401: 'Exhaust Gas Recirculation Flow Insufficient',
  P0411: 'Secondary Air Injection System Incorrect Flow',
  P0420: 'Catalyst System Efficiency Below Threshold (Bank 1)',
  P0430: 'Catalyst System Efficiency Below Threshold (Bank 2)',
  P0441: 'Evaporative Emission System Incorrect Purge Flow',
  P0442: 'Evaporative Emission System Leak Detected (small leak)',
  P0443: 'Evaporative Emission System Purge Control Valve Circuit',
  P0446: 'Evaporative Emission System Vent Control Circuit',
  P0451: 'Evaporative Emission System Pressure Sensor Range/Performance',
  P0455: 'Evaporative Emission System Leak Detected (large leak)',
  P0456: 'Evaporative Emission System Leak Detected (very small leak)',

  // ---- Speed / idle / aux ----
  P0500: 'Vehicle Speed Sensor A',
  P0506: 'Idle Air Control System RPM Lower Than Expected',
  P0507: 'Idle Air Control System RPM Higher Than Expected',
  P0508: 'Idle Air Control System Circuit Low',
  P0512: 'Starter Request Circuit',

  // ---- Computer / output ----
  P0600: 'Serial Communication Link',
  P0601: 'Internal Control Module Memory Check Sum Error',
  P0604: 'Internal Control Module RAM Error',
  P0700: 'Transmission Control System (MIL Request)',
  P0705: 'Transmission Range Sensor Circuit (PRNDL Input)',
  P0710: 'Transmission Fluid Temperature Sensor Circuit',
  P0715: 'Input/Turbine Speed Sensor Circuit',
  P0720: 'Output Speed Sensor Circuit',
  P0725: 'Engine Speed Input Circuit',
  P0741: 'Torque Converter Clutch Circuit Performance/Stuck Off',

  // ---- Turbo / boost (common on WRX/STI/Forester XT) ----
  P0234: 'Turbocharger/Supercharger Overboost Condition',
  P0243: 'Turbocharger Wastegate Solenoid A',
  P0244: 'Turbocharger Wastegate Solenoid A Range/Performance',
  P0245: 'Turbocharger Wastegate Solenoid A Low',
  P0246: 'Turbocharger Wastegate Solenoid A High',
  P1086: 'TGV (Tumble Generator Valve) Position — Subaru',
  P1152: 'O2 Sensor Circuit Range/Performance (Bank 2 Sensor 1) — Subaru',
  P1518: 'Starter Switch Circuit Low — Subaru',
  P0852: 'Park/Neutral Switch Input High',

  // ---- Chassis / Body / Network examples ----
  C0021: 'Right Front Wheel Speed Sensor Circuit',
  C0025: 'Left Front Wheel Speed Sensor Circuit',
  C0040: 'Right Rear Wheel Speed Sensor Circuit',
  B1340: 'Airbag Front Sensor Circuit',
  U0073: 'Control Module Communication Bus A Off',
  U0100: 'Lost Communication With ECM/PCM A',
  U0101: 'Lost Communication With TCM',
  U0121: 'Lost Communication With ABS Control Module',
  U0140: 'Lost Communication With Body Control Module',
  U0155: 'Lost Communication With Instrument Panel Cluster',
}

const SYSTEM = { P: 'Powertrain', C: 'Chassis', B: 'Body', U: 'Network' }

// Subsystem hint from the second digit of a P-code (SAE J2012 grouping).
const P_SUBSYSTEM = {
  0: 'Fuel & Air Metering / Aux Emission',
  1: 'Fuel & Air Metering',
  2: 'Fuel & Air Metering (Injector Circuit)',
  3: 'Ignition System / Misfire',
  4: 'Auxiliary Emission Controls',
  5: 'Vehicle Speed, Idle Control, Aux Inputs',
  6: 'Computer Output Circuit',
  7: 'Transmission',
  8: 'Transmission',
  9: 'Transmission / Drivetrain',
}

export function describeDtc(code) {
  if (!code) return ''
  const c = code.toUpperCase()
  if (DTC_DB[c]) return DTC_DB[c]
  const sys = SYSTEM[c[0]] || 'Unknown'
  if (c[0] === 'P' && P_SUBSYSTEM[c[1]]) {
    return `${sys} — ${P_SUBSYSTEM[c[1]]} (manufacturer/undocumented code ${c})`
  }
  return `${sys} fault — manufacturer/undocumented code ${c}`
}

// Severity heuristic used for the UI dot colour.
export function severityOf(code) {
  const c = (code || '').toUpperCase()
  if (/^P03/.test(c)) return 'high' // misfire
  if (/^(P042|P043|P017|P00)/.test(c)) return 'med'
  if (c[0] === 'U' || c[0] === 'B' || c[0] === 'C') return 'med'
  return 'low'
}
