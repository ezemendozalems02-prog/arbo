import { MOCK_NOW } from '../../mock/config'
import { EmptyState } from './Panel'
import StatusBadge from './StatusBadge'
import { timeAgo } from '../utils/format'
import { OS } from '../styles/tokens'

export default function PendingOrdersList({ orders }) {
  if (!orders.length) return <EmptyState label="No hay pedidos pendientes." description="Todo al día." />
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {orders.map((o, i) => (
        <li key={o.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '11px 0', borderTop: i > 0 ? `1px solid ${OS.color.line}` : 'none',
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: OS.color.ink }}>
              <span className="os-mono">{o.id}</span>{o.tableNumber ? ` · Mesa ${o.tableNumber}` : ''}
            </p>
            <p className="os-num" style={{ fontSize: 12, color: OS.color.ink3, marginTop: 1 }}>
              {o.items.reduce((s, it) => s + it.qty, 0)} productos · {timeAgo(o.createdAt, MOCK_NOW)}
            </p>
          </div>
          <StatusBadge status={o.status} />
        </li>
      ))}
    </ul>
  )
}
