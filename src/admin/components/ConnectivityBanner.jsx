import { useOffline } from '../../context/OfflineContext'
import { COLORS, FONTS } from '../../styles/theme'

export default function ConnectivityBanner() {
  const { isOnline, syncStatus, pendingCount, triggerSync } = useOffline()

  const isWarning = !isOnline || syncStatus === 'SYNC_ERROR' || pendingCount > 0
  if (!isWarning && syncStatus === 'ONLINE') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#1F402F' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E7D32', display: 'inline-block' }} />
        <span>ONLINE</span>
      </div>
    )
  }

  const bgColor = !isOnline ? 'rgba(166,91,74,0.12)' : (syncStatus === 'SYNCING' ? 'rgba(176,138,62,0.12)' : 'rgba(31,64,47,0.08)')
  const textColor = !isOnline ? '#8A4536' : (syncStatus === 'SYNCING' ? '#8A6A2E' : COLORS.green)
  const dotColor = !isOnline ? '#C62828' : (syncStatus === 'SYNCING' ? '#F9A825' : '#2E7D32')

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        background: bgColor,
        borderRadius: 4,
        gap: 12,
        fontFamily: FONTS.sans,
        fontSize: 11,
        color: textColor,
        fontWeight: 600,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, display: 'inline-block' }} />
        <span>
          {!isOnline ? 'MODO OFFLINE' : (syncStatus === 'SYNCING' ? 'SINCRONIZANDO...' : 'EN LÍNEA')}
          {pendingCount > 0 && ` (${pendingCount} operaciones pendientes)`}
        </span>
      </div>

      {pendingCount > 0 && isOnline && (
        <button
          onClick={triggerSync}
          style={{
            background: 'none',
            border: `1px solid ${textColor}`,
            borderRadius: 3,
            padding: '2px 8px',
            color: textColor,
            cursor: 'pointer',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          Sincronizar ahora
        </button>
      )}
    </div>
  )
}
