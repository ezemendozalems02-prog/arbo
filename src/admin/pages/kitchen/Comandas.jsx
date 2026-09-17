import { useEffect, useMemo, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { useToast } from '../../context/ToastContext'
import { ACTIVE_STATIONS, getStationLabel } from '../../../mock/stations'
import { KITCHEN_TICKET_STATUSES, KITCHEN_STATUS_LABELS } from '../../../mock/kitchenConfig'
import { EmptyState } from '../../components/Panel'
import TicketDetailModal from '../../components/kitchen/TicketDetailModal'
import CancelTicketModal from '../../components/kitchen/CancelTicketModal'
import { formatTime } from '../../utils/format'

const STATUS_BADGE = {
  SENT: { bg: 'rgba(48,77,59,0.1)', color: '#304D3B' },
  PREPARING: { bg: 'rgba(176,138,62,0.16)', color: '#8A6A2E' },
  READY: { bg: 'rgba(48,77,59,0.16)', color: '#1F402F' },
  DELIVERED: { bg: 'rgba(31,64,47,0.9)', color: '#F4F0E4' },
  CANCELLED: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536' },
}

function Badge({ status }) {
  const s = STATUS_BADGE[status]
  return (
    <span style={{ fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: s.color, background: s.bg, padding: '4px 9px', borderRadius: 3, whiteSpace: 'nowrap' }}>
      {KITCHEN_STATUS_LABELS[status]}
    </span>
  )
}

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

// BLOQUE 21/22 — historial de comandas: buscar / filtrar / ver detalle.
export default function Comandas() {
  useEffect(() => { document.title = 'Comandas | ARBO OS' }, [])
  const { showToast } = useToast()
  const { tickets, cancelTicket, reprintTicket } = usePOS()
  const [query, setQuery] = useState('')
  const [stationFilter, setStationFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [dateFilter, setDateFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const day = dateFilter ? new Date(`${dateFilter}T00:00:00`) : null
    return [...tickets]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter(t => stationFilter === 'todos' || t.station === stationFilter)
      .filter(t => statusFilter === 'todos' || t.status === statusFilter)
      .filter(t => !day || isSameDay(t.createdAt, day))
      .filter(t => !q || t.code.toLowerCase().includes(q) || String(t.orderNumber).includes(q) || (t.tableNumber && String(t.tableNumber).includes(q)))
  }, [tickets, query, stationFilter, statusFilter, dateFilter])

  const handleCancel = (reason) => {
    cancelTicket(cancelTarget.id, reason)
    showToast(`Comanda #${cancelTarget.code} cancelada`)
    setCancelTarget(null)
    setSelected(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por comanda, mesa u orden..." />
        <select style={inputStyle} value={stationFilter} onChange={e => setStationFilter(e.target.value)}>
          <option value="todos">Todos los sectores</option>
          {ACTIVE_STATIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select style={inputStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="todos">Todos los estados</option>
          {KITCHEN_TICKET_STATUSES.map(st => <option key={st} value={st}>{KITCHEN_STATUS_LABELS[st]}</option>)}
        </select>
        <input style={inputStyle} type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState label={tickets.length === 0 ? 'Todavía no se enviaron comandas.' : 'Sin resultados para este filtro.'} />
      ) : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {filtered.map((t, i) => (
            <button key={t.id} onClick={() => setSelected(t)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, width: '100%', textAlign: 'left',
                padding: '14px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
                borderRight: 'none', borderBottom: 'none', borderLeft: 'none', background: 'none',
                cursor: 'pointer', fontFamily: FONTS.sans,
              }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>
                  #{t.code} · {getStationLabel(t.station)} {t.tableNumber ? `· Mesa ${t.tableNumber}` : '· Mostrador'}
                </p>
                <p style={{ fontSize: 12, color: COLORS.onLightFaint, marginTop: 2 }}>
                  {t.items.map(it => `${it.quantity}× ${it.name}`).join(', ')} · {formatTime(t.createdAt)}
                </p>
              </div>
              <Badge status={t.status} />
            </button>
          ))}
        </div>
      )}

      <TicketDetailModal ticket={selected} open={!!selected} onClose={() => setSelected(null)}
        onCancel={setCancelTarget}
        onReprint={(id) => { reprintTicket(id); showToast(`Reimpresión enviada: #${selected.code}`) }}
        onResend={() => showToast(`Comanda reenviada al sector: #${selected.code}`)} />
      <CancelTicketModal ticket={cancelTarget} open={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} />
    </div>
  )
}
