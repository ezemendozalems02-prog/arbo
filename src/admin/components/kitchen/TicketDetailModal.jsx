import { COLORS, FONTS } from '../../../styles/theme'
import { calcElapsedMs, calcPrepMs, formatDuration } from '../../../services/kitchenService'
import { getStationLabel } from '../../../mock/stations'
import { KITCHEN_STATUS_LABELS } from '../../../mock/kitchenConfig'
import AdminModal from '../AdminModal'
import Button from '../../../components/ui/Button'
import { formatTime } from '../../utils/format'

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
    <span>{label}</span><span style={{ color: COLORS.onLight, fontWeight: 600 }}>{value}</span>
  </div>
)

// BLOQUE 22 (detalle) + 24 (reenviar/reimprimir, simulados).
export default function TicketDetailModal({ ticket, open, onClose, onCancel, onResend, onReprint }) {
  if (!ticket) return null
  const prepMs = calcPrepMs(ticket)

  return (
    <AdminModal open={open} onClose={onClose} title={`Comanda #${ticket.code}`} width={420}>
      <Row label="Mesa" value={ticket.tableNumber ? `Mesa ${ticket.tableNumber}` : 'Mostrador'} />
      <Row label="Sector" value={getStationLabel(ticket.station)} />
      <Row label="Orden" value={`#${ticket.orderNumber}`} />

      <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, margin: '10px 0' }} />
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>Productos</p>
      {ticket.items.map(item => (
        <div key={item.id} style={{ padding: '4px 0' }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>{item.quantity}× {item.name}</p>
          {item.modifiers.length > 0 && (
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint }}>{item.modifiers.map(m => m.optionName).join(' · ')}</p>
          )}
        </div>
      ))}

      <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, margin: '10px 0' }} />
      <Row label="Creada" value={formatTime(ticket.createdAt)} />
      {ticket.startedAt && <Row label="Inicio" value={formatTime(ticket.startedAt)} />}
      {ticket.readyAt && <Row label="Lista" value={formatTime(ticket.readyAt)} />}
      {ticket.deliveredAt && <Row label="Entregada" value={formatTime(ticket.deliveredAt)} />}
      <Row label="Tiempo" value={formatDuration(prepMs ?? calcElapsedMs(ticket))} />
      <Row label="Estado" value={KITCHEN_STATUS_LABELS[ticket.status]} />
      {ticket.status === 'CANCELLED' && (
        <>
          <Row label="Motivo" value={ticket.cancelReason ?? '—'} />
          <Row label="Cancelada por" value={ticket.cancelledBy ?? '—'} />
        </>
      )}
      {ticket.reprints > 0 && <Row label="Reimpresiones" value={ticket.reprints} />}

      {ticket.status !== 'DELIVERED' && ticket.status !== 'CANCELLED' && (
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button variant="outline-light" onClick={() => onReprint(ticket.id)}>Reimprimir</Button>
          <Button variant="outline-light" onClick={() => onResend(ticket.id)}>Reenviar</Button>
          <Button variant="outline-light" onClick={() => onCancel(ticket)}>Cancelar</Button>
        </div>
      )}
    </AdminModal>
  )
}
