// ARBO OS — DOMAIN SERVICE: NORMALIZACIÓN Y CONVERSIÓN DE UNIDADES
// Dimensiones homogéneas: masa (kg, g), volumen (l, ml), conteo (u).

export const UNIT_DIMENSIONS = {
  g:  { dimension: 'mass',   factorToBase: 1 },
  kg: { dimension: 'mass',   factorToBase: 1000 },
  ml: { dimension: 'volume', factorToBase: 1 },
  l:  { dimension: 'volume', factorToBase: 1000 },
  u:  { dimension: 'count',  factorToBase: 1 },
}

export function canConvert(fromUnit, toUnit) {
  if (fromUnit === toUnit) return true
  const a = UNIT_DIMENSIONS[fromUnit]
  const b = UNIT_DIMENSIONS[toUnit]
  return Boolean(a && b && a.dimension === b.dimension)
}

export function convertQuantity(quantity, fromUnit, toUnit) {
  if (fromUnit === toUnit) return quantity
  if (!canConvert(fromUnit, toUnit)) {
    throw new Error(`Incompatible unit conversion: cannot convert from '${fromUnit}' to '${toUnit}'`)
  }
  const fromFactor = UNIT_DIMENSIONS[fromUnit].factorToBase
  const toFactor = UNIT_DIMENSIONS[toUnit].factorToBase
  return (quantity * fromFactor) / toFactor
}
