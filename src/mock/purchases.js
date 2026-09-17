// Compras (bloque 20/21) — historial determinístico + un par de compras
// "en curso" (pendiente/borrador) pensadas para que la demo las reciba en
// vivo y se vea el impacto en stock/costo. El estado EN VIVO de estas
// compras (recibir, cancelar) lo maneja InventoryContext.
import { createRng, MOCK_NOW } from './config'
import { SUPPLIERS } from './suppliers'
import { INVENTORY_ITEMS } from './inventoryItems'

export const PURCHASE_STATUSES = ['borrador', 'pendiente', 'recibida', 'cancelada']
export const PURCHASE_STATUS_LABELS = { borrador: 'Borrador', pendiente: 'Pendiente', recibida: 'Recibida', cancelada: 'Cancelada' }
export const TAX_RATE = 21

const rng = createRng(7331)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const itemsForSupplier = (supplier) => INVENTORY_ITEMS.filter(i => supplier.categories.includes(i.categoryKey))

function buildLine(insumo) {
  const quantity = Math.round((5 + rng() * 20) * 10) / 10
  const unitPrice = Math.round(insumo.avgCost * (0.9 + rng() * 0.2))
  return { insumoId: insumo.id, quantity, unit: insumo.unit, unitsToStock: 1, unitPrice, subtotal: Math.round(quantity * unitPrice) }
}

function buildTotals(items) {
  const subtotal = items.reduce((s, it) => s + it.subtotal, 0)
  const taxAmount = Math.round(subtotal * TAX_RATE / 100)
  return { subtotal, taxAmount, total: subtotal + taxAmount }
}

let seq = 1
function buildPurchase(dayOffset, status) {
  const supplier = pick(SUPPLIERS.filter(s => s.status === 'activo'))
  const pool = itemsForSupplier(supplier)
  const lineCount = Math.min(pool.length, 2 + Math.floor(rng() * 3))
  const items = []
  while (items.length < lineCount) {
    const insumo = pick(pool)
    if (items.some(it => it.insumoId === insumo.id)) continue
    items.push(buildLine(insumo))
  }
  const date = new Date(MOCK_NOW.getTime() + dayOffset * 86400000)
  const totals = buildTotals(items)
  const id = `pur${seq}`
  const number = 2000 + seq
  seq += 1
  return {
    id, number, supplierId: supplier.id, date, status, items, taxRate: TAX_RATE, ...totals,
    notes: '', user: 'Valentina (mozo)', receivedAt: status === 'recibida' ? date : null,
  }
}

const historical = [
  ...Array.from({ length: 8 }, (_, i) => buildPurchase(-30 + i * 3, 'recibida')),
  ...Array.from({ length: 8 }, (_, i) => buildPurchase(-14 + i * 1.5 | 0, 'recibida')),
]

// Una cancelada de ejemplo (bloque 20 pide ver los 4 estados en la lista).
const cancelledExample = buildPurchase(-18, 'cancelada')

// Compra "en curso" pensada para la demo: 2 cajas de 10kg de carne vacuna
// (bloque 6 — la unidad de compra no es la unidad de stock, hace falta el
// factor `unitsToStock`). Queda PENDIENTE para poder "recibirla" en vivo.
const boxDemoPurchase = {
  id: 'pur-demo-caja', number: 2099, supplierId: 'sup1', date: new Date(MOCK_NOW.getTime() - 86400000),
  status: 'pendiente',
  items: [{ insumoId: 'ins1', quantity: 2, unit: 'caja', unitsToStock: 10, unitPrice: 115000, subtotal: 230000 }],
  taxRate: TAX_RATE, subtotal: 230000, taxAmount: Math.round(230000 * TAX_RATE / 100), total: 230000 + Math.round(230000 * TAX_RATE / 100),
  notes: 'Caja de 10kg cada una.', user: 'Valentina (mozo)', receivedAt: null,
}

// Otra pendiente simple (mismo supplier, unidad = unidad de stock) y un borrador.
const simplePending = buildPurchase(0, 'pendiente')
const draftExample = buildPurchase(0, 'borrador')

export const PURCHASES = [...historical, cancelledExample, boxDemoPurchase, simplePending, draftExample]
  .sort((a, b) => b.date - a.date)

export function getPurchaseById(id) {
  return PURCHASES.find(p => p.id === id) ?? null
}

export function getPurchasesForSupplier(supplierId) {
  return PURCHASES.filter(p => p.supplierId === supplierId)
}
