import { BellRing } from 'lucide-react'
import { TABLE_STATUS_LABELS } from '../../../mock/tables'
import { formatMoney } from '../../utils/format'
import { TABLE_STATUS_STYLE } from './tableStyles'

// Sillas alrededor de la mesa (posiciones en % del propio tile).
function seatPositions(shape, capacity) {
  if (shape === 'long') {
    const perSide = Math.ceil((capacity - 2) / 2)
    const xs = Array.from({ length: perSide }, (_, i) => ((i + 1) / (perSide + 1)) * 100)
    return [
      ...xs.map(x => ({ x, y: -1, side: 'h' })),
      ...xs.map(x => ({ x, y: 101, side: 'h' })),
      { x: -1, y: 50, side: 'v' }, { x: 101, y: 50, side: 'v' },
    ].slice(0, capacity)
  }
  const all = [{ x: 50, y: -1, side: 'h' }, { x: 50, y: 101, side: 'h' }, { x: -1, y: 50, side: 'v' }, { x: 101, y: 50, side: 'v' }]
  return capacity <= 2 ? all.slice(0, 2) : all.slice(0, Math.min(capacity, 4))
}

const minutesSince = (date, now) => Math.max(0, Math.round((now - new Date(date)) / 60000))

export default function TableTile({ table, layout, order, total, kitchenReady, dimmed, now, onClick }) {
  const st = TABLE_STATUS_STYLE[table.status] ?? TABLE_STATUS_STYLE.libre
  const seats = seatPositions(layout.shape, table.capacity)
  const seated = table.status === 'ocupada' || table.status === 'pago_pendiente' ? (order?.partySize ?? table.capacity) : 0
  const mins = order?.createdAt ? minutesSince(order.createdAt, now) : null
  const busy = table.status === 'ocupada' || table.status === 'pago_pendiente'

  // Las mesas chicas (2 lugares) usan textos cortos para que nada se corte;
  // el nombre completo del estado queda en el aria-label.
  const small = table.capacity <= 2
  const detail = table.status === 'ocupada' && mins !== null
    ? `${mins} min`
    : table.status === 'libre' ? `${table.capacity} pers.` : (small ? st.tiny : st.short)

  const aria = [
    `Mesa ${table.number}`, TABLE_STATUS_LABELS[table.status],
    `${table.capacity} lugares`,
    busy && order?.partySize ? `${order.partySize} personas` : null,
    mins !== null && busy ? `hace ${mins} minutos` : null,
    busy && total ? `consumo ${formatMoney(total)}` : null,
    kitchenReady ? 'pedido listo en cocina' : null,
  ].filter(Boolean).join(', ')

  return (
    <button type="button" onClick={onClick} aria-label={aria} className="os-table-tile"
      style={{
        '--tile-bg': st.bg, '--tile-ring': st.ring,
        position: 'absolute', inset: 0, padding: 0, border: 0, cursor: 'pointer', background: 'none',
        opacity: dimmed ? 0.28 : 1,
      }}>
      {seats.map((s, i) => (
        <span key={i} aria-hidden="true" style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)',
          width: s.side === 'h' ? '34%' : '13%', height: s.side === 'h' ? '13%' : '34%', maxWidth: 30, maxHeight: 30,
          borderRadius: 6, background: i < seated ? st.ring : st.seat, transition: 'background 200ms ease',
        }} />
      ))}
      <span className="os-table-tile__top" style={{
        position: 'absolute', inset: '9%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3cqw',
        background: st.bg, color: st.fg, borderRadius: layout.shape === 'round' ? '50%' : 'clamp(8px, 1.1cqw, 14px)',
        boxShadow: `inset 0 0 0 2px ${st.ring}, 0 2px 6px rgba(13,33,25,0.18)`,
      }}>
        <span className="os-num" style={{ fontSize: 'clamp(15px, 2.4cqw, 30px)', fontWeight: 800, lineHeight: 1 }}>{table.number}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 'clamp(9px, 0.95cqw, 12px)', fontWeight: 700, opacity: 0.95, whiteSpace: 'nowrap' }}>
          <st.Icon size={11} aria-hidden="true" style={{ flexShrink: 0 }} />{detail}
        </span>
        {busy && total > 0 && layout.shape !== 'round' && (
          <span className="os-num os-table-tile__total" style={{ fontSize: 'clamp(9px, 0.9cqw, 12px)', fontWeight: 600, opacity: 0.85 }}>{formatMoney(total)}</span>
        )}
      </span>
      {kitchenReady && (
        <span title="Pedido listo en cocina" aria-hidden="true" style={{
          position: 'absolute', top: '2%', right: '2%', width: 'clamp(18px, 2cqw, 24px)', height: 'clamp(18px, 2cqw, 24px)',
          borderRadius: '50%', background: '#FFFFFF', color: '#B24A35', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(13,33,25,0.3)', animation: 'os-pulse 1.6s ease-in-out infinite',
        }}>
          <BellRing size={12} />
        </span>
      )}
    </button>
  )
}
