// Filtro de período compartido por los dashboards de Fase 5 (CRM/ARBO
// CLUB/Marketing) — generaliza el mismo patrón que Costs.jsx (Fase 4) para
// no repetirlo en cada pantalla nueva, sumando "90 días" y "Personalizado".
export const PERIODS = [
  { key: 'hoy', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '90d', label: '90 días' },
  { key: 'mes', label: 'Mes actual' },
  { key: 'personalizado', label: 'Personalizado' },
]

export function periodRange(period, custom = {}) {
  const now = new Date()
  if (period === 'hoy') return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: now }
  if (period === '7d') return { from: new Date(now.getTime() - 7 * 86400000), to: now }
  if (period === '30d') return { from: new Date(now.getTime() - 30 * 86400000), to: now }
  if (period === '90d') return { from: new Date(now.getTime() - 90 * 86400000), to: now }
  if (period === 'mes') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
  if (period === 'personalizado' && custom.from && custom.to) return { from: new Date(custom.from), to: new Date(custom.to) }
  return { from: new Date(now.getTime() - 30 * 86400000), to: now }
}
