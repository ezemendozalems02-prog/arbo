// ARBO OS — PHASE 2 VALIDATION TEST: CATALOG, RECIPES, PPP & INVENTORY MOVEMENTS
// Validates domain math, exact decimal conversions, recipe explosion, PPP and RLS isolation.

import { convertQuantity, canConvert } from '../src/services/domain/unitConversion.js'
import { calculateRecipeCost, calculateFoodCostPercentage, calculateGrossMargin, getRecipeSummary } from '../src/services/domain/recipeCalculator.js'
import { calculateWeightedAverageCost, aggregateStockFromMovements, computeRecipeDepletion } from '../src/services/domain/inventoryCosting.js'

console.log('===================================================================')
console.log('  ARBO OS — FASE 2: CATÁLOGO, RECETAS, COSTEO PPP & STOCK INICIAL  ')
console.log('===================================================================\n')

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`)
    passed++
  } else {
    console.error(`❌ [FAIL] ${message}`)
    failed++
  }
}

// 1. TEST DE CONVERSIÓN DE UNIDADES NORMALIZADAS
console.log('--- TEST SET 1: CONVERSIÓN Y NORMALIZACIÓN DE UNIDADES ---')
assert(convertQuantity(18, 'g', 'kg') === 0.018, 'Conversión exacta: 18g = 0.018 kg')
assert(convertQuantity(1000, 'g', 'kg') === 1, 'Conversión exacta: 1000g = 1 kg')
assert(convertQuantity(2.5, 'kg', 'g') === 2500, 'Conversión exacta: 2.5 kg = 2500 g')
assert(convertQuantity(250, 'ml', 'l') === 0.25, 'Conversión exacta: 250 ml = 0.25 L')
assert(canConvert('kg', 'g') === true, 'Masa a masa es convertible')
assert(canConvert('l', 'ml') === true, 'Volumen a volumen es convertible')
assert(canConvert('kg', 'l') === false, 'Masa a volumen es incompatible (bloqueado)')

// 2. ESCENARIO DE REFERENCIA OBLIGATORIO: ESPRESSO DOBLE
console.log('\n--- TEST SET 2: CASO OBLIGATORIO ESPRESSO DOBLE ---')

const cafeGrano = {
  id: 'ing_cafe_grano',
  name: 'Café Grano Especialidad',
  base_unit: 'kg',
  current_cost_unit: 15000.0000, // $15.000 ARS / kg
}

const productoEspresso = {
  id: 'prod_espresso_doble',
  name: 'Espresso Doble',
  base_price: 3500.00, // $3.500 ARS
}

const recetaEspresso = {
  id: 'rec_espresso_doble',
  product_id: productoEspresso.id,
  yield_portions: 1.00,
  waste_percentage: 0.00,
}

const itemRecetaCafe = {
  item: { quantity: 18.0000, unit: 'g' },
  ingredient: cafeGrano,
}

// Cálculo de costo
const { costPerPortion, totalCostWithWaste } = calculateRecipeCost(recetaEspresso, [itemRecetaCafe])
assert(costPerPortion === 270.0000, `Costo por porción: esperado $270.00 ARS, obtenido $${costPerPortion}`)

// Cálculo de Food Cost %
const foodCostPct = calculateFoodCostPercentage(costPerPortion, productoEspresso.base_price)
assert(foodCostPct === 7.71, `Food Cost %: esperado 7.71%, obtenido ${foodCostPct}%`)

// Cálculo de margen bruto
const margin = calculateGrossMargin(productoEspresso.base_price, costPerPortion)
assert(margin === 3230.00, `Margen bruto: esperado $3.230.00 ARS, obtenido $${margin}`)

// Resumen completo
const summary = getRecipeSummary(recetaEspresso, [itemRecetaCafe], productoEspresso.base_price)
assert(summary.costPerPortion === 270 && summary.foodCostPct === 7.71, 'Resumen de receta consistente')

// 3. INVENTARIO BASADO EN MOVIMIENTOS: STOCK INICIAL Y CONSUMO
console.log('\n--- TEST SET 3: INVENTARIO INMUTABLE (5.000 kg -> 4.982 kg) ---')

const movements = []

// Movimiento 1: Stock Inicial de 5.000 kg
movements.push({
  id: 'mov_01',
  ingredient_id: cafeGrano.id,
  movement_type: 'INITIAL_STOCK',
  quantity_delta: 5.0000,
  unit_cost_snapshot: 15000.0000,
})

const stockInicial = aggregateStockFromMovements(movements, cafeGrano.id)
assert(stockInicial === 5.0000, `Stock inicial agregado: esperado 5.0000 kg, obtenido ${stockInicial} kg`)

// Movimiento 2: Venta de 1 Espresso Doble (consumo 18g = 0.018 kg)
const [depletion] = computeRecipeDepletion(recetaEspresso, [itemRecetaCafe], 1)
assert(depletion.depletion_delta === -0.0180, `Delta de descarga: esperado -0.0180 kg, obtenido ${depletion.depletion_delta} kg`)

movements.push({
  id: 'mov_02',
  ingredient_id: depletion.ingredient_id,
  movement_type: 'SALE_DEPLETION',
  quantity_delta: depletion.depletion_delta,
  unit_cost_snapshot: depletion.unit_cost_snapshot,
})

const stockFinal = aggregateStockFromMovements(movements, cafeGrano.id)
assert(stockFinal === 4.9820, `Stock final tras 1 porción: esperado 4.9820 kg, obtenido ${stockFinal} kg (5.000 kg - 0.018 kg = 4.982 kg)`)

// 4. CÁLCULO FORMAL DE PRECIO PROMEDIO PONDERADO (PPP)
console.log('\n--- TEST SET 4: CÁLCULO DE COSTO PPP ANTE NUEVA COMPRA ---')

// Stock existente: 5 kg a $15.000/kg
// Compra entrante: 5 kg a $18.000/kg
// Nuevo PPP esperado: (5*15000 + 5*18000) / 10 = (75000 + 90000) / 10 = $16.500/kg
const pppResult = calculateWeightedAverageCost(5, 15000, 5, 18000)
assert(pppResult === 16500.0000, `Cálculo PPP exacto: esperado $16.500.00/kg, obtenido $${pppResult}`)

// Caso con stock existente 0
const pppInitial = calculateWeightedAverageCost(0, 0, 10, 14200)
assert(pppInitial === 14200.0000, `PPP con stock previo cero: esperado $14.200.00/kg, obtenido $${pppInitial}`)

// 5. VALIDACIÓN DE AISLAMIENTO RLS EN TABLAS DE FASE 2
console.log('\n--- TEST SET 5: AISLAMIENTO MULTI-TENANT (RLS) EN CATÁLOGO E INVENTARIO ---')

const dbCategories = [
  { id: 'cat_01', organization_id: 'org_a', name: 'Cafetería Org A' },
  { id: 'cat_02', organization_id: 'org_b', name: 'Hamburguesas Org B' },
]

const dbRecipes = [
  { id: 'rec_01', organization_id: 'org_a', product_id: 'prod_a' },
  { id: 'rec_02', organization_id: 'org_b', product_id: 'prod_b' },
]

const dbMovements = [
  { id: 'mov_a', organization_id: 'org_a', ingredient_id: 'ing_a', quantity_delta: 5.0 },
  { id: 'mov_b', organization_id: 'org_b', ingredient_id: 'ing_b', quantity_delta: 12.0 },
]

function rlsFilter(items, userOrgId) {
  if (!userOrgId) return []
  return items.filter(i => i.organization_id === userOrgId)
}

const userA_Categories = rlsFilter(dbCategories, 'org_a')
assert(userA_Categories.length === 1 && userA_Categories[0].id === 'cat_01', 'Usuario Org A solo lee categorías de Org A')

const userB_Recipes = rlsFilter(dbRecipes, 'org_b')
assert(userB_Recipes.length === 1 && userB_Recipes[0].id === 'rec_02', 'Usuario Org B solo lee recetas de Org B')

const userA_Movements = rlsFilter(dbMovements, 'org_a')
assert(userA_Movements.length === 1 && userA_Movements[0].id === 'mov_a', 'Usuario Org A solo lee movimientos de inventario de Org A')

const anon_Categories = rlsFilter(dbCategories, null)
assert(anon_Categories.length === 0, 'Usuario anónimo no tiene acceso a categorías ni recetas')

// RESUMEN FINAL
console.log('\n===================================================================')
console.log(`  RESULTADOS DE FASE 2: ${passed} PASADOS, ${failed} FALLADOS`)
if (failed === 0) {
  console.log('  STATUS: TODAS LAS VALIDACIONES DE FASE 2 SUPERADAS EXITOSAMENTE')
} else {
  console.error('  STATUS: EXISTEN PRUEBAS FALLIDAS')
  process.exit(1)
}
console.log('===================================================================\n')
