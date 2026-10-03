import { COLORS, FONTS } from '../../../styles/theme'
import { calcOrderKitchenStatus } from '../../../services/kitchenService'
import { getStationLabel } from '../../../mock/stations'
import { KITCHEN_STATUS_LABELS } from '../../../mock/kitchenConfig'
import Button from '../../ui/Button'

const TICKET_ICON = { SENT: '🆕', PREPARING: '⏳', READY: '✓', DELIVERED: '✓', CANCELLED: '✕' }
const TICKET_COLOR = {
  SENT: COLORS.onLightMuted, PREPARING: '#8A6A2E', READY: COLORS.green, DELIVERED: COLORS.onLightFaint, CANCELLED: COLORS.onLightFaint,
}

// BLOQUE 20 — conecta KDS con el salón: desde la mesa se ve el estado por
// sector sin tener que ir al KDS, y cuando todo está listo se muestra el
// aviso agregado ("PEDIDO LISTO").
export default function KitchenStatusPanel({ tickets, onDeliver }) {
  const active = tickets.filter(t => t.status !== 'CANCELLED')
  if (active.length === 0) return null
  const overall = calcOrderKitchenStatus(tickets)

  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 10 }}>Cocina</p>

      {overall === 'lista' && (
        <div style={{ background: 'rgba(48,77,59,0.1)', color: COLORS.greenDark, fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, padding: '10px 12px', marginBottom: 10, textAlign: 'center' }}>
          ✓ PEDIDO LISTO
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {active.map(t => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: COLORS.cream, border: `1px solid ${COLORS.lineGreen}` }}>
            <div>
              <span style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 700, color: COLORS.greenDark }}>{getStationLabel(t.station)}</span>
              <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginLeft: 8 }}>#{t.code}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: TICKET_COLOR[t.status] }}>
                {TICKET_ICON[t.status]} {KITCHEN_STATUS_LABELS[t.status]}
              </span>
              {t.status === 'READY' && onDeliver && (
                <Button size="sm" onClick={() => onDeliver(t.id)}>Entregar</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
