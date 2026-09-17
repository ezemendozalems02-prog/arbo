// Costeo de recetas (bloques 9-13). Funciones puras: reciben "getters"
// (cómo encontrar un insumo / otra receta) en vez de importar el contexto,
// para poder testear/reusar sin depender de React ni de dónde vive el
// estado — el mismo patrón que kitchenService.js en Fase 3.
import { convertQuantity } from './unitService'

// Una receta puede usar otra receta como ingrediente (bloque 13, "recetas
// compuestas" — ej. Salsa ARBO dentro de Tostado Arbo). `visited` corta
// ciclos accidentales (A usa B usa A) sin explotar la recursión.
export function calcIngredientCost(ingredient, { getInsumo, getRecipe }, visited = new Set()) {
  if (ingredient.kind === 'insumo') {
    const insumo = getInsumo(ingredient.refId)
    if (!insumo) return 0
    const qtyInStockUnit = convertQuantity(ingredient.quantity, ingredient.unit, insumo.unit) ?? ingredient.quantity
    return qtyInStockUnit * insumo.avgCost
  }
  // ingredient.kind === 'recipe' (preparado/base compuesta)
  const subRecipe = getRecipe(ingredient.refId)
  if (!subRecipe || visited.has(subRecipe.id)) return 0
  const { costPerYieldUnit } = calcRecipeCost(subRecipe, { getInsumo, getRecipe }, visited)
  const qtyInYieldUnit = convertQuantity(ingredient.quantity, ingredient.unit, subRecipe.yield.unit) ?? ingredient.quantity
  return qtyInYieldUnit * costPerYieldUnit
}

export function calcRecipeCost(recipe, { getInsumo, getRecipe }, visited = new Set()) {
  if (visited.has(recipe.id)) return { ingredientsCost: 0, costPerYieldUnit: 0, costPerPortion: 0 }
  const nextVisited = new Set(visited)
  nextVisited.add(recipe.id)

  const ingredientsCost = recipe.ingredients.reduce(
    (sum, ing) => sum + calcIngredientCost(ing, { getInsumo, getRecipe }, nextVisited), 0
  )
  const yieldQty = recipe.yield?.qty || 1
  const costPerYieldUnit = ingredientsCost / yieldQty

  return { ingredientsCost, costPerYieldUnit, costPerPortion: costPerYieldUnit }
}

// BLOQUE 12 — Food Cost % = costo / precio × 100.
export function calcFoodCostPct(cost, price) {
  if (!price || price <= 0) return 0
  return (cost / price) * 100
}

export function calcMargin(price, cost) {
  return price - cost
}

// Resumen listo para tablas/tarjetas (recetas, análisis de productos).
export function calcRecipeSummary(recipe, price, { getInsumo, getRecipe }) {
  const { ingredientsCost, costPerPortion } = calcRecipeCost(recipe, { getInsumo, getRecipe })
  const margin = calcMargin(price, costPerPortion)
  const foodCostPct = calcFoodCostPct(costPerPortion, price)
  return { ingredientsCost, cost: costPerPortion, price, margin, foodCostPct }
}
