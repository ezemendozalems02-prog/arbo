// ARBO OS — DOMAIN SERVICE: CUSTOMER, LOYALTY LEDGER (ARBO CLUB) & CUSTOMER 360 / RFM
// Implementación pura e inmutable de la lógica de fidelización, ledger append-only y Customer 360.

/**
 * Normaliza el número de teléfono para evitar duplicados por formato.
 * Mantiene el prefijo '+' si existe y extrae únicamente caracteres numéricos.
 */
export function normalizePhone(phone) {
  if (!phone) return ''
  const trimmed = String(phone).trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

/**
 * Regla oficial de acumulación de puntos ARBO Club:
 * floor(total / 100) — división entera redondeada hacia abajo.
 * Ejemplo: $3.500 -> 35 pts, $3.999 -> 39 pts, $99 -> 0 pts.
 */
export function calculatePointsForSale(total) {
  const numericTotal = Number(total)
  if (isNaN(numericTotal) || numericTotal <= 0) {
    return 0
  }
  return Math.floor(numericTotal / 100)
}

/**
 * Registra un nuevo cliente con aislamiento por organización.
 * Garantiza restricción UNIQUE(organization_id, phone).
 */
export function createCustomer(state, customerData) {
  const { customers = [] } = state
  const {
    organizationId,
    firstName,
    lastName = '',
    phone,
    email = null,
    documentId = null,
    birthdate = null,
    notes = null,
  } = customerData

  if (!organizationId) {
    throw new Error('TENANCY_ERROR: organizationId es requerido.')
  }
  if (!firstName || !firstName.trim()) {
    throw new Error('INVALID_CUSTOMER_NAME: El nombre es obligatorio.')
  }
  if (!phone || !phone.trim()) {
    throw new Error('INVALID_CUSTOMER_PHONE: El teléfono es obligatorio para la identidad de baja fricción.')
  }

  const normalized = normalizePhone(phone)

  // Validar unicidad de teléfono dentro de la misma organización
  const duplicate = customers.find(
    c => c.organization_id === organizationId && normalizePhone(c.phone) === normalized
  )
  if (duplicate) {
    throw new Error(`DUPLICATE_PHONE: Ya existe un cliente registrado con el teléfono ${phone} en esta organización.`)
  }

  const newCustomer = {
    id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: organizationId,
    first_name: firstName.trim(),
    last_name: (lastName || '').trim(),
    phone: normalized,
    email: email ? email.trim().toLowerCase() : null,
    document_id: documentId ? documentId.trim() : null,
    birthdate: birthdate || null,
    status: 'ACTIVE',
    notes: notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    customer: newCustomer,
    updatedState: {
      ...state,
      customers: [...customers, newCustomer],
    },
  }
}

/**
 * Calcula el saldo de puntos de un cliente derivado EXCLUSIVAMENTE del ledger append-only.
 * Nunca lee ni escribe en una columna mutable de saldo.
 */
export function calculateCustomerBalance(loyaltyTransactions = [], customerId) {
  if (!customerId) return 0
  return loyaltyTransactions
    .filter(tx => tx.customer_id === customerId)
    .reduce((acc, tx) => acc + (Number(tx.points_delta) || 0), 0)
}

/**
 * Crea una recompensa en el catálogo de fidelización de la organización.
 */
export function createReward(state, rewardData) {
  const { rewards = [] } = state
  const {
    organizationId,
    name,
    description = '',
    pointsRequired,
    productId = null,
    isActive = true,
  } = rewardData

  if (!organizationId) {
    throw new Error('TENANCY_ERROR: organizationId es requerido.')
  }
  if (!name || !name.trim()) {
    throw new Error('INVALID_REWARD_NAME: El nombre de la recompensa es obligatorio.')
  }
  const pts = Number(pointsRequired)
  if (isNaN(pts) || pts <= 0) {
    throw new Error('INVALID_POINTS_REQUIRED: Los puntos requeridos deben ser un número mayor a cero.')
  }

  const newReward = {
    id: `rew_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: organizationId,
    name: name.trim(),
    description: (description || '').trim(),
    points_required: pts,
    product_id: productId || null,
    is_active: isActive !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    reward: newReward,
    updatedState: {
      ...state,
      rewards: [...rewards, newReward],
    },
  }
}

/**
 * Ejecuta una redención de recompensa de forma ACID sobre el ledger append-only.
 * Valida que el saldo sea suficiente, genera la redención y añade un delta negativo (REDEEM).
 */
export function executeRewardRedemptionAtomic(state, {
  organizationId,
  branchId,
  customerId,
  rewardId,
  userId,
  notes = null,
}) {
  const {
    customers = [],
    rewards = [],
    loyaltyTransactions = [],
    rewardRedemptions = [],
  } = state

  // 1. Validar cliente
  const customer = customers.find(c => c.id === customerId && c.organization_id === organizationId)
  if (!customer) {
    throw new Error(`CUSTOMER_NOT_FOUND: Cliente ${customerId} no encontrado en la organización.`)
  }
  if (customer.status !== 'ACTIVE') {
    throw new Error(`CUSTOMER_INACTIVE: El cliente no se encuentra activo.`)
  }

  // 2. Validar recompensa
  const reward = rewards.find(r => r.id === rewardId && r.organization_id === organizationId)
  if (!reward) {
    throw new Error(`REWARD_NOT_FOUND: Recompensa ${rewardId} no encontrada en la organización.`)
  }
  if (!reward.is_active) {
    throw new Error(`REWARD_INACTIVE: La recompensa "${reward.name}" no está activa actualmente.`)
  }

  // 3. Validar saldo disponible derivado del ledger
  const currentBalance = calculateCustomerBalance(loyaltyTransactions, customerId)
  if (currentBalance < reward.points_required) {
    throw new Error(
      `INSUFFICIENT_POINTS: Saldo insuficiente para canjear recompensa (Disponible: ${currentBalance}, Requerido: ${reward.points_required})`
    )
  }

  // 4. Generar registros atómicos
  const redemptionId = `redm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const now = new Date().toISOString()

  const newRedemption = {
    id: redemptionId,
    organization_id: organizationId,
    branch_id: branchId,
    customer_id: customerId,
    reward_id: rewardId,
    points_spent: reward.points_required,
    status: 'COMPLETED',
    notes: notes || null,
    created_by: userId,
    created_at: now,
  }

  const newLoyaltyTx = {
    id: `ltx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: organizationId,
    customer_id: customerId,
    branch_id: branchId,
    points_delta: -reward.points_required, // Delta negativo
    transaction_type: 'REDEEM',
    reference_type: 'REDEMPTION',
    reference_id: redemptionId,
    notes: `Canje de recompensa: ${reward.name} (-${reward.points_required} pts)`,
    created_at: now,
  }

  const newBalance = currentBalance - reward.points_required

  return {
    success: true,
    redemption: newRedemption,
    loyaltyTransaction: newLoyaltyTx,
    newBalance,
    updatedState: {
      ...state,
      rewardRedemptions: [...rewardRedemptions, newRedemption],
      loyaltyTransactions: [...loyaltyTransactions, newLoyaltyTx],
    },
  }
}

/**
 * Construye la vista Customer 360 y métricas RFM derivando todo desde los datos transaccionales reales.
 * No genera duplicación ni tablas cacheadas desfasadas.
 */
export function buildCustomer360(customerId, {
  customers = [],
  sales = [],
  saleItems = [],
  loyaltyTransactions = [],
  referenceDate = new Date(),
}) {
  const customer = customers.find(c => c.id === customerId)
  if (!customer) {
    throw new Error(`CUSTOMER_NOT_FOUND: Cliente ${customerId} no encontrado.`)
  }

  // Ventas válidas del cliente (excluye anuladas/canceladas)
  const validSales = sales
    .filter(s => s.customer_id === customerId && s.status === 'PAID')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  // Transacciones de puntos
  const customerLoyaltyTxs = loyaltyTransactions
    .filter(tx => tx.customer_id === customerId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const pointsBalance = customerLoyaltyTxs.reduce((acc, tx) => acc + (Number(tx.points_delta) || 0), 0)

  // Métricas RFM
  const frequency = validSales.length
  const monetary = Number(validSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0).toFixed(2))

  let lastPurchaseDate = null
  let recencyDays = null

  if (validSales.length > 0) {
    lastPurchaseDate = validSales[0].created_at
    const diffMs = Math.max(0, new Date(referenceDate).getTime() - new Date(lastPurchaseDate).getTime())
    recencyDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  }

  // Segmentación RFM determinística
  let rfmSegment = 'PROSPECT'
  if (frequency === 0) {
    rfmSegment = 'NO_PURCHASES'
  } else if (frequency >= 5 && monetary >= 20000 && recencyDays <= 30) {
    rfmSegment = 'VIP_CHAMPION'
  } else if (frequency >= 3 && recencyDays <= 30) {
    rfmSegment = 'LOYAL_ACTIVE'
  } else if (frequency === 1 && recencyDays <= 30) {
    rfmSegment = 'NEW_CUSTOMER'
  } else if (recencyDays > 30 && recencyDays <= 60) {
    rfmSegment = 'SLIPPING'
  } else if (recencyDays > 60) {
    rfmSegment = 'AT_RISK_INACTIVE'
  } else {
    rfmSegment = 'OCCASIONAL'
  }

  // Productos favoritos derivados de sale_items asociados a las ventas válidas del cliente
  const validSaleIds = new Set(validSales.map(s => s.id))
  const customerItems = saleItems.filter(item => validSaleIds.has(item.sale_id))

  const productStatsMap = new Map()
  for (const item of customerItems) {
    const key = item.product_id
    const existing = productStatsMap.get(key) || {
      product_id: item.product_id,
      product_name: item.product_name_snapshot,
      total_quantity: 0,
      total_spent: 0.00,
      times_ordered: 0,
    }
    existing.total_quantity += Number(item.quantity) || 0
    existing.total_spent += Number(item.subtotal) || 0
    existing.times_ordered += 1
    productStatsMap.set(key, existing)
  }

  const favoriteProducts = Array.from(productStatsMap.values())
    .map(p => ({
      ...p,
      total_spent: Number(p.total_spent.toFixed(2)),
    }))
    .sort((a, b) => b.total_quantity - a.total_quantity || b.total_spent - a.total_spent)

  const topFavorite = favoriteProducts.length > 0 ? favoriteProducts[0] : null

  return {
    customer: {
      id: customer.id,
      organization_id: customer.organization_id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      full_name: `${customer.first_name} ${customer.last_name}`.trim(),
      phone: customer.phone,
      email: customer.email,
      document_id: customer.document_id,
      status: customer.status,
      created_at: customer.created_at,
    },
    loyalty: {
      current_balance: pointsBalance,
      transactions_count: customerLoyaltyTxs.length,
      history: customerLoyaltyTxs,
    },
    rfm: {
      recency_days: recencyDays,
      last_purchase_date: lastPurchaseDate,
      frequency,
      monetary,
      average_ticket: frequency > 0 ? Number((monetary / frequency).toFixed(2)) : 0.00,
      segment: rfmSegment,
    },
    purchases: {
      total_count: validSales.length,
      recent_sales: validSales.slice(0, 10),
    },
    favorites: {
      top_favorite: topFavorite,
      all_favorites: favoriteProducts,
    },
  }
}
