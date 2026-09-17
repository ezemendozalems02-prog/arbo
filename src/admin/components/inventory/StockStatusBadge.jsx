import { FONTS } from '../../../styles/theme'
import { getStockStatus } from '../../../services/inventoryCostService'

const STYLE = {
  NORMAL: { bg: 'rgba(48,77,59,0.1)', color: '#304D3B', label: 'Normal' },
  STOCK_BAJO: { bg: 'rgba(176,138,62,0.16)', color: '#8A6A2E', label: 'Stock bajo' },
  AGOTADO: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536', label: 'Agotado' },
}

export default function StockStatusBadge({ item }) {
  const s = STYLE[getStockStatus(item)]
  return (
    <span style={{ fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: s.color, background: s.bg, padding: '4px 9px', borderRadius: 3, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}
