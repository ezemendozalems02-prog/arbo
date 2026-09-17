// Sectores de preparación (BLOQUE 2). Estructura configurable a propósito:
// hoy solo Bar y Cocina están operativos (`active: true`), pero agregar un
// sector nuevo en el futuro (Pastelería, Vinoteca, Delivery...) es sumar una
// fila acá — nada en el resto del código está hardcodeado a "dos sectores".
export const STATIONS = [
  { key: 'bar', label: 'Bar / Cafetería', active: true },
  { key: 'cocina', label: 'Cocina', active: true },
  { key: 'pasteleria', label: 'Pastelería', active: false },
  { key: 'vinoteca', label: 'Vinoteca', active: false },
  { key: 'delivery', label: 'Delivery', active: false },
  { key: 'otro', label: 'Otro', active: false },
]

export const STATION_LABELS = Object.fromEntries(STATIONS.map(s => [s.key, s.label]))
export const ACTIVE_STATIONS = STATIONS.filter(s => s.active)

export function getStationLabel(key) {
  return STATION_LABELS[key] ?? key
}
