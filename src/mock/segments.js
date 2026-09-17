// Segmentos CRM — Fase 5, bloque 18/20. Cada condición es un árbol AND/OR de
// reglas simples ({field, operator, value}) que segmentService.js evalúa
// contra el perfil calculado de un cliente (nunca contra el objeto crudo).
export const SEGMENT_KINDS = ['sistema', 'personalizado']

export const SEGMENT_FIELDS = [
  { key: 'totalSpent', label: 'Total gastado' },
  { key: 'visits', label: 'Cantidad de visitas' },
  { key: 'points', label: 'Puntos actuales' },
  { key: 'avgTicket', label: 'Ticket promedio' },
  { key: 'daysSinceLastVisit', label: 'Días sin visitar' },
  { key: 'daysSinceAlta', label: 'Días desde el alta' },
  { key: 'reservations', label: 'Cantidad de reservas' },
  { key: 'tier', label: 'Nivel ARBO CLUB' },
  { key: 'hasPendingRedemption', label: 'Tiene beneficio sin utilizar' },
]

export const SEGMENT_OPERATORS = ['>', '>=', '<', '<=', '==']

const rule = (field, operator, value) => ({ field, operator, value })

export const SEGMENTS = [
  {
    id: 'seg-nuevos', name: 'Clientes nuevos', kind: 'sistema',
    description: 'Se dieron de alta en los últimos 30 días.',
    conditions: { op: 'AND', rules: [rule('daysSinceAlta', '<=', 30)] },
  },
  {
    id: 'seg-frecuentes', name: 'Clientes frecuentes', kind: 'sistema',
    description: 'Visitaron ARBO 15 veces o más.',
    conditions: { op: 'AND', rules: [rule('visits', '>=', 15)] },
  },
  {
    id: 'seg-vip', name: 'Clientes VIP', kind: 'sistema',
    description: 'Alto gasto acumulado y visitas frecuentes.',
    conditions: { op: 'AND', rules: [rule('totalSpent', '>=', 200000), rule('visits', '>=', 20)] },
  },
  {
    id: 'seg-inactivos', name: 'Clientes inactivos', kind: 'sistema',
    description: 'No visitan ARBO hace 30 días o más.',
    conditions: { op: 'AND', rules: [rule('daysSinceLastVisit', '>=', 30)] },
  },
  {
    id: 'seg-alto-gasto', name: 'Clientes de alto gasto', kind: 'sistema',
    description: 'Ticket promedio por encima de $12.000.',
    conditions: { op: 'AND', rules: [rule('avgTicket', '>=', 12000)] },
  },
  {
    id: 'seg-con-puntos', name: 'Con puntos disponibles', kind: 'sistema',
    description: 'Tienen 500 puntos o más para canjear.',
    conditions: { op: 'AND', rules: [rule('points', '>=', 500)] },
  },
  {
    id: 'seg-beneficio-sin-usar', name: 'Beneficio sin utilizar', kind: 'sistema',
    description: 'Tienen un canje pendiente de usar.',
    conditions: { op: 'AND', rules: [rule('hasPendingRedemption', '==', true)] },
  },
  {
    id: 'seg-frecuentes-premium', name: 'Clientes frecuentes premium', kind: 'personalizado',
    description: 'Gastaron más de $100.000 y visitaron al menos 5 veces.',
    conditions: { op: 'AND', rules: [rule('totalSpent', '>', 100000), rule('visits', '>=', 5)] },
  },
  {
    id: 'seg-nunca-reservaron', name: 'Nunca reservaron', kind: 'personalizado',
    description: 'Compraron alguna vez pero nunca hicieron una reserva.',
    conditions: { op: 'AND', rules: [rule('visits', '>', 0), rule('reservations', '==', 0)] },
  },
  {
    id: 'seg-club-alto', name: 'RAÍZ o COPA', kind: 'personalizado',
    description: 'Están en los niveles más altos de ARBO CLUB.',
    conditions: { op: 'OR', rules: [rule('tier', '==', 'raiz'), rule('tier', '==', 'copa')] },
  },
]

export function getSegmentById(id) {
  return SEGMENTS.find(s => s.id === id) ?? null
}
