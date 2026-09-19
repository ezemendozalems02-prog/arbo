// ARBO OS — DOMAIN SERVICE: MULTI-BRANCH MANAGER & CONSOLIDATION
// Gestión del catálogo maestro con sobreescrituras por sucursal y panel ejecutivo consolidado.

import { aggregateStockFromMovements } from './inventoryCosting.js'

/**
 * Obtiene la configuración efectiva de un producto para una sucursal (disponibilidad y precio).
 */
export function getBranchProductSettings({ state, branchId, productId }) {
  const { products = [], branchProductSettings = [] } = state
  const product = products.find(p => p.id === productId)
  if (!product) {
    throw new Error(`PRODUCT_NOT_FOUND: Producto ${productId} no encontrado.`)
  }

  const setting = branchProductSettings.find(
    s => s.branch_id === branchId && s.product_id === productId
  )

  const isAvailable = setting ? Boolean(setting.is_available) : (product.is_available !== false)
  const priceOverride = setting && setting.price_override !== null && setting.price_override !== undefined
    ? Number(setting.price_override)
    : null
  const effectivePrice = priceOverride !== null ? priceOverride : Number(product.base_price || 0)

  return {
    productId,
    branchId,
    name: product.name,
    is_available: isAvailable,
    price_override: priceOverride,
    effective_price: effectivePrice,
    base_price: Number(product.base_price || 0),
    isAvailable,
    priceOverride,
    effectivePrice,
  }
}

/**
 * Establece la disponibilidad y/o sobreescritura de precio local de un producto para una sucursal.
 */
export function setBranchProductSetting(args) {
  const state = args.state || {}
  const payload = args.payload || args
  const organizationId = payload.organizationId || payload.organization_id || null
  const branchId = payload.branchId || payload.branch_id
  const productId = payload.productId || payload.product_id
  const isAvailable = payload.isAvailable !== undefined ? payload.isAvailable : (payload.is_available !== undefined ? payload.is_available : true)
  const priceOverride = payload.priceOverride !== undefined ? payload.priceOverride : (payload.price_override !== undefined ? payload.price_override : null)

  const { branchProductSettings = [] } = state
  const existingIdx = branchProductSettings.findIndex(
    s => s.branch_id === branchId && s.product_id === productId
  )

  const updatedSetting = {
    id: existingIdx !== -1 ? branchProductSettings[existingIdx].id : `bps_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    organization_id: organizationId,
    branch_id: branchId,
    product_id: productId,
    is_available: Boolean(isAvailable),
    price_override: priceOverride !== null ? Number(priceOverride) : null,
    updated_at: new Date().toISOString(),
  }

  let newSettings = [...branchProductSettings]
  if (existingIdx !== -1) {
    newSettings[existingIdx] = updatedSetting
  } else {
    newSettings.push({
      ...updatedSetting,
      created_at: new Date().toISOString(),
    })
  }

  const updatedState = {
    ...state,
    branchProductSettings: newSettings,
  }

  return {
    success: true,
    setting: updatedSetting,
    updatedState,
    ...updatedState,
  }
}

/**
 * Consulta de consolidación directiva ejecutiva multi-sucursal.
 * Agrega ventas, recaudación de caja, valorización de inventario y mercadería en tránsito.
 */
export function getExecutiveConsolidatedMetrics({ state, organizationId }) {
  const {
    branches = [],
    warehouses = [],
    sales = [],
    cashMovements = [],
    inventoryMovements = [],
    ingredients = [],
    stockTransfers = [],
    customers = [],
  } = state

  const orgBranches = branches.filter(b => b.organization_id === organizationId && b.is_active !== false)
  const orgSales = sales.filter(s => s.organization_id === organizationId && s.status === 'PAID')

  let totalSalesAmount = 0.00
  let totalSalesCount = orgSales.length

  const salesByBranch = orgBranches.map(branch => {
    const branchSales = orgSales.filter(s => s.branch_id === branch.id)
    const branchSalesAmount = branchSales.reduce((sum, s) => sum + Number(s.total || 0), 0)
    totalSalesAmount += branchSalesAmount

    const branchCashMovements = cashMovements.filter(
      cm => cm.organization_id === organizationId && cm.branch_id === branch.id
    )
    const cashCollected = branchCashMovements
      .filter(cm => cm.movement_type === 'SALE' || cm.movement_type === 'PAYMENT')
      .reduce((sum, cm) => sum + Number(cm.amount || 0), 0)

    return {
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      salesCount: branchSales.length,
      salesAmount: Number(branchSalesAmount.toFixed(2)),
      cashCollected: Number(cashCollected.toFixed(2)),
    }
  })

  // Valoración de inventario global y por sucursal
  let totalInventoryAssetValue = 0.00
  const inventoryByBranch = orgBranches.map(branch => {
    let branchValue = 0.00
    for (const ing of ingredients) {
      const ingMovements = inventoryMovements.filter(
        m => m.organization_id === organizationId &&
             m.branch_id === branch.id &&
             m.ingredient_id === ing.id
      )
      const stock = aggregateStockFromMovements(ingMovements, ing.id)
      const cost = Number(ing.current_cost_unit || 0)
      if (stock > 0 && cost > 0) {
        branchValue += stock * cost
      }
    }

    branchValue = Number(branchValue.toFixed(2))
    totalInventoryAssetValue += branchValue

    return {
      branchId: branch.id,
      branchName: branch.name,
      assetValue: branchValue,
    }
  })

  // Mercadería en tránsito (DISPATCHED no recibida aún)
  const inTransitTransfers = stockTransfers.filter(
    t => t.organization_id === organizationId && t.status === 'DISPATCHED'
  )

  const activeCustomersCount = customers.filter(
    c => c.organization_id === organizationId && c.status === 'ACTIVE'
  ).length

  const orgWarehouses = warehouses.filter(
    w => w.organization_id === organizationId && w.is_active !== false
  )

  return {
    organizationId,
    totalBranchesCount: orgBranches.length,
    branchesCount: orgBranches.length,
    warehousesCount: orgWarehouses.length,
    totalSalesAmount: Number(totalSalesAmount.toFixed(2)),
    totalSalesCount,
    salesByBranch,
    totalInventoryAssetValue: Number(totalInventoryAssetValue.toFixed(2)),
    inventoryByBranch,
    stockInTransitCount: inTransitTransfers.length,
    transfersInTransitCount: inTransitTransfers.length,
    activeCustomersCount,
  }
}
