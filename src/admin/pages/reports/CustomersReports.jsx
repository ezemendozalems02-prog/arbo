import { useEffect, useMemo } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { usePOS } from '../../../context/POSContext'
import { formatMoney } from '../../utils/format'
import StatCard from '../../components/StatCard'
import Panel, { EmptyState } from '../../components/Panel'

export default function CustomersReports() {
  useEffect(() => {
    document.title = 'Reporte de Clientes & CRM | ARBO OS'
  }, [])

  const { customers, segments, pointsTransactions, redemptions } = useCRM()
  const { sales } = usePOS()

  const metrics = useMemo(() => {
    const total = customers.length
    const active = customers.filter(c => c.status === 'activo' || c.status === 'ACTIVE').length
    const clubMembers = customers.filter(c => c.loyaltyEnrolled || c.is_member).length

    const salesWithCustomer = sales.filter(s => s.customerId || s.customer_id)
    const totalCustomerSpend = salesWithCustomer.reduce((sum, s) => sum + Number(s.total || 0), 0)
    const avgCustomerSpend = total > 0 ? totalCustomerSpend / total : 0

    const totalPointsEarned = pointsTransactions
      ? pointsTransactions.filter(t => t.type === 'EARN').reduce((sum, t) => sum + (t.points || 0), 0)
      : 0

    const totalPointsRedeemed = pointsTransactions
      ? pointsTransactions.filter(t => t.type === 'REDEEM').reduce((sum, t) => sum + (t.points || 0), 0)
      : 0

    return {
      total,
      active,
      clubMembers,
      totalCustomerSpend,
      avgCustomerSpend,
      totalPointsEarned,
      totalPointsRedeemed,
    }
  }, [customers, sales, pointsTransactions])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.green, margin: 0 }}>
          Reporte de Clientes & Fidelización
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.onLightMuted }}>
          Métricas consolidadas de clientes, gasto medio y programa ARBO Club.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard label="Total Clientes Registrados" value={metrics.total} />
        <StatCard label="Miembros ARBO Club" value={metrics.clubMembers} />
        <StatCard label="Gasto Promedio Acumulado" value={formatMoney(metrics.avgCustomerSpend)} />
        <StatCard label="Puntos Otorgados" value={metrics.totalPointsEarned} />
        <StatCard label="Puntos Canjeados" value={metrics.totalPointsRedeemed} />
      </div>

      <Panel title="Segmentos de Clientes Activos">
        {segments.length === 0 ? (
          <EmptyState label="No hay segmentos configurados." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {segments.map(seg => (
              <div key={seg.id} style={{ padding: 12, border: `1px solid ${COLORS.lineGreen}`, borderRadius: 4, background: COLORS.warmWhite }}>
                <div style={{ fontWeight: 700, color: COLORS.green, fontSize: 14 }}>{seg.name}</div>
                <div style={{ fontSize: 12, color: COLORS.onLightMuted, margin: '4px 0' }}>{seg.description || 'Sin descripción'}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.onLight }}>
                  Criterio: {seg.rule || 'Automático'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
