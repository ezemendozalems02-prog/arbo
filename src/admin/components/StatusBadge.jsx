import { FONTS } from '../../styles/theme'
import { ORDER_STATUS_LABELS } from '../../mock/orders'

// Paleta de estado reservada — nunca se reutiliza para series de datos.
const STATUS_STYLE = {
  recibido: { bg: 'rgba(48,77,59,0.1)', color: '#304D3B' },
  aceptado: { bg: 'rgba(143,174,149,0.28)', color: '#1F402F' },
  en_preparacion: { bg: 'rgba(176,138,62,0.16)', color: '#8A6A2E' },
  listo: { bg: 'rgba(176,138,62,0.26)', color: '#6E5423' },
  enviado: { bg: 'rgba(48,77,59,0.16)', color: '#1F402F' },
  entregado: { bg: 'rgba(31,64,47,0.9)', color: '#F4F0E4' },
  cancelado: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536' },
}

export default function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.recibido
  return (
    <span style={{
      fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      color: s.color, background: s.bg, padding: '4px 9px', borderRadius: 3, whiteSpace: 'nowrap',
    }}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  )
}
