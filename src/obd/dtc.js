/* Subaru Tool — Diagnostic Trouble Code decoding.
 *
 * Decodes the raw response bytes from:
 *   Mode 03  stored / confirmed DTCs
 *   Mode 07  pending DTCs
 *   Mode 0A  permanent DTCs
 * into human code strings (P0301, C0021, U0100…), per SAE J2012.
 *
 * Two bytes encode each code:
 *   bits 7-6 of byte A  -> letter  (00=P, 01=C, 10=B, 11=U)
 *   bits 5-4 of byte A  -> first digit (0-3)
 *   bits 3-0 of byte A  -> second digit (hex)
 *   byte B high/low nibbles -> third & fourth digits (hex)
 */

const LETTER = ['P', 'C', 'B', 'U']

export function decodeDtcPair(a, b) {
  if (a === 0 && b === 0) return null // empty slot
  const letter = LETTER[(a & 0xc0) >> 6]
  const d1 = (a & 0x30) >> 4
  const d2 = (a & 0x0f).toString(16).toUpperCase()
  const d3 = ((b & 0xf0) >> 4).toString(16).toUpperCase()
  const d4 = (b & 0x0f).toString(16).toUpperCase()
  return `${letter}${d1}${d2}${d3}${d4}`
}

// Decode a flat array of data bytes (already stripped of mode/echo) into codes.
export function decodeDtcBytes(bytes) {
  const codes = []
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const code = decodeDtcPair(bytes[i], bytes[i + 1])
    if (code) codes.push(code)
  }
  return codes
}

/* ---- Readiness monitors (Mode 01 PID 01, bytes B/C/D) ----
 * Returns MIL status, stored-DTC count and the supported/complete state of
 * each monitor — exactly what Active OBD shows on its "monitors" view. */
export function decodeMonitors(b) {
  // b = [A, B, C, D]
  const A = b[0]
  const B = b[1]
  const C = b[2]
  const D = b[3]
  const mil = (A & 0x80) !== 0
  const dtcCount = A & 0x7f

  const sparkIgnition = (B & 0x08) === 0 // bit3 of B: 0 = spark ignition
  const mk = (supportedBit, completeBit, byteVal) => ({
    supported: (byteVal & supportedBit) !== 0,
    complete: (byteVal & completeBit) === 0, // 0 = complete/ready
  })

  // Continuous monitors (byte B low nibble)
  const monitors = [
    { name: 'Misfire', ...mk(0x01, 0x10, B) },
    { name: 'Fuel System', ...mk(0x02, 0x20, B) },
    { name: 'Components', ...mk(0x04, 0x40, B) },
  ]

  // Non-continuous monitors (bytes C supported / D complete), spark-ignition set
  const sparkMons = [
    ['Catalyst', 0x01],
    ['Heated Catalyst', 0x02],
    ['Evap System', 0x04],
    ['Secondary Air', 0x08],
    ['A/C Refrigerant', 0x10],
    ['O2 Sensor', 0x20],
    ['O2 Sensor Heater', 0x40],
    ['EGR System', 0x80],
  ]
  for (const [name, bit] of sparkMons) {
    monitors.push({
      name,
      supported: (C & bit) !== 0,
      complete: (D & bit) === 0,
    })
  }

  return { mil, dtcCount, sparkIgnition, monitors }
}

// Map a decoded monitor into the UI tri-state used by the design.
export function monitorState(m) {
  if (!m.supported) return 'not-supported'
  return m.complete ? 'ready' : 'not-ready'
}
