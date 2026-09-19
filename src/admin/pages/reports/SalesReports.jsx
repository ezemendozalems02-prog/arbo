import { useEffect, useState, useMemo } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { formatMoney } from '../../utils/format'
import StatCard from '../../components/StatCard'
import Panel, { EmptyState } from '../../components/Panel'
import { getSalesReport, resolveDateRange } from '../../../services/domain/analyticsEngine'

const PERIODS = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'ayer', label: 'Ayer' },
  { key: '7d', label: 'Últimos 7 días' },
  { key: '30d', label: 'Últimos 30 días' },
  { key: 'mes', label: 'Mes actual' },
]

const inputStyle = {
  padding: '9px 12px',
  background: COLORS.warmWhite,
  border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight,
  fontFamily: FONTS.sans,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
}

export default function SalesReports() {
  useEffect(() => {
    document.title = 'Reporte de Ventas | ARBO OS'
  }, [])

  const { sales } = usePOS()
  const [period, setPeriod] = useState('30d')

  // Transformar ventas al formato esperado por el motor analítico si es necesario
  const analyticsState = useMemo(() => {
    const domainSales = sales.map(s => ({
      id: s.id,
      organization_id: s.organization_id || 'org_arbo_main',
      branch_id: s.branch_id || 'branch_trevelin_main',
      total: s.total || 0,
      status: s.status === 'aprobado' || s.status === 'PAID' ? 'PAID' : s.status,
      created_at: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    }))

    const domainPayments = sales.flatMap(s => {
      if (!s.paymentMethod) return []
      return [{
        sale_id: s.id,
        payment_method: s.paymentMethod,
        amount: s.total || 0,
      }]
    })

    return {
      sales: domainSales,
      payments: domainPayments,
    }
  }, [sales])

  const report = useMemo(() => {
    return getSalesReport({
      state: analyticsState,
      organizationId: 'org_arbo_main',
      periodKey: period,
    })
  }, [analyticsState, period])

  const { metrics, paymentBreakdown } = report
  const { comparison } = metrics

  const formatDelta = (delta, deltaPct) => {
    const sign = delta > 0 ? '+' : ''
    const color = delta > 0 ? '#1F402F' : (delta < 0 ? '#8A4536' : COLORS.onLightMuted)
    return (
      <span style={{ color, fontWeight: 700, fontSize: 11 }}>
        {sign}{deltaPct}% ({sign}{formatMoney(delta)})
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Encabezado y Selector de Período */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.green, margin: 0 }}>
            Reporte Ejecutivo de Ventas
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.onLightMuted }}>
            Consolidado determinístico con comparativa versus período anterior.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                ...inputStyle,
                border: `1.5px solid ${period === p.key ? COLORS.green : COLORS.lineGreen}`,
                background: period === p.key ? COLORS.green : COLORS.warmWhite,
                color: period === p.key ? COLORS.cream : COLORS.onLightMuted,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas KPI con Comparativa */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: 16, borderRadius: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.onLightMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Facturación del Período
          </div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 26, fontWeight: 700, color: COLORS.green, margin: '8px 0 4px' }}>
            {formatMoney(metrics.revenue)}
          </div>
          <div style={{ fontSize: 12 }}>
            vs período anterior: {formatDelta(comparison.revenueDelta, comparison.revenueDeltaPct)}
          </div>
        </div>

        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: 16, borderRadius: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.onLightMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Comandas / Tickets
          </div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 26, fontWeight: 700, color: COLORS.green, margin: '8px 0 4px' }}>
            {metrics.salesCount}
          </div>
          <div style={{ fontSize: 12 }}>
            vs período anterior: {comparison.countDelta > 0 ? '+' : ''}{comparison.countDelta} ({comparison.countDeltaPct}%)
          </div>
        </div>

        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: 16, borderRadius: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.onLightMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ticket Promedio
          </div>
          <div style={{ fontFamily: FONTS.serif, fontSize: 26, fontWeight: 700, color: COLORS.green, margin: '8px 0 4px' }}>
            {formatMoney(metrics.averageTicket)}
          </div>
          <div style={{ fontSize: 12 }}>
            vs período anterior: {formatDelta(comparison.avgTicketDelta, comparison.avgTicketDeltaPct)}
          </div>
        </div>
      </div>

      {/* Desglose por Método de Pago */}
      <Panel title="Desglose por Método de Pago">
        {Object.keys(paymentBreakdown).length === 0 ? (
          <EmptyState label="No se registraron cobros en el período seleccionado." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {Object.entries(paymentBreakdown).map(([method, amount]) => {
              const pct = metrics.revenue > 0 ? ((amount / metrics.revenue) * 100).toFixed(1) : 0
              return (
                <div key={method} style={{ padding: 12, border: `1px solid ${COLORS.lineGreen}`, borderRadius: 4, background: '#FAFAFA' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.onLightMuted, textTransform: 'uppercase' }}>
                    {method}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.green, margin: '4px 0' }}>
                    {formatMoney(amount)}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.onLightMuted }}>
                    {pct}% del total facturado
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}
