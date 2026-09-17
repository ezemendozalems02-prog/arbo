// Toda la lógica de comandas vive acá — igual que salesCalculations.js
// centraliza la plata, esto centraliza el pase ORDEN -> COMANDA -> SECTOR.
// Funciones puras: reciben datos, devuelven datos, no tocan el contexto.
import { getProductById } from '../mock/products'
import { getElapsedStatus } from '../mock/kitchenConfig'

// BLOQUE 28 — splitOrderByStation(): agrupa líneas de pedido por sector.
// Recibe líneas ya "pendientes de enviar" (ver buildPendingTicketItems) y
// devuelve un objeto { [station]: item[] }.
export function splitOrderByStation(items) {
  const byStation = {}
  for (const item of items) {
    if (item.quantity <= 0) continue
    const product = getProductById(item.productId)
    const station = product?.station ?? 'cocina'
    if (!byStation[station]) byStation[station] = []
    byStation[station].push(item)
  }
  return byStation
}

// BLOQUE 25/26/40 — una comanda ya enviada no se toca. Lo que se puede
// enviar de nuevo es la diferencia entre la cantidad actual de la línea y
// lo que ya se mandó de esa misma línea (item.sentQty). Esto es lo que
// permite que "agregar 1 Flat White más" genere una comanda nueva en vez de
// mutar la que ya está en cocina.
export function buildPendingTicketItems(order) {
  return order.items
    .map(item => ({ ...item, quantity: item.quantity - (item.sentQty ?? 0) }))
    .filter(item => item.quantity > 0)
}

// BLOQUE 29 — 1 ORDER -> N COMMANDS. Arma un ticket por sector a partir de
// lo pendiente de una orden. `nextLetter` es una función que devuelve la
// siguiente letra de comanda para esa orden (A, B, C...) — se le pasa desde
// afuera porque el contexto es quien lleva la secuencia por orden.
export function buildTicketsFromOrder(order, { uid, now, createdBy, nextLetter }) {
  const pending = buildPendingTicketItems(order)
  const byStation = splitOrderByStation(pending)
  return Object.entries(byStation).map(([station, items]) => ({
    id: uid('ticket'),
    code: `${order.number}-${nextLetter()}`,
    orderId: order.id,
    orderNumber: order.number,
    tableId: order.tableId,
    tableNumber: order.tableNumber,
    station,
    items: items.map(item => ({
      id: uid('tix'), productId: item.productId, name: item.name,
      quantity: item.quantity, modifiers: item.modifiers, notes: item.notes ?? null,
    })),
    status: 'SENT',
    priority: 'normal',
    createdAt: now, sentAt: now, startedAt: null, readyAt: null, deliveredAt: null, cancelledAt: null,
    createdBy, startedBy: null, completedBy: null, cancelledBy: null, cancelReason: null,
    reprints: 0,
  }))
}

// BLOQUE 13/14 — estado general de la orden a partir de sus comandas
// activas (una cancelada no cuenta para "está todo listo").
export function calcOrderKitchenStatus(tickets) {
  const active = tickets.filter(t => t.status !== 'CANCELLED')
  if (active.length === 0) return 'sin_enviar'
  if (active.every(t => t.status === 'DELIVERED')) return 'entregada'
  if (active.every(t => t.status === 'READY' || t.status === 'DELIVERED')) return 'lista'
  if (active.some(t => t.status === 'PREPARING' || t.status === 'READY' || t.status === 'DELIVERED')) return 'en_preparacion'
  return 'enviada'
}

export function calcElapsedMs(ticket, now = new Date()) {
  const from = ticket.sentAt ?? ticket.createdAt
  const until = ticket.status === 'READY' || ticket.status === 'DELIVERED' ? (ticket.readyAt ?? now) : now
  return Math.max(0, until - from)
}

export function calcPrepMs(ticket) {
  if (!ticket.startedAt || !ticket.readyAt) return null
  return Math.max(0, ticket.readyAt - ticket.startedAt)
}

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export function ticketElapsedStatus(ticket, now = new Date()) {
  if (ticket.status === 'READY' || ticket.status === 'DELIVERED' || ticket.status === 'CANCELLED') return 'NORMAL'
  return getElapsedStatus(calcElapsedMs(ticket, now))
}

// BLOQUE 31/32 — métricas simples a partir de las comandas del día.
export function calcKitchenMetrics(tickets, now = new Date()) {
  const active = tickets.filter(t => t.status !== 'CANCELLED')
  const pending = active.filter(t => t.status === 'SENT').length
  const preparing = active.filter(t => t.status === 'PREPARING').length
  const ready = active.filter(t => t.status === 'READY').length
  const delayed = active.filter(t => ticketElapsedStatus(t, now) === 'DELAYED').length
  const prepTimes = active.map(calcPrepMs).filter(ms => ms != null)
  const avgPrepMs = prepTimes.length ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length : 0

  const byStation = {}
  for (const t of active) {
    if (!byStation[t.station]) byStation[t.station] = { count: 0, prepTimes: [] }
    byStation[t.station].count += 1
    const prep = calcPrepMs(t)
    if (prep != null) byStation[t.station].prepTimes.push(prep)
  }
  const stationSummary = Object.fromEntries(
    Object.entries(byStation).map(([station, s]) => [station, {
      count: s.count,
      avgPrepMs: s.prepTimes.length ? s.prepTimes.reduce((a, b) => a + b, 0) / s.prepTimes.length : 0,
    }])
  )

  return { total: active.length, pending, preparing, ready, delayed, avgPrepMs, byStation: stationSummary }
}
