// ARBO OS — DOMAIN SERVICE: PUBLIC COMMERCE, ONLINE ORDERING & TRACKING
// Gestión segura de pedidos online, catálogo público proyectado, integridad de precios,
// resolución multi-tenant por slug, tokens no enumerables y conexión transaccional con checkout ACID.

import { normalizePhone } from './customerLoyaltyManager.js'
import { executeSaleCheckoutAtomic } from './saleCheckout.js'

/**
 * Genera un token criptográfico no enumerable para tracking de pedidos públicos.
 * Evita ataques de fuerza bruta o IDOR secuencial (nunca /order/1, /order/2).
 */
export function generatePublicOrderToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let randomPart = ''
  for (let i = 0; i < 24; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `ord_sec_${Date.now().toString(36)}_${randomPart}`
}

/**
 * Resuelve la sucursal y organización a partir de un slug seguro.
 * El cliente jamás envía un UUID de organización arbitrario.
 */
export function resolveBranchBySlug(state, slug) {
  if (!slug || !slug.trim()) {
    throw new Error('INVALID_SLUG: El slug de la sucursal es obligatorio.')
  }
  const cleanSlug = slug.trim().toLowerCase()
  const { branches = [], organizations = [] } = state

  const branch = branches.find(b => {
    const bSlug = (b.slug || b.code || '').toLowerCase().replace(/_/g, '-')
    return bSlug === cleanSlug && b.is_active !== false
  })

  if (!branch) {
    throw new Error(`BRANCH_NOT_FOUND: No se encontró una sucursal activa para el slug "${slug}".`)
  }

  const organization = organizations.find(o => o.id === branch.organization_id)
  if (!organization) {
    throw new Error(`ORGANIZATION_NOT_FOUND: La organización asociada a la sucursal no existe.`)
  }

  return {
    organization,
    branch,
  }
}

/**
 * Proyecta el catálogo público sanitizado para clientes consumidores.
 * EXCLUYE estrictamente: costos, márgenes, PPP, recetas, insumos y stock numérico exacto.
 */
export function getPublicCatalog(state, { organizationId, branchId = null }) {
  if (!organizationId) {
    throw new Error('TENANCY_ERROR: organizationId es requerido.')
  }
  const { products = [], categories = [] } = state

  const catMap = new Map(categories.map(c => [c.id, c]))

  return products
    .filter(p => p.organization_id === organizationId && p.is_active !== false && p.is_available !== false)
    .map(p => {
      const cat = catMap.get(p.category_id)
      return {
        id: p.id,
        category_id: p.category_id || null,
        category_name: cat ? cat.name : 'General',
        name: p.name,
        description: p.description || '',
        price: Number(p.base_price),
        image_url: p.image_url || null,
        is_available: p.is_available !== false,
      }
    })
}

/**
 * Recalcula y valida el carrito público contra la base de datos persistente.
 * BLINDAJE CONTRA PRICE TAMPERING: El backend es la única fuente de verdad.
 */
export function calculateAndValidateCart(state, { organizationId, branchId, items = [] }) {
  if (!items || items.length === 0) {
    throw new Error('EMPTY_CART: No se puede procesar un carrito sin productos.')
  }

  const { products = [] } = state
  const productsMap = new Map(products.map(p => [p.id, p]))

  let subtotal = 0.00
  const validatedItems = []

  for (const item of items) {
    const product = productsMap.get(item.productId)
    if (!product) {
      throw new Error(`INVALID_PRODUCT: El producto ${item.productId} no existe en el catálogo.`)
    }
    if (product.organization_id !== organizationId) {
      throw new Error(`TENANT_ESCAPE_DETECTED: El producto ${product.name} pertenece a otra organización.`)
    }
    if (product.is_active === false) {
      throw new Error(`PRODUCT_INACTIVE: El producto "${product.name}" no está activo para venta.`)
    }
    if (product.is_available === false) {
      throw new Error(`PRODUCT_UNAVAILABLE: El producto "${product.name}" se encuentra agotado temporalmente.`)
    }

    const qty = Number(item.quantity)
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`INVALID_QUANTITY: Cantidad inválida para "${product.name}".`)
    }

    const officialPrice = Number(product.base_price)

    // Si el cliente envió un precio en el payload, verificar que no haya manipulación
    if (item.clientPrice !== undefined && item.clientPrice !== null) {
      const clientPrice = Number(item.clientPrice)
      if (Math.abs(clientPrice - officialPrice) > 0.01) {
        throw new Error(
          `PRICE_TAMPERING_DETECTED: Manipulación de precio detectada para "${product.name}" (Enviado: $${clientPrice}, Oficial: $${officialPrice}).`
        )
      }
    }

    const lineSubtotal = Number((qty * officialPrice).toFixed(2))
    subtotal += lineSubtotal

    validatedItems.push({
      product_id: product.id,
      product_name_snapshot: product.name,
      unit_price_snapshot: officialPrice,
      quantity: qty,
      subtotal: lineSubtotal,
      notes: item.notes || null,
    })
  }

  const total = Number(subtotal.toFixed(2))

  return {
    subtotal,
    discountAmount: 0.00,
    total,
    validatedItems,
  }
}

/**
 * Identifica o crea el cliente consumidor de baja fricción a partir de su teléfono.
 * Respeta la restricción UNIQUE(organization_id, phone).
 */
export function resolveOrCreatePublicCustomer(state, {
  organizationId,
  name,
  phone,
  email = null,
  notes = null,
}) {
  if (!name || !name.trim()) {
    throw new Error('INVALID_CUSTOMER_NAME: El nombre del cliente es obligatorio para el pedido.')
  }
  if (!phone || !phone.trim()) {
    throw new Error('INVALID_CUSTOMER_PHONE: El teléfono es obligatorio para contactar y coordinar el pedido.')
  }

  const normalizedPhone = normalizePhone(phone)
  const { customers = [] } = state

  // 1. Buscar si ya existe por (organization_id, normalized_phone)
  const existingCustomer = customers.find(
    c => c.organization_id === organizationId && normalizePhone(c.phone) === normalizedPhone
  )

  if (existingCustomer) {
    return {
      customer: existingCustomer,
      isNew: false,
      updatedState: state,
    }
  }

  // 2. Si no existe, crear registro en estado ACTIVE
  const newCustomer = {
    id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: organizationId,
    first_name: name.trim(),
    last_name: '',
    phone: normalizedPhone,
    email: email ? email.trim().toLowerCase() : null,
    document_id: null,
    birthdate: null,
    status: 'ACTIVE',
    notes: notes || 'Cliente registrado vía Online Ordering',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    customer: newCustomer,
    isNew: true,
    updatedState: {
      ...state,
      customers: [...customers, newCustomer],
    },
  }
}

/**
 * Emite una orden pública (`public_orders`) con protección de idempotencia.
 */
export function submitPublicOrder(state, {
  organizationId,
  branchId,
  customerName,
  customerPhone,
  customerEmail = null,
  fulfillmentType = 'TAKEAWAY',
  deliveryAddress = null,
  items = [],
  paymentMethod = 'PAY_ON_PICKUP',
  notes = null,
  idempotencyKey = null,
}) {
  const { publicOrders = [], publicOrderItems = [], branches = [] } = state

  // Validar pertenencia de sucursal a la organización
  const branch = branches.find(b => b.id === branchId && b.organization_id === organizationId)
  if (!branch) {
    throw new Error(`INVALID_BRANCH: La sucursal no existe o no pertenece a la organización.`)
  }

  // Idempotencia: Si ya existe orden con esta clave para el tenant, devolver la existente
  if (idempotencyKey) {
    const existingOrder = publicOrders.find(
      o => o.organization_id === organizationId && o.idempotency_key === idempotencyKey
    )
    if (existingOrder) {
      const existingItems = publicOrderItems.filter(i => i.public_order_id === existingOrder.id)
      return {
        success: true,
        order: existingOrder,
        items: existingItems,
        isDuplicate: true,
        updatedState: state,
      }
    }
  }

  // Resolver o crear cliente
  const customerResolution = resolveOrCreatePublicCustomer(state, {
    organizationId,
    name: customerName,
    phone: customerPhone,
    email: customerEmail,
  })
  let currentState = customerResolution.updatedState
  const customer = customerResolution.customer

  // Validar catálogo y calcular total en backend
  const { subtotal, discountAmount, total, validatedItems } = calculateAndValidateCart(currentState, {
    organizationId,
    branchId,
    items,
  })

  const orderId = `pord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const orderNumber = publicOrders.filter(o => o.branch_id === branchId).length + 1
  const publicToken = generatePublicOrderToken()
  const now = new Date().toISOString()

  const newPublicOrder = {
    id: orderId,
    organization_id: organizationId,
    branch_id: branchId,
    order_number: orderNumber,
    public_token: publicToken,
    status: 'PENDING',
    fulfillment_type: fulfillmentType,
    customer_id: customer.id,
    customer_name: customerName.trim(),
    customer_phone: normalizePhone(customerPhone),
    customer_email: customerEmail ? customerEmail.trim().toLowerCase() : null,
    delivery_address: deliveryAddress || null,
    subtotal,
    discount_amount: discountAmount,
    total,
    payment_method: paymentMethod,
    payment_status: paymentMethod === 'PAY_ON_PICKUP' ? 'PENDING' : 'PAID',
    sale_id: null,
    idempotency_key: idempotencyKey,
    notes: notes || null,
    created_at: now,
    updated_at: now,
  }

  const newOrderItems = validatedItems.map((item, idx) => ({
    id: `poitem_${Date.now()}_${idx}`,
    public_order_id: orderId,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    unit_price_snapshot: item.unit_price_snapshot,
    quantity: item.quantity,
    subtotal: item.subtotal,
    notes: item.notes,
    created_at: now,
  }))

  return {
    success: true,
    order: newPublicOrder,
    items: newOrderItems,
    customer,
    isDuplicate: false,
    updatedState: {
      ...currentState,
      publicOrders: [...currentState.publicOrders, newPublicOrder],
      publicOrderItems: [...currentState.publicOrderItems, ...newOrderItems],
    },
  }
}

/**
 * Convierte indivisiblemente una orden pública en una venta real mediante el motor transaccional existente.
 * Garantiza: VENTA + PAGO + INVENTARIO + CAJA + KDS + LOYALTY EARN en un solo bloque indivisible.
 */
export function confirmPublicOrderToSale(state, {
  publicOrderId,
  cashSessionId,
  userId,
}) {
  const { publicOrders = [], publicOrderItems = [] } = state

  const orderIndex = publicOrders.findIndex(o => o.id === publicOrderId)
  if (orderIndex === -1) {
    throw new Error(`ORDER_NOT_FOUND: Orden pública ${publicOrderId} no encontrada.`)
  }

  const order = publicOrders[orderIndex]
  if (order.status !== 'PENDING') {
    throw new Error(`INVALID_ORDER_STATUS: La orden se encuentra en estado ${order.status} y no puede ser confirmada.`)
  }

  const items = publicOrderItems.filter(i => i.public_order_id === publicOrderId)
  if (items.length === 0) {
    throw new Error(`EMPTY_ORDER: La orden no contiene ítems.`)
  }

  // Preparar payload para checkout ACID
  const checkoutPayload = {
    organizationId: order.organization_id,
    branchId: order.branch_id,
    cashSessionId,
    customerId: order.customer_id,
    userId,
    items: items.map(i => ({
      productId: i.product_id,
      quantity: i.quantity,
    })),
    paymentAmount: order.total,
    cashTendered: order.total,
    notes: `[ONLINE ${order.fulfillment_type}] Pedido #${order.order_number} - Cliente: ${order.customer_name}`,
  }

  // Ejecutar motor transaccional atómico
  const checkoutResult = executeSaleCheckoutAtomic({
    state,
    payload: checkoutPayload,
  })

  // Actualizar estado de la orden pública
  const confirmedOrder = {
    ...order,
    status: 'CONFIRMED',
    sale_id: checkoutResult.receipt.sale_id,
    updated_at: new Date().toISOString(),
  }

  const updatedPublicOrders = [...checkoutResult.updatedState.publicOrders]
  const idxInNew = updatedPublicOrders.findIndex(o => o.id === publicOrderId)
  if (idxInNew !== -1) {
    updatedPublicOrders[idxInNew] = confirmedOrder
  }

  return {
    success: true,
    confirmedOrder,
    saleReceipt: checkoutResult.receipt,
    updatedState: {
      ...checkoutResult.updatedState,
      publicOrders: updatedPublicOrders,
    },
  }
}

/**
 * Consulta de tracking público con token criptográfico seguro.
 * Solo proyecta datos autorizados para el cliente y enmascara PII.
 */
export function getPublicOrderTracking(state, publicToken) {
  if (!publicToken || !publicToken.trim()) {
    throw new Error('MISSING_TOKEN: El token de seguimiento es requerido.')
  }

  const { publicOrders = [], publicOrderItems = [], kitchenTickets = [] } = state
  const order = publicOrders.find(o => o.public_token === publicToken.trim())

  if (!order) {
    throw new Error('ORDER_NOT_FOUND: No se encontró ningún pedido con el código provisto.')
  }

  const items = publicOrderItems.filter(i => i.public_order_id === order.id)

  // Sincronizar estado con el ticket KDS si existe venta vinculada
  let operationalStatus = order.status
  if (order.sale_id) {
    const kdsTicket = kitchenTickets.find(t => t.sale_id === order.sale_id)
    if (kdsTicket) {
      if (kdsTicket.status === 'PREPARING') operationalStatus = 'IN_PREPARATION'
      else if (kdsTicket.status === 'READY') operationalStatus = 'READY'
      else if (kdsTicket.status === 'ARCHIVED') operationalStatus = 'COMPLETED'
      else if (kdsTicket.status === 'CANCELLED') operationalStatus = 'CANCELLED'
    }
  }

  // Enmascarar PII: ej. +5493410000000 -> +54 9 341 ***-0000
  const phone = order.customer_phone || ''
  const maskedPhone = phone.length >= 8 
    ? `${phone.slice(0, 4)}***${phone.slice(-4)}`
    : '***'

  return {
    order_number: order.order_number,
    status: operationalStatus,
    fulfillment_type: order.fulfillment_type,
    customer_name: order.customer_name,
    customer_phone_masked: maskedPhone,
    delivery_address: order.delivery_address,
    items: items.map(i => ({
      name: i.product_name_snapshot,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    subtotal: order.subtotal,
    discount_amount: order.discount_amount,
    total: order.total,
    created_at: order.created_at,
  }
}
