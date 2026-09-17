import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { POINT_TXN_TYPES, POINT_TXN_LABELS } from '../../../mock/loyaltyTransactions'
import { formatDate, formatTime } from '../../utils/format'
import { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'
import AdjustPointsModal from '../../components/crm/AdjustPointsModal'

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

export default function PointsTransactions() {
  useEffect(() => { document.title = 'Movimientos de puntos | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { customers, transactions, adjustPoints } = useCRM()
  const [typeFilter, setTypeFilter] = useState('todos')
  const [formOpen, setFormOpen] = useState(false)

  const filtered = transactions.filter(t => typeFilter === 'todos' || t.type === typeFilter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <select style={inputStyle} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {POINT_TXN_TYPES.map(t => <option key={t} value={t}>{POINT_TXN_LABELS[t]}</option>)}
        </select>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nuevo movimiento</Button>
      </div>

      {filtered.length === 0 ? <EmptyState label="Sin movimientos." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13, minWidth: 760 }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                <th style={{ padding: '10px 14px' }}>Fecha</th>
                <th style={{ padding: '10px 14px' }}>Cliente</th>
                <th style={{ padding: '10px 14px' }}>Tipo</th>
                <th style={{ padding: '10px 14px' }}>Motivo</th>
                <th style={{ padding: '10px 14px' }}>Puntos</th>
                <th style={{ padding: '10px 14px' }}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((t, i) => {
                const customer = customers.find(c => c.id === t.customerId)
                return (
                  <tr key={t.id} style={{ borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none' }}>
                    <td style={{ padding: '10px 14px', color: COLORS.onLightMuted }}>{formatDate(t.createdAt)} {formatTime(t.createdAt)}</td>
                    <td style={{ padding: '10px 14px', color: COLORS.greenDark, fontWeight: 600, cursor: 'pointer' }} onClick={() => customer && navigate(`/admin/clientes/${customer.id}`)}>{customer?.name ?? '—'}</td>
                    <td style={{ padding: '10px 14px', textTransform: 'uppercase', fontSize: 11, fontWeight: 700, color: COLORS.onLightMuted }}>{POINT_TXN_LABELS[t.type]}</td>
                    <td style={{ padding: '10px 14px', color: COLORS.onLightMuted }}>{t.reason}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: t.amount >= 0 ? COLORS.green : '#8A4536' }}>{t.amount >= 0 ? '+' : ''}{t.amount}</td>
                    <td style={{ padding: '10px 14px' }}>{t.balanceAfter}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdjustPointsModal open={formOpen} onClose={() => setFormOpen(false)} customers={customers}
        onConfirm={(payload) => { adjustPoints(payload); showToast('Movimiento registrado') }} />
    </div>
  )
}
