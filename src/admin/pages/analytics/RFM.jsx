import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { calcRFM } from '../../../services/customerAnalyticsService'
import { formatMoney, formatNumber } from '../../utils/format'
import Panel from '../../components/Panel'

// Bloque 35 — solo se muestran los tres valores, sin etiquetas subjetivas
// automáticas ("campeón", "en riesgo", etc.).
export default function RFM() {
  useEffect(() => { document.title = 'RFM | ARBO OS' }, [])
  const navigate = useNavigate()
  const { customers } = useCRM()
  const now = new Date()

  const rows = customers
    .map(c => ({ customer: c, rfm: calcRFM(c, { now }) }))
    .sort((a, b) => b.rfm.monetary - a.rfm.monetary)
    .slice(0, 60)

  return (
    <Panel title="Recency · Frequency · Monetary">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
              <th style={{ padding: '8px 10px' }}>Cliente</th>
              <th style={{ padding: '8px 10px' }}>Recency (días)</th>
              <th style={{ padding: '8px 10px' }}>Frequency (visitas)</th>
              <th style={{ padding: '8px 10px' }}>Monetary</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ customer, rfm }, i) => (
              <tr key={customer.id} onClick={() => navigate(`/admin/clientes/${customer.id}`)} style={{ borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', cursor: 'pointer' }}>
                <td style={{ padding: '10px', color: COLORS.greenDark, fontWeight: 600 }}>{customer.name}</td>
                <td style={{ padding: '10px' }}>{formatNumber(rfm.recencyDays)}</td>
                <td style={{ padding: '10px' }}>{formatNumber(rfm.frequency)}</td>
                <td style={{ padding: '10px', fontWeight: 700, color: COLORS.greenDark }}>{formatMoney(rfm.monetary)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
