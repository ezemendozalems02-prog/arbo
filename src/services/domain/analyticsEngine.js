// ARBO OS — DOMAIN SERVICE: ANALYTICS, OPERATIONAL INTELLIGENCE & REPORTING
// Motor determinístico, auditable y explicable de analítica avanzada y compras sugeridas.
// Cumple estrictamente con las reglas de Fase 9: sin datos ficticios, sin LLMs externos,
// deducción de stock en tránsito, factor de empaque con redondeo hacia arriba (ceil),
// umbral estricto Food Cost Crítico > 35.00%, y Matriz Kasavana-Smith.

import { aggregateStockFromMovements } from './inventoryCosting.js'
import { calculateRecipeCost, calculateFoodCostPercentage, calculateGrossMargin } from './recipeCalculator.js'

/**
 * Constantes y umbrales normativos de ARBO OS Fase 9
 */
export const ANALYTICS_THRESHOLDS = {
  FOOD_COST_CRITICAL: 35.00, // > 35.00% es crítico
  FOOD_COST_WARNING: 30.00,  // > 30.00% y <= 35.00% es alerta preventiva
  FOOD_COST_TARGET: 30.00,   // Objetivo de referencia para cálculo de precio sugerido
}

/**
 * Resuelve el rango de fechas para un período dado.
 */
export function resolveDateRange(periodKey = '30d', customFrom = null, customTo = null, referenceDate = new Date()) {
  const now = new Date(referenceDate.getTime())
  let currentFrom, currentTo
  let prevFrom, prevTo

  if (periodKey === 'custom' && customFrom && customTo) {
    currentFrom = new Date(customFrom)
    currentTo = new Date(customTo)
    const durationMs = currentTo.getTime() - currentFrom.getTime()
    prevTo = new Date(currentFrom.getTime() - 1)
    prevFrom = new Date(prevTo.getTime() - durationMs)
    return { currentFrom, currentTo, prevFrom, prevTo, periodKey }
  }

  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

  if (periodKey === 'hoy') {
    currentFrom = startOfToday
    currentTo = endOfToday
    prevFrom = new Date(startOfToday.getTime() - 86400000)
    prevTo = new Date(endOfToday.getTime() - 86400000)
  } else if (periodKey === 'ayer') {
    currentFrom = new Date(startOfToday.getTime() - 86400000)
    currentTo = new Date(endOfToday.getTime() - 86400000)
    prevFrom = new Date(startOfToday.getTime() - 2 * 86400000)
    prevTo = new Date(endOfToday.getTime() - 2 * 86400000)
  } else if (periodKey === '7d') {
    currentFrom = new Date(endOfToday.getTime() - 7 * 86400000 + 1)
    currentTo = endOfToday
    prevFrom = new Date(currentFrom.getTime() - 7 * 86400000)
    prevTo = new Date(currentFrom.getTime() - 1)
  } else if (periodKey === 'mes') {
    currentFrom = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    currentTo = endOfToday
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    prevFrom = new Date(lastMonthYear, lastMonth, 1, 0, 0, 0, 0)
    const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate()
    const dayToMatch = Math.min(now.getDate(), daysInLastMonth)
    prevTo = new Date(lastMonthYear, lastMonth, dayToMatch, 23, 59, 59, 999)
  } else {
    // 30d por defecto
    currentFrom = new Date(endOfToday.getTime() - 30 * 86400000 + 1)
    currentTo = endOfToday
    prevFrom = new Date(currentFrom.getTime() - 30 * 86400000)
    prevTo = new Date(currentFrom.getTime() - 1)
  }

  return { currentFrom, currentTo, prevFrom, prevTo, periodKey }
}

/**
 * MOTOR DE COMPRAS SUGERIDAS
 * Calcula el déficit neto considerando stock actual y en tránsito,
 * y aplica el factor de empaque redondeando estrictamente hacia arriba.
 */
export function calculatePurchaseSuggestions({
  state = {},
  organizationId,
  branchId = null,
  warehouseId = null,
}) {
  const {
    ingredients = [],
    inventoryMovements = [],
    stockTransfers = [],
    stockTransferItems = [],
  } = state

  if (!organizationId) {
    throw new Error('TENANT_REQUIRED: organizationId es obligatorio para calcular compras sugeridas.')
  }

  const orgIngredients = ingredients.filter(i => i.organization_id === organizationId && i.is_active !== false)
  const suggestions = []

  for (const ing of orgIngredients) {
    // 1. Stock actual en almacén (a partir de inventory_movements)
    const relevantMovements = inventoryMovements.filter(m => {
      if (m.organization_id !== organizationId || m.ingredient_id !== ing.id) return false
      if (warehouseId && m.warehouse_id !== warehouseId) return false
      if (branchId && m.branch_id !== branchId) return false
      return true
    })
    const currentStock = aggregateStockFromMovements(relevantMovements, ing.id)

    // 2. Stock en tránsito: transferencias DISPATCHED hacia este almacén/sucursal
    let inTransitStock = 0.00
    const inTransitTransfers = stockTransfers.filter(t => {
      if (t.organization_id !== organizationId || t.status !== 'DISPATCHED') return false
      if (warehouseId && t.destination_warehouse_id !== warehouseId) return false
      if (branchId && t.destination_branch_id !== branchId) return false
      return true
    })

    for (const transfer of inTransitTransfers) {
      // Buscar ítems en stockTransferItems o transfer.items embebido
      const items = stockTransferItems.filter(ti => ti.transfer_id === transfer.id && ti.ingredient_id === ing.id)
      if (items.length > 0) {
        for (const it of items) {
          inTransitStock += Number(it.quantity || 0)
        }
      } else if (Array.isArray(transfer.items)) {
        for (const it of transfer.items) {
          if (it.ingredient_id === ing.id || it.ingredientId === ing.id) {
            inTransitStock += Number(it.quantity || 0)
          }
        }
      }
    }

    inTransitStock = Number(inTransitStock.toFixed(4))
    const effectiveStock = Number((currentStock + inTransitStock).toFixed(4))

    // 3. Nivel objetivo o stock mínimo
    const targetStock = Number(ing.target_stock_level ?? ing.min_stock ?? ing.minimum_stock ?? 0)

    // Si no hay stock objetivo configurado, no hay déficit calculable
    if (targetStock <= 0) continue

    const netDeficit = targetStock - effectiveStock

    // Si no hay déficit, no se genera compra sugerida
    if (netDeficit <= 0) continue

    // 4. Factor de empaque (ej. bolsa de 5kg, pack de 6u)
    const rawPackageFactor = Number(ing.package_factor || 1)
    const packageFactor = rawPackageFactor > 0 ? rawPackageFactor : 1

    // Redondeo obligatorio HACIA ARRIBA (Ceil)
    const suggestedPackages = Math.ceil(netDeficit / packageFactor)
    const suggestedQuantity = Number((suggestedPackages * packageFactor).toFixed(4))
    const unitCost = Number(ing.current_cost_unit || ing.cost_per_unit || 0)
    const estimatedCost = Number((suggestedQuantity * unitCost).toFixed(2))

    const reason = `Stock actual (${currentStock} ${ing.base_unit}) + en tránsito (${inTransitStock} ${ing.base_unit}) = ${effectiveStock} ${ing.base_unit}. Déficit neto respecto a nivel objetivo (${targetStock} ${ing.base_unit}) es ${netDeficit.toFixed(2)} ${ing.base_unit}. Ajustado por empaque (${packageFactor} ${ing.base_unit}/bulto) a ${suggestedPackages} bultos (${suggestedQuantity} ${ing.base_unit}).`

    suggestions.push({
      ingredientId: ing.id,
      ingredientName: ing.name,
      baseUnit: ing.base_unit,
      currentStock,
      inTransitStock,
      effectiveStock,
      targetStock,
      netDeficit: Number(netDeficit.toFixed(4)),
      packageFactor,
      packagingUnit: ing.packaging_unit || 'bulto',
      suggestedPackages,
      suggestedQuantity,
      unitCost,
      estimatedCost,
      supplierId: ing.primary_supplier_id || null,
      status: 'SUGGESTED',
      reason,
      warehouseId,
      branchId,
      organizationId,
    })
  }

  return {
    organizationId,
    branchId,
    warehouseId,
    suggestionsCount: suggestions.length,
    suggestions,
  }
}

/**
 * ANÁLISIS DE FOOD COST CRÍTICO & MARGEN POR PRODUCTO
 * Evalúa si el costo de receta supera el umbral del 35.00%,
 * identifica el insumo de mayor impacto y sugiere el precio correctivo.
 */
export function analyzeRecipeFoodCost({
  state = {},
  organizationId,
  productId,
  branchId = null,
}) {
  const {
    products = [],
    recipes = [],
    recipeItems = [],
    ingredients = [],
    branchProductSettings = [],
  } = state

  const product = products.find(p => p.id === productId && p.organization_id === organizationId)
  if (!product) {
    throw new Error(`PRODUCT_NOT_FOUND: Producto ${productId} no existe en la organización.`)
  }

  const recipe = recipes.find(r => (r.product_id === productId || r.productId === productId) && r.is_active !== false)
  if (!recipe) {
    return {
      productId,
      productName: product.name,
      hasRecipe: false,
      status: 'INSUFFICIENT_DATA',
      reason: 'El producto no cuenta con receta de costeo activa.',
    }
  }

  // Obtener precio efectivo (con posible sobreescritura de sucursal)
  let effectivePrice = Number(product.base_price || 0)
  if (branchId) {
    const setting = branchProductSettings.find(s => s.branch_id === branchId && s.product_id === productId)
    if (setting && setting.price_override !== null && setting.price_override !== undefined) {
      effectivePrice = Number(setting.price_override)
    }
  }

  // Vincular ítems de receta con insumos
  const items = recipeItems.filter(ri => ri.recipe_id === recipe.id)
  const itemsWithIngredients = items.map(ri => {
    const ing = ingredients.find(i => i.id === ri.ingredient_id) || {
      id: ri.ingredient_id,
      name: 'Desconocido',
      base_unit: ri.unit || 'u',
      current_cost_unit: 0,
    }
    return { item: ri, ingredient: ing }
  })

  const { costPerPortion, totalCostWithWaste } = calculateRecipeCost(recipe, itemsWithIngredients)
  const foodCostPct = calculateFoodCostPercentage(costPerPortion, effectivePrice)
  const margin = calculateGrossMargin(effectivePrice, costPerPortion)

  // Identificar el ingrediente de mayor incidencia en el costo
  let highestImpactIngredient = null
  let maxIngredientCost = -1

  for (const { item, ingredient } of itemsWithIngredients) {
    const qty = Number(item.quantity || 0)
    const unitCost = Number(ingredient.current_cost_unit || 0)
    const itemCost = qty * unitCost
    if (itemCost > maxIngredientCost) {
      maxIngredientCost = itemCost
      highestImpactIngredient = {
        ingredientId: ingredient.id,
        name: ingredient.name,
        costContribution: Number(itemCost.toFixed(4)),
        pctOfTotalCost: costPerPortion > 0 ? Number(((itemCost / costPerPortion) * 100).toFixed(2)) : 0,
      }
    }
  }

  // Precio recomendado para alcanzar Food Cost del 30%
  const recommendedPrice = costPerPortion > 0
    ? Number((costPerPortion / (ANALYTICS_THRESHOLDS.FOOD_COST_TARGET / 100)).toFixed(2))
    : effectivePrice

  // Evaluación estricta de umbrales
  let alertStatus = 'HEALTHY'
  if (foodCostPct > ANALYTICS_THRESHOLDS.FOOD_COST_CRITICAL) {
    alertStatus = 'CRITICAL'
  } else if (foodCostPct > ANALYTICS_THRESHOLDS.FOOD_COST_WARNING) {
    alertStatus = 'WARNING'
  }

  return {
    productId,
    productName: product.name,
    hasRecipe: true,
    effectivePrice,
    costPerPortion,
    totalCostWithWaste,
    margin,
    foodCostPct,
    alertStatus,
    isCritical: alertStatus === 'CRITICAL',
    highestImpactIngredient,
    recommendedPrice,
    targetFoodCostPct: ANALYTICS_THRESHOLDS.FOOD_COST_TARGET,
  }
}

/**
 * MATRIZ KASAVANA-SMITH (MENU ENGINEERING)
 * Clasifica los platos de la carta en STAR, PLOWHORSE, PUZZLE, DOG
 * según popularidad (unidades vendidas) y rentabilidad (margen unitario).
 */
export function calculateKasavanaSmithMatrix({
  state = {},
  organizationId,
  branchId = null,
  periodKey = '30d',
  customFrom = null,
  customTo = null,
}) {
  const {
    products = [],
    recipes = [],
    recipeItems = [],
    ingredients = [],
    sales = [],
    saleItems = [],
    branchProductSettings = [],
  } = state

  if (!organizationId) {
    throw new Error('TENANT_REQUIRED: organizationId es obligatorio para Kasavana-Smith.')
  }

  const { currentFrom, currentTo } = resolveDateRange(periodKey, customFrom, customTo)

  // 1. Filtrar ventas pagadas en el período
  const paidSales = sales.filter(s => {
    if (s.organization_id !== organizationId || s.status !== 'PAID') return false
    if (branchId && s.branch_id !== branchId) return false
    const d = new Date(s.created_at || s.createdAt)
    return d >= currentFrom && d <= currentTo
  })

  const paidSaleIds = new Set(paidSales.map(s => s.id))
  const relevantSaleItems = saleItems.filter(si => paidSaleIds.has(si.sale_id || si.saleId))

  // 2. Acumular unidades vendidas por producto
  const productSalesMap = new Map()
  for (const item of relevantSaleItems) {
    const pId = item.product_id || item.productId
    if (!pId) continue
    const qty = Number(item.quantity || 0)
    productSalesMap.set(pId, (productSalesMap.get(pId) || 0) + qty)
  }

  const orgProducts = products.filter(p => p.organization_id === organizationId && p.is_active !== false)
  if (orgProducts.length === 0 || relevantSaleItems.length === 0) {
    return {
      organizationId,
      branchId,
      periodKey,
      insufficientData: true,
      reason: 'INSUFFICIENT_DATA: No se registran ventas de productos en el período para la matriz Kasavana-Smith.',
      items: [],
      quadrants: { STAR: [], PLOWHORSE: [], PUZZLE: [], DOG: [] },
    }
  }

  // 3. Calcular métricas por producto
  const evaluatedProducts = []
  let totalUnitsSold = 0
  let totalMarginSum = 0

  for (const product of orgProducts) {
    const unitsSold = productSalesMap.get(product.id) || 0
    totalUnitsSold += unitsSold

    // Costo del producto
    const costAnalysis = analyzeRecipeFoodCost({
      state,
      organizationId,
      productId: product.id,
      branchId,
    })

    const unitCost = costAnalysis.costPerPortion || 0
    const price = costAnalysis.effectivePrice || Number(product.base_price || 0)
    const unitMargin = Number((price - unitCost).toFixed(2))

    totalMarginSum += (unitMargin * unitsSold)

    evaluatedProducts.push({
      productId: product.id,
      productName: product.name,
      price,
      cost: unitCost,
      unitMargin,
      unitsSold,
      foodCostPct: costAnalysis.foodCostPct || 0,
      alertStatus: costAnalysis.alertStatus || 'HEALTHY',
    })
  }

  // 4. Benchmarks normativos de Kasavana-Smith:
  // - Popularidad media = total de unidades vendidas / cantidad de productos
  // - Margen medio ponderado = margen total / unidades totales (o margen unitario medio)
  const averageUnitsSold = orgProducts.length > 0 ? totalUnitsSold / orgProducts.length : 0
  const benchmarkMargin = totalUnitsSold > 0 ? (totalMarginSum / totalUnitsSold) : 0

  const quadrants = {
    STAR: [],
    PLOWHORSE: [],
    PUZZLE: [],
    DOG: [],
  }

  const classifiedItems = evaluatedProducts.map(item => {
    const isHighPopularity = item.unitsSold >= averageUnitsSold
    const isHighProfitability = item.unitMargin >= benchmarkMargin

    let category = 'DOG'
    if (isHighPopularity && isHighProfitability) category = 'STAR'
    else if (isHighPopularity && !isHighProfitability) category = 'PLOWHORSE'
    else if (!isHighPopularity && isHighProfitability) category = 'PUZZLE'

    const explanation = `Ventas: ${item.unitsSold} (media: ${averageUnitsSold.toFixed(1)}). Margen: $${item.unitMargin.toFixed(2)} (benchmark: $${benchmarkMargin.toFixed(2)}). Clasificado como ${category}.`

    const classified = {
      ...item,
      category,
      isHighPopularity,
      isHighProfitability,
      explanation,
    }

    quadrants[category].push(classified)
    return classified
  })

  return {
    organizationId,
    branchId,
    periodKey,
    totalProducts: orgProducts.length,
    totalUnitsSold,
    averageUnitsSold: Number(averageUnitsSold.toFixed(2)),
    benchmarkMargin: Number(benchmarkMargin.toFixed(2)),
    items: classifiedItems,
    quadrants,
  }
}

/**
 * SERVICIO DE REPORTES: VENTAS CON COMPARATIVA HISTÓRICA
 */
export function getSalesReport({
  state = {},
  organizationId,
  branchId = null,
  periodKey = '30d',
  customFrom = null,
  customTo = null,
}) {
  const { sales = [], saleItems = [], payments = [] } = state

  if (!organizationId) {
    throw new Error('TENANT_REQUIRED: organizationId es obligatorio para reporte de ventas.')
  }

  const { currentFrom, currentTo, prevFrom, prevTo } = resolveDateRange(periodKey, customFrom, customTo)

  const filterSales = (from, to) => {
    return sales.filter(s => {
      if (s.organization_id !== organizationId || s.status !== 'PAID') return false
      if (branchId && s.branch_id !== branchId) return false
      const d = new Date(s.created_at || s.createdAt)
      return d >= from && d <= to
    })
  }

  const currentSales = filterSales(currentFrom, currentTo)
  const prevSales = filterSales(prevFrom, prevTo)

  const computeTotals = (salesList) => {
    const revenue = salesList.reduce((sum, s) => sum + Number(s.total || 0), 0)
    const count = salesList.length
    const avgTicket = count > 0 ? revenue / count : 0
    return {
      revenue: Number(revenue.toFixed(2)),
      count,
      avgTicket: Number(avgTicket.toFixed(2)),
    }
  }

  const currentTotals = computeTotals(currentSales)
  const prevTotals = computeTotals(prevSales)

  // Deltas y variaciones porcentuales
  const revenueDelta = Number((currentTotals.revenue - prevTotals.revenue).toFixed(2))
  const revenueDeltaPct = prevTotals.revenue > 0
    ? Number(((revenueDelta / prevTotals.revenue) * 100).toFixed(2))
    : 0

  const countDelta = currentTotals.count - prevTotals.count
  const countDeltaPct = prevTotals.count > 0
    ? Number(((countDelta / prevTotals.count) * 100).toFixed(2))
    : 0

  const avgTicketDelta = Number((currentTotals.avgTicket - prevTotals.avgTicket).toFixed(2))
  const avgTicketDeltaPct = prevTotals.avgTicket > 0
    ? Number(((avgTicketDelta / prevTotals.avgTicket) * 100).toFixed(2))
    : 0

  // Desglose por método de pago
  const currentSaleIds = new Set(currentSales.map(s => s.id))
  const currentPayments = payments.filter(p => currentSaleIds.has(p.sale_id || p.saleId))
  const paymentBreakdown = {}

  for (const p of currentPayments) {
    const method = p.payment_method || p.method || 'OTHER'
    const amount = Number(p.amount || 0)
    paymentBreakdown[method] = Number(((paymentBreakdown[method] || 0) + amount).toFixed(2))
  }

  return {
    organizationId,
    branchId,
    periodKey,
    dateRange: {
      current: { from: currentFrom.toISOString(), to: currentTo.toISOString() },
      previous: { from: prevFrom.toISOString(), to: prevTo.toISOString() },
    },
    metrics: {
      revenue: currentTotals.revenue,
      salesCount: currentTotals.count,
      averageTicket: currentTotals.avgTicket,
      comparison: {
        previousRevenue: prevTotals.revenue,
        revenueDelta,
        revenueDeltaPct,
        previousSalesCount: prevTotals.count,
        countDelta,
        countDeltaPct,
        previousAverageTicket: prevTotals.avgTicket,
        avgTicketDelta,
        avgTicketDeltaPct,
      },
    },
    paymentBreakdown,
  }
}

/**
 * SERVICIO DE REPORTES: INVENTARIO, VALORIZACIÓN Y MERMAS
 */
export function getInventoryReport({
  state = {},
  organizationId,
  branchId = null,
  warehouseId = null,
}) {
  const {
    ingredients = [],
    inventoryMovements = [],
    stockTransfers = [],
    wasteMovements = [],
  } = state

  if (!organizationId) {
    throw new Error('TENANT_REQUIRED: organizationId es obligatorio para reporte de inventario.')
  }

  const orgIngredients = ingredients.filter(i => i.organization_id === organizationId && i.is_active !== false)
  let totalAssetValue = 0.00
  let lowStockCount = 0
  const items = []

  for (const ing of orgIngredients) {
    const movements = inventoryMovements.filter(m => {
      if (m.organization_id !== organizationId || m.ingredient_id !== ing.id) return false
      if (warehouseId && m.warehouse_id !== warehouseId) return false
      if (branchId && m.branch_id !== branchId) return false
      return true
    })

    const stock = aggregateStockFromMovements(movements, ing.id)
    const cost = Number(ing.current_cost_unit || ing.cost_per_unit || 0)
    const value = Number((stock * cost).toFixed(2))
    if (value > 0) totalAssetValue += value

    const minStock = Number(ing.target_stock_level ?? ing.min_stock ?? ing.minimum_stock ?? 0)
    const isLowStock = minStock > 0 && stock <= minStock
    if (isLowStock) lowStockCount++

    items.push({
      ingredientId: ing.id,
      name: ing.name,
      baseUnit: ing.base_unit,
      stock,
      unitCost: cost,
      totalValue: value,
      minStock,
      isLowStock,
    })
  }

  // Mercadería en tránsito
  const inTransitTransfers = stockTransfers.filter(t => {
    if (t.organization_id !== organizationId || t.status !== 'DISPATCHED') return false
    if (warehouseId && t.destination_warehouse_id !== warehouseId) return false
    if (branchId && t.destination_branch_id !== branchId) return false
    return true
  })

  // Mermas operativas
  const wasteTotal = wasteMovements
    .filter(w => w.organization_id === organizationId && (!branchId || w.branch_id === branchId))
    .reduce((sum, w) => sum + Number(w.cost || w.total_cost || 0), 0)

  return {
    organizationId,
    branchId,
    warehouseId,
    totalAssetValue: Number(totalAssetValue.toFixed(2)),
    totalItemsCount: orgIngredients.length,
    lowStockCount,
    inTransitCount: inTransitTransfers.length,
    wasteTotalCost: Number(wasteTotal.toFixed(2)),
    items,
  }
}
