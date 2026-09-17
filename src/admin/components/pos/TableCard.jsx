import { COLORS, FONTS } from '../../../styles/theme'
import { TABLE_STATUS_LABELS } from '../../../mock/tables'

const STATUS_STYLE = {
  libre: { bg: COLORS.warmWhite, border: COLORS.lineGreen, text: COLORS.onLightMuted },
  ocupada: { bg: COLORS.greenDark, border: COLORS.greenDark, text: COLORS.cream },
  reservada: { bg: 'rgba(176,138,62,0.16)', border: '#B08A3E', text: '#6E5423' },
  pago_pendiente: { bg: 'rgba(166,91,74,0.14)', border: '#A65B4A', text: '#8A4536' },
}

export default function TableCard({ table, onClick, kitchenReady }) {
  const s = STATUS_STYLE[table.status]
  return (
    <button onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        aspectRatio: '1 / 1', border: `1.5px solid ${s.border}`, background: s.bg, cursor: 'pointer',
        transition: 'transform 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
      {kitchenReady && (
        <span title="Pedido listo" style={{
          position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: '50%',
          background: '#4C7A5B', boxShadow: '0 0 0 2px rgba(244,240,228,0.9)',
        }} />
      )}
      <span style={{ fontFamily: FONTS.serif, fontSize: 22, color: s.text, fontWeight: 600 }}>M{String(table.number).padStart(2, '0')}</span>
      <span style={{ fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.text }}>
        {TABLE_STATUS_LABELS[table.status]}
      </span>
      <span style={{ fontFamily: FONTS.sans, fontSize: 10, color: s.text, opacity: 0.75 }}>{table.capacity} pers.</span>
    </button>
  )
}
