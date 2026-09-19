// ARBO OS — DOMAIN SERVICE: MOTOR TRANSACCIONAL DE VENTAS & CHECKOUT ACID
// Garantiza atomicidad absoluta en la venta, ítems, pago, explosión de inventario y caja.

import { convertQuantity } from './unitConversion.js'
import { aggregateStockFromMovements } from './inventoryCosting.js'

/**
 * Calcula el subtotal y total de una lista de líneas de venta contra el catálogo activo.
 */
export function calculateSaleTotals(items = [], productsMap = new Map()) {
  if (!items || items.length === 0) {
    throw new Error('EMPTY_SALE_ITEMS: No se puede procesar una venta sin ítems.')
  }

  let subtotal = 0.00
  const processedItems = []

  for (const item of items) {
    const product = productsMap.get(item.productId)
    if (!product) {
      throw new Error(`INVALID_PRODUCT: Producto no encontrado (ID: ${item.productId})`)
    }
    if (!product.is_active && product.is_active !== undefined) {
      throw new Error(`INACTIVE_PRODUCT: El producto ${product.name} no está activo para venta.`)
    }

    const qty = Number(item.quantity)
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`INVALID_QUANTITY: Cantidad inválida para el producto ${product.name}`)
    }

    const unitPrice = Number(product.base_price)
    const lineSubtotal = Number((qty * unitPrice).toFixed(2))
    subtotal += lineSubtotal

    processedItems.push({
      product_id: product.id,
      product_name_snapshot: product.name,
      quantity: qty,
      unit_price_snapshot: unitPrice,
      subtotal: lineSubtotal,
    })
  }

  const total = Number(subtotal.toFixed(2))

  return {
    subtotal,
    discountAmount: 0.00,
    total,
    processedItems,
  }
}

/**
 * Explota las recetas de los productos en la venta para calcular el consumo exacto de ingredientes.
 */
export function explodeSaleRecipes(items = [], recipesMap = new Map(), ingredientsMap = new Map()) {
  const depletions = []

  for (const item of items) {
    const recipe = recipesMap.get(item.product_id)
    if (!recipe) {
      // Producto sin receta (ej. producto comercial directo sin transformación de insumos)
      continue
    }

    const portionsSold = Number(item.quantity)
    const recipeYield = Number(recipe.yield_portions || 1.00)
    const wasteFactor = Number(recipe.waste_percentage || 0.00)

    for (const rItem of (recipe.items || [])) {
      const ingredient = ingredientsMap.get(rItem.ingredient_id)
      if (!ingredient) {
        throw new Error(`INGREDIENT_NOT_FOUND: Insumo ${rItem.ingredient_id} requerido en receta no encontrado.`)
      }

      // Convertir cantidad de receta a la unidad base del insumo
      const qtyInBaseUnit = convertQuantity(rItem.quantity, rItem.unit, ingredient.base_unit)
      
      // Aplicar factor de merma si la receta lo especifica
      let singlePortionQty = qtyInBaseUnit / recipeYield
      if (wasteFactor > 0) {
        singlePortionQty = singlePortionQty / (1.0 - (wasteFactor / 100.0))
      }

      const totalDepletionQty = Number((portionsSold * singlePortionQty).toFixed(4))

      depletions.push({
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        base_unit: ingredient.base_unit,
        quantity_delta: -totalDepletionQty, // Delta negativo
        unit_cost_snapshot: Number(ingredient.current_cost_unit || 0),
      })
    }
  }

  return depletions
}

/**
 * Ejecuta la transacción ACID de checkout de forma indivisible.
 * Si cualquier verificación falla (stock insuficiente, caja cerrada, pago dispar),
 * lanza una excepción abortando todas las mutaciones sin alterar el estado.
 */
export function executeSaleCheckoutAtomic({
  state,
  payload: {
    organizationId,
    branchId,
    warehouseId = null,
    cashSessionId,
    customerId = null,
    userId,
    items,
    paymentAmount,
    cashTendered,
    notes,
  },
}) {
  const {
    cashSessions = [],
    products = [],
    recipes = [],
    ingredients = [],
    sales = [],
    saleItems = [],
    payments = [],
    inventoryMovements = [],
    cashMovements = [],
    customers = [],
    loyaltyTransactions = [],
    warehouses = [],
  } = state

  // 1. Validar sesión de caja activa y tenant
  const session = cashSessions.find(s => 
    s.id === cashSessionId && 
    s.organization_id === organizationId && 
    s.branch_id === branchId
  )
  if (!session || session.status !== 'OPEN') {
    throw new Error('CASH_SESSION_NOT_OPEN: La caja no se encuentra abierta o no pertenece a la organización/sucursal.')
  }

  // 1.A Validar depósito si fue especificado
  if (warehouseId) {
    const wh = warehouses.find(w => w.id === warehouseId && w.organization_id === organizationId && w.branch_id === branchId)
    if (!wh) {
      throw new Error(`WAREHOUSE_NOT_FOUND: El depósito ${warehouseId} no existe o no pertenece a la sucursal/organización.`)
    }
    if (wh.is_active === false) {
      throw new Error(`INACTIVE_WAREHOUSE: El depósito ${wh.name} está inactivo.`)
    }
  }

  // 1.B Validar cliente si fue provisto
  let activeCustomer = null
  if (customerId) {
    activeCustomer = customers.find(c => c.id === customerId && c.organization_id === organizationId)
    if (!activeCustomer) {
      throw new Error(`CUSTOMER_NOT_FOUND: El cliente ${customerId} no existe en esta organización.`)
    }
    if (activeCustomer.status !== 'ACTIVE') {
      throw new Error(`CUSTOMER_INACTIVE: El cliente seleccionado no está activo.`)
    }
  }

  // 2. Mapear catálogo
  const productsMap = new Map(products.map(p => [p.id, p]))
  const recipesMap = new Map(recipes.map(r => [r.product_id, r]))
  const ingredientsMap = new Map(ingredients.map(i => [i.id, i]))

  // 3. Calcular totales y snapshots de ítems
  const { subtotal, discountAmount, total, processedItems } = calculateSaleTotals(items, productsMap)

  // 4. Validar pago
  const paymentParsed = Number(paymentAmount)
  if (paymentParsed !== total) {
    throw new Error(`PAYMENT_TOTAL_MISMATCH: El importe a pagar ($${paymentParsed}) no coincide con el total de la venta ($${total}).`)
  }

  const tenderedParsed = Number(cashTendered !== undefined && cashTendered !== null ? cashTendered : paymentParsed)
  if (tenderedParsed < total) {
    throw new Error(`INSUFFICIENT_PAYMENT: El monto recibido en efectivo ($${tenderedParsed}) es menor al total ($${total}).`)
  }
  const changeGiven = Number((tenderedParsed - total).toFixed(2))

  // 5. Explosión de recetas y validación estricta de inventario
  const depletions = explodeSaleRecipes(processedItems, recipesMap, ingredientsMap)

  // Consolidar depletions por ingrediente para chequear contra stock actual
  const requiredStockByIngredient = new Map()
  for (const d of depletions) {
    const curr = requiredStockByIngredient.get(d.ingredient_id) || 0
    requiredStockByIngredient.set(d.ingredient_id, curr + Math.abs(d.quantity_delta))
  }

  for (const [ingredientId, requiredQty] of requiredStockByIngredient.entries()) {
    const ingredient = ingredientsMap.get(ingredientId)
    // Calcular stock actual sumando deltas históricos (filtrando por depósito específico si se indicó)
    const ingMovements = inventoryMovements.filter(m =>
      m.ingredient_id === ingredientId &&
      (warehouseId ? m.warehouse_id === warehouseId : m.branch_id === branchId)
    )
    const availableStock = aggregateStockFromMovements(ingMovements, ingredientId)

    if (availableStock < requiredQty) {
      throw new Error(`INSUFFICIENT_STOCK: Stock insuficiente para ${ingredient.name} (Disponible: ${availableStock} ${ingredient.base_unit}, Requerido: ${requiredQty} ${ingredient.base_unit})`)
    }
  }

  // 6. Si todas las validaciones pasaron, generar los registros atómicos
  const saleId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const saleNumber = sales.filter(s => s.branch_id === branchId).length + 1

  const newSale = {
    id: saleId,
    organization_id: organizationId,
    branch_id: branchId,
    warehouse_id: warehouseId || null,
    cash_session_id: cashSessionId,
    customer_id: customerId || null,
    sale_number: saleNumber,
    status: 'PAID',
    subtotal,
    discount_amount: discountAmount,
    total,
    notes: notes || null,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const newSaleItems = processedItems.map((item, idx) => ({
    id: `sitem_${Date.now()}_${idx}`,
    sale_id: saleId,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    quantity: item.quantity,
    unit_price_snapshot: item.unit_price_snapshot,
    subtotal: item.subtotal,
    created_at: new Date().toISOString(),
  }))

  const newPayment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: organizationId,
    branch_id: branchId,
    sale_id: saleId,
    cash_session_id: cashSessionId,
    payment_method: 'CASH',
    amount: paymentParsed,
    cash_tendered: tenderedParsed,
    change_given: changeGiven,
    created_at: new Date().toISOString(),
  }

  const newInventoryMovements = depletions.map((d, idx) => ({
    id: `imov_${Date.now()}_${idx}`,
    organization_id: organizationId,
    branch_id: branchId,
    warehouse_id: warehouseId || null,
    ingredient_id: d.ingredient_id,
    movement_type: 'SALE_DEPLETION',
    quantity_delta: d.quantity_delta,
    unit_cost_snapshot: d.unit_cost_snapshot,
    reference_id: saleId,
    reason: `Consumo por venta #${saleNumber}`,
    created_by: userId,
    created_at: new Date().toISOString(),
  }))

  const newCashMovement = {
    id: `cmov_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: organizationId,
    branch_id: branchId,
    cash_session_id: cashSessionId,
    movement_type: 'SALE',
    amount: paymentParsed,
    payment_method: 'CASH',
    reference_id: saleId,
    notes: `Cobro venta #${saleNumber}`,
    created_by: userId,
    created_at: new Date().toISOString(),
  }

  // 6.B Comanda KDS generada de forma atómica dentro del checkout (Opción A)
  const { kitchenStations = [], kitchenTickets = [], kitchenTicketItems = [] } = state
  const defaultStation = kitchenStations.find(s => s.branch_id === branchId && s.is_active !== false) || {
    id: 'stat_bar_default',
    name: 'Barra / Cafetería',
    code: 'BAR',
  }

  const ticketId = `ktick_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const ticketNumber = kitchenTickets.filter(t => t.branch_id === branchId).length + 1

  const newKitchenTicket = {
    id: ticketId,
    organization_id: organizationId,
    branch_id: branchId,
    sale_id: saleId,
    station_id: defaultStation.id,
    ticket_number: ticketNumber,
    status: 'NEW',
    notes: notes || null,
    created_at: new Date().toISOString(),
    started_at: null,
    ready_at: null,
    archived_at: null,
    cancelled_at: null,
    created_by: userId,
    cancelled_by: null,
    cancel_reason: null,
  }

  const newKitchenTicketItems = processedItems.map((item, idx) => ({
    id: `ktitem_${Date.now()}_${idx}`,
    ticket_id: ticketId,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    quantity: item.quantity,
    notes: null,
    status: 'PENDING',
    created_at: new Date().toISOString(),
  }))

  // 6.C Acreditación de puntos ARBO Club (Loyalty Ledger)
  let newLoyaltyTx = null
  let pointsEarned = 0

  if (customerId) {
    pointsEarned = Math.floor(total / 100)
    if (pointsEarned > 0) {
      // Validar idempotencia estricta en el ledger
      const isDuplicate = loyaltyTransactions.some(
        tx => tx.reference_type === 'SALE' && tx.reference_id === saleId && tx.transaction_type === 'EARN'
      )
      if (isDuplicate) {
        throw new Error('IDEMPOTENCY_VIOLATION: Ya se han acreditado puntos para esta venta.')
      }

      newLoyaltyTx = {
        id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        organization_id: organizationId,
        customer_id: customerId,
        branch_id: branchId,
        points_delta: pointsEarned,
        transaction_type: 'EARN',
        reference_type: 'SALE',
        reference_id: saleId,
        notes: `Acumulación ARBO Club por venta #${saleNumber} ($${total})`,
        created_at: new Date().toISOString(),
      }
    }
  }

  // 7. Retornar nuevo estado completamente integrado y el recibo
  return {
    success: true,
    updatedState: {
      ...state,
      sales: [...sales, newSale],
      saleItems: [...saleItems, ...newSaleItems],
      payments: [...payments, newPayment],
      inventoryMovements: [...inventoryMovements, ...newInventoryMovements],
      cashMovements: [...cashMovements, newCashMovement],
      kitchenTickets: [...kitchenTickets, newKitchenTicket],
      kitchenTicketItems: [...kitchenTicketItems, ...newKitchenTicketItems],
      loyaltyTransactions: newLoyaltyTx ? [...loyaltyTransactions, newLoyaltyTx] : loyaltyTransactions,
    },
    receipt: {
      sale_id: saleId,
      sale_number: saleNumber,
      status: 'PAID',
      customer_id: customerId || null,
      points_earned: pointsEarned,
      subtotal,
      total,
      payment_method: 'CASH',
      amount_paid: paymentParsed,
      cash_tendered: tenderedParsed,
      change_given: changeGiven,
      items: newSaleItems,
      inventory_depletions: newInventoryMovements,
      kitchen_ticket: newKitchenTicket,
      loyalty_transaction: newLoyaltyTx,
    },
  }
}
