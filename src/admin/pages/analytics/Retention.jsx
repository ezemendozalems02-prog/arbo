import { useEffect } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { getRetentionMetrics } from '../../../services/customerAnalyticsService'
import { formatMoney, formatNumber } from '../../utils/format'
import StatCard from '../../components/StatCard'
import Panel from '../../components/Panel'
import BarChart from '../../components/BarChart'

export default function Retention() {
  useEffect(() => { document.title = 'Retención | ARBO OS' }, [])
  const { customers } = useCRM()
  const now = new Date()
  const r = getRetentionMetrics(customers, { now })

  const breakdown = [
    { label: 'Nuevos', total: r.nuevos }, { label: 'Activos', total: r.activos },
    { label: 'Recurrentes', total: r.recurrentes }, { label: 'Inactivos', total: r.inactivos },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <StatCard label="Clientes totales" value={formatNumber(r.total)} />
        <StatCard label="Nuevos (30d)" value={formatNumber(r.nuevos)} />
        <StatCard label="Activos (30d)" value={formatNumber(r.activos)} />
        <StatCard label="Recurrentes" value={formatNumber(r.recurrentes)} />
        <StatCard label="Perdidos (60d+)" value={formatNumber(r.inactivos)} />
      </div>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <StatCard label="Frecuencia promedio" value={`${r.avgFrequency} visitas`} />
        <StatCard label="Ticket promedio" value={formatMoney(r.avgTicket)} />
        <StatCard label="Revenue por cliente" value={formatMoney(r.revenuePerCustomer)} />
      </div>
      <Panel title="Composición de la base de clientes">
        <BarChart data={breakdown} formatValue={formatNumber} />
      </Panel>
    </div>
  )
}
