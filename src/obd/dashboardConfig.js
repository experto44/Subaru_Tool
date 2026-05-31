/* Subaru Tool — default dashboard layout.
 * Each entry references PID id(s) and a widget type. Users can reorder, add,
 * remove and change widget type from the Customize sheet (persisted). */
export const DEFAULT_DASH = [
  { id: 'rpm', widget: 'ring' },
  { id: 'speed', widget: 'ring' },
  { id: 'boost', widget: 'ring' },
  { id: 'temps', widget: 'temps', pids: ['oil_temp', 'cvt_temp', 'coolant'] },
  { id: 'throttle', widget: 'bar' },
  { id: 'load', widget: 'bar' },
  { id: 'awd', widget: 'awd' },
]
