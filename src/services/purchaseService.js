// BLOQUE 21 — recibir una compra debe: convertir cada línea a la unidad de
// stock del insumo, actualizar el costo promedio ponderado y devolver los
// movimientos a registrar. Todo puro: el contexto solo aplica el resultado.
import { canAutoConvert, convertQuantity } from './unitService'
import { calcWeightedAverageCost } from './inventoryCostService'

// Cuánto entra realmente al stock (en la unidad del insumo) y a qué costo
// unitario "de stock" equivale esa línea — cubre los 3 casos del bloque 6:
// unidad de compra = unidad de stock; unidad de compra convertible
// automáticamente (kg<->g, L<->ml); o unidad de compra "de paquete"
// (caja/pack/botella) con el factor manual `unitsToStock` cargado en la compra.
export function resolvePurchaseLine(item, insumo) {
  let stockQty
  if (item.unit === insumo.unit) {
    stockQty = item.quantity * (item.unitsToStock || 1)
  } else if (canAutoConvert(item.unit, insumo.unit)) {
    stockQty = convertQuantity(item.quantity, item.unit, insumo.unit)
  } else {
    stockQty = item.quantity * (item.unitsToStock || 1)
  }
  const lineCost = item.quantity * item.unitPrice
  const unitCost = stockQty > 0 ? lineCost / stockQty : 0
  return { stockQty, unitCost }
}

// Aplica la recepción de una compra sobre la lista de insumos (no muta:
// devuelve los insumos actualizados + los movimientos a agregar).
export function applyPurchaseReceipt(purchase, items, { uid, now, user }) {
  const updatedItems = [...items]
  const movements = []

  for (const line of purchase.items) {
    const idx = updatedItems.findIndex(i => i.id === line.insumoId)
    if (idx === -1) continue
    const insumo = updatedItems[idx]
    const { stockQty, unitCost } = resolvePurchaseLine(line, insumo)
    const stockBefore = insumo.currentStock
    const newAvgCost = calcWeightedAverageCost(insumo.currentStock, insumo.avgCost, stockQty, unitCost)
    const stockAfter = stockBefore + stockQty

    updatedItems[idx] = { ...insumo, currentStock: stockAfter, avgCost: newAvgCost, lastCost: unitCost, updatedAt: now }
    movements.push({
      id: uid('mov'), insumoId: insumo.id, type: 'entrada', quantity: stockQty, unit: insumo.unit,
      stockBefore, stockAfter, reason: `Compra #${purchase.number} recibida`, user, reference: purchase.id, createdAt: now,
    })
  }

  return { updatedItems, movements }
}
