import { COLORS, FONTS } from '../../styles/theme'
import { MOCK_NOW } from '../../mock/config'
import { EmptyState } from './Panel'
import StatusBadge from './StatusBadge'
import { timeAgo } from '../utils/format'

export default function PendingOrdersList({ orders }) {
  if (!orders.length) return <EmptyState label="No hay pedidos pendientes. Todo al día." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {orders.map((o, i) => (
        <div key={o.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '11px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, fontWeight: 600 }}>
              {o.id} {o.tableNumber ? `· Mesa ${o.tableNumber}` : ''}
            </p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 2 }}>
              {o.items.reduce((s, it) => s + it.qty, 0)} productos · {timeAgo(o.createdAt, MOCK_NOW)}
            </p>
          </div>
          <StatusBadge status={o.status} />
        </div>
      ))}
    </div>
  )
}
