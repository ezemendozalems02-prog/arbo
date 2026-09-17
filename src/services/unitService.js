// Conversión de unidades (bloque 6/11) — centralizada acá, nunca repetida
// en un componente. Solo masa<->masa y volumen<->volumen se convierten
// automáticamente; el resto requiere el factor explícito de la compra.
import { UNIT_DIMENSIONS } from '../mock/units'

export function canAutoConvert(fromUnit, toUnit) {
  if (fromUnit === toUnit) return true
  const a = UNIT_DIMENSIONS[fromUnit]
  const b = UNIT_DIMENSIONS[toUnit]
  return Boolean(a && b && a.dimension === b.dimension)
}

// Convierte `quantity` de `fromUnit` a `toUnit`. Devuelve null si las
// unidades no son de la misma dimensión (ahí hace falta un factor manual,
// no un supuesto automático).
export function convertQuantity(quantity, fromUnit, toUnit) {
  if (fromUnit === toUnit) return quantity
  if (!canAutoConvert(fromUnit, toUnit)) return null
  const fromFactor = UNIT_DIMENSIONS[fromUnit].factor
  const toFactor = UNIT_DIMENSIONS[toUnit].factor
  return (quantity * fromFactor) / toFactor
}
