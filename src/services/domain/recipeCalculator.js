// ARBO OS — DOMAIN SERVICE: CÁLCULO DE RECETAS, COSTEO Y FOOD COST %
import { convertQuantity } from './unitConversion.js'

export function calculateRecipeItemCost(item, ingredient) {
  if (!item || !ingredient) return 0
  const qtyInBaseUnit = convertQuantity(item.quantity, item.unit, ingredient.base_unit)
  return qtyInBaseUnit * ingredient.current_cost_unit
}

export function calculateRecipeCost(recipe, itemsWithIngredients) {
  if (!recipe || !itemsWithIngredients || itemsWithIngredients.length === 0) {
    return { totalCost: 0, costPerPortion: 0 }
  }

  const baseIngredientsCost = itemsWithIngredients.reduce((sum, { item, ingredient }) => {
    return sum + calculateRecipeItemCost(item, ingredient)
  }, 0)

  // Aplicación de merma operativa configurada en la receta
  const wasteMultiplier = 1 + (Number(recipe.waste_percentage) || 0) / 100
  const totalCostWithWaste = baseIngredientsCost * wasteMultiplier

  const yieldPortions = Number(recipe.yield_portions) || 1
  const costPerPortion = totalCostWithWaste / yieldPortions

  return {
    baseIngredientsCost,
    totalCostWithWaste,
    costPerPortion: Number(costPerPortion.toFixed(4)),
  }
}

export function calculateFoodCostPercentage(costPerPortion, basePrice) {
  if (!basePrice || Number(basePrice) <= 0) return 0
  const pct = (Number(costPerPortion) / Number(basePrice)) * 100
  return Number(pct.toFixed(2))
}

export function calculateGrossMargin(basePrice, costPerPortion) {
  return Number((Number(basePrice) - Number(costPerPortion)).toFixed(2))
}

export function getRecipeSummary(recipe, itemsWithIngredients, basePrice) {
  const { costPerPortion, totalCostWithWaste } = calculateRecipeCost(recipe, itemsWithIngredients)
  const foodCostPct = calculateFoodCostPercentage(costPerPortion, basePrice)
  const margin = calculateGrossMargin(basePrice, costPerPortion)

  return {
    costPerPortion,
    totalCostWithWaste,
    basePrice: Number(basePrice),
    margin,
    foodCostPct,
  }
}
