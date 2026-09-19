// ARBO OS — DOMAIN SERVICE: WAREHOUSE MANAGER
// Gestión de depósitos físicos, asignación a sucursales y consulta de inventario por depósito.

import { aggregateStockFromMovements } from './inventoryCosting.js'

/**
 * Registra un nuevo depósito físico para una sucursal.
 */
export function createWarehouse({
  state,
  payload: {
    organizationId,
    branchId,
    name,
    code,
    warehouseType = 'BRANCH',
    isDefault = false,
  },
}) {
  const { organizations = [], branches = [], warehouses = [] } = state

  if (!organizationId || !branchId || !name || !code) {
    throw new Error('MISSING_FIELDS: organizationId, branchId, name y code son obligatorios.')
  }

  // 1. Validar existencia del tenant y de la sucursal
  const org = organizations.find(o => o.id === organizationId)
  if (!org) {
    throw new Error(`ORGANIZATION_NOT_FOUND: La organización ${organizationId} no existe.`)
  }

  const branch = branches.find(b => b.id === branchId && b.organization_id === organizationId)
  if (!branch) {
    throw new Error(`BRANCH_NOT_FOUND: La sucursal ${branchId} no existe o no pertenece a la organización.`)
  }

  // 2. Validar código único dentro de la sucursal
  const existingCode = warehouses.find(
    w => w.branch_id === branchId && w.code.toLowerCase() === code.trim().toLowerCase()
  )
  if (existingCode) {
    throw new Error(`DUPLICATE_WAREHOUSE_CODE: Ya existe un depósito con el código "${code}" en esta sucursal.`)
  }

  // Si se marca como default, desmarcar otros defaults de la misma sucursal
  let updatedWarehouses = warehouses
  if (isDefault) {
    updatedWarehouses = warehouses.map(w =>
      w.branch_id === branchId ? { ...w, is_default: false } : w
    )
  }

  const warehouseId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  const newWarehouse = {
    id: warehouseId,
    organization_id: organizationId,
    branch_id: branchId,
    name: name.trim(),
    code: code.trim().toUpperCase(),
    warehouse_type: warehouseType,
    is_default: Boolean(isDefault),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    success: true,
    warehouse: newWarehouse,
    updatedState: {
      ...state,
      warehouses: [...updatedWarehouses, newWarehouse],
    },
  }
}

/**
 * Obtiene los depósitos activos para una sucursal dada con aislamiento multi-tenant.
 */
export function getWarehousesForBranch({ state, organizationId, branchId }) {
  const { warehouses = [] } = state
  return warehouses.filter(
    w => w.organization_id === organizationId &&
         w.branch_id === branchId &&
         w.is_active !== false
  )
}

/**
 * Calcula el stock físico de un insumo dentro de un depósito específico.
 */
export function getWarehouseStock({ state, organizationId, warehouseId, ingredientId }) {
  const { inventoryMovements = [] } = state
  const movements = inventoryMovements.filter(
    m => m.organization_id === organizationId &&
         m.warehouse_id === warehouseId &&
         m.ingredient_id === ingredientId
  )
  return aggregateStockFromMovements(movements, ingredientId)
}
