// Clientes mock — base para CRM, Dashboard y (a futuro) ARBO CLUB.
// Los niveles reutilizan los umbrales reales de ARBO CLUB (src/data/benefits.js)
// en vez de inventar una escala nueva para el panel administrativo.
import { createRng, MOCK_NOW } from './config'
import { pointsForAmount, tierForPoints } from '../services/loyaltyService'

const FIRST_NAMES = [
  'Martín', 'Sofía', 'Lucas', 'Valentina', 'Mateo', 'Camila', 'Tomás', 'Julieta',
  'Nicolás', 'Agustina', 'Franco', 'Micaela', 'Bruno', 'Delfina', 'Ignacio', 'Renata',
  'Santiago', 'Catalina', 'Joaquín', 'Emilia',
]
const LAST_NAMES = [
  'Pérez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Romero', 'Sosa',
  'Álvarez', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Molina',
  'Silva', 'Ríos', 'Castro', 'Vega',
]

const TOTAL_CUSTOMERS = 126

const rng = createRng(2026)

export const CUSTOMERS = Array.from({ length: TOTAL_CUSTOMERS }, (_, i) => {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length]
  const lastName = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length]
  const visits = 1 + Math.floor(rng() * 44)
  const avgTicket = 5000 + Math.floor(rng() * 9000)
  const totalSpent = visits * avgTicket
  const points = pointsForAmount(totalSpent)
  const daysSinceLastVisit = Math.floor(rng() * 40)
  const lastActivity = new Date(MOCK_NOW.getTime() - daysSinceLastVisit * 86400000)
  // Fase 5 (bloque 30/38) — fecha de nacimiento determinística, solo mes/día
  // relevantes (la automatización de cumpleaños no depende del año). El año
  // es de relleno para tener un Date válido, no se usa para calcular edad.
  const birthMonth = Math.floor(rng() * 12)
  const birthDay = 1 + Math.floor(rng() * 28)
  const birthDate = new Date(1990, birthMonth, birthDay)
  const daysSinceAlta = visits * (4 + Math.floor(rng() * 10))
  const createdAt = new Date(MOCK_NOW.getTime() - daysSinceAlta * 86400000)

  return {
    id: `cli-${i + 1}`,
    name: `${firstName} ${lastName}`,
    phone: `+54 9 2945 ${String(400000 + i * 137).slice(0, 6)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    birthDate,
    createdAt,
    visits,
    orders: Math.max(1, Math.round(visits * 0.62)),
    reservations: Math.round(visits * 0.2),
    totalSpent,
    avgTicket,
    points,
    tier: tierForPoints(points),
    lastActivity,
  }
})

export function getCustomerById(id) {
  return CUSTOMERS.find(c => c.id === id)
}

export const CUSTOMERS_COUNT = CUSTOMERS.length
