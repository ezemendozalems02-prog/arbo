// Personalización de mensajes de campaña — Fase 5, bloque 25.
const VARS = {
  firstName: (c) => c.name.split(' ')[0],
  lastName: (c) => c.name.split(' ').slice(1).join(' ') || c.name.split(' ')[0],
  points: (c) => c.points.toLocaleString('es-AR'),
  loyaltyLevel: (c) => c.tier?.name ?? '',
  lastVisit: (c) => c.lastActivity?.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) ?? '',
  reward: (_c, ctx) => ctx?.rewardName ?? 'un beneficio',
}

export function renderMessage(message, customer, ctx = {}) {
  return message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const resolver = VARS[key]
    return resolver ? String(resolver(customer, ctx)) : match
  })
}

export const TEMPLATE_VARIABLES = Object.keys(VARS)
