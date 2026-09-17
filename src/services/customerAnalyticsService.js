// Métricas y perfil calculado del cliente — Fase 5, bloque 32/33/34/35.
// `buildCustomerProfile` es la ÚNICA función que traduce un cliente crudo a
// los números que segmentService/RFM/CLV consumen, para no repetir fórmulas
// (días sin visitar, etc.) en cada pantalla.
import { createRng } from '../mock/config'

const dayMs = 86400000
const daysBetween = (a, b) => Math.max(0, Math.round((a - b) / dayMs))

export function buildCustomerProfile(customer, { now, getRedemptionsForCustomer } = {}) {
  const redemptions = getRedemptionsForCustomer ? getRedemptionsForCustomer(customer.id) : []
  return {
    totalSpent: customer.totalSpent,
    visits: customer.visits,
    points: customer.points,
    avgTicket: customer.avgTicket,
    reservations: customer.reservations,
    tier: customer.tier?.key,
    daysSinceLastVisit: now ? daysBetween(now, customer.lastActivity) : 0,
    daysSinceAlta: now ? daysBetween(now, customer.createdAt) : 0,
    hasPendingRedemption: redemptions.some(r => r.status === 'pendiente'),
  }
}

// CLV aproximado — SIEMPRE mostrar como estimación (bloque 33), nunca como
// dato contable exacto: es ticket promedio x frecuencia mensual x 12 meses.
export function calcCLV(customer, { now } = {}) {
  const monthsActive = Math.max(1, Math.round((now ? daysBetween(now, customer.createdAt) : 180) / 30))
  const frequencyPerMonth = customer.visits / monthsActive
  const value = Math.round(customer.avgTicket * frequencyPerMonth * 12)
  return { value, isEstimate: true }
}

// RFM — solo expone los tres valores, sin asignar etiquetas automáticas
// (bloque 35: "sin asignar etiquetas subjetivas automáticamente").
export function calcRFM(customer, { now }) {
  return {
    recencyDays: daysBetween(now, customer.lastActivity),
    frequency: customer.visits,
    monetary: customer.totalSpent,
  }
}

export function getRetentionMetrics(customers, { now }) {
  const total = customers.length
  const nuevos = customers.filter(c => daysBetween(now, c.createdAt) <= 30).length
  const activos = customers.filter(c => daysBetween(now, c.lastActivity) <= 30).length
  const recurrentes = customers.filter(c => c.visits >= 5 && daysBetween(now, c.lastActivity) <= 60).length
  const inactivos = customers.filter(c => daysBetween(now, c.lastActivity) > 60).length
  const avgTicket = total ? Math.round(customers.reduce((s, c) => s + c.avgTicket, 0) / total) : 0
  const avgFrequency = total ? Math.round((customers.reduce((s, c) => s + c.visits, 0) / total) * 10) / 10 : 0
  const revenuePerCustomer = total ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / total) : 0
  return { total, nuevos, activos, recurrentes, inactivos, avgTicket, avgFrequency, revenuePerCustomer }
}

export function getTopCustomersByRevenue(customers, limit = 10) {
  return [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit)
}

// Cohortes de adquisición — bloque 34. Los pedidos mock (src/mock/orders.js)
// solo cubren la última semana, así que no alcanza para medir retención
// mes a mes con datos reales: se genera una matriz determinística SOLO para
// mostrar el funcionamiento del tablero. La UI debe rotularla como demo.
const cohortRng = createRng(5522)
export function buildCohortDemo() {
  const months = ['Abr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Ago 2026', 'Sep 2026']
  return months.map((month, i) => {
    const size = 40 - i * 4 + Math.floor(cohortRng() * 8)
    const periods = months.length - i
    let retention = 100
    const row = [{ period: 0, pct: 100 }]
    for (let p = 1; p < periods; p++) {
      retention = Math.max(8, retention - (10 + cohortRng() * 12))
      row.push({ period: p, pct: Math.round(retention) })
    }
    return { month, size, row }
  })
}
