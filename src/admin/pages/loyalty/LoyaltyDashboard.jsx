import { useEffect } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { formatNumber, formatDate } from '../../utils/format'
import StatCard from '../../components/StatCard'
import Panel, { EmptyState } from '../../components/Panel'

export default function LoyaltyDashboard() {
  useEffect(() => { document.title = 'ARBO Club | ARBO OS' }, [])
  const { customers, levels, transactions, redemptions, rewards } = useCRM()

  const now = new Date()
  const puntosEmitidos = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const puntosCanjeados = transactions.filter(t => t.type === 'REDEEM').reduce((s, t) => s + Math.abs(t.amount), 0)
  const beneficiosCanjeados = redemptions.length
  const beneficiosUtilizados = redemptions.filter(r => r.status === 'utilizado').length
  const nuevosMiembros = customers.filter(c => (now - c.createdAt) <= 30 * 86400000).length

  const distribution = [...levels].sort((a, b) => a.order - b.order).map(l => ({
    level: l, count: customers.filter(c => c.tier?.key === l.key).length,
  }))

  const recentActivity = [
    ...transactions.slice(0, 20).map(t => ({ id: t.id, at: t.createdAt, label: `${customers.find(c => c.id === t.customerId)?.name ?? 'Cliente'} · ${t.reason} · ${t.amount >= 0 ? '+' : ''}${t.amount} pts` })),
    ...redemptions.slice(0, 20).map(r => ({ id: r.id, at: r.createdAt, label: `${customers.find(c => c.id === r.customerId)?.name ?? 'Cliente'} · canjeó ${rewards.find(rw => rw.id === r.rewardId)?.name ?? 'beneficio'}` })),
  ].sort((a, b) => b.at - a.at).slice(0, 12)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <StatCard label="Miembros" value={formatNumber(customers.length)} />
        <StatCard label="Nuevos miembros (30d)" value={formatNumber(nuevosMiembros)} />
        <StatCard label="Puntos emitidos" value={formatNumber(puntosEmitidos)} />
        <StatCard label="Puntos canjeados" value={formatNumber(puntosCanjeados)} />
        <StatCard label="Beneficios canjeados" value={formatNumber(beneficiosCanjeados)} />
        <StatCard label="Beneficios utilizados" value={formatNumber(beneficiosUtilizados)} />
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Panel title="Distribución por niveles">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {distribution.map(({ level, count }, i) => (
              <div key={level.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                <span style={{ color: level.color, fontWeight: 700, textTransform: 'uppercase', fontSize: 11 }}>{level.name}</span>
                <span style={{ color: COLORS.onLightMuted }}>{formatNumber(count)} clientes</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Actividad reciente">
          {recentActivity.length === 0 ? <EmptyState label="Sin actividad." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentActivity.map((a, i) => (
                <div key={a.id} style={{ padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 12 }}>
                  <span style={{ color: COLORS.onLightFaint }}>{formatDate(a.at)}</span> — <span style={{ color: COLORS.onLight }}>{a.label}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
