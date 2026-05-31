/* Subaru Tool — PID catalogue
 *
 * Two sets are exposed:
 *   STANDARD_PIDS  — the full SAE J1979 Mode 01 set (the generic OBD-II sensors
 *                    every ELM327 app, including Active OBD, can read).
 *   SUBARU_PIDS    — Subaru SSM / extended sensors (oil temp, AT/CVT temp,
 *                    AWD torque split, knock correction, fine knock learning,
 *                    A/F ratio, etc.) that Subaru-focused apps expose.
 *
 * Each PID describes how to REQUEST it and how to DECODE the raw ECU bytes:
 *   id        unique key used across the UI
 *   pid       OBD request string sent to the adapter (e.g. "010C")
 *   mode      service/mode ("01" live, etc.)
 *   bytes     number of data bytes expected in the response
 *   name/short human labels
 *   group     UI grouping (Engine, Temps, Air/Fuel, Turbo, Drivetrain, System…)
 *   unit/uunit metric unit and optional imperial unit
 *   uconv     metric -> imperial converter
 *   decimals  display precision
 *   min/max   gauge range
 *   decode(b) (bytes:number[]) => metric value
 *   flags     fav / signed / redline / warnAbove / warnBelow
 *
 * Decode formulas follow SAE J1979 (Appendix B) for standard PIDs and the
 * widely documented Subaru SSM definitions for the extended set.
 */

// ---- shared decode helpers -------------------------------------------------
const A = (b) => b[0]
const u16 = (b) => b[0] * 256 + b[1]

// ============================================================================
// STANDARD SAE J1979 MODE 01 PIDS
// ============================================================================
export const STANDARD_PIDS = [
  // --- Engine ---
  { id: 'load', pid: '0104', mode: '01', bytes: 1, name: 'Calculated Engine Load', short: 'Load',
    group: 'Engine', unit: '%', min: 0, max: 100, decimals: 0, fav: true,
    decode: (b) => (A(b) * 100) / 255 },
  { id: 'rpm', pid: '010C', mode: '01', bytes: 2, name: 'Engine RPM', short: 'RPM',
    group: 'Engine', unit: 'rpm', min: 0, max: 8000, decimals: 0, fav: true, redline: 6700,
    decode: (b) => u16(b) / 4 },
  { id: 'speed', pid: '010D', mode: '01', bytes: 1, name: 'Vehicle Speed', short: 'Speed',
    group: 'Engine', unit: 'km/h', uunit: 'mph', uconv: (v) => v * 0.621371,
    min: 0, max: 255, decimals: 0, fav: true, decode: (b) => A(b) },
  { id: 'timing', pid: '010E', mode: '01', bytes: 1, name: 'Ignition Timing Advance', short: 'Timing',
    group: 'Engine', unit: '°', min: -64, max: 64, decimals: 1, signed: true,
    decode: (b) => A(b) / 2 - 64 },
  { id: 'throttle', pid: '0111', mode: '01', bytes: 1, name: 'Throttle Position', short: 'Throttle',
    group: 'Engine', unit: '%', min: 0, max: 100, decimals: 0, fav: true,
    decode: (b) => (A(b) * 100) / 255 },
  { id: 'rel_throttle', pid: '0145', mode: '01', bytes: 1, name: 'Relative Throttle Position', short: 'Rel Throttle',
    group: 'Engine', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'abs_throttle_b', pid: '0147', mode: '01', bytes: 1, name: 'Absolute Throttle Position B', short: 'TPS B',
    group: 'Engine', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'accel_d', pid: '0149', mode: '01', bytes: 1, name: 'Accelerator Pedal Position D', short: 'Pedal D',
    group: 'Engine', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'accel_e', pid: '014A', mode: '01', bytes: 1, name: 'Accelerator Pedal Position E', short: 'Pedal E',
    group: 'Engine', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'commanded_throttle', pid: '014C', mode: '01', bytes: 1, name: 'Commanded Throttle Actuator', short: 'Cmd Throttle',
    group: 'Engine', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'abs_load', pid: '0143', mode: '01', bytes: 2, name: 'Absolute Load Value', short: 'Abs Load',
    group: 'Engine', unit: '%', min: 0, max: 25700, decimals: 0, decode: (b) => (u16(b) * 100) / 255 },

  // --- Temperatures ---
  { id: 'coolant', pid: '0105', mode: '01', bytes: 1, name: 'Engine Coolant Temp', short: 'Coolant',
    group: 'Temps', unit: '°C', uunit: '°F', uconv: (v) => (v * 9) / 5 + 32,
    min: -40, max: 215, decimals: 0, fav: true, warnAbove: 110, decode: (b) => A(b) - 40 },
  { id: 'iat', pid: '010F', mode: '01', bytes: 1, name: 'Intake Air Temp', short: 'IAT',
    group: 'Temps', unit: '°C', uunit: '°F', uconv: (v) => (v * 9) / 5 + 32,
    min: -40, max: 215, decimals: 0, decode: (b) => A(b) - 40 },
  { id: 'ambient', pid: '0146', mode: '01', bytes: 1, name: 'Ambient Air Temp', short: 'Ambient',
    group: 'Temps', unit: '°C', uunit: '°F', uconv: (v) => (v * 9) / 5 + 32,
    min: -40, max: 215, decimals: 0, decode: (b) => A(b) - 40 },
  { id: 'cat_b1s1', pid: '013C', mode: '01', bytes: 2, name: 'Catalyst Temp B1S1', short: 'Cat 11',
    group: 'Temps', unit: '°C', uunit: '°F', uconv: (v) => (v * 9) / 5 + 32,
    min: -40, max: 6513, decimals: 0, decode: (b) => u16(b) / 10 - 40 },
  { id: 'cat_b2s1', pid: '013D', mode: '01', bytes: 2, name: 'Catalyst Temp B2S1', short: 'Cat 21',
    group: 'Temps', unit: '°C', uunit: '°F', uconv: (v) => (v * 9) / 5 + 32,
    min: -40, max: 6513, decimals: 0, decode: (b) => u16(b) / 10 - 40 },
  { id: 'oil_temp_std', pid: '015C', mode: '01', bytes: 1, name: 'Engine Oil Temp', short: 'Oil',
    group: 'Temps', unit: '°C', uunit: '°F', uconv: (v) => (v * 9) / 5 + 32,
    min: -40, max: 210, decimals: 0, warnAbove: 130, decode: (b) => A(b) - 40 },

  // --- Air / Fuel ---
  { id: 'map', pid: '010B', mode: '01', bytes: 1, name: 'Intake Manifold Abs Pressure', short: 'MAP',
    group: 'Air/Fuel', unit: 'kPa', min: 0, max: 255, decimals: 0, decode: (b) => A(b) },
  { id: 'maf', pid: '0110', mode: '01', bytes: 2, name: 'Mass Air Flow Rate', short: 'MAF',
    group: 'Air/Fuel', unit: 'g/s', min: 0, max: 655, decimals: 1, decode: (b) => u16(b) / 100 },
  { id: 'stft1', pid: '0106', mode: '01', bytes: 1, name: 'Short Term Fuel Trim B1', short: 'STFT 1',
    group: 'Air/Fuel', unit: '%', min: -100, max: 99, decimals: 1, signed: true,
    decode: (b) => (A(b) - 128) * (100 / 128) },
  { id: 'ltft1', pid: '0107', mode: '01', bytes: 1, name: 'Long Term Fuel Trim B1', short: 'LTFT 1',
    group: 'Air/Fuel', unit: '%', min: -100, max: 99, decimals: 1, signed: true,
    decode: (b) => (A(b) - 128) * (100 / 128) },
  { id: 'stft2', pid: '0108', mode: '01', bytes: 1, name: 'Short Term Fuel Trim B2', short: 'STFT 2',
    group: 'Air/Fuel', unit: '%', min: -100, max: 99, decimals: 1, signed: true,
    decode: (b) => (A(b) - 128) * (100 / 128) },
  { id: 'ltft2', pid: '0109', mode: '01', bytes: 1, name: 'Long Term Fuel Trim B2', short: 'LTFT 2',
    group: 'Air/Fuel', unit: '%', min: -100, max: 99, decimals: 1, signed: true,
    decode: (b) => (A(b) - 128) * (100 / 128) },
  { id: 'fuel_pressure', pid: '010A', mode: '01', bytes: 1, name: 'Fuel Pressure (gauge)', short: 'Fuel Pr',
    group: 'Air/Fuel', unit: 'kPa', min: 0, max: 765, decimals: 0, decode: (b) => A(b) * 3 },
  { id: 'fuel_rail_p', pid: '0123', mode: '01', bytes: 2, name: 'Fuel Rail Gauge Pressure', short: 'Rail Pr',
    group: 'Air/Fuel', unit: 'kPa', min: 0, max: 655350, decimals: 0, decode: (b) => u16(b) * 10 },
  { id: 'commanded_afr', pid: '0144', mode: '01', bytes: 2, name: 'Commanded Equivalence Ratio', short: 'λ cmd',
    group: 'Air/Fuel', unit: 'λ', min: 0, max: 2, decimals: 3, decode: (b) => (u16(b) * 2) / 65536 },
  { id: 'o2_b1s1', pid: '0114', mode: '01', bytes: 2, name: 'O2 Sensor B1S1 Voltage', short: 'O2 11',
    group: 'Air/Fuel', unit: 'V', min: 0, max: 1.275, decimals: 3, decode: (b) => A(b) / 200 },
  { id: 'o2_b1s2', pid: '0115', mode: '01', bytes: 2, name: 'O2 Sensor B1S2 Voltage', short: 'O2 12',
    group: 'Air/Fuel', unit: 'V', min: 0, max: 1.275, decimals: 3, decode: (b) => A(b) / 200 },
  { id: 'commanded_egr', pid: '012C', mode: '01', bytes: 1, name: 'Commanded EGR', short: 'EGR cmd',
    group: 'Air/Fuel', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'egr_error', pid: '012D', mode: '01', bytes: 1, name: 'EGR Error', short: 'EGR err',
    group: 'Air/Fuel', unit: '%', min: -100, max: 99, decimals: 1, signed: true,
    decode: (b) => (A(b) - 128) * (100 / 128) },
  { id: 'evap_purge', pid: '012E', mode: '01', bytes: 1, name: 'Commanded Evap Purge', short: 'Evap',
    group: 'Air/Fuel', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },

  // --- System / Fuel level / Voltage ---
  { id: 'abs_map', pid: '0133', mode: '01', bytes: 1, name: 'Barometric Pressure', short: 'Baro',
    group: 'System', unit: 'kPa', min: 0, max: 255, decimals: 0, decode: (b) => A(b) },
  { id: 'fuel_level', pid: '012F', mode: '01', bytes: 1, name: 'Fuel Tank Level', short: 'Fuel',
    group: 'System', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'module_voltage', pid: '0142', mode: '01', bytes: 2, name: 'Control Module Voltage', short: 'Battery',
    group: 'System', unit: 'V', min: 0, max: 65.5, decimals: 2, warnBelow: 12, fav: true,
    decode: (b) => u16(b) / 1000 },
  { id: 'run_time', pid: '011F', mode: '01', bytes: 2, name: 'Run Time Since Start', short: 'Run Time',
    group: 'System', unit: 's', min: 0, max: 65535, decimals: 0, decode: (b) => u16(b) },
  { id: 'distance_mil', pid: '0121', mode: '01', bytes: 2, name: 'Distance With MIL On', short: 'MIL Dist',
    group: 'System', unit: 'km', uunit: 'mi', uconv: (v) => v * 0.621371,
    min: 0, max: 65535, decimals: 0, decode: (b) => u16(b) },
  { id: 'distance_clr', pid: '0131', mode: '01', bytes: 2, name: 'Distance Since Codes Cleared', short: 'Dist Clr',
    group: 'System', unit: 'km', uunit: 'mi', uconv: (v) => v * 0.621371,
    min: 0, max: 65535, decimals: 0, decode: (b) => u16(b) },
  { id: 'warmups_clr', pid: '0130', mode: '01', bytes: 1, name: 'Warm-ups Since Codes Cleared', short: 'Warm-ups',
    group: 'System', unit: '', min: 0, max: 255, decimals: 0, decode: (b) => A(b) },
]

// ============================================================================
// SUBARU SSM / EXTENDED PIDS
// Request strings use Subaru's enhanced data identifiers via the ELM (Mode 22
// where standardised, or SSM addresses tunnelled by the adapter). The decode
// formulas are the documented SSM scalings.
// ============================================================================
export const SUBARU_PIDS = [
  { id: 'boost', pid: '2222', mode: '22', bytes: 1, name: 'Boost / Manifold Rel. Pressure', short: 'Boost',
    group: 'Turbo', unit: 'bar', uunit: 'psi', uconv: (v) => v * 14.5038,
    min: -1, max: 2.2, decimals: 2, fav: true, redline: 1.4,
    // SSM: manifold abs pressure (kPa) minus barometric (~101.3) -> bar
    decode: (b) => ((A(b) * 37 / 255) * 6.895 - 101.3) / 100 },
  { id: 'oil_temp', pid: '2101', mode: '22', bytes: 1, name: 'Engine Oil Temperature', short: 'Oil',
    group: 'Temps', unit: '°C', uunit: '°F', uconv: (v) => (v * 9) / 5 + 32,
    min: -40, max: 160, decimals: 0, warnAbove: 130, decode: (b) => A(b) - 40 },
  { id: 'cvt_temp', pid: '2102', mode: '22', bytes: 1, name: 'AT/CVT Fluid Temperature', short: 'CVT',
    group: 'Temps', unit: '°C', uunit: '°F', uconv: (v) => (v * 9) / 5 + 32,
    min: -40, max: 150, decimals: 0, warnAbove: 120, decode: (b) => A(b) - 40 },
  { id: 'afr', pid: '2240', mode: '22', bytes: 1, name: 'Air-Fuel Ratio (wideband)', short: 'AFR',
    group: 'Air/Fuel', unit: ':1', min: 9, max: 20, decimals: 1,
    // SSM A/F sensor #1: (A/128)*14.7
    decode: (b) => (A(b) / 128) * 14.7 },
  { id: 'knock', pid: '2280', mode: '22', bytes: 1, name: 'Knock Correction Advance', short: 'Knock',
    group: 'Engine', unit: '°', min: -8, max: 0, decimals: 2, signed: true, warnBelow: -2,
    decode: (b) => (A(b) - 128) * (1 / 2) },
  { id: 'fklc', pid: '2281', mode: '22', bytes: 1, name: 'Fine Knock Learning Correction', short: 'FKLC',
    group: 'Engine', unit: '°', min: -4, max: 4, decimals: 2, signed: true,
    decode: (b) => (A(b) - 128) * (1 / 4) },
  { id: 'iam', pid: '2282', mode: '22', bytes: 1, name: 'Ignition Advance Multiplier', short: 'IAM',
    group: 'Engine', unit: '', min: 0, max: 1, decimals: 3, decode: (b) => A(b) / 16 },
  { id: 'maf_v', pid: '2241', mode: '22', bytes: 1, name: 'Mass Air Flow Sensor Voltage', short: 'MAF V',
    group: 'Air/Fuel', unit: 'V', min: 0, max: 5, decimals: 2, decode: (b) => (A(b) * 5) / 255 },
  { id: 'tgv_pos', pid: '2250', mode: '22', bytes: 1, name: 'Tumble Generator Valve Position', short: 'TGV',
    group: 'Air/Fuel', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'wastegate', pid: '2251', mode: '22', bytes: 1, name: 'Wastegate Duty', short: 'WG Duty',
    group: 'Turbo', unit: '%', min: 0, max: 100, decimals: 0, decode: (b) => (A(b) * 100) / 255 },
  { id: 'awd_f', pid: '2310', mode: '22', bytes: 1, name: 'AWD Front Torque Distribution', short: 'Front',
    group: 'Drivetrain', unit: '%', min: 0, max: 100, decimals: 0,
    decode: (b) => Math.round(Math.max(5, Math.min(95, (A(b) * 100) / 255))) },
  { id: 'gear', pid: '2320', mode: '22', bytes: 1, name: 'Current Gear Position', short: 'Gear',
    group: 'Drivetrain', unit: '', min: 0, max: 8, decimals: 0, decode: (b) => A(b) },
]

export const ALL_PIDS = [...STANDARD_PIDS, ...SUBARU_PIDS]

const _byId = new Map(ALL_PIDS.map((p) => [p.id, p]))
const _byPid = new Map(ALL_PIDS.map((p) => [p.pid.toUpperCase(), p]))

export function pidById(id) {
  return _byId.get(id)
}
export function pidByPid(pid) {
  return _byPid.get(String(pid).toUpperCase())
}

export const PID_GROUPS = Array.from(new Set(ALL_PIDS.map((p) => p.group)))
