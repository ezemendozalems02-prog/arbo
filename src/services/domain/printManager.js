// ARBO OS — DOMAIN SERVICE: THERMAL PRINTING & ESC/POS BRIDGE
// Arquitectura: ARBO Web -> Local Print Bridge -> ESC/POS Thermal Printer
// Soporte de colas de impresión, enrutamiento a estaciones de cocina y prevención de doble impresión.

export const PRINT_STATUS = {
  QUEUED: 'QUEUED',
  PRINTING: 'PRINTING',
  PRINTED: 'PRINTED',
  FAILED: 'FAILED',
}

export const PRINT_TARGETS = {
  CASHIER: 'CASHIER',
  KITCHEN_STATION: 'KITCHEN_STATION',
  EXPEDITION: 'EXPEDITION',
}

/**
 * Generador de comandos ESC/POS estándar para impresoras térmicas de 58mm y 80mm.
 */
export function buildEscPosCommands({
  title = 'ARBO PATAGONIA',
  subtitle = 'Trevelin, Chubut',
  ticketNumber = '',
  tableNumber = null,
  orderType = 'SALON',
  items = [],
  totals = {},
  footerMessage = '¡Gracias por su visita!',
  isKitchenTicket = false,
}) {
  // Comandos estándar ESC/POS en formato de escape
  const ESC = '\x1B'
  const GS = '\x1D'
  const INIT = `${ESC}@`
  const ALIGN_CENTER = `${ESC}a\x01`
  const ALIGN_LEFT = `${ESC}a\x00`
  const ALIGN_RIGHT = `${ESC}a\x02`
  const BOLD_ON = `${ESC}E\x01`
  const BOLD_OFF = `${ESC}E\x00`
  const DOUBLE_ON = `${GS}!\x11`
  const DOUBLE_OFF = `${GS}!\x00`
  const FEED = '\n'
  const CUT_PAPER = `${GS}V\x41\x03` // Corte parcial de papel
  const LINE_DIVIDER = '------------------------------------------------\n'

  let buffer = ''
  buffer += INIT
  buffer += ALIGN_CENTER
  buffer += `${BOLD_ON}${title}${BOLD_OFF}${FEED}`
  if (subtitle && !isKitchenTicket) {
    buffer += `${subtitle}${FEED}`
  }
  buffer += LINE_DIVIDER

  // Encabezado de comanda o recibo
  buffer += ALIGN_LEFT
  buffer += `TICKET: #${ticketNumber} | TIPO: ${orderType}${FEED}`
  if (tableNumber) {
    buffer += `${BOLD_ON}MESA: ${tableNumber}${BOLD_OFF}${FEED}`
  }
  buffer += `FECHA: ${new Date().toLocaleString('es-AR')}${FEED}`
  buffer += LINE_DIVIDER

  // Lista de Ítems
  if (isKitchenTicket) {
    buffer += `${BOLD_ON}COMANDA DE COCINA / PREPARACIÓN${BOLD_OFF}${FEED}`
    buffer += LINE_DIVIDER
  }

  for (const it of items) {
    const qty = it.quantity || it.qty || 1
    const name = it.name || it.product_name || 'Producto'
    const price = it.price ? `$${Number(it.price).toFixed(2)}` : ''
    const notes = it.notes ? `  * NOTAS: ${it.notes}\n` : ''

    if (isKitchenTicket) {
      buffer += `${DOUBLE_ON}${qty}x ${name}${DOUBLE_OFF}${FEED}`
      if (notes) buffer += notes
    } else {
      buffer += `${qty}x ${name.padEnd(28)} ${price.padStart(8)}${FEED}`
      if (notes) buffer += notes
    }
  }

  buffer += LINE_DIVIDER

  // Totales (solo en tickets de caja o cliente)
  if (!isKitchenTicket && totals.total !== undefined) {
    buffer += ALIGN_RIGHT
    if (totals.subtotal !== undefined) buffer += `SUBTOTAL: $${Number(totals.subtotal).toFixed(2)}${FEED}`
    if (totals.tax !== undefined) buffer += `IVA / IMPUESTOS: $${Number(totals.tax).toFixed(2)}${FEED}`
    buffer += `${BOLD_ON}${DOUBLE_ON}TOTAL: $${Number(totals.total).toFixed(2)}${DOUBLE_OFF}${BOLD_OFF}${FEED}`
    buffer += LINE_DIVIDER
  }

  // Pie de ticket
  buffer += ALIGN_CENTER
  buffer += `${footerMessage}${FEED}${FEED}${FEED}`
  buffer += CUT_PAPER

  return buffer
}

/**
 * Crea un trabajo de impresión auditable.
 */
export function createPrintJob({
  id = null,
  type = 'RECEIPT',
  target = PRINT_TARGETS.CASHIER,
  stationId = null,
  payload = {},
  printerEndpoint = 'http://localhost:9100/print',
}) {
  const jobId = id || `pjob_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
  return {
    id: jobId,
    type,
    target,
    station_id: stationId,
    printer_endpoint: printerEndpoint,
    payload,
    status: PRINT_STATUS.QUEUED,
    attempts: 0,
    created_at: new Date().toISOString(),
    printed_at: null,
    error: null,
  }
}

/**
 * Encola y gestiona trabajos de impresión previniendo duplicados.
 */
export function enqueuePrintJob(queue = [], job) {
  const exists = queue.some(j => j.id === job.id)
  if (exists) {
    return { success: false, reason: 'DUPLICATE_PRINT_JOB_ID', queue }
  }
  return { success: true, queue: [...queue, job], job }
}

/**
 * Procesa un trabajo de impresión simulando o conectando con el puente local.
 */
export async function executePrintJob({
  job,
  bridgeSender = null,
}) {
  if (job.status === PRINT_STATUS.PRINTED) {
    return { success: true, alreadyPrinted: true, job }
  }

  const attempts = (job.attempts || 0) + 1

  try {
    if (bridgeSender) {
      const bridgeResponse = await bridgeSender(job)
      if (!bridgeResponse.success) {
        throw new Error(bridgeResponse.error || 'Fallo de comunicación con impresora térmica')
      }
    }

    return {
      success: true,
      job: {
        ...job,
        status: PRINT_STATUS.PRINTED,
        attempts,
        printed_at: new Date().toISOString(),
        error: null,
      },
    }
  } catch (error) {
    return {
      success: false,
      job: {
        ...job,
        status: PRINT_STATUS.FAILED,
        attempts,
        error: error.message,
      },
    }
  }
}

/**
 * Enruta los ítems de una comanda a la estación de cocina correspondiente.
 */
export function routeItemsToKitchenStation(items = [], targetStationId) {
  if (!targetStationId) return items
  return items.filter(it => it.station_id === targetStationId || it.stationId === targetStationId)
}
