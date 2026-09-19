// ARBO OS — PHASE 3 VALIDATION SUITE: SALES, CASH & ACID TRANSACTION
// Validates:
// 1. Mandatory Vertical Slice: Espresso Doble (5.000kg -> 4.982kg, $10.000 -> $13.500, $270 cost, 7.71% FC)
// 2. Rollback on Payment Mismatch
// 3. Rollback on Insufficient Stock (Strict Policy)
// 4. Rollback on Closed Cash Session
// 5. Cash Register History Preservation across sessions
// 6. Immutability of Historical Sale Price Snapshots
// 7. Deterministic Multi-sale Concurrency / Inventory Depletion
// 8. Multi-tenant Isolation (RLS)

import { openCashSession, closeCashSession, calculateSessionExpectedCash } from '../src/services/domain/cashSessionManager.js'
import { executeSaleCheckoutAtomic } from '../src/services/domain/saleCheckout.js'
import { calculateRecipeCost, calculateFoodCostPercentage } from '../src/services/domain/recipeCalculator.js'
import { aggregateStockFromMovements } from '../src/services/domain/inventoryCosting.js'

console.log('===================================================================')
console.log('  ARBO OS — FASE 3: VENTAS, CAJA & TRANSACCIÓN ACID INDIVISIBLE    ')
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

// SETUP BASE
const orgA = 'org_arbo_demo'
const orgB = 'org_other_tenant'
const branchPrincipal = 'branch_principal'
const userBarista = 'user_barista_01'
const register1 = 'reg_principal_01'

const cafeGrano = {
  id: 'ing_cafe_grano',
  organization_id: orgA,
  branch_id: branchPrincipal,
  name: 'Café Grano Especialidad',
  base_unit: 'kg',
  current_cost_unit: 15000.0000,
}

const espressoDoble = {
  id: 'prod_espresso_doble',
  organization_id: orgA,
  branch_id: branchPrincipal,
  name: 'Espresso Doble',
  base_price: 3500.00,
  is_active: true,
}

const recetaEspresso = {
  id: 'rec_espresso_doble',
  organization_id: orgA,
  product_id: espressoDoble.id,
  yield_portions: 1.00,
  waste_percentage: 0.00,
  items: [
    {
      ingredient_id: cafeGrano.id,
      quantity: 18.0000,
      unit: 'g',
    }
  ]
}

// Estado inicial del sistema
let systemState = {
  cashRegisters: [{ id: register1, organization_id: orgA, branch_id: branchPrincipal, name: 'Caja Principal' }],
  cashSessions: [],
  cashMovements: [],
  products: [espressoDoble],
  recipes: [recetaEspresso],
  ingredients: [cafeGrano],
  sales: [],
  saleItems: [],
  payments: [],
  inventoryMovements: [
    {
      id: 'imov_initial',
      organization_id: orgA,
      branch_id: branchPrincipal,
      ingredient_id: cafeGrano.id,
      movement_type: 'INITIAL_STOCK',
      quantity_delta: 5.0000, // 5.000 kg stock inicial
      unit_cost_snapshot: 15000.0000,
      reason: 'Inventario inicial Fase 2',
      created_at: new Date().toISOString(),
    }
  ]
}

// -------------------------------------------------------------------------
// TEST SET 1: APERTURA DE CAJA
// -------------------------------------------------------------------------
console.log('--- TEST SET 1: APERTURA AUDITABLE DE CAJA ---')

const openResult = openCashSession(
  systemState.cashSessions,
  systemState.cashMovements,
  {
    organizationId: orgA,
    branchId: branchPrincipal,
    cashRegisterId: register1,
    openedBy: userBarista,
    initialAmount: 10000.00,
    notes: 'Apertura de turno de prueba',
  }
)

systemState.cashSessions = openResult.sessions
systemState.cashMovements = openResult.movements
const activeSession = openResult.session

assert(activeSession.status === 'OPEN', 'Sesión de caja abierta en estado OPEN')
assert(activeSession.initial_amount === 10000.00, 'Monto inicial registrado exactamente en $10.000,00 ARS')
assert(systemState.cashMovements.length === 1, 'Movimiento inicial OPENING registrado en el libro mayor de caja')
assert(systemState.cashMovements[0].amount === 10000.00, 'Importe de movimiento inicial igual a $10.000,00')

// -------------------------------------------------------------------------
// TEST SET 2: VERTICAL SLICE OBLIGATORIO (ESPRESSO DOBLE)
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 2: VERTICAL SLICE OBLIGATORIO (ESPRESSO DOBLE) ---')

const checkoutPayload = {
  organizationId: orgA,
  branchId: branchPrincipal,
  cashSessionId: activeSession.id,
  userId: userBarista,
  items: [
    {
      productId: espressoDoble.id,
      quantity: 1,
      unitPrice: 3500.00,
    }
  ],
  paymentAmount: 3500.00,
  cashTendered: 3500.00,
  notes: 'Venta 1 Espresso Doble de validación',
}

const checkoutResult = executeSaleCheckoutAtomic({
  state: systemState,
  payload: checkoutPayload,
})

systemState = checkoutResult.updatedState
const receipt = checkoutResult.receipt

assert(checkoutResult.success === true, 'Transacción de checkout ejecutada exitosamente')
assert(receipt.total === 3500.00, 'Total de venta: $3.500,00 ARS')
assert(receipt.payment_method === 'CASH', 'Método de pago: CASH')
assert(receipt.amount_paid === 3500.00, 'Pago en efectivo: $3.500,00 ARS')

// Verificación de Inventario
const cafeMovements = systemState.inventoryMovements.filter(m => m.ingredient_id === cafeGrano.id)
const currentStock = aggregateStockFromMovements(cafeMovements, cafeGrano.base_unit)
assert(currentStock === 4.982, `Inventario restante: esperado 4.982 kg, obtenido ${currentStock} kg (5.000 kg - 0.018 kg = 4.982 kg)`)

// Verificación de Caja
const expectedCashInBox = calculateSessionExpectedCash(activeSession, systemState.cashMovements)
assert(expectedCashInBox === 13500.00, `Caja en efectivo: esperado $13.500,00 ARS, obtenido $${expectedCashInBox} ($10.000 + $3.500 = $13.500)`)

// Verificación de Costo y Food Cost
const { costPerPortion } = calculateRecipeCost(recetaEspresso, [{ item: { quantity: 18, unit: 'g' }, ingredient: cafeGrano }])
const foodCostPct = calculateFoodCostPercentage(costPerPortion, espressoDoble.base_price)
assert(costPerPortion === 270.00, `Costo del producto: esperado $270.00 ARS, obtenido $${costPerPortion}`)
assert(foodCostPct === 7.71, `Food Cost: esperado 7.71%, obtenido ${foodCostPct}%`)

// -------------------------------------------------------------------------
// TEST SET 3: PRUEBA DE ROLLBACK POR DISCREPANCIA DE PAGO
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 3: ROLLBACK ATÓMICO ANTE DISCREPANCIA DE PAGO ---')

const stateBeforeMismatch = JSON.parse(JSON.stringify(systemState))
let rollbackPaymentTriggered = false

try {
  executeSaleCheckoutAtomic({
    state: systemState,
    payload: {
      organizationId: orgA,
      branchId: branchPrincipal,
      cashSessionId: activeSession.id,
      userId: userBarista,
      items: [{ productId: espressoDoble.id, quantity: 1, unitPrice: 3500.00 }],
      paymentAmount: 2000.00, // DISCREPANCIA: total es 3500, pago enviado es 2000
      cashTendered: 2000.00,
    }
  })
} catch (err) {
  rollbackPaymentTriggered = true
  assert(err.message.includes('PAYMENT_TOTAL_MISMATCH'), `Excepción esperada capturada: ${err.message}`)
}

assert(rollbackPaymentTriggered === true, 'Rollback disparado por importe no coincidente')
assert(systemState.sales.length === stateBeforeMismatch.sales.length, 'Integridad post-rollback: Cero ventas agregadas')
assert(systemState.inventoryMovements.length === stateBeforeMismatch.inventoryMovements.length, 'Integridad post-rollback: Cero movimientos de inventario huérfanos')
assert(systemState.cashMovements.length === stateBeforeMismatch.cashMovements.length, 'Integridad post-rollback: Cero movimientos de caja huérfanos')

// -------------------------------------------------------------------------
// TEST SET 4: PRUEBA DE ROLLBACK POR STOCK INSUFICIENTE (POLÍTICA ESTRICTA)
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 4: ROLLBACK ATÓMICO ANTE STOCK INSUFICIENTE ---')

const stateBeforeStockFail = JSON.parse(JSON.stringify(systemState))
let rollbackStockTriggered = false

try {
  // Intentar vender 300 espressos dobles = 300 * 18g = 5.4 kg (Disponible solo 4.982 kg)
  executeSaleCheckoutAtomic({
    state: systemState,
    payload: {
      organizationId: orgA,
      branchId: branchPrincipal,
      cashSessionId: activeSession.id,
      userId: userBarista,
      items: [{ productId: espressoDoble.id, quantity: 300, unitPrice: 3500.00 }],
      paymentAmount: 300 * 3500.00,
      cashTendered: 300 * 3500.00,
    }
  })
} catch (err) {
  rollbackStockTriggered = true
  assert(err.message.includes('INSUFFICIENT_STOCK'), `Excepción esperada capturada: ${err.message}`)
}

assert(rollbackStockTriggered === true, 'Rollback disparado por stock insuficiente')
assert(systemState.sales.length === stateBeforeStockFail.sales.length, 'Integridad post-rollback: Cero ventas creadas')
assert(systemState.inventoryMovements.length === stateBeforeStockFail.inventoryMovements.length, 'Integridad post-rollback: Stock permanece intacto en 4.982 kg')

// -------------------------------------------------------------------------
// TEST SET 5: ROLLBACK ANTE SESIÓN DE CAJA CERRADA
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 5: ROLLBACK ANTE CAJA CERRADA ---')

let rollbackClosedCashTriggered = false
try {
  executeSaleCheckoutAtomic({
    state: systemState,
    payload: {
      organizationId: orgA,
      branchId: branchPrincipal,
      cashSessionId: 'sess_non_existent_or_closed',
      userId: userBarista,
      items: [{ productId: espressoDoble.id, quantity: 1, unitPrice: 3500.00 }],
      paymentAmount: 3500.00,
      cashTendered: 3500.00,
    }
  })
} catch (err) {
  rollbackClosedCashTriggered = true
  assert(err.message.includes('CASH_SESSION_NOT_OPEN'), `Excepción esperada capturada: ${err.message}`)
}
assert(rollbackClosedCashTriggered === true, 'Rollback disparado por caja no abierta')

// -------------------------------------------------------------------------
// TEST SET 6: HISTORIAL DE CAJA PRESERVADO (NUEVA SESIÓN NO DESTRUYE ANTERIOR)
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 6: PRESERVACIÓN INMUTABLE DE HISTORIAL DE CAJA ---')

// 1. Cerrar Sesión 1
const closeResult = closeCashSession(
  systemState.cashSessions,
  systemState.cashMovements,
  {
    sessionId: activeSession.id,
    closedBy: userBarista,
    declaredAmount: 13500.00,
    notes: 'Cierre de turno normal sin diferencias',
  }
)

systemState.cashSessions = closeResult.sessions
const closedSession1 = closeResult.closedSession

assert(closedSession1.status === 'CLOSED', 'Sesión 1 cerrada correctamente')
assert(closedSession1.closing_expected_amount === 13500.00, 'Arqueo esperado en cierre: $13.500,00')
assert(closedSession1.closing_difference === 0.00, 'Diferencia de caja: $0,00')

// 2. Abrir Sesión 2 en la misma registradora
const openResult2 = openCashSession(
  systemState.cashSessions,
  systemState.cashMovements,
  {
    organizationId: orgA,
    branchId: branchPrincipal,
    cashRegisterId: register1,
    openedBy: userBarista,
    initialAmount: 5000.00,
    notes: 'Apertura de segundo turno',
  }
)

systemState.cashSessions = openResult2.sessions
systemState.cashMovements = openResult2.movements
const activeSession2 = openResult2.session

// Comprobación crítica: Sesión 1 permanece intacta en la base
const session1Retrieved = systemState.cashSessions.find(s => s.id === activeSession.id)
assert(systemState.cashSessions.length === 2, 'Existen 2 sesiones registradas en el historial')
assert(session1Retrieved.status === 'CLOSED', 'Sesión 1 sigue registrada como CLOSED')
assert(session1Retrieved.closing_expected_amount === 13500.00, 'Sesión 1 conserva su arqueo histórico de $13.500,00')
assert(activeSession2.status === 'OPEN', 'Sesión 2 activa como OPEN con $5.000,00')
assert(systemState.cashMovements.length === 3, 'El libro mayor de caja contiene 3 movimientos (Open1, Venta1, Open2)')

// -------------------------------------------------------------------------
// TEST SET 7: INMUTABILIDAD DE SNAPSHOTS DE PRECIO EN LÍNEAS DE VENTA
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 7: INMUTABILIDAD DE SNAPSHOTS HISTÓRICOS ---')

// Simular aumento de precio futuro en el catálogo
const modifiedProduct = { ...espressoDoble, base_price: 4500.00 } // Sube a $4.500
systemState.products = [modifiedProduct]

// Verificar que la venta histórica #1 conserva su precio unitario original
const historicSaleItem = systemState.saleItems[0]
assert(historicSaleItem.unit_price_snapshot === 3500.00, 'El ítem de venta histórica conserva su precio original de $3.500,00')
assert(historicSaleItem.subtotal === 3500.00, 'El subtotal histórico de la línea permanece inalterado')
assert(systemState.sales[0].total === 3500.00, 'El total de la venta histórica permanece inalterado en $3.500,00')

// -------------------------------------------------------------------------
// TEST SET 8: CONCURRENCIA SERIALIZADA & CONSUMO DETERMINISTA
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 8: CONCURRENCIA & CONSUMO DETERMINISTA ---')

// Ejecutar 2 ventas consecutivas en Sesión 2 de 50 Espressos cada una
// 50 x 0.018 kg = 0.900 kg por venta -> Total 1.800 kg consumidos
const stockBeforeConcurrent = aggregateStockFromMovements(
  systemState.inventoryMovements.filter(m => m.ingredient_id === cafeGrano.id),
  cafeGrano.base_unit
)

const saleA = executeSaleCheckoutAtomic({
  state: systemState,
  payload: {
    organizationId: orgA,
    branchId: branchPrincipal,
    cashSessionId: activeSession2.id,
    userId: userBarista,
    items: [{ productId: modifiedProduct.id, quantity: 50, unitPrice: 4500.00 }],
    paymentAmount: 50 * 4500.00,
    cashTendered: 50 * 4500.00,
  }
})
systemState = saleA.updatedState

const saleB = executeSaleCheckoutAtomic({
  state: systemState,
  payload: {
    organizationId: orgA,
    branchId: branchPrincipal,
    cashSessionId: activeSession2.id,
    userId: userBarista,
    items: [{ productId: modifiedProduct.id, quantity: 50, unitPrice: 4500.00 }],
    paymentAmount: 50 * 4500.00,
    cashTendered: 50 * 4500.00,
  }
})
systemState = saleB.updatedState

const stockAfterConcurrent = aggregateStockFromMovements(
  systemState.inventoryMovements.filter(m => m.ingredient_id === cafeGrano.id),
  cafeGrano.base_unit
)

const expectedRemaining = Number((stockBeforeConcurrent - 1.800).toFixed(4))
assert(stockAfterConcurrent === expectedRemaining, `Consumo determinista: ${stockBeforeConcurrent} kg - 1.800 kg = ${stockAfterConcurrent} kg (esperado ${expectedRemaining} kg)`)
assert(systemState.sales.length === 3, 'Total de 3 ventas auditables en el sistema')

// -------------------------------------------------------------------------
// TEST SET 9: AISLAMIENTO MULTI-TENANT (RLS)
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 9: AISLAMIENTO MULTI-TENANT (RLS) ---')

// Intentar checkout desde un usuario de Org B usando la sesión de Org A
let crossTenantBlocked = false
try {
  executeSaleCheckoutAtomic({
    state: systemState,
    payload: {
      organizationId: orgB, // Org B
      branchId: branchPrincipal, // Pero sesión pertenece a Org A
      cashSessionId: activeSession2.id,
      userId: 'user_attacker_org_b',
      items: [{ productId: modifiedProduct.id, quantity: 1, unitPrice: 4500.00 }],
      paymentAmount: 4500.00,
      cashTendered: 4500.00,
    }
  })
} catch (err) {
  crossTenantBlocked = true
  assert(err.message.includes('CASH_SESSION_NOT_OPEN') || err.message.includes('ORGANIZATION_MISMATCH'), 'Acceso cross-tenant bloqueado a nivel de boundary transaccional')
}
assert(crossTenantBlocked === true, 'Aislamiento multi-tenant validado')

// -------------------------------------------------------------------------
// RESUMEN FINAL
// -------------------------------------------------------------------------
console.log('\n===================================================================')
console.log(`  RESULTADOS DE FASE 3: ${passed} PASADOS, ${failed} FALLADOS`)
if (failed === 0) {
  console.log('  STATUS: TODAS LAS VALIDACIONES DE FASE 3 SUPERADAS EXITOSAMENTE')
} else {
  console.error('  STATUS: EXISTEN FALLAS EN LA VALIDACIÓN DE FASE 3')
}
console.log('===================================================================\n')

if (failed > 0) process.exit(1)
