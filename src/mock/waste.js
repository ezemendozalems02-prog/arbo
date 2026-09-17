// Mermas (bloque 15) — historial determinístico. El registro EN VIVO de
// mermas nuevas (y su descuento de stock) lo maneja InventoryContext.
import { createRng, MOCK_NOW } from './config'
import { INVENTORY_ITEMS } from './inventoryItems'

export const WASTE_REASONS = ['vencimiento', 'rotura', 'derrame', 'error_produccion', 'devolucion', 'sobreproduccion', 'mala_conservacion', 'otro']
export const WASTE_REASON_LABELS = {
  vencimiento: 'Vencimiento', rotura: 'Rotura', derrame: 'Derrame', error_produccion: 'Error de producción',
  devolucion: 'Devolución', sobreproduccion: 'Sobreproducción', mala_conservacion: 'Mala conservación', otro: 'Otro',
}
export const WASTE_STATUSES = ['registrada', 'anulada']

const rng = createRng(9911)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]

let seq = 1
function buildWaste(dayOffset) {
  const insumo = pick(INVENTORY_ITEMS)
  const quantity = Math.round((0.5 + rng() * 4) * 10) / 10
  const id = `waste${seq}`
  seq += 1
  return {
    id, insumoId: insumo.id, quantity, unit: insumo.unit, reason: pick(WASTE_REASONS),
    cost: Math.round(quantity * insumo.avgCost), user: 'Valentina (mozo)', notes: '',
    createdAt: new Date(MOCK_NOW.getTime() + dayOffset * 86400000), status: 'registrada',
  }
}

export const WASTE_RECORDS = Array.from({ length: 10 }, (_, i) => buildWaste(-27 + i * 3))
  .sort((a, b) => b.createdAt - a.createdAt)

export function getWasteById(id) {
  return WASTE_RECORDS.find(w => w.id === id) ?? null
}
