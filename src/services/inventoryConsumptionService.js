// BLOQUE 26/27/28 — PRODUCTO -> RECETA -> INGREDIENTES -> INSUMOS -> STOCK.
// Preparado para cuando el POS/las ventas confirmadas disparen esto de
// verdad; por ahora nadie descuenta stock automáticamente todavía (ver
// nota en README de InventoryContext), pero el cálculo ya es real.
import { convertQuantity } from './unitService'
import { calcRecipeCost } from './recipeCostService'

const itemQty = (item) => item.quantity ?? item.qty ?? 0

// Aplana una receta (compuesta o no) a cantidades de INSUMO base, en la
// unidad de stock de cada insumo. `multiplier` son "cuántas veces" se
// preparó esa receta (ej. 2 hamburguesas -> multiplier 2).
function flattenRecipe(recipe, multiplier, { getRecipe, getInsumo }, acc, visited) {
  if (visited.has(recipe.id)) return
  const nextVisited = new Set(visited)
  nextVisited.add(recipe.id)

  for (const ing of recipe.ingredients) {
    const qtyNeeded = ing.quantity * multiplier
    if (ing.kind === 'insumo') {
      const insumo = getInsumo(ing.refId)
      if (!insumo) continue
      const qtyInStockUnit = convertQuantity(qtyNeeded, ing.unit, insumo.unit) ?? qtyNeeded
      const current = acc.get(ing.refId) ?? { insumoId: ing.refId, quantity: 0, unit: insumo.unit }
      current.quantity += qtyInStockUnit
      acc.set(ing.refId, current)
    } else {
      const subRecipe = getRecipe(ing.refId)
      if (!subRecipe) continue
      const qtyInYieldUnit = convertQuantity(qtyNeeded, ing.unit, subRecipe.yield.unit) ?? qtyNeeded
      const subMultiplier = qtyInYieldUnit / (subRecipe.yield?.qty || 1)
      flattenRecipe(subRecipe, subMultiplier, { getRecipe, getInsumo }, acc, nextVisited)
    }
  }
}

// Entrada: una orden (o un pedido histórico) con items [{productId, quantity|qty}].
// Salida: consumo de insumos [{insumoId, quantity, unit}] — bloque 27.
export function calculateOrderConsumption(order, { getRecipeByProductId, getRecipe, getInsumo }) {
  const acc = new Map()
  for (const item of order.items ?? []) {
    const recipe = getRecipeByProductId(item.productId)
    if (!recipe) continue // producto sin receta cargada: no se sabe qué consume
    flattenRecipe(recipe, itemQty(item), { getRecipe, getInsumo }, acc, new Set())
  }
  return [...acc.values()]
}

// BLOQUE 28 — costo real de una orden a partir de sus recetas.
export function calculateOrderCost(order, { getRecipeByProductId, getRecipe, getInsumo }) {
  let totalCost = 0
  let totalRevenue = 0
  const byProduct = []

  for (const item of order.items ?? []) {
    const qty = itemQty(item)
    const revenue = qty * (item.unitPrice ?? 0)
    totalRevenue += revenue
    const recipe = getRecipeByProductId(item.productId)
    if (!recipe) { byProduct.push({ productId: item.productId, qty, cost: null, revenue }); continue }
    const { costPerPortion } = calcRecipeCost(recipe, { getInsumo, getRecipe })
    const cost = costPerPortion * qty
    totalCost += cost
    byProduct.push({ productId: item.productId, qty, cost, revenue })
  }

  return { totalCost, totalRevenue, margin: totalRevenue - totalCost, byProduct }
}
