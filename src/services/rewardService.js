// Reglas de un beneficio ARBO CLUB — Fase 5, bloque 14/17.
export function isRewardActive(reward, now) {
  if (reward.status !== 'activo') return false
  if (reward.endDate && now > reward.endDate) return false
  if (reward.stock !== null && reward.redeemedCount >= reward.stock) return false
  return true
}

export function canAffordReward(reward, pointsBalance) {
  return pointsBalance >= reward.pointsCost
}

// Código de canje simulado (bloque 17): preparado para que, a futuro, un
// lector de QR/POS/caja pueda resolverlo contra este mismo formato.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function generateRedemptionCode() {
  let s = ''
  for (let i = 0; i < 5; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return `ARBO-${s}`
}
