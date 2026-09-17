import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { getRetentionMetrics } from '../../../services/customerAnalyticsService'
import { evaluateCustomer } from '../../../services/segmentService'
import { periodRange } from '../../utils/period'
import { formatMoney, formatNumber, formatDate } from '../../utils/format'
import StatCard from '../../components/StatCard'
import PeriodFilter from '../../components/PeriodFilter'
import { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'
import NewCustomerModal from '../../components/crm/NewCustomerModal'

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

export default function CustomersDashboard() {
  useEffect(() => { document.title = 'Clientes | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { customers, transactions, segments, createCustomer, getRedemptionsForCustomer } = useCRM()
  const [searchParams] = useSearchParams()
  const [period, setPeriod] = useState('30d')
  const [custom, setCustom] = useState({})
  const [query, setQuery] = useState('')
  const [segmentFilter, setSegmentFilter] = useState(searchParams.get('segmento') ?? 'todos')
  const [formOpen, setFormOpen] = useState(false)

  const now = new Date()
  const { from, to } = periodRange(period, custom)
  const deps = { now, getRedemptionsForCustomer }

  const retention = getRetentionMetrics(customers, { now })
  const txnsInPeriod = transactions.filter(t => t.createdAt >= from && t.createdAt <= to)
  const puntosEmitidos = txnsInPeriod.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const puntosCanjeados = txnsInPeriod.filter(t => t.type === 'REDEEM').reduce((s, t) => s + Math.abs(t.amount), 0)
  const clientesNuevos = customers.filter(c => c.createdAt >= from && c.createdAt <= to).length

  const q = query.trim().toLowerCase()
  const rows = customers
    .filter(c => segmentFilter === 'todos' || evaluateCustomer(c, segments.find(s => s.id === segmentFilter), deps))
    .filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q))
    .sort((a, b) => b.totalSpent - a.totalSpent)

  const daysSince = (date) => Math.round((now - date) / 86400000)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PeriodFilter period={period} onChange={setPeriod} custom={custom} onCustomChange={setCustom} />

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <StatCard label="Clientes totales" value={formatNumber(retention.total)} />
        <StatCard label="Clientes nuevos" value={formatNumber(clientesNuevos)} hint="en el período" />
        <StatCard label="Clientes activos" value={formatNumber(retention.activos)} />
        <StatCard label="Clientes recurrentes" value={formatNumber(retention.recurrentes)} />
        <StatCard label="Clientes inactivos" value={formatNumber(retention.inactivos)} />
      </div>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <StatCard label="Ticket promedio" value={formatMoney(retention.avgTicket)} />
        <StatCard label="Frecuencia promedio" value={`${retention.avgFrequency} visitas`} />
        <StatCard label="Revenue por cliente" value={formatMoney(retention.revenuePerCustomer)} />
        <StatCard label="Puntos emitidos" value={formatNumber(puntosEmitidos)} hint="en el período" />
        <StatCard label="Puntos canjeados" value={formatNumber(puntosCanjeados)} hint="en el período" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre, email o teléfono..." />
          <select style={inputStyle} value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)}>
            <option value="todos">Todos los segmentos</option>
            {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nuevo cliente</Button>
      </div>

      {rows.length === 0 ? <EmptyState label="Sin resultados." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13, minWidth: 820 }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                <th style={{ padding: '10px 14px' }}>Nombre</th>
                <th style={{ padding: '10px 14px' }}>Contacto</th>
                <th style={{ padding: '10px 14px' }}>Última visita</th>
                <th style={{ padding: '10px 14px' }}>Visitas</th>
                <th style={{ padding: '10px 14px' }}>Total gastado</th>
                <th style={{ padding: '10px 14px' }}>Puntos</th>
                <th style={{ padding: '10px 14px' }}>Nivel</th>
                <th style={{ padding: '10px 14px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 60).map((c, i) => (
                <tr key={c.id} onClick={() => navigate(`/admin/clientes/${c.id}`)}
                  style={{ borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', cursor: 'pointer' }}>
                  <td style={{ padding: '10px 14px', color: COLORS.greenDark, fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '10px 14px', color: COLORS.onLightMuted }}>{c.email}</td>
                  <td style={{ padding: '10px 14px', color: COLORS.onLightMuted }}>{formatDate(c.lastActivity)}</td>
                  <td style={{ padding: '10px 14px' }}>{formatNumber(c.visits)}</td>
                  <td style={{ padding: '10px 14px' }}>{formatMoney(c.totalSpent)}</td>
                  <td style={{ padding: '10px 14px' }}>{formatNumber(c.points)}</td>
                  <td style={{ padding: '10px 14px', textTransform: 'uppercase', fontSize: 11, fontWeight: 700, color: COLORS.green }}>{c.tier?.name}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 3,
                      color: daysSince(c.lastActivity) <= 30 ? '#304D3B' : '#8A4536',
                      background: daysSince(c.lastActivity) <= 30 ? 'rgba(48,77,59,0.1)' : 'rgba(166,91,74,0.16)',
                    }}>
                      {daysSince(c.lastActivity) <= 30 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewCustomerModal open={formOpen} onClose={() => setFormOpen(false)}
        onCreate={(data) => { createCustomer(data); showToast(`Cliente "${data.name}" creado`) }} />
    </div>
  )
}
