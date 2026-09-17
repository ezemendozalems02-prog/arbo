// Reglas de ARBO CLUB centralizadas — reutilizadas por el mock de clientes
// (src/mock/customers.js) y por el POS (al confirmar una venta con cliente
// asociado), para no repetir la constante "1 punto cada $100" en dos lugares.
import { CLUB } from '../data/benefits'

export function pointsForAmount(amount) {
  return Math.round(amount / 100)
}

export function tierForPoints(points) {
  return [...CLUB.tiers].sort((a, b) => b.threshold - a.threshold)
    .find(t => points >= t.threshold) ?? CLUB.tiers[0]
}
