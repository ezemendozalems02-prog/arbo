// ARBO OS — DOMAIN SERVICE: STOCK TRANSFER MANAGER
// Flujo transaccional de transferencias entre depósitos y sucursales.
// Regla Crítica: inventory_movements es la única fuente de verdad contable y física.

import { aggregateStockFromMovements, calculateWeightedAverageCost } from './inventoryCosting.js'

/**
 * Crea una nueva transferencia de stock en estado borrador (DRAFT).
 */
export function createStockTransfer({
  state,
  payload: {
    organizationId,
    originBranchId,
    originWarehouseId,
    destinationBranchId,
    destinationWarehouseId,
    items = [],
    notes = null,
    userId,
  },
}) {
  const {
    organizations = [],
    branches = [],
    warehouses = [],
    ingredients = [],
    stockTransfers = [],
  } = state

  if (!organizationId || !originWarehouseId || !destinationWarehouseId) {
    throw new Error('MISSING_FIELDS: organizationId, originWarehouseId y destinationWarehouseId son obligatorios.')
  }

  // 1. Validar que origen y destino no sean el mismo depósito
  if (originWarehouseId === destinationWarehouseId) {
    throw new Error('IDENTICAL_WAREHOUSES: El depósito de origen no puede ser igual al de destino.')
  }

  // 2. Validar depósitos y que pertenezcan al mismo tenant
  const originWh = warehouses.find(w => w.id === originWarehouseId && w.organization_id === organizationId)
  const destWh = warehouses.find(w => w.id === destinationWarehouseId && w.organization_id === organizationId)

  if (!originWh || !destWh) {
    throw new Error('WAREHOUSE_NOT_FOUND: Uno o ambos depósitos no existen o pertenecen a otro tenant.')
  }

  if (originWh.is_active === false || destWh.is_active === false) {
    throw new Error('INACTIVE_WAREHOUSE: No se puede operar con un depósito inactivo.')
  }

  // 3. Validar ítems
  if (!items || items.length === 0) {
    throw new Error('EMPTY_ITEMS: La transferencia debe contener al menos un insumo.')
  }

  const ingredientsMap = new Map(ingredients.map(i => [i.id, i]))
  const processedItems = []

  for (const item of items) {
    const ing = ingredientsMap.get(item.ingredientId || item.ingredient_id)
    if (!ing) {
      throw new Error(`INVALID_INGREDIENT: Insumo ${item.ingredientId || item.ingredient_id} no encontrado.`)
    }

    const qty = Number(item.quantitySent || item.quantity || item.quantity_sent)
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`INVALID_QUANTITY: Cantidad inválida para el insumo ${ing.name}.`)
    }

    processedItems.push({
      ingredient_id: ing.id,
      ingredient_name: ing.name,
      quantity_sent: qty,
      quantity_received: null,
      unit: item.unit || ing.base_unit,
      unit_cost_snapshot: Number(ing.current_cost_unit || 0),
      notes: item.notes || null,
    })
  }

  const transferId = `str_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const orgTransfers = stockTransfers.filter(t => t.organization_id === organizationId)
  const transferNumber = orgTransfers.length + 1

  const newTransfer = {
    id: transferId,
    organization_id: organizationId,
    transfer_number: transferNumber,
    origin_branch_id: originBranchId || originWh.branch_id,
    origin_warehouse_id: originWarehouseId,
    destination_branch_id: destinationBranchId || destWh.branch_id,
    destination_warehouse_id: destinationWarehouseId,
    status: 'DRAFT',
    notes: notes || null,
    requested_by: userId || null,
    dispatched_by: null,
    received_by: null,
    dispatched_at: null,
    received_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const newTransferItems = processedItems.map((pi, idx) => ({
    id: `stitem_${Date.now()}_${idx}`,
    transfer_id: transferId,
    ...pi,
    created_at: new Date().toISOString(),
  }))

  return {
    success: true,
    transfer: newTransfer,
    items: newTransferItems,
    updatedState: {
      ...state,
      stockTransfers: [...stockTransfers, newTransfer],
      stockTransferItems: [...(state.stockTransferItems || []), ...newTransferItems],
    },
  }
}

/**
 * Ejecuta el despacho atómico de una transferencia (DISPATCH).
 * Genera el movimiento TRANSFER_OUT (-Q) congelando el costo snapshot del PPP de origen.
 */
export function dispatchStockTransfer({ state, transferId, userId }) {
  const {
    stockTransfers = [],
    stockTransferItems = [],
    inventoryMovements = [],
    ingredients = [],
  } = state

  const transfer = stockTransfers.find(t => t.id === transferId)
  if (!transfer) {
    throw new Error(`TRANSFER_NOT_FOUND: Transferencia ${transferId} no encontrada.`)
  }

  // Idempotencia: Si ya está despachada, evitar doble egreso
  if (transfer.status === 'DISPATCHED') {
    return {
      success: true,
      alreadyDispatched: true,
      transfer,
      updatedState: state,
    }
  }

  if (transfer.status !== 'DRAFT' && transfer.status !== 'REQUESTED') {
    throw new Error(`INVALID_STATUS: La transferencia está en estado "${transfer.status}" y no puede ser despachada.`)
  }

  const items = stockTransferItems.filter(i => i.transfer_id === transferId)
  if (items.length === 0) {
    throw new Error('EMPTY_TRANSFER: La transferencia no contiene ítems para despachar.')
  }

  // 1. Validar stock suficiente en el depósito de origen
  for (const item of items) {
    const originMovements = inventoryMovements.filter(
      m => m.organization_id === transfer.organization_id &&
           m.ingredient_id === item.ingredient_id &&
           (m.warehouse_id === transfer.origin_warehouse_id ||
            (!m.warehouse_id && m.branch_id === transfer.origin_branch_id))
    )
    const availableStock = aggregateStockFromMovements(originMovements, item.ingredient_id)

    if (availableStock < item.quantity_sent) {
      throw new Error(`INSUFFICIENT_STOCK: Stock insuficiente en origen para ${item.ingredient_name || item.ingredient_id}. Disponible: ${availableStock}, Requerido: ${item.quantity_sent}`)
    }
  }

  // 2. Generar movimientos de egreso TRANSFER_OUT
  const now = new Date().toISOString()
  const newMovements = items.map((item, idx) => ({
    id: `imov_tout_${Date.now()}_${idx}`,
    organization_id: transfer.organization_id,
    branch_id: transfer.origin_branch_id,
    warehouse_id: transfer.origin_warehouse_id,
    ingredient_id: item.ingredient_id,
    movement_type: 'TRANSFER_OUT',
    quantity_delta: -Number(item.quantity_sent),
    unit_cost_snapshot: Number(item.unit_cost_snapshot || 0),
    reference_id: transfer.id,
    reason: `Despacho transferencia #${transfer.transfer_number}`,
    created_by: userId,
    created_at: now,
  }))

  const updatedTransfer = {
    ...transfer,
    status: 'DISPATCHED',
    dispatched_by: userId,
    dispatched_at: now,
    updated_at: now,
  }

  const auditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: transfer.organization_id,
    entity: 'stock_transfers',
    entity_id: transfer.id,
    action: 'DISPATCH_TRANSFER',
    actor_id: userId,
    created_at: now,
  }

  return {
    success: true,
    transfer: updatedTransfer,
    inventoryMovements: newMovements,
    updatedState: {
      ...state,
      stockTransfers: stockTransfers.map(t => t.id === transferId ? updatedTransfer : t),
      inventoryMovements: [...inventoryMovements, ...newMovements],
      auditLogs: [...(state.auditLogs || []), auditEntry],
    },
  }
}

/**
 * Ejecuta la recepción atómica de una transferencia (RECEIVE).
 * Genera el movimiento TRANSFER_IN (+Q) portando el costo snapshot transferido,
 * recalcula el PPP ponderado en destino y registra mermas de transporte si hay faltantes.
 */
export function receiveStockTransfer({ state, transferId, userId, itemsReceived = [], receivedItems = [] }) {
  const {
    stockTransfers = [],
    stockTransferItems = [],
    inventoryMovements = [],
    ingredients = [],
  } = state

  const transfer = stockTransfers.find(t => t.id === transferId)
  if (!transfer) {
    throw new Error(`TRANSFER_NOT_FOUND: Transferencia ${transferId} no encontrada.`)
  }

  // Concurrencia e Idempotencia estricta: Si ya está recibida, rechazar doble recepción
  if (transfer.status === 'RECEIVED') {
    throw new Error('TRANSFER_ALREADY_RECEIVED: La transferencia ya ha sido recibida y procesada.')
  }

  if (transfer.status !== 'DISPATCHED') {
    throw new Error(`INVALID_STATUS: La transferencia se encuentra en estado "${transfer.status}" y no puede recibirse (debe estar DISPATCHED).`)
  }

  const items = stockTransferItems.filter(i => i.transfer_id === transferId)
  const incoming = itemsReceived.length > 0 ? itemsReceived : receivedItems
  const receivedMap = new Map()
  for (const ir of incoming) {
    const qty = Number(
      ir.quantityReceived !== undefined ? ir.quantityReceived :
      (ir.quantity_received !== undefined ? ir.quantity_received :
      (ir.quantity !== undefined ? ir.quantity : 0))
    )
    if (ir.ingredient_id) receivedMap.set(ir.ingredient_id, qty)
    if (ir.ingredientId) receivedMap.set(ir.ingredientId, qty)
    if (ir.item_id) receivedMap.set(ir.item_id, qty)
    if (ir.itemId) receivedMap.set(ir.itemId, qty)
  }

  const now = new Date().toISOString()
  const newMovements = []
  const updatedItems = []
  let updatedIngredients = [...ingredients]

  for (const item of items) {
    const qtySent = Number(item.quantity_sent)
    let qtyRec = qtySent
    if (receivedMap.has(item.id)) {
      qtyRec = receivedMap.get(item.id)
    } else if (receivedMap.has(item.ingredient_id)) {
      qtyRec = receivedMap.get(item.ingredient_id)
    }

    if (qtyRec < 0) {
      throw new Error(`INVALID_RECEIVED_QUANTITY: Cantidad recibida inválida (${qtyRec}).`)
    }
    if (qtyRec > qtySent) {
      throw new Error(`RECEIVE_QUANTITY_EXCEEDS_DISPATCHED: La cantidad recibida (${qtyRec}) no puede ser mayor a la enviada (${qtySent}).`)
    }

    // 1. Movimiento de ingreso en destino TRANSFER_IN
    if (qtyRec > 0) {
      newMovements.push({
        id: `imov_tin_${Date.now()}_${item.id}`,
        organization_id: transfer.organization_id,
        branch_id: transfer.destination_branch_id,
        warehouse_id: transfer.destination_warehouse_id,
        ingredient_id: item.ingredient_id,
        movement_type: 'TRANSFER_IN',
        quantity_delta: qtyRec,
        unit_cost_snapshot: Number(item.unit_cost_snapshot || 0),
        reference_id: transfer.id,
        reason: `Recepción transferencia #${transfer.transfer_number}`,
        created_by: userId,
        created_at: now,
      })

      // 2. Recalcular PPP en destino
      const destMovements = inventoryMovements.filter(
        m => m.organization_id === transfer.organization_id &&
             m.ingredient_id === item.ingredient_id &&
             (m.warehouse_id === transfer.destination_warehouse_id ||
              (!m.warehouse_id && m.branch_id === transfer.destination_branch_id))
      )
      const existingDestQty = aggregateStockFromMovements(destMovements, item.ingredient_id)
      const ingRecord = ingredients.find(i => i.id === item.ingredient_id)
      const existingAvgCost = ingRecord ? Number(ingRecord.current_cost_unit || 0) : 0

      const newDestPpp = calculateWeightedAverageCost(
        existingDestQty,
        existingAvgCost,
        qtyRec,
        Number(item.unit_cost_snapshot || 0)
      )

      updatedIngredients = updatedIngredients.map(ing =>
        ing.id === item.ingredient_id ? { ...ing, current_cost_unit: newDestPpp } : ing
      )
    }

    // 3. Merma en transporte si hubo faltante físico
    const discrepancy = qtySent - qtyRec
    if (discrepancy > 0) {
      newMovements.push({
        id: `imov_waste_${Date.now()}_${item.id}`,
        organization_id: transfer.organization_id,
        branch_id: transfer.destination_branch_id,
        warehouse_id: null, // Merma ocurrida en tránsito inter-sucursal
        ingredient_id: item.ingredient_id,
        movement_type: 'WASTE',
        quantity_delta: -discrepancy,
        unit_cost_snapshot: Number(item.unit_cost_snapshot || 0),
        reference_id: transfer.id,
        reason: `Merma en transporte remito #${transfer.transfer_number}`,
        created_by: userId,
        created_at: now,
      })
    }

    updatedItems.push({
      ...item,
      quantity_received: qtyRec,
    })
  }

  const updatedTransfer = {
    ...transfer,
    status: 'RECEIVED',
    received_by: userId,
    received_at: now,
    updated_at: now,
  }

  const auditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: transfer.organization_id,
    entity: 'stock_transfers',
    entity_id: transfer.id,
    action: 'RECEIVE_TRANSFER',
    actor_id: userId,
    created_at: now,
  }

  return {
    success: true,
    transfer: updatedTransfer,
    items: updatedItems,
    inventoryMovements: newMovements,
    updatedState: {
      ...state,
      stockTransfers: stockTransfers.map(t => t.id === transferId ? updatedTransfer : t),
      stockTransferItems: (state.stockTransferItems || []).map(ti => {
        const matching = updatedItems.find(ui => ui.id === ti.id)
        return matching || ti
      }),
      inventoryMovements: [...inventoryMovements, ...newMovements],
      ingredients: updatedIngredients,
      auditLogs: [...(state.auditLogs || []), auditEntry],
    },
  }
}

/**
 * Cancela una transferencia. Si estaba DISPATCHED, inserta un movimiento compensatorio en origen.
 */
export function cancelStockTransfer({ state, transferId, userId, reason = null }) {
  const {
    stockTransfers = [],
    stockTransferItems = [],
    inventoryMovements = [],
  } = state

  const transfer = stockTransfers.find(t => t.id === transferId)
  if (!transfer) {
    throw new Error(`TRANSFER_NOT_FOUND: Transferencia ${transferId} no encontrada.`)
  }

  if (transfer.status === 'RECEIVED') {
    throw new Error('CANNOT_CANCEL_RECEIVED_TRANSFER: No se puede cancelar una transferencia que ya ha sido recibida.')
  }

  const now = new Date().toISOString()
  let compensatingMovements = []

  // Si ya estaba despachada, compensar devolviendo la mercadería a origen
  if (transfer.status === 'DISPATCHED') {
    const items = stockTransferItems.filter(i => i.transfer_id === transferId)
    compensatingMovements = items.map((item, idx) => ({
      id: `imov_comp_${Date.now()}_${idx}`,
      organization_id: transfer.organization_id,
      branch_id: transfer.origin_branch_id,
      warehouse_id: transfer.origin_warehouse_id,
      ingredient_id: item.ingredient_id,
      movement_type: 'TRANSFER_IN', // Compensación
      quantity_delta: Number(item.quantity_sent),
      unit_cost_snapshot: Number(item.unit_cost_snapshot || 0),
      reference_id: transfer.id,
      reason: `Devolución por cancelación de remito #${transfer.transfer_number}`,
      created_by: userId,
      created_at: now,
    }))
  }

  const updatedTransfer = {
    ...transfer,
    status: 'CANCELLED',
    notes: reason ? `${transfer.notes ? transfer.notes + ' | ' : ''}Cancelado: ${reason}` : transfer.notes,
    updated_at: now,
  }

  const auditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: transfer.organization_id,
    entity: 'stock_transfers',
    entity_id: transfer.id,
    action: 'CANCEL_TRANSFER',
    actor_id: userId,
    created_at: now,
  }

  return {
    success: true,
    transfer: updatedTransfer,
    compensatingMovements,
    updatedState: {
      ...state,
      stockTransfers: stockTransfers.map(t => t.id === transferId ? updatedTransfer : t),
      inventoryMovements: [...inventoryMovements, ...compensatingMovements],
      auditLogs: [...(state.auditLogs || []), auditEntry],
    },
  }
}

/**
 * Obtiene una transferencia completa con sus ítems (para uso en UI / Supabase)
 */
export async function getStockTransferWithItems(transferId, supabaseClient = null) {
  try {
    const client = supabaseClient || (await import('../../lib/supabase.js')).supabase
    if (!client) return null
    const { data: transfer, error: trErr } = await client
      .from('stock_transfers')
      .select('*')
      .eq('id', transferId)
      .single()
    if (trErr || !transfer) return null

    const { data: items } = await client
      .from('stock_transfer_items')
      .select('*, ingredient:ingredients(name, unit)')
      .eq('transfer_id', transferId)

    return { ...transfer, items: items || [] }
  } catch {
    return null
  }
}

