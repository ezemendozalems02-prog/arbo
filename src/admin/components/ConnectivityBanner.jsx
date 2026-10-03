import { CloudOff, RefreshCw } from 'lucide-react'
import { useOffline } from '../../context/OfflineContext'
import { OS } from '../styles/tokens'

// Estado de conexión en la topbar. Con todo en orden no muestra nada (la
// topbar se mantiene liviana); aparece solo sin conexión, sincronizando o
// con operaciones pendientes de subir. Misma lógica de OfflineContext.
export default function ConnectivityBanner() {
  const { isOnline, syncStatus, pendingCount, triggerSync } = useOffline()

  const syncing = isOnline && syncStatus === 'SYNCING'
  const failed = isOnline && syncStatus === 'SYNC_ERROR'
  if (isOnline && !syncing && !failed && pendingCount === 0) return null

  const tone = !isOnline || failed
    ? { color: OS.color.danger, bg: OS.color.dangerBg }
    : { color: OS.color.warning, bg: OS.color.warningBg }
  const label = !isOnline ? 'Sin conexión' : syncing ? 'Sincronizando…' : failed ? 'Error al sincronizar' : 'Cambios sin subir'
  const Icon = !isOnline ? CloudOff : RefreshCw

  return (
    <div role="status" aria-live="polite" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, height: 32, padding: '0 6px 0 12px', borderRadius: 999,
      background: tone.bg, color: tone.color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <Icon size={14} aria-hidden="true" style={syncing ? { animation: 'os-spin 1s linear infinite' } : undefined} />
      <span>{label}{pendingCount > 0 && ` · ${pendingCount}`}</span>
      {pendingCount > 0 && isOnline && !syncing ? (
        <button type="button" onClick={triggerSync} style={{
          height: 24, padding: '0 10px', borderRadius: 999, border: 0, cursor: 'pointer',
          background: tone.color, color: '#fff', fontSize: 11, fontWeight: 700,
        }}>
          Sincronizar
        </button>
      ) : <span style={{ width: 6 }} />}
    </div>
  )
}
