import { EmptyState } from './Panel'
import Badge from '../ui/Badge'
import { OS } from '../styles/tokens'

const STATUS = {
  pendiente: { label: 'Pendiente', tone: 'pending' },
  confirmada: { label: 'Confirmada', tone: 'success' },
  cancelada: { label: 'Cancelada', tone: 'danger' },
}

export default function RecentReservationsList({ reservations }) {
  if (!reservations.length) {
    return <EmptyState label="Tu agenda todavía está tranquila." description="Las próximas reservas van a aparecer acá." />
  }
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {reservations.map((r, i) => {
        const st = STATUS[r.status] ?? STATUS.pendiente
        return (
          <li key={r.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderTop: i > 0 ? `1px solid ${OS.color.line}` : 'none',
          }}>
            <div style={{ width: 44, flexShrink: 0, textAlign: 'center', borderRadius: 10, padding: '5px 0', background: OS.color.surface3 }}>
              <p className="os-num" style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1, color: OS.color.ink }}>{r.date.getDate()}</p>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: OS.color.ink3 }}>
                {r.date.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')}
              </p>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: OS.color.ink }}>{r.customerName}</p>
              <p className="os-num" style={{ fontSize: 12, color: OS.color.ink3, marginTop: 1 }}>
                {r.time} · {r.party} personas · Mesa {r.tableNumber}
              </p>
            </div>
            <Badge tone={st.tone}>{st.label}</Badge>
          </li>
        )
      })}
    </ul>
  )
}
