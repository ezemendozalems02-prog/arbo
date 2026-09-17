// Flujo de canje — Fase 5, bloque 15/16. Cliente -> elige beneficio ->
// verificar puntos -> confirmar -> descontar -> crear registro -> código.
import { isRewardActive, canAffordReward, generateRedemptionCode } from './rewardService'

export function validateRedemption({ reward, pointsBalance, now }) {
  if (!reward) return { ok: false, error: 'Beneficio inexistente.' }
  if (!isRewardActive(reward, now)) return { ok: false, error: 'Este beneficio no está disponible.' }
  if (!canAffordReward(reward, pointsBalance)) return { ok: false, error: 'Puntos insuficientes para este canje.' }
  return { ok: true, error: null }
}

export function buildRedemption({ customer, reward, uid, now }) {
  return {
    id: uid('rdm'), customerId: customer.id, rewardId: reward.id, pointsUsed: reward.pointsCost,
    code: generateRedemptionCode(), status: 'pendiente', createdAt: now, usedAt: null,
  }
}
