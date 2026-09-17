import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { calcCLV, getTopCustomersByRevenue, getRetentionMetrics } from '../../../services/customerAnalyticsService'
import { formatMoney, formatNumber } from '../../utils/format'
import StatCard from '../../components/StatCard'
import Panel from '../../components/Panel'

export default function CustomerAnalytics() {
  useEffect(() => { document.title = 'Análisis de clientes | ARBO OS' }, [])
  const navigate = useNavigate()
  const { customers } = useCRM()
  const now = new Date()
  const retention = getRetentionMetrics(customers, { now })
  const top = getTopCustomersByRevenue(customers, 20)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard label="Revenue por cliente" value={formatMoney(retention.revenuePerCustomer)} />
        <StatCard label="Ticket promedio" value={formatMoney(retention.avgTicket)} />
        <StatCard label="Frecuencia promedio" value={`${retention.avgFrequency} visitas`} />
      </div>

      <Panel title="Top 20 clientes por revenue y CLV estimado">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                <th style={{ padding: '8px 10px' }}>Cliente</th>
                <th style={{ padding: '8px 10px' }}>Total gastado</th>
                <th style={{ padding: '8px 10px' }}>Ticket promedio</th>
                <th style={{ padding: '8px 10px' }}>Visitas</th>
                <th style={{ padding: '8px 10px' }}>CLV estimado</th>
              </tr>
            </thead>
            <tbody>
              {top.map((c, i) => {
                const clv = calcCLV(c, { now })
                return (
                  <tr key={c.id} onClick={() => navigate(`/admin/clientes/${c.id}`)} style={{ borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', cursor: 'pointer' }}>
                    <td style={{ padding: '10px', color: COLORS.greenDark, fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '10px' }}>{formatMoney(c.totalSpent)}</td>
                    <td style={{ padding: '10px' }}>{formatMoney(c.avgTicket)}</td>
                    <td style={{ padding: '10px' }}>{formatNumber(c.visits)}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: COLORS.greenDark }}>{formatMoney(clv.value)} <span style={{ fontSize: 10, fontWeight: 400, color: COLORS.onLightFaint }}>(estimado)</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
