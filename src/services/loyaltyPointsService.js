// Libro mayor de puntos ARBO CLUB — Fase 5, bloque 8/9/10/11/12.
// Toda regla de puntos vive acá (nunca en un componente): la conversión
// monto->puntos ya estaba centralizada en loyaltyService.js (Fase 1/2), este
// servicio la reutiliza y agrega la mecánica de transacción/saldo.
import { pointsForAmount, tierForPoints } from './loyaltyService'
import { getLevelForPoints } from '../mock/loyaltyLevels'

export { pointsForAmount, tierForPoints }

// Nunca se resta/suma el saldo "a mano": toda variación queda como una
// transacción con saldo anterior/posterior, igual que un movimiento de stock.
export function buildTransaction({ customerId, type, amount, reason, reference, user, balanceBefore, uid, now }) {
  const balanceAfter = Math.max(0, balanceBefore + amount)
  return {
    id: uid('ptx'), customerId, type, amount, reason, reference: reference ?? null,
    user, balanceBefore, balanceAfter, createdAt: now,
  }
}

export function earnFromSaleAmount(amount) {
  return pointsForAmount(amount)
}

// Devoluciones (bloque 11): revertir una venta revierte los puntos que
// generó, nunca dejando el saldo en negativo.
export function buildRefundTransaction({ customerId, originalAmount, user, balanceBefore, uid, now, reference }) {
  return buildTransaction({
    customerId, type: 'REFUND', amount: -originalAmount, reason: 'Devolución de venta — puntos revertidos',
    reference, user, balanceBefore, uid, now,
  })
}

// Expiración (bloque 12): solo se prepara la forma del dato, no se ejecuta
// ningún proceso automático real todavía.
export function buildExpirationCandidate({ transaction, expirationDays = 365 }) {
  const expiresAt = new Date(transaction.createdAt.getTime() + expirationDays * 86400000)
  return { transactionId: transaction.id, customerId: transaction.customerId, amount: transaction.amount, expiresAt, status: 'pendiente' }
}

export function getLevelForBalance(points) {
  return getLevelForPoints(points)
}
