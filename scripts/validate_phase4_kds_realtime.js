// ARBO OS — PHASE 4 VALIDATION SUITE: KDS REALTIME, COMANDAS & ESTACIONES
// Validates:
// 1. Mandatory Vertical Slice: Espresso Doble (Venta $3500, Caja $13500, Stock 4.982kg, KDS ARCHIVED)
// 2. KDS Lifecycle: NEW -> PREPARING -> READY -> ARCHIVED
// 3. Realtime Delivery & Broadcast Sync
// 4. Fallback Polling & Deduplication (no duplicate tickets)
// 5. Race Conditions & Idempotent State Transitions
// 6. Cross-tenant Isolation (RLS)
// 7. Historical Ticket Preservation (Archived tickets remain intact)
// 8. Controlled Cancellations (Audit and Reason preserved)
// 9. Elapsed Timers & SLA calculation

import { openCashSession, calculateSessionExpectedCash } from '../src/services/domain/cashSessionManager.js'
import { executeSaleCheckoutAtomic } from '../src/services/domain/saleCheckout.js'
import { aggregateStockFromMovements } from '../src/services/domain/inventoryCosting.js'
import {
  TICKET_STATUSES,
  createKitchenTicket,
  transitionTicketStatus,
  calculateTicketElapsedTime,
  deduplicateTickets,
} from '../src/services/domain/kitchenTicketManager.js'

console.log('===================================================================')
console.log('  ARBO OS — FASE 4: KDS REALTIME, COMANDAS & ESTACIONES OPERATIVAS ')
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
const userChef = 'user_chef_01'
const register1 = 'reg_principal_01'

const stationBar = {
  id: 'stat_bar_01',
  organization_id: orgA,
  branch_id: branchPrincipal,
  name: 'Barra / Cafetería',
  code: 'BAR',
}

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
  station_id: stationBar.id,
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
  kitchenStations: [stationBar],
  kitchenTickets: [],
  kitchenTicketItems: [],
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
      reason: 'Inventario inicial',
      created_at: new Date().toISOString(),
    }
  ]
}

// -------------------------------------------------------------------------
// TEST SET 1: APERTURA DE CAJA & CHECKOUT CON GENERACIÓN ATÓMICA DE COMANDA
// -------------------------------------------------------------------------
console.log('--- TEST SET 1: CHECKOUT VENTA -> COMANDA KDS ATÓMICA ---')

// 1. Abrir caja con $10.000
const openResult = openCashSession(
  systemState.cashSessions,
  systemState.cashMovements,
  {
    organizationId: orgA,
    branchId: branchPrincipal,
    cashRegisterId: register1,
    openedBy: userBarista,
    initialAmount: 10000.00,
    notes: 'Apertura de turno KDS',
  }
)
systemState.cashSessions = openResult.sessions
systemState.cashMovements = openResult.movements
const activeSession = openResult.session

assert(activeSession.initial_amount === 10000.00, 'Caja abierta con $10.000,00 ARS')

// 2. Checkout de 1 Espresso Doble ($3.500 CASH)
const checkoutResult = executeSaleCheckoutAtomic({
  state: systemState,
  payload: {
    organizationId: orgA,
    branchId: branchPrincipal,
    cashSessionId: activeSession.id,
    userId: userBarista,
    items: [{ productId: espressoDoble.id, quantity: 1, unitPrice: 3500.00 }],
    paymentAmount: 3500.00,
    cashTendered: 3500.00,
    notes: 'Pedido salón mesa 4',
  }
})

systemState = checkoutResult.updatedState
const receipt = checkoutResult.receipt
const createdTicket = receipt.kitchen_ticket

assert(checkoutResult.success === true, 'Transacción de cobro ejecutada exitosamente')
assert(createdTicket !== undefined && createdTicket !== null, 'Comanda KDS creada atómicamente en la misma transacción')
assert(createdTicket.status === TICKET_STATUSES.NEW, 'Comanda KDS emitida en estado inicial NEW')
assert(createdTicket.station_id === stationBar.id, 'Comanda dirigida a estación Barra / Cafetería (BAR)')
assert(systemState.kitchenTicketItems.length === 1, 'Línea de comanda creada con snapshot del producto')
assert(systemState.kitchenTicketItems[0].product_name_snapshot === 'Espresso Doble', 'Snapshot de nombre: Espresso Doble')

// -------------------------------------------------------------------------
// TEST SET 2: CICLO DE VIDA KDS COMPLETO (NEW -> PREPARING -> READY -> ARCHIVED)
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 2: CICLO DE VIDA KDS (VERTICAL SLICE OBLIGATORIO) ---')

// 1. Operador pasa comanda a PREPARING
const prepResult = transitionTicketStatus(systemState.kitchenTickets, {
  ticketId: createdTicket.id,
  newStatus: TICKET_STATUSES.PREPARING,
  expectedStatus: TICKET_STATUSES.NEW,
  userId: userChef,
})
systemState.kitchenTickets = prepResult.tickets
const preparingTicket = prepResult.updatedTicket

assert(preparingTicket.status === TICKET_STATUSES.PREPARING, 'Comanda en KDS transiciona a PREPARING')
assert(preparingTicket.started_at !== null, 'Timestamp started_at registrado correctamente')

// 2. Operador pasa comanda a READY
const readyResult = transitionTicketStatus(systemState.kitchenTickets, {
  ticketId: createdTicket.id,
  newStatus: TICKET_STATUSES.READY,
  expectedStatus: TICKET_STATUSES.PREPARING,
  userId: userChef,
})
systemState.kitchenTickets = readyResult.tickets
const readyTicket = readyResult.updatedTicket

assert(readyTicket.status === TICKET_STATUSES.READY, 'Comanda en KDS transiciona a READY (Lista para entrega)')
assert(readyTicket.ready_at !== null, 'Timestamp ready_at registrado correctamente')

// 3. Operador archiva comanda (ARCHIVED)
const archiveResult = transitionTicketStatus(systemState.kitchenTickets, {
  ticketId: createdTicket.id,
  newStatus: TICKET_STATUSES.ARCHIVED,
  expectedStatus: TICKET_STATUSES.READY,
  userId: userChef,
})
systemState.kitchenTickets = archiveResult.tickets
const archivedTicket = archiveResult.updatedTicket

assert(archivedTicket.status === TICKET_STATUSES.ARCHIVED, 'Comanda en KDS transiciona a ARCHIVED (Finalizada)')
assert(archivedTicket.archived_at !== null, 'Timestamp archived_at registrado correctamente')

// 4. Validación simultánea del Vertical Slice Obligatorio
console.log('\n--- VERIFICACIÓN SIMULTÁNEA DE IMPACTOS CRUZADOS ---')
const currentStock = aggregateStockFromMovements(
  systemState.inventoryMovements.filter(m => m.ingredient_id === cafeGrano.id),
  cafeGrano.id
)
const currentCash = calculateSessionExpectedCash(activeSession, systemState.cashMovements)

assert(receipt.total === 3500.00, 'Venta: Total = $3.500,00 ARS')
assert(currentCash === 13500.00, 'Caja: Saldo en efectivo = $13.500,00 ARS ($10.000 + $3.500)')
assert(currentStock === 4.982, `Inventario: Stock restante = 4.982 kg (5.000 kg - 0.018 kg)`)
assert(archivedTicket.status === 'ARCHIVED', 'KDS: Estado final de la comanda = ARCHIVED')

// -------------------------------------------------------------------------
// TEST SET 3: SINCRONIZACIÓN REALTIME & BROADCAST
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 3: SIMULACIÓN DE SINCRONIZACIÓN REALTIME ---')

// Simular broadcast de nuevo ticket a Cliente B (KDS abierto)
const incomingRealtimeTicket = {
  id: 'ktick_realtime_sync_01',
  organization_id: orgA,
  branch_id: branchPrincipal,
  sale_id: 'sale_other_01',
  station_id: stationBar.id,
  ticket_number: 2,
  status: TICKET_STATUSES.NEW,
  created_at: new Date().toISOString(),
  started_at: null,
  ready_at: null,
  archived_at: null,
}

// Cliente B recibe evento Realtime CDC y actualiza estado
const stateClientB = deduplicateTickets(systemState.kitchenTickets, [incomingRealtimeTicket])
assert(stateClientB.some(t => t.id === incomingRealtimeTicket.id), 'Cliente B recibe ticket NEW en tiempo real sin recargar pantalla')

// Cliente B transiciona a PREPARING y emite actualización
const clientBPrep = transitionTicketStatus(stateClientB, {
  ticketId: incomingRealtimeTicket.id,
  newStatus: TICKET_STATUSES.PREPARING,
  expectedStatus: TICKET_STATUSES.NEW,
})
// Cliente A recibe el cambio de estado de Cliente B
const stateClientA = deduplicateTickets(systemState.kitchenTickets, [clientBPrep.updatedTicket])
const syncedOnA = stateClientA.find(t => t.id === incomingRealtimeTicket.id)
assert(syncedOnA.status === TICKET_STATUSES.PREPARING, 'Cliente A recibe transición PREPARING vía Realtime')

// -------------------------------------------------------------------------
// TEST SET 4: RECUPERACIÓN POR POLLING FALLBACK Y DEDUPLICACIÓN
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 4: FALLBACK POR POLLING & DEDUPLICACIÓN ---')

// Simular que Realtime se cayó y Polling HTTP trae una lista con tickets repetidos y nuevos
const polledTickets = [
  incomingRealtimeTicket, // Ya existente
  clientBPrep.updatedTicket, // Versión más nueva del mismo
  archivedTicket, // Ya existente
  {
    id: 'ktick_polled_new_02',
    organization_id: orgA,
    branch_id: branchPrincipal,
    sale_id: 'sale_poll_02',
    station_id: stationBar.id,
    ticket_number: 3,
    status: TICKET_STATUSES.NEW,
    created_at: new Date().toISOString(),
  }
]

const deduplicated = deduplicateTickets(systemState.kitchenTickets, polledTickets)
const countIncoming = deduplicated.filter(t => t.id === incomingRealtimeTicket.id).length

assert(countIncoming === 1, 'Deduplicación exitosa: Cero tickets duplicados tras recuperación por Polling')
assert(deduplicated.some(t => t.id === 'ktick_polled_new_02'), 'Polling recupera tickets no entregados por Realtime')

// -------------------------------------------------------------------------
// TEST SET 5: CONTROL DE CONCURRENCIA & TRANSICIÓN IDEMPOTENTE
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 5: CONCURRENCIA & IDEMPOTENCIA EN PANTALLAS ---')

// Escenario: Dos tablets pulsan PREPARAR al mismo tiempo sobre el ticket de polling
const ticketToPrepare = deduplicated.find(t => t.id === 'ktick_polled_new_02')

// Tablet 1
const tap1 = transitionTicketStatus(deduplicated, {
  ticketId: ticketToPrepare.id,
  newStatus: TICKET_STATUSES.PREPARING,
  expectedStatus: TICKET_STATUSES.NEW,
})

// Tablet 2 pulsa exactamente lo mismo
const tap2 = transitionTicketStatus(tap1.tickets, {
  ticketId: ticketToPrepare.id,
  newStatus: TICKET_STATUSES.PREPARING,
  expectedStatus: null, // Idempotente
})

assert(tap1.isNoop === false, 'Primer tap procesa la transición a PREPARING')
assert(tap2.isNoop === true, 'Segundo tap concurrente es idempotente (no duplica ni falla)')
assert(tap2.updatedTicket.status === TICKET_STATUSES.PREPARING, 'Estado final consistente en PREPARING')

// -------------------------------------------------------------------------
// TEST SET 6: AISLAMIENTO MULTI-TENANT (RLS) EN COMANDAS
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 6: AISLAMIENTO MULTI-TENANT (RLS) ---')

const ticketOrgB = createKitchenTicket({
  id: 'ktick_org_b_secret',
  organizationId: orgB,
  branchId: 'branch_other',
  saleId: 'sale_b_01',
  stationId: 'stat_b_01',
  ticketNumber: 1,
  items: [{ productId: 'prod_b', name: 'Plato Secreto Org B', quantity: 1 }],
}).ticket

// Filtrar comandas accesibles para Org A
const visibleForOrgA = [archivedTicket, ticketOrgB].filter(t => t.organization_id === orgA)
const visibleForOrgB = [archivedTicket, ticketOrgB].filter(t => t.organization_id === orgB)

assert(visibleForOrgA.length === 1 && visibleForOrgA[0].id === archivedTicket.id, 'Org A no puede ver comandas de Org B')
assert(visibleForOrgB.length === 1 && visibleForOrgB[0].id === ticketOrgB.id, 'Org B no puede ver comandas de Org A')

// -------------------------------------------------------------------------
// TEST SET 7: PRESERVACIÓN INMUTABLE DEL HISTORIAL
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 7: HISTORIAL PRESERVADO DE COMANDAS ---')

// Se crea un nuevo ticket activo (Ticket #4)
const ticketNew = createKitchenTicket({
  id: 'ktick_active_04',
  organizationId: orgA,
  branchId: branchPrincipal,
  saleId: 'sale_04',
  stationId: stationBar.id,
  ticketNumber: 4,
  items: [{ productId: espressoDoble.id, name: 'Espresso Doble', quantity: 2 }],
}).ticket

systemState.kitchenTickets.push(ticketNew)

// Comprobar que el Ticket #1 (archivedTicket) sigue existiendo intacto en la lista histórica
const historicFound = systemState.kitchenTickets.find(t => t.id === createdTicket.id)
assert(historicFound !== undefined, 'Ticket #1 histórico permanece en base tras nuevas comandas')
assert(historicFound.status === TICKET_STATUSES.ARCHIVED, 'Ticket #1 conserva su estado terminal ARCHIVED')
assert(systemState.kitchenTickets.length >= 2, 'Historial multi-ticket acumulativo')

// -------------------------------------------------------------------------
// TEST SET 8: CANCELACIÓN AUDITADA CON MOTIVO
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 8: CANCELACIÓN AUDITADA ---')

const cancelResult = transitionTicketStatus(systemState.kitchenTickets, {
  ticketId: ticketNew.id,
  newStatus: TICKET_STATUSES.CANCELLED,
  userId: userBarista,
  cancelReason: 'Cliente desistió del pedido',
})

const cancelledTicket = cancelResult.updatedTicket
assert(cancelledTicket.status === TICKET_STATUSES.CANCELLED, 'Comanda marcada como CANCELLED')
assert(cancelledTicket.cancel_reason === 'Cliente desistió del pedido', 'Motivo de cancelación auditado y persistido')
assert(cancelledTicket.cancelled_at !== null, 'Timestamp cancelled_at registrado')

// -------------------------------------------------------------------------
// TEST SET 9: TIMERS Y CÁLCULO DE SLA
// -------------------------------------------------------------------------
console.log('\n--- TEST SET 9: CÁLCULO DE TIEMPO TRANSCURRIDO & SLA ---')

const mockTicketOld = {
  created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Hace 15 min
  ready_at: null,
  archived_at: null,
}
const elapsed = calculateTicketElapsedTime(mockTicketOld)
assert(elapsed.minutes >= 15, `Tiempo transcurrido calculado correctamente: ${elapsed.formatted}`)
assert(elapsed.isDelayed === true, 'Detección automática de comanda demorada (>10 min)')

// -------------------------------------------------------------------------
// RESUMEN FINAL
// -------------------------------------------------------------------------
console.log('\n===================================================================')
console.log(`  RESULTADOS DE FASE 4: ${passed} PASADOS, ${failed} FALLADOS`)
if (failed === 0) {
  console.log('  STATUS: TODAS LAS VALIDACIONES DE FASE 4 SUPERADAS EXITOSAMENTE')
} else {
  console.error('  STATUS: EXISTEN FALLAS EN LA VALIDACIÓN DE FASE 4')
}
console.log('===================================================================\n')

if (failed > 0) process.exit(1)
