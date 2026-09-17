// Motor de segmentación — Fase 5, bloque 19/20. Evalúa el árbol AND/OR de un
// segmento contra el perfil calculado del cliente (customerAnalyticsService),
// nunca contra el objeto crudo, para no repetir cada fórmula acá.
import { buildCustomerProfile } from './customerAnalyticsService'

function evaluateRule(rule, profile) {
  const value = profile[rule.field]
  switch (rule.operator) {
    case '>': return value > rule.value
    case '>=': return value >= rule.value
    case '<': return value < rule.value
    case '<=': return value <= rule.value
    case '==': return value === rule.value
    default: return false
  }
}

export function evaluateConditions(conditions, profile) {
  if (!conditions?.rules?.length) return true
  const results = conditions.rules.map(r => evaluateRule(r, profile))
  return conditions.op === 'OR' ? results.some(Boolean) : results.every(Boolean)
}

export function evaluateCustomer(customer, segment, deps) {
  const profile = buildCustomerProfile(customer, deps)
  return evaluateConditions(segment.conditions, profile)
}

export function getSegmentMembers(segment, customers, deps) {
  return customers.filter(c => evaluateCustomer(c, segment, deps))
}

export function getSegmentCount(segment, customers, deps) {
  return getSegmentMembers(segment, customers, deps).length
}
