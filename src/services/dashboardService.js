// Capa de servicios del Dashboard.
// Hoy lee de Mock Data; cuando conectemos Supabase, solo este archivo
// cambia de implementación — la UI (src/admin/pages/Dashboard.jsx) sigue
// llamando a las mismas funciones con la misma forma de retorno.
import { MOCK_NOW } from '../mock/config'
import { CUSTOMERS_COUNT } from '../mock/customers'
import { ORDERS, ORDER_STATUS_LABELS, getOrdersForDay, getPendingOrders, getTodayOrders } from '../mock/orders'
import { getProductById } from '../mock/products'
import { getReservationsForDay, getTodayReservations, getUpcomingReservations, RESERVATIONS } from '../mock/reservations'

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const today = startOfDay(MOCK_NOW)
const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const isCancelled = (o) => o.status === 'cancelado'

export function getDashboardSummary() {
  const todayOrders = getTodayOrders().filter(o => !isCancelled(o))
  const salesToday = todayOrders.reduce((sum, o) => sum + o.total, 0)
  const ordersToday = todayOrders.length
  const reservationsToday = getTodayReservations().filter(r => r.status !== 'cancelada').length
  const avgTicket = ordersToday > 0 ? Math.round(salesToday / ordersToday) : 0

  return {
    salesToday,
    ordersToday,
    reservationsToday,
    customersTotal: CUSTOMERS_COUNT,
    avgTicket,
  }
}

// Mismo cálculo que getDashboardSummary aplicado al día anterior: alimenta
// las comparaciones "vs ayer" del tablero.
export function getYesterdaySummary() {
  const yesterday = new Date(today.getTime() - 86400000)
  const orders = getOrdersForDay(yesterday).filter(o => !isCancelled(o))
  const sales = orders.reduce((sum, o) => sum + o.total, 0)
  return {
    salesToday: sales,
    ordersToday: orders.length,
    reservationsToday: getReservationsForDay(yesterday).filter(r => r.status !== 'cancelada').length,
    avgTicket: orders.length > 0 ? Math.round(sales / orders.length) : 0,
  }
}

// Ventas de hoy agrupadas por hora de servicio (para el gráfico "ventas por hora").
export function getSalesByHour() {
  const buckets = new Map()
  for (const order of getTodayOrders()) {
    if (isCancelled(order)) continue
    const hour = order.createdAt.getHours()
    buckets.set(hour, (buckets.get(hour) ?? 0) + order.total)
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hour, total]) => ({ hour, label: `${hour}h`, total }))
}

// Ventas de los últimos N días (incluye hoy) para el gráfico "ventas por día".
export function getSalesByLastDays(days = 7) {
  const result = []
  for (let offset = -(days - 1); offset <= 0; offset++) {
    const day = new Date(today.getTime() + offset * 86400000)
    const total = ORDERS
      .filter(o => !isCancelled(o) && startOfDay(o.createdAt).getTime() === day.getTime())
      .reduce((sum, o) => sum + o.total, 0)
    result.push({ date: day, label: DAY_LABELS[day.getDay()], total })
  }
  return result
}

// Productos más vendidos (por cantidad) en los últimos N días.
export function getTopProducts(limit = 5, days = 7) {
  const since = new Date(today.getTime() - (days - 1) * 86400000)
  const totals = new Map()
  for (const order of ORDERS) {
    if (isCancelled(order) || order.createdAt < since) continue
    for (const item of order.items) {
      const entry = totals.get(item.productId) ?? { qty: 0, revenue: 0 }
      entry.qty += item.qty
      entry.revenue += item.qty * item.unitPrice
      totals.set(item.productId, entry)
    }
  }
  return [...totals.entries()]
    .map(([productId, stats]) => ({ product: getProductById(productId), ...stats }))
    .filter(row => row.product)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit)
}

export function getRecentSales(limit = 6) {
  return [...ORDERS]
    .filter(o => !isCancelled(o))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

export function getRecentReservations(limit = 6) {
  return getUpcomingReservations(limit)
}

export function getDashboardPendingOrders(limit = 6) {
  return getPendingOrders()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

// Actividad reciente: solo hechos ya ocurridos (pedidos creados, reservas
// ya pasadas) — nunca reservas futuras, que dominarían el orden por fecha.
export function getRecentActivity(limit = 8) {
  const orderEvents = ORDERS
    .filter(o => o.createdAt <= MOCK_NOW)
    .slice(-40)
    .map(o => ({
      id: `activity-order-${o.id}`,
      type: 'order',
      timestamp: o.createdAt,
      message: `Pedido ${o.id} · ${ORDER_STATUS_LABELS[o.status]} · ${o.customerName}`,
    }))
  const reservationEvents = RESERVATIONS
    .filter(r => r.date <= MOCK_NOW)
    .slice(-20)
    .map(r => ({
      id: `activity-reservation-${r.id}`,
      type: 'reservation',
      timestamp: r.date,
      message: `Reserva de ${r.customerName} · ${r.party} personas · ${r.time}`,
    }))
  return [...orderEvents, ...reservationEvents]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
}
