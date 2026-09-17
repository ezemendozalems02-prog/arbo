import { COLORS, FONTS } from '../../styles/theme'
import { EmptyState } from './Panel'

const STATUS_LABEL = { pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada' }
const STATUS_COLOR = { pendiente: '#8A6A2E', confirmada: '#1F402F', cancelada: '#8A4536' }

export default function RecentReservationsList({ reservations }) {
  if (!reservations.length) return <EmptyState label="No hay próximas reservas." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {reservations.map((r, i) => (
        <div key={r.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '11px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, fontWeight: 600 }}>{r.customerName}</p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 2 }}>
              {r.date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} · {r.time} · {r.party} personas · Mesa {r.tableNumber}
            </p>
          </div>
          <span style={{ fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: STATUS_COLOR[r.status], flexShrink: 0 }}>
            {STATUS_LABEL[r.status]}
          </span>
        </div>
      ))}
    </div>
  )
}
