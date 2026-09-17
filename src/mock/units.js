// Unidades de medida (Fase 4, bloque 6). Dos unidades son "convertibles
// automáticamente" cuando comparten dimensión física (masa o volumen) — el
// resto (unidad, porción, caja, pack, botella, otro) son unidades de conteo
// o de packaging: no existe una conversión universal ("una caja" no pesa lo
// mismo para carne que para servilletas), así que esas se resuelven con un
// factor explícito cargado en el momento de la compra (ver purchase.items[].
// unitsToStock en purchaseService.js), no acá.
export const UNITS_OF_MEASURE = [
  'unidad', 'gramo', 'kilogramo', 'mililitro', 'litro', 'porcion', 'caja', 'pack', 'botella', 'otro',
]

export const UNIT_LABELS = {
  unidad: 'Unidad', gramo: 'Gramo', kilogramo: 'Kilogramo', mililitro: 'Mililitro', litro: 'Litro',
  porcion: 'Porción', caja: 'Caja', pack: 'Pack', botella: 'Botella', otro: 'Otro',
}

export const UNIT_SHORT = {
  unidad: 'un', gramo: 'g', kilogramo: 'kg', mililitro: 'ml', litro: 'L',
  porcion: 'porc', caja: 'caja', pack: 'pack', botella: 'bot', otro: 'u',
}

// Dimensión física de cada unidad, expresada en su unidad base (gramo o
// mililitro) — es lo único que permite convertir automáticamente.
export const UNIT_DIMENSIONS = {
  gramo: { dimension: 'masa', factor: 1 },
  kilogramo: { dimension: 'masa', factor: 1000 },
  mililitro: { dimension: 'volumen', factor: 1 },
  litro: { dimension: 'volumen', factor: 1000 },
}
