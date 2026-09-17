// Automatizaciones — Fase 5, bloque 26-31. Cada "ejecución" es una
// simulación: calcula qué clientes matchean el trigger/condición y arma un
// log, pero nunca dispara un envío ni una acción real (bloque 28).
import { ORDERS } from '../mock/orders'
import { REDEMPTIONS } from '../mock/redemptions'

const dayMs = 86400000
const daysBetween = (a, b) => Math.max(0, Math.round((a - b) / dayMs))

function hasOrderWithinDays(customerId, now, days) {
  return ORDERS.some(o => o.customerId === customerId && daysBetween(now, o.createdAt) <= days)
}

function hasRedemptionWithinDays(customerId, now, days) {
  return REDEMPTIONS.some(r => r.customerId === customerId && daysBetween(now, r.createdAt) <= days)
}

function isBirthdaySoon(customer, now, withinDays = 30) {
  const next = new Date(now.getFullYear(), customer.birthDate.getMonth(), customer.birthDate.getDate())
  if (next < now) next.setFullYear(now.getFullYear() + 1)
  return daysBetween(next, now) <= withinDays
}

// Cada regla es una aproximación demostrable con el mock disponible — se
// documenta la suposición en vez de simularla con datos inventados sueltos.
const MATCHERS = {
  CUSTOMER_CREATED: (c, now) => daysBetween(now, c.createdAt) <= 7,
  FIRST_PURCHASE: (c) => c.orders === 1,
  RESERVATION_COMPLETED: (c) => c.reservations >= 1,
  BIRTHDAY: (c, now) => isBirthdaySoon(c, now),
  CUSTOMER_INACTIVE: (c, now, condition) => daysBetween(now, c.lastActivity) >= (condition?.days ?? 30),
  REWARD_UNLOCKED: (c) => c.points >= 800,
  POINTS_EXPIRING: (c) => c.points >= 300,
  REWARD_REDEEMED: (c, now) => hasRedemptionWithinDays(c.id, now, 7),
  PURCHASE_COMPLETED: (c, now) => hasOrderWithinDays(c.id, now, 3),
}

export function getMatchingCustomers(automation, customers, { now }) {
  const matcher = MATCHERS[automation.trigger]
  if (!matcher) return []
  return customers.filter(c => matcher(c, now, automation.condition))
}

export function simulateRun(automation, customers, { now, uid }) {
  const matches = getMatchingCustomers(automation, customers, { now })
  return {
    id: uid('run'), automationId: automation.id, at: now,
    matchedCount: matches.length, sample: matches.slice(0, 5).map(c => c.name),
  }
}
