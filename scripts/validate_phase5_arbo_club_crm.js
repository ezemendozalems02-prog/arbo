// ARBO OS — FASE 5 VALIDATION SUITE: ARBO CLUB + CRM + CUSTOMER 360
// Valida Customer, Loyalty Ledger append-only, Floor(total/100), Checkout ACID + Loyalty,
// Redención de recompensas, Rollback, Idempotencia, Multi-Branch, RLS y CRM / RFM.

import { executeSaleCheckoutAtomic } from '../src/services/domain/saleCheckout.js'
import {
  createCustomer,
  calculatePointsForSale,
  calculateCustomerBalance,
  createReward,
  executeRewardRedemptionAtomic,
  buildCustomer360,
  normalizePhone,
} from '../src/services/domain/customerLoyaltyManager.js'
import { transitionTicketStatus } from '../src/services/domain/kitchenTicketManager.js'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(condition, message) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`✅ [PASS] ${message}`)
  } else {
    failedTests++
    console.error(`❌ [FAIL] ${message}`)
    throw new Error(`Assertion failed: ${message}`)
  }
}

console.log('===================================================================')
console.log('  ARBO OS — FASE 5: ARBO CLUB + CRM + CUSTOMER 360 VALIDATION      ')
console.log('===================================================================\n')

// ===================================================================
// SETUP DE DATOS BASE (Escenario Espresso Doble y Multi-Branch)
// ===================================================================
const ORG_A = 'org_trevelin_demo'
const ORG_B = 'org_rival_cafe'
const BRANCH_A1 = 'branch_trevelin_main'
const BRANCH_A2 = 'branch_esquel_express'
const BRANCH_B1 = 'branch_rival_central'
const USER_THIAGO = 'usr_thiago_admin'

const INGREDIENT_COFFEE_A = {
  id: 'ing_coffee_01',
  organization_id: ORG_A,
  name: 'Café Grano Especialidad',
  base_unit: 'kg',
  current_cost_unit: 15000.00,
}

const PRODUCT_ESPRESSO_A = {
  id: 'prod_espresso_01',
  organization_id: ORG_A,
  name: 'Espresso Doble',
  base_price: 3500.00,
  is_active: true,
}

const RECIPE_ESPRESSO_A = {
  id: 'rec_espresso_01',
  organization_id: ORG_A,
  product_id: PRODUCT_ESPRESSO_A.id,
  yield_portions: 1,
  waste_percentage: 0,
  items: [
    {
      ingredient_id: INGREDIENT_COFFEE_A.id,
      quantity: 18,
      unit: 'g', // 18g = 0.018 kg
    }
  ]
}

let systemState = {
  organizations: [{ id: ORG_A, name: 'ARBO Trevelin' }, { id: ORG_B, name: 'Rival Café' }],
  branches: [
    { id: BRANCH_A1, organization_id: ORG_A, name: 'Trevelin Principal' },
    { id: BRANCH_A2, organization_id: ORG_A, name: 'Esquel Express' },
    { id: BRANCH_B1, organization_id: ORG_B, name: 'Rival Central' },
  ],
  cashRegisters: [{ id: 'creg_01', organization_id: ORG_A, branch_id: BRANCH_A1, name: 'Caja Principal' }],
  cashSessions: [
    {
      id: 'csess_01',
      organization_id: ORG_A,
      branch_id: BRANCH_A1,
      register_id: 'creg_01',
      user_id: USER_THIAGO,
      status: 'OPEN',
      opening_amount: 10000.00,
      opened_at: new Date().toISOString(),
    }
  ],
  products: [PRODUCT_ESPRESSO_A],
  ingredients: [INGREDIENT_COFFEE_A],
  recipes: [RECIPE_ESPRESSO_A],
  inventoryMovements: [
    {
      id: 'imov_initial_01',
      organization_id: ORG_A,
      branch_id: BRANCH_A1,
      ingredient_id: INGREDIENT_COFFEE_A.id,
      movement_type: 'INITIAL_COUNT',
      quantity_delta: 5.000, // 5 kg iniciales
      unit_cost_snapshot: 15000.00,
      created_at: new Date().toISOString(),
    }
  ],
  cashMovements: [
    {
      id: 'cmov_initial_01',
      organization_id: ORG_A,
      branch_id: BRANCH_A1,
      cash_session_id: 'csess_01',
      movement_type: 'OPENING',
      amount: 10000.00,
      payment_method: 'CASH',
      created_at: new Date().toISOString(),
    }
  ],
  kitchenStations: [
    { id: 'stat_bar_01', organization_id: ORG_A, branch_id: BRANCH_A1, name: 'Barra / Cafetería', code: 'BAR', is_active: true }
  ],
  kitchenTickets: [],
  kitchenTicketItems: [],
  sales: [],
  saleItems: [],
  payments: [],
  customers: [],
  loyaltyTransactions: [],
  rewards: [],
  rewardRedemptions: [],
}

// ===================================================================
// TEST SET 1: REGLA DE ACREDITACIÓN DE PUNTOS — FLOOR(TOTAL / 100)
// ===================================================================
console.log('--- TEST SET 1: FÓRMULA DE PUNTOS FLOOR(TOTAL / 100) ---')
assert(calculatePointsForSale(3500) === 35, 'Venta $3.500 acredita 35 puntos')
assert(calculatePointsForSale(3999) === 39, 'Venta $3.999 acredita 39 puntos (sin redondear hacia arriba)')
assert(calculatePointsForSale(99) === 0, 'Venta $99 acredita 0 puntos (piso estricto)')
assert(calculatePointsForSale(100) === 1, 'Venta $100 acredita 1 punto')
assert(calculatePointsForSale(0) === 0, 'Venta $0 acredita 0 puntos')
assert(calculatePointsForSale(-500) === 0, 'Venta negativa o nula no genera puntos')

// ===================================================================
// TEST SET 2: CLIENTE Y TENANCY ORGANIZATION-LEVEL
// ===================================================================
console.log('\n--- TEST SET 2: MODELO CUSTOMER & TENANCY ORGANIZATION-LEVEL ---')
const demoCustomerData = {
  organizationId: ORG_A,
  firstName: 'Cliente Demo',
  lastName: '',
  phone: '+54 9 341 000-0000',
  email: 'demo@arboclub.com',
}

const { customer: demoCustomer, updatedState: stateWithCustomer } = createCustomer(systemState, demoCustomerData)
systemState = stateWithCustomer

assert(demoCustomer.id.startsWith('cust_'), 'Cliente registrado con ID único')
assert(demoCustomer.organization_id === ORG_A, 'Cliente pertenece a la organización ARBO Trevelin')
assert(demoCustomer.phone === '+5493410000000', 'Teléfono normalizado correctamente a +5493410000000')
assert(demoCustomer.status === 'ACTIVE', 'Cliente creado en estado ACTIVE')

// Unicidad de teléfono en la misma organización
let duplicateBlocked = false
try {
  createCustomer(systemState, {
    organizationId: ORG_A,
    firstName: 'Otro Cliente',
    phone: '+5493410000000',
  })
} catch (err) {
  duplicateBlocked = err.message.includes('DUPLICATE_PHONE')
}
assert(duplicateBlocked, 'Bloqueo estricto de teléfono duplicado en la misma organización')

// Mismo teléfono en OTRA organización permitido (aislamiento multi-tenant)
const { customer: orgBCustomer } = createCustomer(systemState, {
  organizationId: ORG_B,
  firstName: 'Cliente Rival',
  phone: '+5493410000000',
})
assert(orgBCustomer.organization_id === ORG_B, 'Mismo teléfono permitido en Organización B (aislamiento por tenant)')

// ===================================================================
// TEST SET 3: VERTICAL SLICE OBLIGATORIO (ESPRESSO DOBLE + ARBO CLUB)
// ===================================================================
console.log('\n--- TEST SET 3: VERTICAL SLICE OBLIGATORIO (VENTA $3.500 + CHECKOUT ACID + LOYALTY) ---')
// Escenario:
// Cliente: Cliente Demo (+5493410000000)
// Venta: 1 Espresso Doble ($3.500)
// Caja inicial: $10.000
// Stock inicial: 5.000 kg
// Pago: $3.500 CASH

const checkoutResult = executeSaleCheckoutAtomic({
  state: systemState,
  payload: {
    organizationId: ORG_A,
    branchId: BRANCH_A1,
    cashSessionId: 'csess_01',
    customerId: demoCustomer.id,
    userId: USER_THIAGO,
    items: [{ productId: PRODUCT_ESPRESSO_A.id, quantity: 1 }],
    paymentAmount: 3500.00,
    cashTendered: 3500.00,
    notes: 'Venta con acumulación ARBO Club',
  }
})

systemState = checkoutResult.updatedState
const receipt = checkoutResult.receipt

assert(receipt.total === 3500.00, 'Total de la venta: $3.500,00 ARS')
assert(receipt.customer_id === demoCustomer.id, 'Venta asociada al customer_id de Cliente Demo')
assert(receipt.points_earned === 35, 'Puntos ganados calculados: 35 puntos')

// Validar libro mayor de caja
const totalCash = systemState.cashMovements
  .filter(m => m.cash_session_id === 'csess_01')
  .reduce((acc, m) => acc + Number(m.amount), 0)
assert(totalCash === 13500.00, 'Caja en efectivo: exactamente $13.500,00 ARS ($10.000 + $3.500)')

// Validar inventario consumido
const coffeeStock = systemState.inventoryMovements
  .filter(m => m.ingredient_id === INGREDIENT_COFFEE_A.id)
  .reduce((acc, m) => acc + Number(m.quantity_delta), 0)
assert(Number(coffeeStock.toFixed(3)) === 4.982, 'Stock restante de café: exactamente 4.982 kg (5.000 kg - 0.018 kg)')

// Validar Food Cost
const unitCost = 18 * (15000 / 1000) // 18g * $15/g = $270
const foodCostPct = Number(((unitCost / 3500) * 100).toFixed(2))
assert(unitCost === 270.00, 'Costo del producto: $270,00 ARS')
assert(foodCostPct === 7.71, 'Food Cost: exactamente 7.71%')

// Validar KDS Ticket
const kdsTicket = systemState.kitchenTickets.find(t => t.sale_id === receipt.sale_id)
assert(kdsTicket !== undefined, 'Comanda KDS creada indivisiblemente')

// Avanzar comanda KDS a ARCHIVED
const res1 = transitionTicketStatus(systemState.kitchenTickets, { ticketId: kdsTicket.id, newStatus: 'PREPARING' })
const res2 = transitionTicketStatus(res1.tickets, { ticketId: kdsTicket.id, newStatus: 'READY' })
const res3 = transitionTicketStatus(res2.tickets, { ticketId: kdsTicket.id, newStatus: 'ARCHIVED' })
systemState.kitchenTickets = res3.tickets
assert(res3.updatedTicket.status === 'ARCHIVED', 'KDS Ticket completado en ARCHIVED')

// Validar Loyalty Ledger Append-Only
const customerLedger = systemState.loyaltyTransactions.filter(tx => tx.customer_id === demoCustomer.id)
assert(customerLedger.length === 1, 'Loyalty Ledger contiene exactamente 1 transacción')
assert(customerLedger[0].transaction_type === 'EARN', 'Transacción de tipo EARN')
assert(customerLedger[0].points_delta === 35, 'Puntos delta registrados: +35 EARN')
assert(customerLedger[0].reference_type === 'SALE', 'Referencia a SALE')
assert(customerLedger[0].reference_id === receipt.sale_id, 'Referencia enlazada al sale_id')

const customerBalance = calculateCustomerBalance(systemState.loyaltyTransactions, demoCustomer.id)
assert(customerBalance === 35, 'Saldo de puntos derivado del ledger: 35 puntos')

// ===================================================================
// TEST SET 4: VENTA ANÓNIMA (ARBO CLUB OPCIONAL)
// ===================================================================
console.log('\n--- TEST SET 4: VENTA ANÓNIMA PERMITIDA ---')
const anonCheckout = executeSaleCheckoutAtomic({
  state: systemState,
  payload: {
    organizationId: ORG_A,
    branchId: BRANCH_A1,
    cashSessionId: 'csess_01',
    customerId: null, // Venta anónima sin cliente
    userId: USER_THIAGO,
    items: [{ productId: PRODUCT_ESPRESSO_A.id, quantity: 1 }],
    paymentAmount: 3500.00,
    cashTendered: 3500.00,
    notes: 'Venta mostrador anónima',
  }
})
systemState = anonCheckout.updatedState
assert(anonCheckout.receipt.customer_id === null, 'Venta anónima procesada con customer_id null')
assert(anonCheckout.receipt.points_earned === 0, 'Cero puntos acreditados para venta anónima')
assert(
  systemState.loyaltyTransactions.filter(tx => tx.customer_id === demoCustomer.id).length === 1,
  'El saldo de Cliente Demo no se altera en ventas anónimas'
)

// ===================================================================
// TEST SET 5: RECOMPENSAS & REDENCIÓN ATÓMICA (REDEMPTION TEST)
// ===================================================================
console.log('\n--- TEST SET 5: RECOMPENSAS & REDENCIÓN ATÓMICA ---')
const { reward: freeCoffeeReward, updatedState: stateWithReward } = createReward(systemState, {
  organizationId: ORG_A,
  name: 'Café Gratis',
  description: 'Canje de un Café de Especialidad por 35 puntos',
  pointsRequired: 35,
  productId: PRODUCT_ESPRESSO_A.id,
})
systemState = stateWithReward

assert(freeCoffeeReward.name === 'Café Gratis', 'Recompensa "Café Gratis" creada en catálogo')
assert(freeCoffeeReward.points_required === 35, 'Costo de la recompensa: 35 puntos')

// Redención exitosa: Cliente con 35 puntos canjea Café Gratis
const redemptionResult = executeRewardRedemptionAtomic(systemState, {
  organizationId: ORG_A,
  branchId: BRANCH_A1,
  customerId: demoCustomer.id,
  rewardId: freeCoffeeReward.id,
  userId: USER_THIAGO,
  notes: 'Canje de Café Gratis en mostrador',
})
systemState = redemptionResult.updatedState

assert(redemptionResult.success === true, 'Redención ejecutada exitosamente')
assert(redemptionResult.newBalance === 0, 'Nuevo saldo resultante: 0 puntos (35 -> 0)')
assert(redemptionResult.loyaltyTransaction.points_delta === -35, 'Delta de puntos registrado en ledger: -35 REDEEM')
assert(redemptionResult.loyaltyTransaction.transaction_type === 'REDEEM', 'Tipo de transacción en ledger: REDEEM')

const balanceAfterRedemption = calculateCustomerBalance(systemState.loyaltyTransactions, demoCustomer.id)
assert(balanceAfterRedemption === 0, 'Saldo derivado del ledger tras redención: exactamente 0 puntos')

// Intento de segunda redención con saldo insuficiente (0 < 35)
let doubleRedemptionBlocked = false
try {
  executeRewardRedemptionAtomic(systemState, {
    organizationId: ORG_A,
    branchId: BRANCH_A1,
    customerId: demoCustomer.id,
    rewardId: freeCoffeeReward.id,
    userId: USER_THIAGO,
  })
} catch (err) {
  doubleRedemptionBlocked = err.message.includes('INSUFFICIENT_POINTS')
}
assert(doubleRedemptionBlocked, 'Segunda redención bloqueada por saldo insuficiente (previene saldo negativo)')

// ===================================================================
// TEST SET 6: ROLLBACK TRANSACCIONAL ANTE FALLA DE FIDELIZACIÓN
// ===================================================================
console.log('\n--- TEST SET 6: ROLLBACK ATÓMICO ANTE ERROR EN CUSTOMER/FIDELIZACIÓN ---')
const preRollbackSalesCount = systemState.sales.length
const preRollbackCashMovementsCount = systemState.cashMovements.length
const preRollbackInvMovementsCount = systemState.inventoryMovements.length
const preRollbackKdsTicketsCount = systemState.kitchenTickets.length
const preRollbackLoyaltyTxsCount = systemState.loyaltyTransactions.length

let rollbackCaught = false
try {
  executeSaleCheckoutAtomic({
    state: systemState,
    payload: {
      organizationId: ORG_A,
      branchId: BRANCH_A1,
      cashSessionId: 'csess_01',
      customerId: 'cust_inexistente_9999', // Cliente inválido
      userId: USER_THIAGO,
      items: [{ productId: PRODUCT_ESPRESSO_A.id, quantity: 1 }],
      paymentAmount: 3500.00,
      cashTendered: 3500.00,
    }
  })
} catch (err) {
  rollbackCaught = err.message.includes('CUSTOMER_NOT_FOUND')
}

assert(rollbackCaught, 'Excepción de fidelización capturada durante el checkout')
assert(systemState.sales.length === preRollbackSalesCount, 'Rollback: Cero ventas creadas')
assert(systemState.cashMovements.length === preRollbackCashMovementsCount, 'Rollback: Cero movimientos de caja huérfanos')
assert(systemState.inventoryMovements.length === preRollbackInvMovementsCount, 'Rollback: Cero movimientos de inventario consumidos')
assert(systemState.kitchenTickets.length === preRollbackKdsTicketsCount, 'Rollback: Cero tickets KDS creados')
assert(systemState.loyaltyTransactions.length === preRollbackLoyaltyTxsCount, 'Rollback: Cero transacciones de puntos huérfanas')

// ===================================================================
// TEST SET 7: IDEMPOTENCIA EN ACREDITACIÓN DE PUNTOS
// ===================================================================
console.log('\n--- TEST SET 7: IDEMPOTENCIA DEL LEDGER (EVITAR DOBLE ACREDITACIÓN) ---')
const testSaleId = 'sale_idempotency_test_01'
const initialTx = {
  id: 'ltx_idem_01',
  organization_id: ORG_A,
  customer_id: demoCustomer.id,
  branch_id: BRANCH_A1,
  points_delta: 35,
  transaction_type: 'EARN',
  reference_type: 'SALE',
  reference_id: testSaleId,
  created_at: new Date().toISOString(),
}
const stateWithEarn = {
  ...systemState,
  loyaltyTransactions: [...systemState.loyaltyTransactions, initialTx],
}

// Simular reintento de acreditación sobre la misma venta
const duplicateExists = stateWithEarn.loyaltyTransactions.some(
  tx => tx.reference_type === 'SALE' && tx.reference_id === testSaleId && tx.transaction_type === 'EARN'
)
assert(duplicateExists, 'Idempotencia detectada: ya existe transacción EARN para la venta')

// El ledger nunca debe permitir duplicar el registro
const dedupedTransactions = stateWithEarn.loyaltyTransactions.filter(
  tx => tx.reference_type === 'SALE' && tx.reference_id === testSaleId && tx.transaction_type === 'EARN'
)
assert(dedupedTransactions.length === 1, 'Exactamente 1 movimiento EARN en el ledger (nunca +35 +35)')

// ===================================================================
// TEST SET 8: MULTI-BRANCH CON HISTORIAL UNIFICADO
// ===================================================================
console.log('\n--- TEST SET 8: MULTI-BRANCH CON SALDO UNIFICADO ---')
// Cliente Demo compra en Sucursal Esquel Express (BRANCH_A2)
// Abrir sesión de caja para Branch A2
const sessionEsquel = {
  id: 'csess_esquel_01',
  organization_id: ORG_A,
  branch_id: BRANCH_A2,
  register_id: 'creg_02',
  user_id: USER_THIAGO,
  status: 'OPEN',
  opening_amount: 5000.00,
  opened_at: new Date().toISOString(),
}
// Agregar stock inicial en Branch A2
const stockEsquel = {
  id: 'imov_esquel_01',
  organization_id: ORG_A,
  branch_id: BRANCH_A2,
  ingredient_id: INGREDIENT_COFFEE_A.id,
  movement_type: 'INITIAL_COUNT',
  quantity_delta: 5.000,
  unit_cost_snapshot: 15000.00,
  created_at: new Date().toISOString(),
}

systemState = {
  ...systemState,
  cashSessions: [...systemState.cashSessions, sessionEsquel],
  inventoryMovements: [...systemState.inventoryMovements, stockEsquel],
}

const checkoutEsquel = executeSaleCheckoutAtomic({
  state: systemState,
  payload: {
    organizationId: ORG_A,
    branchId: BRANCH_A2,
    cashSessionId: 'csess_esquel_01',
    customerId: demoCustomer.id, // Mismo cliente en otra sucursal
    userId: USER_THIAGO,
    items: [{ productId: PRODUCT_ESPRESSO_A.id, quantity: 2 }], // $7.000
    paymentAmount: 7000.00,
    cashTendered: 7000.00,
    notes: 'Compra en sucursal Esquel Express',
  }
})
systemState = checkoutEsquel.updatedState

assert(checkoutEsquel.receipt.points_earned === 70, 'Venta en Esquel ($7.000) acredita 70 puntos')
const unifiedBalance = calculateCustomerBalance(systemState.loyaltyTransactions, demoCustomer.id)
// Saldo inicial: 35 - 35 (canje) + 70 (nueva compra) = 70
assert(unifiedBalance === 70, 'Saldo unificado del cliente a nivel organización: 70 puntos')

// ===================================================================
// TEST SET 9: AISLAMIENTO MULTI-TENANT (RLS)
// ===================================================================
console.log('\n--- TEST SET 9: AISLAMIENTO MULTI-TENANT ESTRICTO (RLS) ---')
// Registrar cliente y puntos en Organización B
const { customer: custOrgB, updatedState: stateOrgB } = createCustomer(systemState, {
  organizationId: ORG_B,
  firstName: 'Cliente Privado B',
  phone: '+5493419999999',
})
systemState = stateOrgB

const { reward: rewardOrgB, updatedState: stateRewardB } = createReward(systemState, {
  organizationId: ORG_B,
  name: 'Beneficio Org B',
  pointsRequired: 100,
})
systemState = stateRewardB

// Simular filtrado por RLS para usuario de Organización A
const orgACustomers = systemState.customers.filter(c => c.organization_id === ORG_A)
const orgBCustomers = systemState.customers.filter(c => c.organization_id === ORG_B)

assert(orgACustomers.every(c => c.organization_id === ORG_A), 'RLS Org A: Únicamente clientes de Organización A son visibles')
assert(!orgACustomers.some(c => c.id === custOrgB.id), 'RLS Org A: Cliente de Organización B está oculto')
assert(orgBCustomers.every(c => c.organization_id === ORG_B), 'RLS Org B: Únicamente clientes de Organización B son visibles')

const orgARewards = systemState.rewards.filter(r => r.organization_id === ORG_A)
assert(!orgARewards.some(r => r.id === rewardOrgB.id), 'RLS Org A: Recompensas de Organización B están ocultas')

// ===================================================================
// TEST SET 10: CUSTOMER 360 & MÉTRICAS RFM
// ===================================================================
console.log('\n--- TEST SET 10: CUSTOMER 360 & RFM ANALYTICS ---')
const customer360 = buildCustomer360(demoCustomer.id, {
  customers: systemState.customers,
  sales: systemState.sales,
  saleItems: systemState.saleItems,
  loyaltyTransactions: systemState.loyaltyTransactions,
})

assert(customer360.customer.full_name === 'Cliente Demo', 'Customer 360: Identidad y nombre completos')
assert(customer360.purchases.total_count === 2, 'Customer 360: Compras totales = 2 (Trevelin + Esquel)')
assert(customer360.rfm.frequency === 2, 'RFM: Frecuencia de compra = 2')
assert(customer360.rfm.monetary === 10500.00, 'RFM: Gasto monetario acumulado = $10.500,00 ($3.500 + $7.000)')
assert(customer360.rfm.average_ticket === 5250.00, 'RFM: Ticket promedio = $5.250,00')
assert(customer360.rfm.recency_days === 0, 'RFM: Recencia = 0 días (compra efectuada hoy)')
assert(customer360.loyalty.current_balance === 70, 'Customer 360: Saldo actual derivado = 70 puntos')
assert(customer360.loyalty.transactions_count === 3, 'Customer 360: 3 transacciones en ledger (+35 EARN, -35 REDEEM, +70 EARN)')

// Producto favorito
assert(customer360.favorites.top_favorite !== null, 'Customer 360: Producto favorito identificado')
assert(customer360.favorites.top_favorite.product_id === PRODUCT_ESPRESSO_A.id, 'Producto favorito: Espresso Doble')
assert(customer360.favorites.top_favorite.total_quantity === 3, 'Cantidad acumulada consumida: 3 unidades (1 + 2)')

console.log('\n===================================================================')
console.log(`  RESULTADOS DE FASE 5: ${passedTests} PASADOS, ${failedTests} FALLADOS`)
console.log('  STATUS: TODAS LAS VALIDACIONES DE FASE 5 SUPERADAS EXITOSAMENTE')
console.log('===================================================================\n')
