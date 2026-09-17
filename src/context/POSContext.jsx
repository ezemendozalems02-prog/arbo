import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { INITIAL_TABLES } from '../mock/tables'
import { getCustomerById } from '../mock/customers'
import { PAYMENT_METHODS } from '../mock/orders'
import { CURRENT_STAFF_NAME } from '../mock/staff'
import { calcCashDifference, calcCashSummary } from '../services/cashCalculations'
import { calcOrderTotals, modifiersSignature } from '../services/salesCalculations'
import { pointsForAmount, tierForPoints } from '../services/loyaltyService'
import { buildTicketsFromOrder, calcOrderKitchenStatus } from '../services/kitchenService'

// Estado en vivo de la operación de salón (mesas, órdenes abiertas, ventas,
// caja). Fase 2 sigue sin Supabase: este contexto ES la "base de datos" de
// la demo, persistida en localStorage. El día de mañana, cada función de
// abajo (openTable, confirmSale, closeCashRegister...) pasa a llamar a
// Supabase en vez de mutar este estado — la UI que las consume no cambia.
const KEY = 'arbo_pos_v1'
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`

function initialState() {
  return {
    tables: INITIAL_TABLES,
    orders: {},
    sales: [],
    tickets: {},
    cash: { status: 'cerrada', openedAt: null, closedAt: null, initialAmount: 0, movements: [], lastClosing: null },
    customerAdjustments: {},
    saleSeq: 1,
    orderSeq: 1,
  }
}

const DATE_KEYS = ['createdAt', 'openedAt', 'closedAt', 'sentAt', 'startedAt', 'readyAt', 'deliveredAt', 'cancelledAt']
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

const POSContext = createContext(null)

export function POSProvider({ children }) {
  const [state, setState] = useState(load)
  const [counterOrderId, setCounterOrderId] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage unavailable */ }
  }, [state])

  // ---------- Caja ----------
  const openCashRegister = useCallback((initialAmount) => {
    setState(s => ({
      ...s,
      cash: { ...s.cash, status: 'abierta', openedAt: new Date(), closedAt: null, initialAmount, movements: [] },
    }))
  }, [])

  const registerCashMovement = useCallback(({ type, amount, concept }) => {
    setState(s => ({
      ...s,
      cash: { ...s.cash, movements: [...s.cash.movements, { id: uid('mov'), type, amount, concept, createdAt: new Date() }] },
    }))
  }, [])

  const closeCashRegister = useCallback((declaredCash) => {
    setState(s => {
      const summary = calcCashSummary(s.cash)
      const diff = calcCashDifference(summary.expectedCash, declaredCash)
      return {
        ...s,
        cash: {
          ...s.cash,
          status: 'cerrada',
          closedAt: new Date(),
          lastClosing: { expectedCash: summary.expectedCash, declaredCash, diff, closedAt: new Date() },
        },
      }
    })
  }, [])

  // ---------- Mesas / órdenes ----------
  const createOrder = useCallback(({ tableId, tableNumber, customerId, customerName, partySize }) => {
    const orderId = uid('order')
    setState(s => {
      const order = {
        id: orderId, number: s.orderSeq, tableId: tableId ?? null, tableNumber: tableNumber ?? null,
        customerId: customerId ?? null, customerName: customerName ?? null, partySize: partySize ?? null,
        items: [], discount: null, createdAt: new Date(), ticketIds: [], ticketSeq: 0,
      }
      return { ...s, orders: { ...s.orders, [orderId]: order }, orderSeq: s.orderSeq + 1 }
    })
    return orderId
  }, [])

  const openTable = useCallback((tableId, { customerId, customerName, partySize } = {}) => {
    const orderId = uid('order')
    setState(s => {
      const table = s.tables.find(t => t.id === tableId)
      if (!table) return s
      const order = {
        id: orderId, number: s.orderSeq, tableId, tableNumber: table.number,
        customerId: customerId ?? null, customerName: customerName ?? null, partySize: partySize ?? null,
        items: [], discount: null, createdAt: new Date(), ticketIds: [], ticketSeq: 0,
      }
      return {
        ...s,
        orders: { ...s.orders, [orderId]: order },
        orderSeq: s.orderSeq + 1,
        tables: s.tables.map(t => t.id === tableId ? { ...t, status: 'ocupada', orderId } : t),
      }
    })
    return orderId
  }, [])

  const startCounterOrder = useCallback(() => {
    const id = createOrder({})
    setCounterOrderId(id)
    return id
  }, [createOrder])

  const addItemToOrder = useCallback((orderId, product, modifiers = []) => {
    const signature = modifiersSignature(modifiers)
    setState(s => {
      const order = s.orders[orderId]
      if (!order) return s
      const existing = order.items.find(it => it.productId === product.id && it.signature === signature)
      const items = existing
        ? order.items.map(it => it === existing ? { ...it, quantity: it.quantity + 1 } : it)
        : [...order.items, {
            id: uid('item'), productId: product.id, name: product.name, unitPrice: product.price,
            modifiers, signature, quantity: 1, sentQty: 0,
          }]
      return { ...s, orders: { ...s.orders, [orderId]: { ...order, items } } }
    })
  }, [])

  // BLOQUE 27/40: una línea ya enviada a cocina (item.sentQty > 0) no puede
  // bajar de esa cantidad ni desaparecer en silencio — la única forma de
  // "sacarla" es cancelar la comanda que la contiene. Clampeamos acá para
  // que ningún llamador (steppers, botón eliminar) pueda saltarse la regla.
  const updateItemQuantity = useCallback((orderId, itemId, quantity) => {
    setState(s => {
      const order = s.orders[orderId]
      if (!order) return s
      const target = order.items.find(it => it.id === itemId)
      if (!target) return s
      const floor = target.sentQty ?? 0
      if (floor > 0) {
        const clamped = Math.max(quantity, floor)
        return { ...s, orders: { ...s.orders, [orderId]: { ...order, items: order.items.map(it => it.id === itemId ? { ...it, quantity: clamped } : it) } } }
      }
      const items = quantity <= 0
        ? order.items.filter(it => it.id !== itemId)
        : order.items.map(it => it.id === itemId ? { ...it, quantity } : it)
      return { ...s, orders: { ...s.orders, [orderId]: { ...order, items } } }
    })
  }, [])

  const removeItem = useCallback((orderId, itemId) => {
    setState(s => {
      const order = s.orders[orderId]
      if (!order) return s
      const target = order.items.find(it => it.id === itemId)
      if (target && (target.sentQty ?? 0) > 0) return s
      return { ...s, orders: { ...s.orders, [orderId]: { ...order, items: order.items.filter(it => it.id !== itemId) } } }
    })
  }, [])

  const setOrderDiscount = useCallback((orderId, discount) => {
    setState(s => {
      const order = s.orders[orderId]
      if (!order) return s
      return { ...s, orders: { ...s.orders, [orderId]: { ...order, discount } } }
    })
  }, [])

  const setOrderCustomer = useCallback((orderId, customerId) => {
    const customer = customerId ? getCustomerById(customerId) : null
    setState(s => {
      const order = s.orders[orderId]
      if (!order) return s
      return { ...s, orders: { ...s.orders, [orderId]: { ...order, customerId: customer?.id ?? null, customerName: customer?.name ?? null } } }
    })
  }, [])

  const startPayment = useCallback((tableId) => {
    if (!tableId) return
    setState(s => ({ ...s, tables: s.tables.map(t => t.id === tableId ? { ...t, status: 'pago_pendiente' } : t) }))
  }, [])

  const cancelOrder = useCallback((orderId) => {
    setState(s => {
      const order = s.orders[orderId]
      if (!order) return s
      const { [orderId]: _discard, ...rest } = s.orders
      // Cancelar la orden entera no debe dejar comandas "vivas" huérfanas
      // en los tableros de cocina/bar (bloque 23): las que ya se enviaron
      // y no están entregadas pasan a CANCELLED también.
      const now = new Date()
      const tickets = { ...s.tickets }
      for (const ticketId of order.ticketIds ?? []) {
        const t = tickets[ticketId]
        if (t && t.status !== 'DELIVERED' && t.status !== 'CANCELLED') {
          tickets[ticketId] = { ...t, status: 'CANCELLED', cancelledAt: now, cancelledBy: CURRENT_STAFF_NAME, cancelReason: 'Orden cancelada' }
        }
      }
      return {
        ...s,
        orders: rest,
        tickets,
        tables: order.tableId
          ? s.tables.map(t => t.id === order.tableId ? { ...t, status: 'libre', orderId: null } : t)
          : s.tables,
      }
    })
    if (orderId === counterOrderId) setCounterOrderId(null)
  }, [counterOrderId])

  // ---------- Comandas / KDS ----------
  // BLOQUE 4/6 — enviar comanda crea Y envía en el mismo paso (ver
  // kitchenConfig.js: por eso no hay estado DRAFT). Solo lo pendiente de
  // enviar (buildPendingTicketItems) genera comandas nuevas.
  const sendKitchenTickets = useCallback((orderId) => {
    let created = []
    setState(s => {
      const order = s.orders[orderId]
      if (!order) return s
      const now = new Date()
      let letterCode = order.ticketSeq ?? 0
      const nextLetter = () => String.fromCharCode(65 + letterCode++)
      const newTickets = buildTicketsFromOrder(order, { uid, now, createdBy: CURRENT_STAFF_NAME, nextLetter })
      if (newTickets.length === 0) return s
      created = newTickets

      const sentItems = order.items.map(it => ({ ...it, sentQty: it.quantity }))
      const updatedOrder = { ...order, items: sentItems, ticketSeq: letterCode, ticketIds: [...order.ticketIds, ...newTickets.map(t => t.id)] }
      const tickets = { ...s.tickets }
      for (const t of newTickets) tickets[t.id] = t

      return { ...s, orders: { ...s.orders, [orderId]: updatedOrder }, tickets }
    })
    return created
  }, [])

  const takeTicket = useCallback((ticketId) => {
    setState(s => {
      const t = s.tickets[ticketId]
      if (!t || t.status !== 'SENT') return s
      return { ...s, tickets: { ...s.tickets, [ticketId]: { ...t, status: 'PREPARING', startedAt: new Date(), startedBy: CURRENT_STAFF_NAME } } }
    })
  }, [])

  const readyTicket = useCallback((ticketId) => {
    setState(s => {
      const t = s.tickets[ticketId]
      if (!t || t.status !== 'PREPARING') return s
      return { ...s, tickets: { ...s.tickets, [ticketId]: { ...t, status: 'READY', readyAt: new Date(), completedBy: CURRENT_STAFF_NAME } } }
    })
  }, [])

  const deliverTicket = useCallback((ticketId) => {
    setState(s => {
      const t = s.tickets[ticketId]
      if (!t || t.status !== 'READY') return s
      return { ...s, tickets: { ...s.tickets, [ticketId]: { ...t, status: 'DELIVERED', deliveredAt: new Date() } } }
    })
  }, [])

  const cancelTicket = useCallback((ticketId, reason) => {
    setState(s => {
      const t = s.tickets[ticketId]
      if (!t || t.status === 'DELIVERED' || t.status === 'CANCELLED') return s
      return { ...s, tickets: { ...s.tickets, [ticketId]: { ...t, status: 'CANCELLED', cancelledAt: new Date(), cancelledBy: CURRENT_STAFF_NAME, cancelReason: reason || 'Sin motivo especificado' } } }
    })
  }, [])

  // BLOQUE 24 — sin hardware real: solo feedback simulado + registro de la
  // acción en la propia comanda (útil para el detalle/historial).
  const reprintTicket = useCallback((ticketId) => {
    setState(s => {
      const t = s.tickets[ticketId]
      if (!t) return s
      return { ...s, tickets: { ...s.tickets, [ticketId]: { ...t, reprints: (t.reprints ?? 0) + 1 } } }
    })
  }, [])

  const confirmSale = useCallback((orderId, { paymentMethod, cashReceived, split } = {}) => {
    let createdSale = null
    setState(s => {
      const order = s.orders[orderId]
      if (!order || order.items.length === 0) return s
      const { subtotal, discountAmount, total } = calcOrderTotals(order)
      const loyaltyPointsEarned = order.customerId ? pointsForAmount(total) : 0

      const sale = {
        id: uid('sale'), number: s.saleSeq,
        tableId: order.tableId, tableNumber: order.tableNumber,
        customerId: order.customerId, customerName: order.customerName,
        items: order.items, subtotal, discount: order.discount, discountAmount, total,
        paymentMethod, paymentStatus: 'aprobado',
        cashReceived: paymentMethod === 'efectivo' ? cashReceived : null,
        changeGiven: paymentMethod === 'efectivo' ? Math.max(cashReceived - total, 0) : null,
        split: split ?? null,
        loyaltyPointsEarned,
        createdAt: new Date(),
      }
      createdSale = sale

      const { [orderId]: _discard, ...remainingOrders } = s.orders
      const cashOpen = s.cash.status === 'abierta'
      const movements = cashOpen
        ? [...s.cash.movements, { id: uid('mov'), type: 'venta', amount: total, method: paymentMethod, concept: `Venta ${sale.tableNumber ? `Mesa ${sale.tableNumber}` : 'Mostrador'}`, createdAt: new Date() }]
        : s.cash.movements

      return {
        ...s,
        orders: remainingOrders,
        sales: [...s.sales, sale],
        saleSeq: s.saleSeq + 1,
        cash: { ...s.cash, movements },
        tables: order.tableId
          ? s.tables.map(t => t.id === order.tableId ? { ...t, status: 'libre', orderId: null } : t)
          : s.tables,
        customerAdjustments: order.customerId
          ? { ...s.customerAdjustments, [order.customerId]: (s.customerAdjustments[order.customerId] ?? 0) + loyaltyPointsEarned }
          : s.customerAdjustments,
      }
    })
    if (orderId === counterOrderId) setCounterOrderId(null)
    return createdSale
  }, [counterOrderId])

  const getCustomerWithLivePoints = useCallback((customerId) => {
    const base = getCustomerById(customerId)
    if (!base) return null
    const delta = state.customerAdjustments[customerId] ?? 0
    const points = base.points + delta
    return { ...base, points, tier: tierForPoints(points) }
  }, [state.customerAdjustments])

  const ticketList = Object.values(state.tickets)

  const value = {
    tables: state.tables,
    orders: state.orders,
    sales: state.sales,
    tickets: ticketList,
    cash: state.cash,
    counterOrderId,
    paymentMethods: PAYMENT_METHODS,
    openCashRegister, registerCashMovement, closeCashRegister,
    openTable, startCounterOrder, addItemToOrder, updateItemQuantity, removeItem,
    setOrderDiscount, setOrderCustomer, startPayment, cancelOrder, confirmSale,
    sendKitchenTickets, takeTicket, readyTicket, deliverTicket, cancelTicket, reprintTicket,
    getCustomerWithLivePoints,
    getOrder: (orderId) => state.orders[orderId] ?? null,
    getTable: (tableId) => state.tables.find(t => t.id === tableId) ?? null,
    getSaleById: (id) => state.sales.find(s => s.id === id) ?? null,
    getTicketById: (id) => state.tickets[id] ?? null,
    getTicketsForOrder: (orderId) => ticketList.filter(t => t.orderId === orderId),
    getOrderKitchenStatus: (orderId) => calcOrderKitchenStatus(ticketList.filter(t => t.orderId === orderId)),
    cashSummary: calcCashSummary(state.cash),
  }

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook vive junto a su Provider a propósito
export function usePOS() {
  const ctx = useContext(POSContext)
  if (!ctx) throw new Error('usePOS debe usarse dentro de <POSProvider>')
  return ctx
}
