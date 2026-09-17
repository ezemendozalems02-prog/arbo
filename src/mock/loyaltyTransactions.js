// Libro mayor de puntos ARBO CLUB — Fase 5, bloque 9/10.
// Se construye a partir de dos fuentes ya existentes en vez de inventar
// saldos nuevos: el saldo final de cada cliente (CUSTOMERS[].points, que ya
// se usa en POS/Dashboard desde Fase 2) y sus canjes reales (REDEMPTIONS).
// Cada transacción queda con saldo anterior/posterior consistente, así el
// número que ve el mozo en el POS es el mismo que ve el CRM en su historial.
import { createRng, MOCK_NOW } from './config'
import { CUSTOMERS } from './customers'
import { REDEMPTIONS } from './redemptions'
import { getRewardById } from './rewards'

export const POINT_TXN_TYPES = ['EARN', 'REDEEM', 'BONUS', 'ADJUSTMENT', 'EXPIRED', 'REFUND']
export const POINT_TXN_LABELS = {
  EARN: 'Acumulación', REDEEM: 'Canje', BONUS: 'Bono', ADJUSTMENT: 'Ajuste', EXPIRED: 'Vencimiento', REFUND: 'Devolución',
}

const rng = createRng(2929)

function splitAmount(total, count) {
  if (total <= 0 || count <= 0) return Array(count).fill(0)
  const cuts = Array.from({ length: count - 1 }, () => Math.floor(rng() * total)).sort((a, b) => a - b)
  const bounds = [0, ...cuts, total]
  return Array.from({ length: count }, (_, i) => bounds[i + 1] - bounds[i])
}

const redemptionsByCustomer = new Map()
for (const r of REDEMPTIONS) {
  if (!redemptionsByCustomer.has(r.customerId)) redemptionsByCustomer.set(r.customerId, [])
  redemptionsByCustomer.get(r.customerId).push(r)
}

let seq = 1
const rows = []

for (const customer of CUSTOMERS) {
  const custRedemptions = redemptionsByCustomer.get(customer.id) ?? []
  const deductions = custRedemptions.filter(r => r.status !== 'cancelado').reduce((s, r) => s + r.pointsUsed, 0)

  const flavors = []
  if (rng() < 0.18) flavors.push({ type: 'BONUS', amount: 100, reason: 'Cumpleaños ARBO' })
  if (rng() < 0.10) flavors.push({ type: 'ADJUSTMENT', amount: rng() < 0.5 ? 30 : -30, reason: 'Ajuste manual de staff' })
  if (rng() < 0.06) flavors.push({ type: 'EXPIRED', amount: -Math.max(20, Math.floor(customer.points * 0.05)), reason: 'Vencimiento de puntos sin usar' })

  const flavorNet = flavors.reduce((s, f) => s + f.amount, 0)
  const earnTotal = Math.max(0, customer.points + deductions - flavorNet)
  const earnCount = Math.min(4, Math.max(1, Math.round(customer.visits / 12)))

  const earliestRedemptionMs = custRedemptions.length ? Math.min(...custRedemptions.map(r => r.createdAt.getTime())) : MOCK_NOW.getTime()
  const earnWindowStart = customer.createdAt.getTime()
  const earnWindowEnd = Math.max(earnWindowStart + 1, Math.min(earliestRedemptionMs - 86400000, MOCK_NOW.getTime()))
  const windowSpan = Math.max(1, earnWindowEnd - earnWindowStart)

  const earnAmounts = splitAmount(earnTotal, earnCount).filter(a => a > 0)
  const txns = []
  for (const amount of earnAmounts) {
    txns.push({ type: 'EARN', amount, reason: 'Compra en el local', reference: null, at: new Date(earnWindowStart + Math.floor(rng() * windowSpan)) })
  }
  for (const f of flavors) {
    const span = Math.max(1, MOCK_NOW.getTime() - earnWindowEnd)
    txns.push({ ...f, reference: null, at: new Date(earnWindowEnd + Math.floor(rng() * span)) })
  }
  for (const r of custRedemptions) {
    txns.push({ type: 'REDEEM', amount: -r.pointsUsed, reason: `Canje: ${getRewardById(r.rewardId)?.name ?? 'beneficio'}`, reference: r.id, at: r.createdAt })
    if (r.status === 'cancelado') {
      txns.push({ type: 'REFUND', amount: r.pointsUsed, reason: 'Canje cancelado — puntos devueltos', reference: r.id, at: new Date(r.createdAt.getTime() + 3600000) })
    }
  }

  txns.sort((a, b) => a.at - b.at)
  let balance = 0
  for (const t of txns) {
    const balanceBefore = balance
    balance = Math.max(0, balance + t.amount)
    rows.push({
      id: `ptx-${seq++}`, customerId: customer.id, type: t.type, amount: t.amount, reason: t.reason,
      reference: t.reference, user: 'Sistema', balanceBefore, balanceAfter: balance, createdAt: t.at,
    })
  }
}

export const POINT_TRANSACTIONS = rows.sort((a, b) => b.createdAt - a.createdAt)

export function getTransactionsForCustomer(customerId) {
  return POINT_TRANSACTIONS.filter(t => t.customerId === customerId).sort((a, b) => b.createdAt - a.createdAt)
}

export function getPointsBalance(customerId) {
  const txns = getTransactionsForCustomer(customerId)
  return txns.length ? txns[0].balanceAfter : 0
}
