// Campañas — Fase 5, bloque 21-24/46. "Enviar" siempre SIMULA: nunca hay un
// canal real de salida (WhatsApp/Email/Push) detrás de esta función.
import { getSegmentMembers } from './segmentService'

export function getAudience(campaign, segments, customers, deps) {
  const segment = segments.find(s => s.id === campaign.segmentId)
  if (!segment) return []
  return getSegmentMembers(segment, customers, deps)
}

// Antes de enviar (bloque 24): mostrar a cuántos clientes alcanzaría.
export function previewAudience(campaign, segments, customers, deps) {
  const audience = getAudience(campaign, segments, customers, deps)
  return { count: audience.length, sample: audience.slice(0, 5) }
}

function buildStats(reached) {
  const opens = Math.round(reached * (0.35 + Math.random() * 0.3))
  const clicks = Math.round(opens * (0.2 + Math.random() * 0.25))
  const redemptions = Math.round(clicks * (0.1 + Math.random() * 0.2))
  return { reached, opens, clicks, redemptions, conversion: reached ? Math.round((redemptions / reached) * 1000) / 10 : 0 }
}

// Recipientes recreados a partir del segmento en vez de guardarse aparte —
// misma lógica que las recetas referencian insumos por id en Fase 4: la
// audiencia de una campaña ya enviada no se "copia", se recalcula.
export function getCampaignRecipients(campaign, segments, customers, deps) {
  if (!campaign.stats) return []
  const audience = getAudience(campaign, segments, customers, deps)
  return audience.slice(0, campaign.stats.reached)
}

export function simulateSend(campaign, segments, customers, deps) {
  const audience = getAudience(campaign, segments, customers, deps)
  return { status: 'COMPLETED', sentAt: deps.now, stats: buildStats(audience.length) }
}
