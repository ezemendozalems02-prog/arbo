// ARBO OS — DOMAIN SERVICE: COSTEO PPP E INVENTARIO POR MOVIMIENTOS
import { convertQuantity } from './unitConversion.js'

export function calculateWeightedAverageCost(existingQty, existingAvgCost, incomingQty, incomingUnitCost) {
  const eQty = Number(existingQty) || 0
  const eCost = Number(existingAvgCost) || 0
  const iQty = Number(incomingQty) || 0
  const iCost = Number(incomingUnitCost) || 0

  const totalQty = eQty + iQty
  if (totalQty <= 0) return iCost

  const totalValue = (eQty * eCost) + (iQty * iCost)
  const newAvg = totalValue / totalQty
  return Number(newAvg.toFixed(4))
}

export function aggregateStockFromMovements(movements, ingredientId) {
  if (!movements || movements.length === 0) return 0
  const hasMatchingId = ingredientId && movements.some(m => m.ingredient_id === ingredientId)
  const filtered = hasMatchingId ? movements.filter(m => m.ingredient_id === ingredientId) : movements
  const total = filtered.reduce((sum, m) => sum + (Number(m.quantity_delta) || 0), 0)
  return Number(total.toFixed(4))
}

export function computeRecipeDepletion(recipe, itemsWithIngredients, portions = 1) {
  const wasteMultiplier = 1 + (Number(recipe.waste_percentage) || 0) / 100

  return itemsWithIngredients.map(({ item, ingredient }) => {
    const rawQty = convertQuantity(item.quantity, item.unit, ingredient.base_unit)
    const totalRequired = rawQty * wasteMultiplier * (portions / (Number(recipe.yield_portions) || 1))
    
    return {
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      base_unit: ingredient.base_unit,
      depletion_delta: -Number(totalRequired.toFixed(4)),
      unit_cost_snapshot: ingredient.current_cost_unit,
    }
  })
}
