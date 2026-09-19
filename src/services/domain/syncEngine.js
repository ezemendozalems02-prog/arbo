// ARBO OS — DOMAIN SERVICE: SYNC ENGINE & CONFLICT RESOLUTION
// Orquestador determinístico de sincronización offline -> servidor con resolución de conflictos.
// Pipeline: OFFLINE -> OUTBOX -> ONLINE -> PROCESS -> SERVER -> ACK -> MARK SYNCED

import { OUTBOX_STATUS, updateOutboxItemStatus, getPendingOutboxItems } from './offlineOutbox.js'

/**
 * Procesa la cola de outbox pendiente contra el servidor o estado remoto.
 */
export async function processOutboxSync({
  outboxList = [],
  serverHandler,
  serverState = {},
}) {
  const pending = getPendingOutboxItems(outboxList)
  if (pending.length === 0) {
    return {
      total: 0,
      synced: 0,
      failed: 0,
      conflicts: 0,
      outboxList,
      results: [],
    }
  }

  let currentList = [...outboxList]
  let syncedCount = 0
  let failedCount = 0
  let conflictCount = 0
  const results = []

  for (const item of pending) {
    // 1. Marcar como PROCESSING
    const markProc = updateOutboxItemStatus(currentList, item.id, OUTBOX_STATUS.PROCESSING)
    currentList = markProc.outboxList

    try {
      // 2. Ejecutar handler del servidor
      const response = await serverHandler({ item, serverState })

      if (response && response.conflict) {
        // Conflicto de sincronización detectado (ej. stock remoto insuficiente)
        conflictCount++
        const markConflict = updateOutboxItemStatus(currentList, item.id, OUTBOX_STATUS.FAILED, {
          incrementAttempts: true,
          lastError: `SYNC_CONFLICT: ${response.conflictReason || 'Conflicto de concurrencia en servidor'}`,
        })
        currentList = markConflict.outboxList
        results.push({
          id: item.id,
          status: 'CONFLICT',
          reason: response.conflictReason,
        })
      } else if (response && response.success) {
        // Éxito: Servidor procesó o reconoció idempotencia previa
        syncedCount++
        const markSuccess = updateOutboxItemStatus(currentList, item.id, OUTBOX_STATUS.SYNCED)
        currentList = markSuccess.outboxList
        results.push({
          id: item.id,
          status: 'SYNCED',
          remoteId: response.remoteId,
        })
      } else {
        // Error de negocio o validación remota
        failedCount++
        const errorMsg = response?.error || 'Error desconocido en servidor'
        const markFail = updateOutboxItemStatus(currentList, item.id, OUTBOX_STATUS.FAILED, {
          incrementAttempts: true,
          lastError: errorMsg,
        })
        currentList = markFail.outboxList
        results.push({
          id: item.id,
          status: 'FAILED',
          error: errorMsg,
        })
      }
    } catch (networkOrFatalError) {
      // Fallo de conectividad o excepción
      failedCount++
      const markFail = updateOutboxItemStatus(currentList, item.id, OUTBOX_STATUS.FAILED, {
        incrementAttempts: true,
        lastError: networkOrFatalError.message,
      })
      currentList = markFail.outboxList
      results.push({
        id: item.id,
        status: 'FAILED',
        error: networkOrFatalError.message,
      })
    }
  }

  return {
    total: pending.length,
    synced: syncedCount,
    failed: failedCount,
    conflicts: conflictCount,
    outboxList: currentList,
    results,
  }
}

/**
 * Validador determinístico de reconciliación de stock antes de aplicar venta offline.
 */
export function reconcileOfflineStockSale({
  item,
  serverStock,
  requiredQuantity,
}) {
  const currentServer = Number(serverStock) || 0
  const needed = Number(requiredQuantity) || 0

  if (currentServer < needed) {
    return {
      canApply: false,
      conflict: true,
      conflictReason: `INSUFFICIENT_SERVER_STOCK: Stock servidor (${currentServer}) menor a la cantidad vendida offline (${needed}).`,
      remainingServerStock: currentServer,
    }
  }

  return {
    canApply: true,
    conflict: false,
    remainingServerStock: Number((currentServer - needed).toFixed(4)),
  }
}
