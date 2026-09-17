// Historial de canjes de beneficios ARBO CLUB — Fase 5, bloque 15/16.
// Cada canje descuenta puntos reales del cliente: src/mock/loyaltyTransactions.js
// lee este array para construir el libro mayor de puntos de forma consistente
// (nunca se inventan dos verdades distintas del saldo de un cliente).
import { createRng, MOCK_NOW } from './config'
import { CUSTOMERS } from './customers'
import { REWARDS } from './rewards'

export const REDEMPTION_STATUSES = ['pendiente', 'utilizado', 'vencido', 'cancelado']

const rng = createRng(8181)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function genCode() {
  let s = ''
  for (let i = 0; i < 5; i++) s += CODE_CHARS[Math.floor(rng() * CODE_CHARS.length)]
  return `ARBO-${s}`
}

const TARGET_COUNT = 38
const eligibleCustomers = CUSTOMERS.filter(c => c.points >= 150)

export const REDEMPTIONS = Array.from({ length: TARGET_COUNT }, (_, i) => {
  const customer = eligibleCustomers[Math.floor(rng() * eligibleCustomers.length)]
  const affordableRewards = REWARDS.filter(r => r.pointsCost <= customer.points && r.status !== 'vencido')
  const reward = affordableRewards.length ? affordableRewards[Math.floor(rng() * affordableRewards.length)] : REWARDS[0]
  const daysAgo = Math.floor(rng() * 45)
  const createdAt = new Date(MOCK_NOW.getTime() - daysAgo * 86400000)
  const roll = rng()
  const status = roll < 0.58 ? 'utilizado' : roll < 0.83 ? 'pendiente' : roll < 0.93 ? 'vencido' : 'cancelado'

  return {
    id: `rdm-${i + 1}`,
    customerId: customer.id,
    rewardId: reward.id,
    pointsUsed: reward.pointsCost,
    code: genCode(),
    status,
    createdAt,
    usedAt: status === 'utilizado' ? new Date(createdAt.getTime() + Math.floor(rng() * 5) * 86400000) : null,
  }
}).sort((a, b) => b.createdAt - a.createdAt)

export function getRedemptionById(id) {
  return REDEMPTIONS.find(r => r.id === id) ?? null
}

export function getRedemptionsForCustomer(customerId) {
  return REDEMPTIONS.filter(r => r.customerId === customerId)
}
