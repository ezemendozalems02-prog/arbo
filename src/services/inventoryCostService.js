// Costeo de insumos (bloque 8) — costo promedio ponderado. Centralizado acá
// a propósito: ni el contexto ni un componente deben recalcular esto a mano.

// Estado de stock (bloque 19/43) a partir de min/actual — un solo lugar que
// decide los umbrales, nunca comparaciones sueltas en cada componente.
export function getStockStatus(item) {
  if (item.currentStock <= 0) return 'AGOTADO'
  if (item.currentStock <= item.stockMin) return 'STOCK_BAJO'
  return 'NORMAL'
}

// Costo promedio ponderado (bloque 8): funde el stock existente con un
// ingreso nuevo. Ejemplo del brief: 10kg a $10.000 + 10kg a $12.000 = $11.000/kg.
export function calcWeightedAverageCost(existingQty, existingAvgCost, incomingQty, incomingUnitCost) {
  const totalQty = existingQty + incomingQty
  if (totalQty <= 0) return incomingUnitCost
  return (existingQty * existingAvgCost + incomingQty * incomingUnitCost) / totalQty
}

export function calcStockValue(item) {
  return item.currentStock * item.avgCost
}

export function calcInventoryTotalValue(items) {
  return items.reduce((sum, item) => sum + calcStockValue(item), 0)
}

export function needsReplenishment(item) {
  return getStockStatus(item) !== 'NORMAL'
}
