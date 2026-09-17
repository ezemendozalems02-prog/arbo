import { useEffect, useState } from 'react'
import { COLORS } from '../../../styles/theme'
import { calcElapsedMs, formatDuration, ticketElapsedStatus } from '../../../services/kitchenService'

const STATUS_COLOR = { NORMAL: COLORS.onDarkMuted, WARNING: '#D8A94A', DELAYED: '#E08A73' }

// Reloj en vivo simple (bloque 16): un tick por segundo para refrescar el
// tiempo transcurrido, nada más elaborado — el propio ticket ya trae sus
// timestamps fijos (sentAt/readyAt), este componente solo los formatea.
export default function ElapsedTimer({ ticket, dark = true }) {
  const [, setTick] = useState(0)
  const isLive = ticket.status === 'SENT' || ticket.status === 'PREPARING'

  useEffect(() => {
    if (!isLive) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [isLive])

  const elapsedMs = calcElapsedMs(ticket)
  const status = ticketElapsedStatus(ticket)
  const color = dark ? STATUS_COLOR[status] : (status === 'NORMAL' ? COLORS.onLightMuted : status === 'WARNING' ? '#8A6A2E' : '#8A4536')

  return (
    <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color }}>
      {formatDuration(elapsedMs)}
    </span>
  )
}
