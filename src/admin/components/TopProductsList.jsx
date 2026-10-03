import { EmptyState } from './Panel'
import { formatMoney, formatNumber } from '../utils/format'
import { OS } from '../styles/tokens'

export default function TopProductsList({ rows }) {
  if (!rows.length) return <EmptyState label="Todavía no hay ventas registradas." />
  const max = Math.max(...rows.map(r => r.qty))

  return (
    <ol style={{ display: 'flex', flexDirection: 'column', gap: 14, listStyle: 'none', margin: 0, padding: 0 }}>
      {rows.map((row, i) => (
        <li key={row.product.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="os-num" style={{
            width: 24, height: 24, borderRadius: 8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, background: i === 0 ? OS.color.forest : OS.color.surface3, color: i === 0 ? OS.color.inkInverse : OS.color.ink2,
          }}>{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: OS.color.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.product.name}</span>
              <span className="os-num" style={{ fontSize: 12, color: OS.color.ink3, flexShrink: 0 }}>
                {formatNumber(row.qty)} u · <strong style={{ color: OS.color.ink2 }}>{formatMoney(row.revenue)}</strong>
              </span>
            </div>
            <div className="os-progress" style={{ height: 4 }} aria-hidden="true">
              <span style={{ width: `${(row.qty / max) * 100}%`, background: i === 0 ? OS.color.forest : OS.color.leafSoft }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
