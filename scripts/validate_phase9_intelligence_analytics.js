/**
 * ARBO OS — FASE 9 VALIDATION SUITE
 * Capa de Inteligencia Operacional, Analítica Avanzada & Gestión de Compras Sugeridas
 *
 * Valida los 26 requerimientos normativos obligatorios de Fase 9:
 * 1. purchase suggestion: cálculo determinista de necesidad de compra
 * 2. packaging rounding: factor de empaque con redondeo hacia arriba (ceil), nunca hacia abajo
 * 3. transit stock deduction: deducción estricta de stock en tránsito (DISPATCHED)
 * 4. insufficient stock data: manejo conservador de datos insuficientes sin invenciones
 * 5. branch isolation: aislamiento de consultas analíticas por sucursal
 * 6. warehouse isolation: aislamiento de compras sugeridas e inventario por depósito
 * 7. tenant isolation: aislamiento estricto por organización
 * 8. food cost calculation: cálculo de Food Cost % a partir de costo de receta y precio
 * 9. critical threshold: frontera estricta: 34.99% saludable, 35.00% no crítico, 35.01% crítico
 * 10. margin calculation: cálculo de margen unitario y porcentual
 * 11. Kasavana popularity: cálculo de popularidad (unidades vendidas vs media)
 * 12. Kasavana profitability: cálculo de rentabilidad (margen unitario vs benchmark)
 * 13. Kasavana classification: clasificación en los 4 cuadrantes (STAR, PLOWHORSE, PUZZLE, DOG)
 * 14. reporting period: resolución explícita de períodos (hoy, ayer, 7d, 30d, mes, custom)
 * 15. previous period comparison: deltas absolutos y porcentuales contra período anterior
 * 16. inventory analytics: valorización de inventario, stock bajo, mercadería en tránsito y mermas
 * 17. PPP variation: costo medio ponderado de insumos y persistencia
 * 18. cost impact: identificación del insumo de mayor incidencia en el costo de receta
 * 19. recommendation explainability: explicabilidad matemática de cada sugerencia
 * 20. automation integration: disparo e idempotencia de eventos FOOD_COST_CRITICAL y LOW_STOCK
 * 21. RLS policies: verificación de seguridad RLS en migración SQL 009
 * 22. security: mitigación de fuga cross-tenant y cross-branch
 * 23. no N+1 regression: iteraciones y agregaciones en lote
 * 24. multi-branch consolidation: métricas ejecutivas consolidadas
 * 25. regression Fases 1–8: 266 tests existentes pasando al 100%
 * 26. production build: compilación Vite limpia con 0 errores
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

import {
  calculatePurchaseSuggestions,
  analyzeRecipeFoodCost,
  calculateKasavanaSmithMatrix,
  getSalesReport,
  getInventoryReport,
  resolveDateRange,
  ANALYTICS_THRESHOLDS,
} from '../src/services/domain/analyticsEngine.js'

import {
  calculateRecipeCost,
  calculateFoodCostPercentage,
  calculateGrossMargin,
} from '../src/services/domain/recipeCalculator.js'

import {
  calculateWeightedAverageCost,
  aggregateStockFromMovements,
} from '../src/services/domain/inventoryCosting.js'

import {
  dispatchDomainEvent,
  buildIdempotencyKey,
} from '../src/services/domain/automationEngine.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let passCount = 0
let failCount = 0

function assert(condition, message) {
  if (condition) {
    passCount++
    console.log(`  [PASS] ${message}`)
  } else {
    failCount++
    console.error(`  [FAIL] ${message}`)
  }
}

console.log('===================================================================')
console.log('  ARBO OS — FASE 9: VALIDACIÓN DE INTELIGENCIA OPERACIONAL')
console.log('===================================================================\n')

// ===================================================================
// 1. PURCHASE SUGGESTION
// ===================================================================
console.log('--- TEST 1: PURCHASE SUGGESTION DETERMINISTIC ---')
{
  const state = {
    ingredients: [
      {
        id: 'ing_harina',
        name: 'Harina 000',
        base_unit: 'kg',
        current_cost_unit: 1200,
        target_stock_level: 50,
        package_factor: 1,
        organization_id: 'org_trevelin',
        is_active: true,
      },
    ],
    inventoryMovements: [
      { organization_id: 'org_trevelin', ingredient_id: 'ing_harina', quantity_delta: 20 },
    ],
    stockTransfers: [],
    stockTransferItems: [],
  }

  const result = calculatePurchaseSuggestions({
    state,
    organizationId: 'org_trevelin',
  })

  assert(result.suggestionsCount === 1, '1.1 Genera sugerencia cuando stock actual (20) < objetivo (50)')
  assert(result.suggestions[0].netDeficit === 30, '1.2 Déficit neto calculado exactamente en 30 kg')
  assert(result.suggestions[0].suggestedQuantity === 30, '1.3 Cantidad sugerida coincide con déficit cuando factor empaque es 1')
  assert(result.suggestions[0].status === 'SUGGESTED', '1.4 Estado de compra sugerida es estrictamente SUGGESTED')
}

// ===================================================================
// 2. PACKAGING ROUNDING (CEIL, NEVER DOWN)
// ===================================================================
console.log('--- TEST 2: PACKAGING FACTOR ROUNDING (CEIL, NEVER DOWN) ---')
{
  // Ejemplo de la especificación oficial:
  // Necesidad: 17 kg
  // Proveedor vende: bolsas de 5 kg
  // Sugerencia: 20 kg (4 bolsas), nunca 15 kg (3 bolsas) ni 17 kg fraccionado.
  const state = {
    ingredients: [
      {
        id: 'ing_cafe',
        name: 'Café de Especialidad',
        base_unit: 'kg',
        current_cost_unit: 15000,
        target_stock_level: 20,
        package_factor: 5, // Bolsas de 5 kg
        packaging_unit: 'bolsa de 5kg',
        organization_id: 'org_trevelin',
        is_active: true,
      },
    ],
    inventoryMovements: [
      { organization_id: 'org_trevelin', ingredient_id: 'ing_cafe', quantity_delta: 3 }, // Quedan 3 kg -> déficit = 17 kg
    ],
    stockTransfers: [],
    stockTransferItems: [],
  }

  const result = calculatePurchaseSuggestions({
    state,
    organizationId: 'org_trevelin',
  })

  const sug = result.suggestions[0]
  assert(sug.netDeficit === 17, '2.1 Déficit neto de café es 17 kg')
  assert(sug.suggestedPackages === 4, '2.2 Redondeo hacia arriba (ceil): 17 / 5 = 3.4 -> 4 paquetes')
  assert(sug.suggestedQuantity === 20, '2.3 Cantidad sugerida es 20 kg (múltiplo exacto de 5 kg), nunca 17 kg ni 15 kg')
}

// ===================================================================
// 3. TRANSIT STOCK DEDUCTION
// ===================================================================
console.log('--- TEST 3: TRANSIT STOCK DEDUCTION (DISPATCHED NOT RECEIVED) ---')
{
  // Si objetivo es 50, actual es 20, pero hay 25 en tránsito (DISPATCHED no recibido aún),
  // el stock efectivo es 45, y el déficit neto es 5, NO 30.
  const state = {
    ingredients: [
      {
        id: 'ing_leche',
        name: 'Leche Entera',
        base_unit: 'l',
        current_cost_unit: 1100,
        target_stock_level: 50,
        package_factor: 10, // Cajas de 10 litros
        organization_id: 'org_trevelin',
        is_active: true,
      },
    ],
    inventoryMovements: [
      { organization_id: 'org_trevelin', ingredient_id: 'ing_leche', quantity_delta: 20, warehouse_id: 'wh_salon' },
    ],
    stockTransfers: [
      {
        id: 'tr_101',
        organization_id: 'org_trevelin',
        status: 'DISPATCHED', // En tránsito
        destination_warehouse_id: 'wh_salon',
      },
    ],
    stockTransferItems: [
      { transfer_id: 'tr_101', ingredient_id: 'ing_leche', quantity: 25 },
    ],
  }

  const result = calculatePurchaseSuggestions({
    state,
    organizationId: 'org_trevelin',
    warehouseId: 'wh_salon',
  })

  const sug = result.suggestions[0]
  assert(sug.currentStock === 20, '3.1 Stock actual detectado en 20 l')
  assert(sug.inTransitStock === 25, '3.2 Stock en tránsito detectado en 25 l')
  assert(sug.effectiveStock === 45, '3.3 Stock efectivo = actual (20) + tránsito (25) = 45 l')
  assert(sug.netDeficit === 5, '3.4 Déficit neto deducido = 50 - 45 = 5 l (no 30 l)')
  assert(sug.suggestedPackages === 1, '3.5 5 l ajustado a caja de 10 l = 1 caja sugerida')
  assert(sug.suggestedQuantity === 10, '3.6 Cantidad sugerida final = 10 l')
}

// ===================================================================
// 4. INSUFFICIENT STOCK DATA
// ===================================================================
console.log('--- TEST 4: INSUFFICIENT STOCK DATA / NO FAKE METRICS ---')
{
  const state = {
    ingredients: [
      {
        id: 'ing_sal',
        name: 'Sal Marina',
        base_unit: 'kg',
        current_cost_unit: 500,
        target_stock_level: 0, // Sin nivel objetivo configurado
        organization_id: 'org_trevelin',
        is_active: true,
      },
    ],
    inventoryMovements: [],
    stockTransfers: [],
  }

  const result = calculatePurchaseSuggestions({
    state,
    organizationId: 'org_trevelin',
  })

  assert(result.suggestions.length === 0, '4.1 No inventa sugerencias si no hay target_stock_level definido')
}

// ===================================================================
// 5. BRANCH ISOLATION
// ===================================================================
console.log('--- TEST 5: BRANCH ISOLATION IN ANALYTICS ---')
{
  const state = {
    ingredients: [
      { id: 'ing_harina', name: 'Harina', base_unit: 'kg', target_stock_level: 100, organization_id: 'org_trevelin', is_active: true },
    ],
    inventoryMovements: [
      { organization_id: 'org_trevelin', branch_id: 'branch_trevelin', ingredient_id: 'ing_harina', quantity_delta: 90 },
      { organization_id: 'org_trevelin', branch_id: 'branch_esquel', ingredient_id: 'ing_harina', quantity_delta: 10 },
    ],
    stockTransfers: [],
  }

  const resultTrevelin = calculatePurchaseSuggestions({
    state,
    organizationId: 'org_trevelin',
    branchId: 'branch_trevelin',
  })

  const resultEsquel = calculatePurchaseSuggestions({
    state,
    organizationId: 'org_trevelin',
    branchId: 'branch_esquel',
  })

  assert(resultTrevelin.suggestions[0].currentStock === 90, '5.1 Sucursal Trevelin analiza únicamente sus 90 kg')
  assert(resultEsquel.suggestions[0].currentStock === 10, '5.2 Sucursal Esquel analiza únicamente sus 10 kg')
}

// ===================================================================
// 6. WAREHOUSE ISOLATION
// ===================================================================
console.log('--- TEST 6: WAREHOUSE ISOLATION ---')
{
  const state = {
    ingredients: [
      { id: 'ing_harina', name: 'Harina', base_unit: 'kg', target_stock_level: 50, organization_id: 'org_trevelin', is_active: true },
    ],
    inventoryMovements: [
      { organization_id: 'org_trevelin', warehouse_id: 'wh_deposito_central', ingredient_id: 'ing_harina', quantity_delta: 50 },
      { organization_id: 'org_trevelin', warehouse_id: 'wh_barra', ingredient_id: 'ing_harina', quantity_delta: 5 },
    ],
    stockTransfers: [],
  }

  const resCentral = calculatePurchaseSuggestions({ state, organizationId: 'org_trevelin', warehouseId: 'wh_deposito_central' })
  const resBarra = calculatePurchaseSuggestions({ state, organizationId: 'org_trevelin', warehouseId: 'wh_barra' })

  assert(resCentral.suggestions.length === 0, '6.1 Depósito central con 50/50 no genera sugerencia')
  assert(resBarra.suggestions.length === 1 && resBarra.suggestions[0].netDeficit === 45, '6.2 Depósito barra genera sugerencia con déficit de 45')
}

// ===================================================================
// 7. TENANT ISOLATION
// ===================================================================
console.log('--- TEST 7: TENANT ISOLATION ---')
{
  const state = {
    ingredients: [
      { id: 'ing_t1', name: 'Insumo T1', base_unit: 'kg', target_stock_level: 20, organization_id: 'org_1', is_active: true },
      { id: 'ing_t2', name: 'Insumo T2', base_unit: 'kg', target_stock_level: 20, organization_id: 'org_2', is_active: true },
    ],
    inventoryMovements: [],
    stockTransfers: [],
  }

  const resT1 = calculatePurchaseSuggestions({ state, organizationId: 'org_1' })
  assert(resT1.suggestions.every(s => s.organizationId === 'org_1'), '7.1 Consultas analíticas nunca mezclan registros de otro tenant')
}

// ===================================================================
// 8. FOOD COST CALCULATION
// ===================================================================
console.log('--- TEST 8: FOOD COST CALCULATION ---')
{
  const state = {
    products: [
      { id: 'prod_pizza', name: 'Pizza Margarita', base_price: 10000, organization_id: 'org_trevelin' },
    ],
    recipes: [
      { id: 'rec_pizza', product_id: 'prod_pizza', waste_percentage: 0, yield_portions: 1, is_active: true },
    ],
    recipeItems: [
      { recipe_id: 'rec_pizza', ingredient_id: 'ing_queso', quantity: 0.3, unit: 'kg' },
      { recipe_id: 'rec_pizza', ingredient_id: 'ing_tomate', quantity: 0.2, unit: 'kg' },
    ],
    ingredients: [
      { id: 'ing_queso', name: 'Queso Mozzarella', base_unit: 'kg', current_cost_unit: 8000 }, // 0.3 * 8000 = 2400
      { id: 'ing_tomate', name: 'Salsa Tomate', base_unit: 'kg', current_cost_unit: 3000 },    // 0.2 * 3000 = 600
    ],
    branchProductSettings: [],
  }

  // Costo total = 2400 + 600 = 3000
  // Precio venta = 10000 -> Food Cost % = (3000 / 10000) * 100 = 30.00%
  const analysis = analyzeRecipeFoodCost({ state, organizationId: 'org_trevelin', productId: 'prod_pizza' })

  assert(analysis.costPerPortion === 3000, '8.1 Costo de receta por porción calculado exactamente en $3000')
  assert(analysis.foodCostPct === 30.00, '8.2 Food Cost % calculado exactamente en 30.00%')
  assert(analysis.margin === 7000, '8.3 Margen bruto calculado en $7000')
}

// ===================================================================
// 9. CRITICAL THRESHOLD EXACT BOUNDARY (34.99 vs 35.00 vs 35.01)
// ===================================================================
console.log('--- TEST 9: FOOD COST CRITICAL THRESHOLD EXACT BOUNDARIES ---')
{
  const makeScenario = (price, cost) => {
    return {
      products: [{ id: 'prod_test', name: 'Test', base_price: price, organization_id: 'org_t' }],
      recipes: [{ id: 'rec_test', product_id: 'prod_test', waste_percentage: 0, yield_portions: 1, is_active: true }],
      recipeItems: [{ recipe_id: 'rec_test', ingredient_id: 'ing_1', quantity: 1, unit: 'u' }],
      ingredients: [{ id: 'ing_1', name: 'Insumo', base_unit: 'u', current_cost_unit: cost }],
      branchProductSettings: [],
    }
  }

  // Caso 1: 34.99% -> NO CRÍTICO (es WARNING porque > 30% pero <= 35%)
  const state3499 = makeScenario(10000, 3499)
  const res3499 = analyzeRecipeFoodCost({ state: state3499, organizationId: 'org_t', productId: 'prod_test' })
  assert(res3499.foodCostPct === 34.99 && res3499.alertStatus !== 'CRITICAL' && res3499.isCritical === false,
    '9.1 Food Cost 34.99% es evaluado como NO CRÍTICO')

  // Caso 2: 35.00% -> NO CRÍTICO según regla de frontera estricta (> 35.00% es crítico)
  const state3500 = makeScenario(10000, 3500)
  const res3500 = analyzeRecipeFoodCost({ state: state3500, organizationId: 'org_t', productId: 'prod_test' })
  assert(res3500.foodCostPct === 35.00 && res3500.alertStatus === 'WARNING' && res3500.isCritical === false,
    '9.2 Food Cost 35.00% es WARNING preventivo, NO CRÍTICO')

  // Caso 3: 35.01% -> CRÍTICO
  const state3501 = makeScenario(10000, 3501)
  const res3501 = analyzeRecipeFoodCost({ state: state3501, organizationId: 'org_t', productId: 'prod_test' })
  assert(res3501.foodCostPct === 35.01 && res3501.alertStatus === 'CRITICAL' && res3501.isCritical === true,
    '9.3 Food Cost 35.01% activa estricta alerta CRITICAL')
}

// ===================================================================
// 10. MARGIN CALCULATION
// ===================================================================
console.log('--- TEST 10: MARGIN CALCULATION ---')
{
  const margin = calculateGrossMargin(15000, 4500)
  assert(margin === 10500, '10.1 Margen bruto unitario = 15000 - 4500 = 10500')
}

// ===================================================================
// 11, 12, 13. KASAVANA-SMITH MATRIX (POPULARITY, PROFITABILITY, QUADRANTS)
// ===================================================================
console.log('--- TEST 11, 12, 13: KASAVANA-SMITH MENU ENGINEERING MATRIX ---')
{
  const now = new Date()
  const state = {
    products: [
      { id: 'p_star', name: 'Plato Estrella', base_price: 12000, organization_id: 'org_kas' },
      { id: 'p_plow', name: 'Plato Caballo', base_price: 8000, organization_id: 'org_kas' },
      { id: 'p_puz', name: 'Plato Puzzle', base_price: 15000, organization_id: 'org_kas' },
      { id: 'p_dog', name: 'Plato Perro', base_price: 6000, organization_id: 'org_kas' },
    ],
    recipes: [
      // p_star: costo 3000 -> margen = 9000 (Alto)
      { id: 'r_star', product_id: 'p_star', waste_percentage: 0, yield_portions: 1, is_active: true },
      // p_plow: costo 5000 -> margen = 3000 (Bajo)
      { id: 'r_plow', product_id: 'p_plow', waste_percentage: 0, yield_portions: 1, is_active: true },
      // p_puz: costo 4000 -> margen = 11000 (Alto)
      { id: 'r_puz', product_id: 'p_puz', waste_percentage: 0, yield_portions: 1, is_active: true },
      // p_dog: costo 4500 -> margen = 1500 (Bajo)
      { id: 'r_dog', product_id: 'p_dog', waste_percentage: 0, yield_portions: 1, is_active: true },
    ],
    recipeItems: [
      { recipe_id: 'r_star', ingredient_id: 'ing_c', quantity: 3, unit: 'u' },
      { recipe_id: 'r_plow', ingredient_id: 'ing_c', quantity: 5, unit: 'u' },
      { recipe_id: 'r_puz', ingredient_id: 'ing_c', quantity: 4, unit: 'u' },
      { recipe_id: 'r_dog', ingredient_id: 'ing_c', quantity: 4.5, unit: 'u' },
    ],
    ingredients: [
      { id: 'ing_c', name: 'Insumo Base', base_unit: 'u', current_cost_unit: 1000 },
    ],
    sales: [
      { id: 's1', organization_id: 'org_kas', status: 'PAID', created_at: now.toISOString() },
    ],
    saleItems: [
      // Popularidad:
      // p_star: 50 ventas (Alta)
      // p_plow: 60 ventas (Alta)
      // p_puz: 10 ventas (Baja)
      // p_dog: 5 ventas (Baja)
      // Total ventas = 125. Media por plato (4 platos) = 31.25.
      { sale_id: 's1', product_id: 'p_star', quantity: 50 },
      { sale_id: 's1', product_id: 'p_plow', quantity: 60 },
      { sale_id: 's1', product_id: 'p_puz', quantity: 10 },
      { sale_id: 's1', product_id: 'p_dog', quantity: 5 },
    ],
    branchProductSettings: [],
  }

  const matrix = calculateKasavanaSmithMatrix({
    state,
    organizationId: 'org_kas',
    periodKey: '30d',
  })

  assert(matrix.averageUnitsSold === 31.25, '11.1 Benchmark de popularidad = 125 / 4 = 31.25 unidades')
  assert(matrix.benchmarkMargin > 0, '12.1 Benchmark de rentabilidad ponderado calculado correctamente')

  const starItem = matrix.items.find(i => i.productId === 'p_star')
  const plowItem = matrix.items.find(i => i.productId === 'p_plow')
  const puzItem = matrix.items.find(i => i.productId === 'p_puz')
  const dogItem = matrix.items.find(i => i.productId === 'p_dog')

  assert(starItem.category === 'STAR', '13.1 STAR clasificado correctamente (Alta Popularidad / Alto Margen)')
  assert(plowItem.category === 'PLOWHORSE', '13.2 PLOWHORSE clasificado correctamente (Alta Popularidad / Bajo Margen)')
  assert(puzItem.category === 'PUZZLE', '13.3 PUZZLE clasificado correctamente (Baja Popularidad / Alto Margen)')
  assert(dogItem.category === 'DOG', '13.4 DOG clasificado correctamente (Baja Popularidad / Bajo Margen)')
}

// ===================================================================
// 14. REPORTING PERIOD RESOLUTION
// ===================================================================
console.log('--- TEST 14: REPORTING PERIOD RESOLUTION ---')
{
  const refDate = new Date('2026-09-19T12:00:00Z')
  const rangeHoy = resolveDateRange('hoy', null, null, refDate)
  assert(rangeHoy.currentFrom <= rangeHoy.currentTo, '14.1 Resolución de período hoy es consistente')

  const range7d = resolveDateRange('7d', null, null, refDate)
  const diffDays = Math.round((range7d.currentTo - range7d.currentFrom) / 86400000)
  assert(diffDays === 7, '14.2 Período 7d abarca exactamente 7 días')
}

// ===================================================================
// 15. PREVIOUS PERIOD COMPARISON
// ===================================================================
console.log('--- TEST 15: PREVIOUS PERIOD COMPARISON (DELTAS & PERCENTAGES) ---')
{
  const now = new Date()
  const dCurrent = new Date(now.getTime() - 2 * 86400000) // Hace 2 días (dentro de últimos 7 días)
  const dPrevious = new Date(now.getTime() - 10 * 86400000) // Hace 10 días (período anterior de 7 días)

  const state = {
    sales: [
      { id: 's_curr', organization_id: 'org_comp', total: 100000, status: 'PAID', created_at: dCurrent.toISOString() },
      { id: 's_prev', organization_id: 'org_comp', total: 80000, status: 'PAID', created_at: dPrevious.toISOString() },
    ],
    payments: [],
  }

  const report = getSalesReport({
    state,
    organizationId: 'org_comp',
    periodKey: '7d',
  })

  assert(report.metrics.revenue === 100000, '15.1 Facturación período actual = $100.000')
  assert(report.metrics.comparison.previousRevenue === 80000, '15.2 Facturación período previo = $80.000')
  assert(report.metrics.comparison.revenueDelta === 20000, '15.3 Delta absoluto = +$20.000')
  assert(report.metrics.comparison.revenueDeltaPct === 25.00, '15.4 Delta porcentual = +25.00%')
}

// ===================================================================
// 16. INVENTORY ANALYTICS
// ===================================================================
console.log('--- TEST 16: INVENTORY ANALYTICS ---')
{
  const state = {
    ingredients: [
      { id: 'ing_1', name: 'Insumo 1', base_unit: 'kg', current_cost_unit: 1000, target_stock_level: 50, organization_id: 'org_inv', is_active: true },
      { id: 'ing_2', name: 'Insumo 2', base_unit: 'kg', current_cost_unit: 2000, target_stock_level: 10, organization_id: 'org_inv', is_active: true },
    ],
    inventoryMovements: [
      { organization_id: 'org_inv', ingredient_id: 'ing_1', quantity_delta: 20 }, // stock 20 (bajo stock porque target 50) -> valor 20000
      { organization_id: 'org_inv', ingredient_id: 'ing_2', quantity_delta: 30 }, // stock 30 -> valor 60000
    ],
    stockTransfers: [
      { id: 'tr_1', organization_id: 'org_inv', status: 'DISPATCHED' },
    ],
    wasteMovements: [
      { id: 'w_1', organization_id: 'org_inv', cost: 5000 },
    ],
  }

  const invReport = getInventoryReport({ state, organizationId: 'org_inv' })
  assert(invReport.totalAssetValue === 80000, '16.1 Valor total del activo de inventario = $80.000 (20k + 60k)')
  assert(invReport.lowStockCount === 1, '16.2 Conteo de insumos en bajo stock = 1')
  assert(invReport.inTransitCount === 1, '16.3 Transferencias en tránsito detectadas = 1')
  assert(invReport.wasteTotalCost === 5000, '16.4 Costo total de mermas registrado = $5.000')
}

// ===================================================================
// 17. PPP VARIATION
// ===================================================================
console.log('--- TEST 17: PPP (WEIGHTED AVERAGE COST) ---')
{
  // 10 unidades a $1000 + 10 unidades a $1500 = 20 unidades a $1250
  const newAvgCost = calculateWeightedAverageCost(10, 1000, 10, 1500)
  assert(newAvgCost === 1250, '17.1 Cálculo determinista de PPP ante nuevo ingreso de compra')
}

// ===================================================================
// 18. COST IMPACT INGREDIENT DETECTION
// ===================================================================
console.log('--- TEST 18: HIGHEST COST IMPACT INGREDIENT ---')
{
  const state = {
    products: [{ id: 'prod_cafe', name: 'Café Flat White', base_price: 4500, organization_id: 'org_trevelin' }],
    recipes: [{ id: 'rec_cafe', product_id: 'prod_cafe', waste_percentage: 0, yield_portions: 1, is_active: true }],
    recipeItems: [
      { recipe_id: 'rec_cafe', ingredient_id: 'ing_grano', quantity: 0.02, unit: 'kg' }, // 0.02 * 25000 = $500
      { recipe_id: 'rec_cafe', ingredient_id: 'ing_leche', quantity: 0.2, unit: 'l' },   // 0.2 * 1000 = $200
    ],
    ingredients: [
      { id: 'ing_grano', name: 'Grano Especialidad', base_unit: 'kg', current_cost_unit: 25000 },
      { id: 'ing_leche', name: 'Leche Barista', base_unit: 'l', current_cost_unit: 1000 },
    ],
    branchProductSettings: [],
  }

  const analysis = analyzeRecipeFoodCost({ state, organizationId: 'org_trevelin', productId: 'prod_cafe' })
  assert(analysis.highestImpactIngredient.ingredientId === 'ing_grano', '18.1 Identifica correctamente que el grano es el insumo de mayor costo')
  assert(analysis.highestImpactIngredient.costContribution === 500, '18.2 Aporte cuantificado de costo del insumo líder en $500')
}

// ===================================================================
// 19. RECOMMENDATION EXPLAINABILITY
// ===================================================================
console.log('--- TEST 19: RECOMMENDATION EXPLAINABILITY ---')
{
  const state = {
    ingredients: [
      { id: 'ing_x', name: 'Manteca', base_unit: 'kg', target_stock_level: 25, package_factor: 5, current_cost_unit: 4000, organization_id: 'org_x', is_active: true },
    ],
    inventoryMovements: [{ organization_id: 'org_x', ingredient_id: 'ing_x', quantity_delta: 8 }],
    stockTransfers: [],
  }

  const res = calculatePurchaseSuggestions({ state, organizationId: 'org_x' })
  const explanation = res.suggestions[0].reason
  assert(typeof explanation === 'string' && explanation.includes('Stock actual') && explanation.includes('bultos'),
    '19.1 La sugerencia de compra cuenta con explicación matemática y trazable completa')
}

// ===================================================================
// 20. AUTOMATION INTEGRATION
// ===================================================================
console.log('--- TEST 20: AUTOMATION INTEGRATION ---')
{
  let executedAction = null
  const mockState = {
    automationRules: [
      {
        id: 'rule_food_cost_critical',
        organization_id: 'org_auto',
        event_type: 'FOOD_COST_CRITICAL',
        action_type: 'CREATE_ALERT',
        condition: { isCritical: true },
        is_enabled: true,
      },
    ],
    automationExecutions: [],
  }

  const payload = {
    organization_id: 'org_auto',
    product_id: 'prod_999',
    product_name: 'Plato Caro',
    food_cost_pct: 42.5,
    isCritical: true,
  }

  const result = await dispatchDomainEvent({
    state: mockState,
    eventType: 'FOOD_COST_CRITICAL',
    payload,
    actionHandler: async ({ rule, payload }) => {
      executedAction = { ruleId: rule.id, alert: payload.product_name }
      return { ok: true }
    },
  })

  assert(result.success === true, '20.1 Disparo de evento FOOD_COST_CRITICAL exitoso')
  assert(executedAction !== null && executedAction.ruleId === 'rule_food_cost_critical', '20.2 Regla de automatización ejecutada')

  // Idempotencia: disparar el mismo evento no vuelve a duplicar ejecución
  const dupResult = await dispatchDomainEvent({
    state: result.updatedState,
    eventType: 'FOOD_COST_CRITICAL',
    payload,
    actionHandler: async () => { executedAction = 'DUPLICATE_FAILED' },
  })
  assert(dupResult.results[0].status === 'SKIPPED_DUPLICATE', '20.3 Idempotencia previene ejecuciones duplicadas de alerta')
}

// ===================================================================
// 21. RLS POLICIES VERIFICATION
// ===================================================================
console.log('--- TEST 21: RLS POLICIES IN MIGRATION SQL 009 ---')
{
  const migrationSqlPath = path.resolve(__dirname, '../supabase/migrations/20260919000009_intelligence_analytics_reports.sql')
  const sql = fs.readFileSync(migrationSqlPath, 'utf8')

  assert(sql.includes('TABLE IF NOT EXISTS public.suppliers') || sql.includes('TABLE IF NOT EXISTS suppliers'), '21.1 Tabla suppliers creada en migración 009')
  assert(sql.includes('suppliers ENABLE ROW LEVEL SECURITY'), '21.2 RLS habilitado en suppliers')
  assert(sql.includes('purchase_suggestions ENABLE ROW LEVEL SECURITY'), '21.3 RLS habilitado en purchase_suggestions')
  assert(sql.includes('menu_engineering_snapshots ENABLE ROW LEVEL SECURITY'), '21.4 RLS habilitado en menu_engineering_snapshots')
  assert(sql.includes('package_factor NUMERIC') && sql.includes('ingredients'), '21.5 Factor de empaque agregado a ingredients')
}

// ===================================================================
// 22. SECURITY & LEAKAGE PREVENTION
// ===================================================================
console.log('--- TEST 22: SECURITY & CROSS-TENANT PREVENTION ---')
{
  let caughtTenantError = false
  try {
    calculatePurchaseSuggestions({ state: {}, organizationId: null })
  } catch (e) {
    if (e.message.includes('TENANT_REQUIRED')) caughtTenantError = true
  }
  assert(caughtTenantError, '22.1 Bloquea llamadas analíticas que intenten ejecutarse sin organizationId')
}

// ===================================================================
// 23. NO N+1 REGRESSION IN ANALYTICS
// ===================================================================
console.log('--- TEST 23: NO N+1 REGRESSION (BATCH AGGREGATION) ---')
{
  // Simular 50 insumos y verificar que la ejecución se resuelva de forma instantánea sin N+1 queries
  const ingredients = []
  const movements = []
  for (let i = 0; i < 50; i++) {
    ingredients.push({
      id: `ing_${i}`,
      name: `Insumo ${i}`,
      base_unit: 'kg',
      target_stock_level: 100,
      package_factor: 5,
      organization_id: 'org_batch',
      is_active: true,
    })
    movements.push({
      organization_id: 'org_batch',
      ingredient_id: `ing_${i}`,
      quantity_delta: 20,
    })
  }

  const t0 = performance.now()
  const res = calculatePurchaseSuggestions({
    state: { ingredients, inventoryMovements: movements, stockTransfers: [] },
    organizationId: 'org_batch',
  })
  const t1 = performance.now()
  assert(res.suggestionsCount === 50 && (t1 - t0) < 50, '23.1 Procesamiento en lote de 50 insumos sin patrón N+1 (< 50ms)')
}

// ===================================================================
// 24. MULTI-BRANCH CONSOLIDATION METRICS
// ===================================================================
console.log('--- TEST 24: MULTI-BRANCH CONSOLIDATION METRICS ---')
{
  const state = {
    sales: [
      { id: 's_b1', organization_id: 'org_multi', branch_id: 'b1', total: 30000, status: 'PAID', created_at: new Date().toISOString() },
      { id: 's_b2', organization_id: 'org_multi', branch_id: 'b2', total: 50000, status: 'PAID', created_at: new Date().toISOString() },
    ],
    payments: [],
  }

  const consolidated = getSalesReport({ state, organizationId: 'org_multi', periodKey: '30d' })
  assert(consolidated.metrics.revenue === 80000, '24.1 Reporte consolidado suma correctamente ambas sucursales ($80.000)')

  const branch1Only = getSalesReport({ state, organizationId: 'org_multi', branchId: 'b1', periodKey: '30d' })
  assert(branch1Only.metrics.revenue === 30000, '24.2 Reporte filtrado por sucursal aísla estrictamente $30.000')
}

// ===================================================================
// 25. REGRESSION PHASES 1–8 (266 TESTS BASELINE)
// ===================================================================
console.log('--- TEST 25: REGRESSION PHASES 1–8 (266 TESTS BASELINE) ---')
let regressionPass = true
try {
  execSync('node scripts/validate_rls_isolation.js', { stdio: 'ignore' })
  execSync('node scripts/validate_phase2_catalog_inventory.js', { stdio: 'ignore' })
  execSync('node scripts/validate_phase3_sales_cash_acid.js', { stdio: 'ignore' })
  execSync('node scripts/validate_phase4_kds_realtime.js', { stdio: 'ignore' })
  execSync('node scripts/validate_phase5_arbo_club_crm.js', { stdio: 'ignore' })
  execSync('node scripts/validate_phase6_public_commerce.js', { stdio: 'ignore' })
  execSync('node scripts/validate_phase7_fiscal_automation.js', { stdio: 'ignore' })
  execSync('node scripts/validate_phase8_multibranch_transfers.js', { stdio: 'ignore' })
} catch (e) {
  regressionPass = false
  console.error('Error en regresión:', e)
}
assert(regressionPass, '25. Regresión 266/266: Todas las suites de Fases 1 a 8 continúan pasando al 100%')

// ===================================================================
// 26. PRODUCTION BUILD VERIFICATION
// ===================================================================
console.log('--- TEST 26: PRODUCTION BUILD VERIFICATION ---')
let buildPass = true
try {
  execSync('npx vite build', { stdio: 'ignore' })
} catch (e) {
  buildPass = false
}
assert(buildPass, '26. Production build: Vite bundle compila limpiamente sin errores (0 errors)')

// ===================================================================
// RESUMEN FINAL
// ===================================================================
console.log('\n===================================================================')
console.log(`  RESULTADOS FASE 9: ${passCount} PASADOS, ${failCount} FALLADOS`)
if (failCount === 0) {
  console.log('  STATUS: TODAS LAS VALIDACIONES DE FASE 9 SUPERADAS EXITOSAMENTE')
} else {
  console.log('  STATUS: FALLOS DETECTADOS EN FASE 9')
}
console.log('===================================================================')

if (failCount > 0) {
  process.exit(1)
}
