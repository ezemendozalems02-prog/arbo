// Movimientos de stock (bloque 17) — historial determinístico previo a esta
// fase, para que la tabla de "Movimientos" no arranque vacía. Los
// movimientos NUEVOS (compra recibida, merma, ajuste manual) los agrega
// InventoryContext en vivo, con timestamps reales.
import { createRng, MOCK_NOW } from './config'
import { INVENTORY_ITEMS } from './inventoryItems'

export const STOCK_MOVEMENT_TYPES = ['entrada', 'salida', 'ajuste', 'merma', 'transferencia', 'consumo', 'devolucion']
export const STOCK_MOVEMENT_LABELS = {
  entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste', merma: 'Merma',
  transferencia: 'Transferencia', consumo: 'Consumo', devolucion: 'Devolución',
}
const REASON_BY_TYPE = {
  entrada: 'Compra recibida', salida: 'Consumo de servicio', ajuste: 'Ajuste de inventario físico',
  merma: 'Merma registrada', transferencia: 'Transferencia entre sectores', consumo: 'Consumo de producción',
  devolucion: 'Devolución a proveedor',
}

const rng = createRng(5151)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]

let seq = 1
function buildMovement(dayOffset) {
  const insumo = pick(INVENTORY_ITEMS)
  const type = pick(STOCK_MOVEMENT_TYPES)
  const isIncoming = type === 'entrada' || type === 'devolucion'
  const quantity = Math.round((1 + rng() * 8) * 10) / 10
  const stockBefore = Math.round((insumo.stockMin + rng() * (insumo.stockMax - insumo.stockMin)) * 10) / 10
  const stockAfter = Math.max(0, isIncoming ? stockBefore + quantity : stockBefore - quantity)
  const id = `mov${seq}`
  seq += 1
  return {
    id, insumoId: insumo.id, type, quantity, unit: insumo.unit, stockBefore, stockAfter,
    reason: REASON_BY_TYPE[type], user: 'Valentina (mozo)', reference: null,
    createdAt: new Date(MOCK_NOW.getTime() + dayOffset * 86400000 - Math.floor(rng() * 8) * 3600000),
  }
}

export const STOCK_MOVEMENTS = Array.from({ length: 30 }, (_, i) => buildMovement(-29 + i))
  .sort((a, b) => b.createdAt - a.createdAt)
