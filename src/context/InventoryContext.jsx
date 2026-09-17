import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { INVENTORY_ITEMS } from '../mock/inventoryItems'
import { SUPPLIERS } from '../mock/suppliers'
import { RECIPES } from '../mock/recipes'
import { PURCHASES } from '../mock/purchases'
import { WASTE_RECORDS } from '../mock/waste'
import { STOCK_MOVEMENTS } from '../mock/stockMovements'
import { CURRENT_STAFF_NAME } from '../mock/staff'
import { convertQuantity } from '../services/unitService'
import { applyPurchaseReceipt } from '../services/purchaseService'
import { buildAuditEntry } from '../services/auditLogService'

// Estado en vivo del módulo de Inventario/Recetas/Compras/Proveedores/Mermas
// (Fase 4) — mismo patrón que POSContext en Fase 2/3: arranca desde Mock
// Data y persiste sus cambios en localStorage. Cuando exista Supabase, cada
// acción de abajo pasa a llamar a un repositorio real; la UI no cambia.
//
// Nota de alcance (bloque 26): las ventas confirmadas en el POS NO
// descuentan stock automáticamente todavía — el servicio de consumo
// teórico (inventoryConsumptionService) ya está listo y se usa para
// MOSTRAR el consumo/costo de una venta (ver VentaDetail), pero conectarlo
// para mutar stock de verdad queda para cuando la venta viva en Supabase.
const KEY = 'arbo_inventory_v1'
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`

function initialState() {
  return {
    items: INVENTORY_ITEMS,
    suppliers: SUPPLIERS,
    recipes: RECIPES,
    purchases: PURCHASES,
    waste: WASTE_RECORDS,
    movements: STOCK_MOVEMENTS,
    physicalInventories: [],
    auditLog: [],
    purchaseSeq: 2100,
  }
}

const DATE_KEYS = ['updatedAt', 'date', 'receivedAt', 'createdAt', 'countedAt']
function reviveDates(obj) {
  if (Array.isArray(obj)) return obj.map(reviveDates)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      if (DATE_KEYS.includes(k) && typeof v === 'string') out[k] = new Date(v)
      else out[k] = reviveDates(v)
    }
    return out
  }
  return obj
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState()
    return { ...initialState(), ...reviveDates(JSON.parse(raw)) }
  } catch {
    return initialState()
  }
}

const InventoryContext = createContext(null)

export function InventoryProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage unavailable */ }
  }, [state])

  const pushAudit = (s, entry) => ({ ...s, auditLog: [buildAuditEntry({ ...entry, uid }), ...s.auditLog] })

  // ---------- Insumos ----------
  const createInsumo = useCallback((data) => {
    const item = {
      id: uid('ins'), active: true, currentStock: data.currentStock ?? 0, avgCost: data.cost ?? 0, lastCost: data.cost ?? 0,
      updatedAt: new Date(), ...data,
    }
    setState(s => pushAudit({ ...s, items: [...s.items, item] }, { user: CURRENT_STAFF_NAME, action: 'crear', entity: 'insumo', entityId: item.id, before: null, after: item }))
    return item.id
  }, [])

  // BLOQUE 18 — ajuste manual: nunca se toca currentStock directo, siempre
  // queda un movimiento de tipo AJUSTE con motivo.
  const adjustStock = useCallback(({ insumoId, delta, reason, notes, user = CURRENT_STAFF_NAME }) => {
    setState(s => {
      const idx = s.items.findIndex(i => i.id === insumoId)
      if (idx === -1) return s
      const item = s.items[idx]
      const now = new Date()
      const stockBefore = item.currentStock
      const stockAfter = Math.max(0, stockBefore + delta)
      const updatedItem = { ...item, currentStock: stockAfter, updatedAt: now }
      const movement = {
        id: uid('mov'), insumoId, type: 'ajuste', quantity: Math.abs(stockAfter - stockBefore), unit: item.unit,
        stockBefore, stockAfter, reason, user, reference: notes || null, createdAt: now,
      }
      let next = { ...s, items: s.items.map((it, i) => i === idx ? updatedItem : it), movements: [movement, ...s.movements] }
      next = pushAudit(next, { user, action: 'ajuste_stock', entity: 'insumo', entityId: insumoId, before: { currentStock: stockBefore }, after: { currentStock: stockAfter } })
      return next
    })
  }, [])

  // ---------- Proveedores ----------
  const createSupplier = useCallback((data) => {
    const supplier = { id: uid('sup'), status: 'activo', categories: [], ...data }
    setState(s => pushAudit({ ...s, suppliers: [...s.suppliers, supplier] }, { user: CURRENT_STAFF_NAME, action: 'crear', entity: 'proveedor', entityId: supplier.id, before: null, after: supplier }))
    return supplier.id
  }, [])

  // ---------- Recetas ----------
  const createRecipe = useCallback((data) => {
    const recipe = { id: uid('rec'), status: 'activa', ingredients: [], ...data }
    setState(s => pushAudit({ ...s, recipes: [...s.recipes, recipe] }, { user: CURRENT_STAFF_NAME, action: 'crear', entity: 'receta', entityId: recipe.id, before: null, after: recipe }))
    return recipe.id
  }, [])

  const updateRecipe = useCallback((recipeId, patch) => {
    setState(s => ({ ...s, recipes: s.recipes.map(r => r.id === recipeId ? { ...r, ...patch } : r) }))
  }, [])

  // ---------- Compras ----------
  const createPurchase = useCallback((data) => {
    let id
    setState(s => {
      id = uid('pur')
      const purchase = {
        id, number: s.purchaseSeq, date: new Date(), status: 'pendiente', taxRate: 21, notes: '',
        user: CURRENT_STAFF_NAME, receivedAt: null, ...data,
      }
      return pushAudit({ ...s, purchases: [purchase, ...s.purchases], purchaseSeq: s.purchaseSeq + 1 },
        { user: CURRENT_STAFF_NAME, action: 'crear', entity: 'compra', entityId: id, before: null, after: purchase })
    })
    return id
  }, [])

  const receivePurchase = useCallback((purchaseId) => {
    setState(s => {
      const purchase = s.purchases.find(p => p.id === purchaseId)
      if (!purchase || purchase.status === 'recibida' || purchase.status === 'cancelada') return s
      const now = new Date()
      const { updatedItems, movements } = applyPurchaseReceipt(purchase, s.items, { uid, now, user: CURRENT_STAFF_NAME })
      const updatedPurchase = { ...purchase, status: 'recibida', receivedAt: now }
      let next = {
        ...s, items: updatedItems, movements: [...movements, ...s.movements],
        purchases: s.purchases.map(p => p.id === purchaseId ? updatedPurchase : p),
      }
      next = pushAudit(next, { user: CURRENT_STAFF_NAME, action: 'recibir', entity: 'compra', entityId: purchaseId, before: { status: purchase.status }, after: { status: 'recibida' } })
      return next
    })
  }, [])

  const cancelPurchase = useCallback((purchaseId) => {
    setState(s => ({ ...s, purchases: s.purchases.map(p => p.id === purchaseId ? { ...p, status: 'cancelada' } : p) }))
  }, [])

  // ---------- Mermas ----------
  const registerWaste = useCallback(({ insumoId, quantity, unit, reason, notes, user = CURRENT_STAFF_NAME }) => {
    let created = null
    setState(s => {
      const idx = s.items.findIndex(i => i.id === insumoId)
      if (idx === -1) return s
      const item = s.items[idx]
      const now = new Date()
      const qtyInStockUnit = convertQuantity(quantity, unit, item.unit) ?? quantity
      const clampedQty = Math.min(qtyInStockUnit, item.currentStock)
      const stockBefore = item.currentStock
      const stockAfter = Math.max(0, stockBefore - clampedQty)
      const waste = {
        id: uid('waste'), insumoId, quantity: clampedQty, unit: item.unit, reason, notes: notes || '',
        cost: Math.round(clampedQty * item.avgCost), user, status: 'registrada', createdAt: now,
      }
      created = waste
      const movement = {
        id: uid('mov'), insumoId, type: 'merma', quantity: clampedQty, unit: item.unit,
        stockBefore, stockAfter, reason: `Merma: ${reason}`, user, reference: waste.id, createdAt: now,
      }
      return {
        ...s,
        items: s.items.map((it, i) => i === idx ? { ...it, currentStock: stockAfter, updatedAt: now } : it),
        waste: [waste, ...s.waste],
        movements: [movement, ...s.movements],
      }
    })
    return created
  }, [])

  // ---------- Inventario físico ----------
  // BLOQUE 31 — cuenta real por categoría, compara contra sistema y al
  // confirmar genera un movimiento de AJUSTE por cada insumo con diferencia.
  const createPhysicalInventory = useCallback(({ categoryKey, counts, user = CURRENT_STAFF_NAME }) => {
    let created = null
    setState(s => {
      const now = new Date()
      const lines = []
      const updatedItems = [...s.items]
      const newMovements = []

      for (const { insumoId, countedQty } of counts) {
        const idx = updatedItems.findIndex(i => i.id === insumoId)
        if (idx === -1) continue
        const item = updatedItems[idx]
        const diff = countedQty - item.currentStock
        lines.push({ insumoId, systemQty: item.currentStock, countedQty, diff, valueDiff: diff * item.avgCost })
        if (diff !== 0) {
          newMovements.push({
            id: uid('mov'), insumoId, type: 'ajuste', quantity: Math.abs(diff), unit: item.unit,
            stockBefore: item.currentStock, stockAfter: countedQty, reason: 'Ajuste por inventario físico', user, reference: null, createdAt: now,
          })
          updatedItems[idx] = { ...item, currentStock: countedQty, updatedAt: now }
        }
      }

      const physicalInventory = { id: uid('phys'), categoryKey, countedAt: now, user, lines }
      created = physicalInventory
      return {
        ...s, items: updatedItems, movements: [...newMovements, ...s.movements],
        physicalInventories: [physicalInventory, ...s.physicalInventories],
      }
    })
    return created
  }, [])

  const value = {
    items: state.items,
    suppliers: state.suppliers,
    recipes: state.recipes,
    purchases: state.purchases,
    waste: state.waste,
    movements: state.movements,
    physicalInventories: state.physicalInventories,
    auditLog: state.auditLog,
    createInsumo, adjustStock, createSupplier, createRecipe, updateRecipe,
    createPurchase, receivePurchase, cancelPurchase, registerWaste, createPhysicalInventory,
    getItemById: (id) => state.items.find(i => i.id === id) ?? null,
    getSupplierById: (id) => state.suppliers.find(s => s.id === id) ?? null,
    getRecipeById: (id) => state.recipes.find(r => r.id === id) ?? null,
    getRecipeByProductId: (productId) => state.recipes.find(r => r.productId === productId) ?? null,
    getPurchaseById: (id) => state.purchases.find(p => p.id === id) ?? null,
    getWasteById: (id) => state.waste.find(w => w.id === id) ?? null,
  }

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook vive junto a su Provider a propósito
export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory debe usarse dentro de <InventoryProvider>')
  return ctx
}
