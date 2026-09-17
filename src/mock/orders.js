// Pedidos/ventas mock — el eslabón central de la cadena
// Producto -> POS -> Pedido -> Comanda -> Cocina -> Venta.
// Cada línea de pedido referencia un producto real de src/mock/products.js
// (a su vez la misma carta pública), nunca un total inventado a mano.
// Reutiliza el vocabulario de src/pages/Pedidos.jsx (delivery/retiro) y
// suma "salon" para consumo en mesa, propio del panel administrativo.
import { createRng, MOCK_NOW } from './config'
import { CUSTOMERS } from './customers'
import { PRODUCTS } from './products'

export const ORDER_STATUSES = ['recibido', 'aceptado', 'en_preparacion', 'listo', 'enviado', 'entregado', 'cancelado']
export const ORDER_STATUS_LABELS = {
  recibido: 'Recibido',
  aceptado: 'Aceptado',
  en_preparacion: 'En preparación',
  listo: 'Listo',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}
export const PENDING_STATUSES = ['recibido', 'aceptado', 'en_preparacion', 'listo', 'enviado']
export const PAYMENT_METHODS = ['efectivo', 'tarjeta', 'mercado_pago', 'transferencia']
export const CHANNELS = ['salon', 'delivery', 'retiro']

const rng = createRng(4242)
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const today = startOfDay(MOCK_NOW)

// Curva horaria de un día de servicio: desayuno, almuerzo, merienda y cena.
const HOUR_WEIGHTS = [
  [8, 2], [9, 4], [10, 3], [11, 2],
  [12, 5], [13, 7], [14, 4],
  [16, 3], [17, 4], [18, 3],
  [19, 5], [20, 8], [21, 6], [22, 2],
]
const HOUR_POOL = HOUR_WEIGHTS.flatMap(([hour, weight]) => Array(weight).fill(hour))

function pick(arr) { return arr[Math.floor(rng() * arr.length)] }

function buildLineItems() {
  const lineCount = 1 + Math.floor(rng() * 3)
  const items = []
  for (let i = 0; i < lineCount; i++) {
    const product = pick(PRODUCTS)
    const qty = 1 + (rng() < 0.25 ? 1 : 0)
    const existing = items.find(it => it.productId === product.id)
    if (existing) { existing.qty += qty; continue }
    items.push({ productId: product.id, name: product.name, unitPrice: product.price, qty })
  }
  return items
}

function statusForOrder(dayOffset, hour) {
  if (dayOffset < 0) return rng() < 0.06 ? 'cancelado' : 'entregado'
  // Hoy: cuanto más reciente la hora vs. MOCK_NOW, más probable que siga en curso.
  const hoursAgo = (MOCK_NOW.getHours() * 60 + MOCK_NOW.getMinutes()) / 60 - hour
  if (hoursAgo > 2) return rng() < 0.05 ? 'cancelado' : 'entregado'
  if (hoursAgo > 1) return pick(['listo', 'enviado', 'entregado', 'entregado'])
  if (hoursAgo > 0.33) return pick(['aceptado', 'en_preparacion', 'listo'])
  return pick(['recibido', 'aceptado'])
}

let seq = 1000
function buildOrder(dayOffset) {
  // Para "hoy" nunca generamos pedidos en horas futuras respecto de MOCK_NOW.
  const pool = dayOffset === 0 ? HOUR_POOL.filter(h => h <= MOCK_NOW.getHours()) : HOUR_POOL
  const hour = pick(pool.length ? pool : [MOCK_NOW.getHours()])
  const minute = dayOffset === 0 && hour === MOCK_NOW.getHours()
    ? Math.floor(rng() * (MOCK_NOW.getMinutes() + 1))
    : Math.floor(rng() * 60)
  const createdAt = new Date(today.getTime() + dayOffset * 86400000)
  createdAt.setHours(hour, minute, 0, 0)

  const items = buildLineItems()
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.qty, 0)
  const discount = rng() < 0.12 ? Math.round(subtotal * 0.1) : 0
  const channel = pick(CHANNELS)
  const total = subtotal - discount + (channel === 'delivery' ? 1500 : 0)
  const hasCustomer = rng() < 0.55
  const customer = hasCustomer ? pick(CUSTOMERS) : null

  return {
    id: `ARBO-${seq++}`,
    createdAt,
    channel,
    tableNumber: channel === 'salon' ? 1 + Math.floor(rng() * 14) : null,
    customerId: customer?.id ?? null,
    customerName: customer?.name ?? 'Cliente mostrador',
    items,
    subtotal,
    discount,
    total,
    paymentMethod: pick(PAYMENT_METHODS),
    status: statusForOrder(dayOffset, hour),
  }
}

function ordersForDay(dayOffset, count) {
  return Array.from({ length: count }, () => buildOrder(dayOffset))
}

export const ORDERS = [
  ...ordersForDay(-6, 34),
  ...ordersForDay(-5, 31),
  ...ordersForDay(-4, 36),
  ...ordersForDay(-3, 29),
  ...ordersForDay(-2, 40),
  ...ordersForDay(-1, 37),
  ...ordersForDay(0, 38),
].sort((a, b) => a.createdAt - b.createdAt)

export function getOrdersForDay(date) {
  const day = startOfDay(date).getTime()
  return ORDERS.filter(o => startOfDay(o.createdAt).getTime() === day)
}

export function getTodayOrders() {
  return getOrdersForDay(today)
}

export function getPendingOrders() {
  return ORDERS.filter(o => PENDING_STATUSES.includes(o.status))
}
