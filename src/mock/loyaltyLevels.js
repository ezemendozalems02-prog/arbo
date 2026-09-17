// Niveles de ARBO CLUB — Fase 5, bloque 13. Arrancan desde los mismos 3
// niveles del sitio público (src/data/benefits.js, CLUB.tiers) para que el
// admin no invente una escala paralela, pero acá quedan como entidades
// editables (crear/editar/reordenar) — el sitio público sigue leyendo
// CLUB.tiers sin cambios, esto es la copia administrable de esa fuente.
import { CLUB } from '../data/benefits'

export const LEVEL_STATUSES = ['activo', 'inactivo']

const COLORS_BY_TIER = { semilla: '#8FAE95', raiz: '#304D3B', copa: '#1F402F' }

export const LOYALTY_LEVELS = CLUB.tiers.map((tier, i) => ({
  id: `lvl-${tier.key}`,
  key: tier.key,
  name: tier.name,
  subtitle: tier.subtitle,
  order: i + 1,
  pointsRequired: tier.threshold,
  benefits: tier.benefits,
  color: COLORS_BY_TIER[tier.key] ?? '#304D3B',
  status: 'activo',
}))

export function getLevelForPoints(points, levels = LOYALTY_LEVELS) {
  return [...levels]
    .filter(l => l.status === 'activo')
    .sort((a, b) => b.pointsRequired - a.pointsRequired)
    .find(l => points >= l.pointsRequired) ?? levels[0]
}

export function getLevelById(id, levels = LOYALTY_LEVELS) {
  return levels.find(l => l.id === id) ?? null
}
