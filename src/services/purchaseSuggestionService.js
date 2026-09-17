// BLOQUE 25 — sugerencia de compra. Lógica determinística (nada de IA):
// si un insumo no está en NORMAL, sugiere completar hasta el máximo.
import { getStockStatus } from './inventoryCostService'

export function suggestPurchaseForItem(item) {
  const status = getStockStatus(item)
  if (status === 'NORMAL') return null
  const suggestedQty = Math.max(item.stockMax - item.currentStock, 0)
  return { itemId: item.id, status, currentStock: item.currentStock, stockMin: item.stockMin, stockMax: item.stockMax, suggestedQty, unit: item.unit, supplierId: item.primarySupplierId }
}

export function suggestPurchases(items) {
  return items.map(suggestPurchaseForItem).filter(Boolean)
}
