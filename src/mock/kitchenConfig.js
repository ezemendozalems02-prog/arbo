// Configuración central de comandas — nada de umbrales ni estados
// hardcodeados repetidos en componentes (bloques 5 y 17).

// El proyecto ya usa una nomenclatura de estados para pedidos online
// (recibido/aceptado/en_preparacion/.../src/mock/orders.js) — es OTRA
// entidad (la orden pública), así que no la reutilizamos acá.
// Para comandas usamos la propuesta del bloque 5, con dos recortes
// deliberados, documentados según permite el propio bloque 5:
//   - Sin DRAFT: "enviar comanda" crea y envía en el mismo click (bloque 4),
//     así que un estado borrador nunca sería observable.
//   - Sin ACCEPTED: el flujo de ejemplo (bloque 10) pasa directo de
//     SENT a PREPARING al tocar "Tomar" — no hay un paso de aceptación
//     separado en esta fase.
export const KITCHEN_TICKET_STATUSES = ['SENT', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
// "la comanda" es femenino — concuerda con Ventas.jsx (SALE_STATUS_LABELS:
// "Aprobada"/"Cancelada" para "la venta").
export const KITCHEN_STATUS_LABELS = {
  SENT: 'Nueva',
  PREPARING: 'En preparación',
  READY: 'Lista',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
}

// Estado agregado de la orden (bloque 14) — combina los estados de todas
// sus comandas activas.
export const ORDER_KITCHEN_STATUSES = ['sin_enviar', 'enviada', 'en_preparacion', 'lista', 'entregada']
export const ORDER_KITCHEN_STATUS_LABELS = {
  sin_enviar: 'Sin enviar',
  enviada: 'Enviada',
  en_preparacion: 'En preparación',
  lista: 'Lista',
  entregada: 'Entregada',
}

export const PRIORITIES = ['normal', 'urgent']

// Umbrales de demora (bloque 17), en milisegundos — un solo lugar para
// tocar si el ritmo del servicio cambia.
export const DELAY_THRESHOLDS_MS = {
  warning: 6 * 60 * 1000,
  delayed: 12 * 60 * 1000,
}

export function getElapsedStatus(elapsedMs) {
  if (elapsedMs >= DELAY_THRESHOLDS_MS.delayed) return 'DELAYED'
  if (elapsedMs >= DELAY_THRESHOLDS_MS.warning) return 'WARNING'
  return 'NORMAL'
}
