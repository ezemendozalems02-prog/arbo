// ARBO OS — DOMAIN SERVICE: OFFLINE OUTBOX (INDEXEDDB & RESILIENCE)
// Almacenamiento persistente de transacciones diferidas ante cortes de conectividad.
// Estados normativos: PENDING, PROCESSING, SYNCED, FAILED, DEAD_LETTER.

export const OUTBOX_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED',
  DEAD_LETTER: 'DEAD_LETTER',
}

export const OUTBOX_MAX_ATTEMPTS = 5

/**
 * Genera una entrada de outbox estándar e inmutable.
 */
export function createOutboxEntry({
  id = null,
  operationType,
  payload = {},
  idempotencyKey = null,
  organizationId = null,
  branchId = null,
}) {
  if (!operationType) {
    throw new Error('OPERATION_TYPE_REQUIRED: operationType es obligatorio para encolar en Outbox.')
  }

  const timestamp = new Date().toISOString()
  const entryId = id || `outbox_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
  const key = idempotencyKey || `idem_${operationType}_${payload.id || entryId}_${Date.now()}`

  return {
    id: entryId,
    operation_type: operationType,
    idempotency_key: key,
    payload,
    organization_id: organizationId || payload.organization_id || null,
    branch_id: branchId || payload.branch_id || null,
    status: OUTBOX_STATUS.PENDING,
    attempts: 0,
    last_error: null,
    created_at: timestamp,
    synced_at: null,
  }
}

/**
 * Encola un nuevo elemento en la cola de outbox (soporta array en memoria o store).
 */
export function enqueueOutboxItem(outboxList = [], entry) {
  // Verificar duplicados por idempotency_key
  const exists = outboxList.some(item => item.idempotency_key === entry.idempotency_key)
  if (exists) {
    return {
      success: false,
      reason: 'DUPLICATE_IDEMPOTENCY_KEY',
      outboxList,
    }
  }

  return {
    success: true,
    outboxList: [...outboxList, entry],
    entry,
  }
}

/**
 * Actualiza el estado de un elemento en la outbox.
 */
export function updateOutboxItemStatus(outboxList = [], id, newStatus, metadata = {}) {
  const index = outboxList.findIndex(item => item.id === id)
  if (index === -1) {
    throw new Error(`OUTBOX_ITEM_NOT_FOUND: Elemento ${id} no existe en la outbox.`)
  }

  const current = outboxList[index]
  const attempts = metadata.incrementAttempts ? current.attempts + 1 : current.attempts
  const finalStatus = (attempts >= OUTBOX_MAX_ATTEMPTS && newStatus === OUTBOX_STATUS.FAILED)
    ? OUTBOX_STATUS.DEAD_LETTER
    : newStatus

  const updatedItem = {
    ...current,
    status: finalStatus,
    attempts,
    last_error: metadata.lastError !== undefined ? metadata.lastError : current.last_error,
    synced_at: finalStatus === OUTBOX_STATUS.SYNCED ? new Date().toISOString() : current.synced_at,
    updated_at: new Date().toISOString(),
  }

  const updatedList = [...outboxList]
  updatedList[index] = updatedItem

  return {
    success: true,
    updatedItem,
    outboxList: updatedList,
  }
}

/**
 * Obtiene los elementos pendientes ordenados cronológicamente para sincronización.
 */
export function getPendingOutboxItems(outboxList = [], limit = 50) {
  return outboxList
    .filter(item => item.status === OUTBOX_STATUS.PENDING || item.status === OUTBOX_STATUS.FAILED)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(0, limit)
}

/**
 * Depura elementos sincronizados exitosamente (respetando retención).
 */
export function purgeSyncedOutboxItems(outboxList = []) {
  return outboxList.filter(item => item.status !== OUTBOX_STATUS.SYNCED)
}
