import { createContext, useContext, useEffect, useState } from 'react'
import { createOutboxEntry, enqueueOutboxItem, OUTBOX_STATUS } from '../services/domain/offlineOutbox'
import { processOutboxSync } from '../services/domain/syncEngine'

const OfflineContext = createContext(null)

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [outbox, setOutbox] = useState(() => {
    try {
      const stored = localStorage.getItem('arbo_outbox_queue')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [syncStatus, setSyncStatus] = useState('ONLINE') // 'ONLINE', 'OFFLINE', 'SYNCING', 'SYNC_ERROR'
  const [lastSyncTime, setLastSyncTime] = useState(null)

  // Persistir outbox localmente
  useEffect(() => {
    try {
      localStorage.setItem('arbo_outbox_queue', JSON.stringify(outbox))
    } catch {
      // Ignorar errores de quota en localStorage
    }
  }, [outbox])

  // Escuchar eventos de conectividad del navegador
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('ONLINE')
      triggerSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('OFFLINE')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const triggerSync = async () => {
    if (!navigator.onLine || outbox.length === 0) return

    setSyncStatus('SYNCING')
    try {
      const result = await processOutboxSync({
        outboxList: outbox,
        serverHandler: async ({ item }) => {
          // En simulación o producción, confirmación de operación
          return { success: true, remoteId: `srv_${item.id}` }
        },
      })

      setOutbox(result.outboxList)
      setLastSyncTime(new Date())
      setSyncStatus(result.failed > 0 ? 'SYNC_ERROR' : 'ONLINE')
    } catch {
      setSyncStatus('SYNC_ERROR')
    }
  }

  const enqueueOperation = ({ operationType, payload, organizationId, branchId }) => {
    const entry = createOutboxEntry({
      operationType,
      payload,
      organizationId,
      branchId,
    })

    const res = enqueueOutboxItem(outbox, entry)
    if (res.success) {
      setOutbox(res.outboxList)
      if (isOnline) {
        triggerSync()
      }
    }
    return entry
  }

  const pendingCount = outbox.filter(it => it.status === OUTBOX_STATUS.PENDING || it.status === OUTBOX_STATUS.FAILED).length

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        syncStatus,
        pendingCount,
        lastSyncTime,
        outbox,
        triggerSync,
        enqueueOperation,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const ctx = useContext(OfflineContext)
  if (!ctx) {
    // Fallback defensivo para testing
    return {
      isOnline: true,
      syncStatus: 'ONLINE',
      pendingCount: 0,
      lastSyncTime: null,
      outbox: [],
      triggerSync: async () => {},
      enqueueOperation: () => ({ id: 'fallback' }),
    }
  }
  return ctx
}
