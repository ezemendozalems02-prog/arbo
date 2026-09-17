import { COLORS, FONTS } from '../../styles/theme'
import { EmptyState } from './Panel'
import { formatMoney, formatNumber } from '../utils/format'

export default function TopProductsList({ rows }) {
  if (!rows.length) return <EmptyState label="Todavía no hay ventas registradas." />
  const max = Math.max(...rows.map(r => r.qty))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rows.map(row => (
        <div key={row.product.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
            <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, fontWeight: 500 }}>{row.product.name}</span>
            <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, flexShrink: 0 }}>
              {formatNumber(row.qty)} u · {formatMoney(row.revenue)}
            </span>
          </div>
          <div style={{ height: 5, background: COLORS.lineGreen }}>
            <div style={{ height: '100%', width: `${(row.qty / max) * 100}%`, background: COLORS.green }} />
          </div>
        </div>
      ))}
    </div>
  )
}
