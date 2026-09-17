import { COLORS, FONTS } from '../../styles/theme'
import { MOCK_NOW } from '../../mock/config'
import { EmptyState } from './Panel'
import StatusBadge from './StatusBadge'
import { formatMoney, timeAgo } from '../utils/format'

const CHANNEL_LABELS = { salon: 'Salón', delivery: 'Delivery', retiro: 'Retiro' }

export default function RecentSalesList({ orders }) {
  if (!orders.length) return <EmptyState label="Todavía no hay pedidos." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {orders.map((o, i) => (
        <div key={o.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '11px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, fontWeight: 600 }}>
              {o.id} <span style={{ fontWeight: 400, color: COLORS.onLightMuted }}>· {CHANNEL_LABELS[o.channel]}</span>
            </p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 2 }}>
              {o.customerName} · {timeAgo(o.createdAt, MOCK_NOW)}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700, color: COLORS.greenDark }}>{formatMoney(o.total)}</p>
            <div style={{ marginTop: 4 }}><StatusBadge status={o.status} /></div>
          </div>
        </div>
      ))}
    </div>
  )
}
