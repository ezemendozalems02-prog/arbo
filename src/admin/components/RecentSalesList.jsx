import { Bike, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { MOCK_NOW } from '../../mock/config'
import { EmptyState } from './Panel'
import StatusBadge from './StatusBadge'
import { formatMoney, timeAgo } from '../utils/format'
import { OS } from '../styles/tokens'

const CHANNEL = {
  salon: { label: 'Salón', Icon: UtensilsCrossed },
  delivery: { label: 'Delivery', Icon: Bike },
  retiro: { label: 'Retiro', Icon: ShoppingBag },
}

export default function RecentSalesList({ orders }) {
  if (!orders.length) return <EmptyState label="Todavía no hay pedidos." />
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {orders.map((o, i) => {
        const ch = CHANNEL[o.channel] ?? CHANNEL.salon
        return (
          <li key={o.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
            borderTop: i > 0 ? `1px solid ${OS.color.line}` : 'none',
          }}>
            <span title={ch.label} style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', background: OS.color.surface3, color: OS.color.leaf, flexShrink: 0 }}>
              <ch.Icon size={15} aria-hidden="true" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: OS.color.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {o.customerName} <span className="os-mono" style={{ fontWeight: 400, color: OS.color.ink3 }}>{o.id}</span>
              </p>
              <p style={{ fontSize: 12, color: OS.color.ink3, marginTop: 1 }}>{ch.label} · {timeAgo(o.createdAt, MOCK_NOW)}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p className="os-num" style={{ fontSize: 14, fontWeight: 700, color: OS.color.ink }}>{formatMoney(o.total)}</p>
              <div style={{ marginTop: 4 }}><StatusBadge status={o.status} /></div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
