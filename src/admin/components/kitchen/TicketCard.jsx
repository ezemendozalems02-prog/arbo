import { COLORS, FONTS } from '../../../styles/theme'
import ElapsedTimer from './ElapsedTimer'
import Button from '../../../components/ui/Button'

const ACTION_LABEL = { SENT: 'Tomar', PREPARING: 'Listo', READY: 'Entregar' }

// Tarjeta del KDS (bloque 8/41): lo primero que se lee es mesa + productos,
// después el tiempo, y una única acción grande (nunca un menú de opciones)
// para no hacer pensar al que está cocinando bajo presión de servicio.
export default function TicketCard({ ticket, onAdvance, onCancel }) {
  return (
    <div style={{
      background: 'rgba(244,240,228,0.06)', border: `1px solid rgba(244,240,228,0.18)`,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontFamily: 'monospace', fontSize: 13, color: COLORS.accent, letterSpacing: '0.04em' }}>#{ticket.code}</p>
          <p style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.onDark, fontWeight: 600 }}>
            {ticket.tableNumber ? `Mesa ${ticket.tableNumber}` : 'Mostrador'}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {ticket.priority === 'urgent' && (
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, color: '#E08A73', marginBottom: 4 }}>⚡ URGENTE</p>
          )}
          <ElapsedTimer ticket={ticket} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ticket.items.map(item => (
          <div key={item.id}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 600, color: COLORS.onDark }}>{item.quantity}× {item.name}</p>
            {item.modifiers.length > 0 && (
              <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onDarkMuted }}>{item.modifiers.map(m => m.optionName).join(' · ')}</p>
            )}
          </div>
        ))}
      </div>

      {ticket.status === 'READY' && ticket.readyAt && ticket.startedAt && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.accent }}>
          Preparado en {Math.floor((ticket.readyAt - ticket.startedAt) / 60000)}:{String(Math.floor(((ticket.readyAt - ticket.startedAt) / 1000) % 60)).padStart(2, '0')}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Button full variant="solid-dark" onClick={() => onAdvance(ticket.id)}>{ACTION_LABEL[ticket.status]}</Button>
        {onCancel && (
          <button onClick={() => onCancel(ticket)} aria-label="Cancelar comanda"
            style={{ background: 'none', border: `1px solid rgba(244,240,228,0.3)`, color: COLORS.onDarkFaint, cursor: 'pointer', padding: '0 12px', fontSize: 14 }}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
