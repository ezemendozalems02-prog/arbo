// ARBO OS — DOMAIN SERVICE: GESTIÓN DE COMANDAS KDS & CICLO DE VIDA OPERATIVO
// Controla estados deterministas: NEW -> PREPARING -> READY -> ARCHIVED (o CANCELLED)
// Garantiza idempotencia, concurrencia segura y deduplicación para sincronización Realtime/Polling.

export const TICKET_STATUSES = {
  NEW: 'NEW',
  PREPARING: 'PREPARING',
  READY: 'READY',
  ARCHIVED: 'ARCHIVED',
  CANCELLED: 'CANCELLED',
}

const VALID_TRANSITIONS = {
  NEW: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['ARCHIVED', 'CANCELLED'],
  ARCHIVED: [], // Estado terminal
  CANCELLED: [], // Estado terminal
}

/**
 * Crea una comanda KDS vinculada a una venta y estación operativa.
 */
export function createKitchenTicket({
  id = `ktick_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
  organizationId,
  branchId,
  saleId,
  stationId,
  ticketNumber,
  items = [],
  notes = null,
  createdBy = null,
  createdAt = new Date().toISOString(),
}) {
  if (!saleId) throw new Error('MISSING_SALE_ID: Una comanda KDS debe estar vinculada a una venta.')
  if (!stationId) throw new Error('MISSING_STATION_ID: Una comanda KDS debe tener una estación asignada.')
  if (!items || items.length === 0) throw new Error('EMPTY_TICKET_ITEMS: No se puede crear una comanda sin ítems.')

  const ticket = {
    id,
    organization_id: organizationId,
    branch_id: branchId,
    sale_id: saleId,
    station_id: stationId,
    ticket_number: Number(ticketNumber) || 1,
    status: TICKET_STATUSES.NEW,
    notes,
    created_at: createdAt,
    started_at: null,
    ready_at: null,
    archived_at: null,
    cancelled_at: null,
    created_by: createdBy,
    cancelled_by: null,
    cancel_reason: null,
  }

  const ticketItems = items.map((item, idx) => ({
    id: `ktitem_${Date.now()}_${idx}`,
    ticket_id: id,
    product_id: item.product_id || item.productId,
    product_name_snapshot: item.product_name_snapshot || item.name || 'Producto',
    quantity: Number(item.quantity) || 1,
    notes: item.notes || null,
    status: 'PENDING',
    created_at: createdAt,
  }))

  return { ticket, ticketItems }
}

/**
 * Transiciona el estado de una comanda con validación estricta e idempotencia.
 */
export function transitionTicketStatus(tickets = [], {
  ticketId,
  newStatus,
  expectedStatus = null,
  userId = null,
  cancelReason = null,
  timestamp = new Date().toISOString(),
}) {
  const index = tickets.findIndex(t => t.id === ticketId)
  if (index === -1) {
    throw new Error(`TICKET_NOT_FOUND: No se encontró la comanda con ID ${ticketId}`)
  }

  const currentTicket = tickets[index]

  // Idempotencia: Si ya está en el estado requerido, retorno exitoso sin mutación
  if (currentTicket.status === newStatus) {
    return {
      tickets,
      updatedTicket: currentTicket,
      isNoop: true,
    }
  }

  // Validación de estado esperado si fue provisto
  if (expectedStatus && currentTicket.status !== expectedStatus) {
    throw new Error(`INVALID_STATUS_TRANSITION: La comanda está en ${currentTicket.status} y se esperaba ${expectedStatus} para pasar a ${newStatus}.`)
  }

  // Validación de flujo de estados
  const allowed = VALID_TRANSITIONS[currentTicket.status] || []
  if (!allowed.includes(newStatus)) {
    throw new Error(`DISALLOWED_TRANSITION: Transición no permitida de ${currentTicket.status} a ${newStatus}.`)
  }

  const updatedTicket = {
    ...currentTicket,
    status: newStatus,
    started_at: newStatus === TICKET_STATUSES.PREPARING && !currentTicket.started_at ? timestamp : currentTicket.started_at,
    ready_at: newStatus === TICKET_STATUSES.READY && !currentTicket.ready_at ? timestamp : currentTicket.ready_at,
    archived_at: newStatus === TICKET_STATUSES.ARCHIVED && !currentTicket.archived_at ? timestamp : currentTicket.archived_at,
    cancelled_at: newStatus === TICKET_STATUSES.CANCELLED && !currentTicket.cancelled_at ? timestamp : currentTicket.cancelled_at,
    cancelled_by: newStatus === TICKET_STATUSES.CANCELLED ? userId : currentTicket.cancelled_by,
    cancel_reason: newStatus === TICKET_STATUSES.CANCELLED ? cancelReason : currentTicket.cancel_reason,
  }

  const newTickets = [...tickets]
  newTickets[index] = updatedTicket

  return {
    tickets: newTickets,
    updatedTicket,
    isNoop: false,
  }
}

/**
 * Calcula el tiempo transcurrido en minutos y segundos de forma consistente.
 */
export function calculateTicketElapsedTime(ticket, now = new Date()) {
  if (!ticket || !ticket.created_at) return { totalSeconds: 0, formatted: '00:00', isDelayed: false }

  const start = new Date(ticket.created_at).getTime()
  // Si ya está listo o archivado, el tiempo se congela en ready_at o archived_at
  const end = ticket.ready_at 
    ? new Date(ticket.ready_at).getTime() 
    : (ticket.archived_at ? new Date(ticket.archived_at).getTime() : now.getTime())

  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Alerta de demora (ej. más de 10 minutos)
  const isDelayed = totalSeconds > 600

  return { totalSeconds, minutes, seconds, formatted, isDelayed }
}

/**
 * Deduplica y sincroniza listas de comandas evitando colisiones entre Realtime y Polling.
 */
export function deduplicateTickets(existingTickets = [], incomingTickets = []) {
  const map = new Map()
  for (const t of existingTickets) map.set(t.id, t)
  for (const t of incomingTickets) {
    // Si ya existe, sobreescribir con la versión más reciente (por timestamp de actualización)
    map.set(t.id, t)
  }
  return Array.from(map.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}
