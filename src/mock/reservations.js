// Reservas mock — mismo vocabulario que el flujo público (src/pages/Reservas.jsx):
// horarios, tamaños de mesa y tipo de ubicación. El panel administrativo no
// inventa un modelo de datos paralelo, lo reutiliza y le agrega estado de gestión.
import { createRng, MOCK_NOW } from './config'
import { CUSTOMERS } from './customers'

const TIMES = ['12:30', '13:00', '13:30', '19:30', '20:00', '20:30', '21:00']
const TABLE_TYPES = ['interior', 'ventana', 'exterior']
export const RESERVATION_STATUSES = ['pendiente', 'confirmada', 'cancelada']

const rng = createRng(777)
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const today = startOfDay(MOCK_NOW)

function buildReservation(i, dayOffset) {
  const date = new Date(today.getTime() + dayOffset * 86400000)
  const time = TIMES[Math.floor(rng() * TIMES.length)]
  const [hour, minute] = time.split(':').map(Number)
  const dateTime = new Date(date.getTime())
  dateTime.setHours(hour, minute, 0, 0)
  const customer = CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)]
  const party = 1 + Math.floor(rng() * 7)
  const isPast = dateTime.getTime() < MOCK_NOW.getTime()
  const status = isPast
    ? (rng() < 0.85 ? 'confirmada' : 'cancelada')
    : (rng() < 0.15 ? 'cancelada' : rng() < 0.55 ? 'confirmada' : 'pendiente')

  return {
    id: `res-${i + 1}`,
    customerId: customer.id,
    customerName: customer.name,
    date: dateTime,
    time,
    party,
    tableType: TABLE_TYPES[Math.floor(rng() * TABLE_TYPES.length)],
    tableNumber: 1 + Math.floor(rng() * 14),
    status,
  }
}

export const RESERVATIONS = [
  // últimos 5 días
  ...Array.from({ length: 22 }, (_, i) => buildReservation(i, -1 - Math.floor(i / 5))),
  // hoy
  ...Array.from({ length: 17 }, (_, i) => buildReservation(100 + i, 0)),
  // próximos 6 días
  ...Array.from({ length: 24 }, (_, i) => buildReservation(200 + i, 1 + Math.floor(i / 4))),
].sort((a, b) => a.date - b.date)

export function getReservationsForDay(date) {
  const day = startOfDay(date).getTime()
  return RESERVATIONS.filter(r => startOfDay(r.date).getTime() === day)
}

export function getTodayReservations() {
  return getReservationsForDay(today)
}

export function getUpcomingReservations(limit = 5) {
  return RESERVATIONS
    .filter(r => r.status !== 'cancelada' && r.date.getTime() >= MOCK_NOW.getTime())
    .slice(0, limit)
}
