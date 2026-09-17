import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { useToast } from '../../context/ToastContext'
import { ACTIVE_STATIONS } from '../../../mock/stations'
import { calcKitchenMetrics, formatDuration } from '../../../services/kitchenService'
import TicketCard from '../../components/kitchen/TicketCard'
import CancelTicketModal from '../../components/kitchen/CancelTicketModal'

const COLUMNS = [
  { status: 'SENT', title: 'Nuevos' },
  { status: 'PREPARING', title: 'En preparación' },
  { status: 'READY', title: 'Listos' },
]

const isToday = (d) => {
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

// KDS — Kitchen Display System (bloque 7/8). A propósito NO reutiliza el
// look de Panel/StatCard del resto del admin: pensada para leerse de
// lejos, durante el servicio, con fondo oscuro y tarjetas grandes.
export default function KDS() {
  useEffect(() => { document.title = 'Cocina | ARBO OS' }, [])
  const { showToast } = useToast()
  const { tickets, takeTicket, readyTicket, deliverTicket, cancelTicket } = usePOS()
  const [station, setStation] = useState(ACTIVE_STATIONS[0].key)
  const [cancelTarget, setCancelTarget] = useState(null)

  const stationTickets = tickets.filter(t => t.station === station)
  const todayTickets = stationTickets.filter(t => isToday(t.createdAt))
  const metrics = calcKitchenMetrics(todayTickets)

  const handleAdvance = (ticket) => {
    if (ticket.status === 'SENT') { takeTicket(ticket.id); return }
    if (ticket.status === 'PREPARING') { readyTicket(ticket.id); showToast(`Comanda #${ticket.code} lista`); return }
    if (ticket.status === 'READY') { deliverTicket(ticket.id); showToast(`Comanda #${ticket.code} entregada`) }
  }

  const handleCancel = (reason) => {
    cancelTicket(cancelTarget.id, reason)
    showToast(`Comanda #${cancelTarget.code} cancelada`)
    setCancelTarget(null)
  }

  return (
    <div style={{ padding: '20px 24px 60px', minHeight: 'calc(100vh - 65px)', background: COLORS.greenDark }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {ACTIVE_STATIONS.map(s => (
            <button key={s.key} onClick={() => setStation(s.key)}
              style={{
                padding: '10px 20px', fontFamily: FONTS.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: 'pointer', border: `1.5px solid ${station === s.key ? COLORS.accent : 'rgba(244,240,228,0.25)'}`,
                background: station === s.key ? 'rgba(143,174,149,0.16)' : 'transparent', color: station === s.key ? COLORS.accent : COLORS.onDarkMuted,
              }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          {[
            ['Pendientes', metrics.pending],
            ['Preparando', metrics.preparing],
            ['Listos', metrics.ready],
            ['Demorados', metrics.delayed],
            ['Prom. hoy', metrics.avgPrepMs ? formatDuration(metrics.avgPrepMs) : '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: FONTS.sans, fontSize: 20, fontWeight: 700, color: COLORS.onDark }}>{value}</p>
              <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onDarkFaint }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {COLUMNS.map(col => {
          const colTickets = stationTickets
            .filter(t => t.status === col.status)
            .sort((a, b) => a.sentAt - b.sentAt)
          return (
            <div key={col.status}>
              <p style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onDarkMuted, marginBottom: 12 }}>
                {col.title} · {colTickets.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {colTickets.length === 0 ? (
                  <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onDarkFaint, padding: '20px 0', textAlign: 'center', border: '1px dashed rgba(244,240,228,0.15)' }}>
                    Sin comandas
                  </p>
                ) : (
                  colTickets.map(t => (
                    <TicketCard key={t.id} ticket={t} onAdvance={() => handleAdvance(t)}
                      onCancel={t.status !== 'READY' ? setCancelTarget : undefined} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      <CancelTicketModal ticket={cancelTarget} open={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} />
    </div>
  )
}
