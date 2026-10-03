import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { formatNumber, formatDate } from '../../utils/format'
import { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'
import RedeemRewardModal from '../../components/crm/RedeemRewardModal'

const STATUS_STYLE = {
  pendiente: { bg: 'rgba(176,138,62,0.16)', color: '#8A6A2E' },
  utilizado: { bg: 'rgba(48,77,59,0.1)', color: '#304D3B' },
  vencido: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536' },
  cancelado: { bg: 'rgba(31,64,47,0.1)', color: COLORS.onLightMuted },
}

export default function Redemptions() {
  useEffect(() => { document.title = 'Canjes | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { customers, rewards, redemptions, redeemReward, markRedemptionUsed, cancelRedemption } = useCRM()
  const [statusFilter, setStatusFilter] = useState('todos')
  const [formOpen, setFormOpen] = useState(false)

  const rows = redemptions.filter(r => statusFilter === 'todos' || r.status === statusFilter)

  const inputStyle = {
    padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
    color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <select style={inputStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="todos">Todos los estados</option>
          {Object.keys(STATUS_STYLE).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nuevo canje</Button>
      </div>

      {rows.length === 0 ? <EmptyState label="Sin canjes." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13, minWidth: 760 }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                <th style={{ padding: '10px 14px' }}>Cliente</th>
                <th style={{ padding: '10px 14px' }}>Beneficio</th>
                <th style={{ padding: '10px 14px' }}>Puntos</th>
                <th style={{ padding: '10px 14px' }}>Código</th>
                <th style={{ padding: '10px 14px' }}>Fecha</th>
                <th style={{ padding: '10px 14px' }}>Estado</th>
                <th style={{ padding: '10px 14px' }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 60).map((r, i) => {
                const customer = customers.find(c => c.id === r.customerId)
                const reward = rewards.find(rw => rw.id === r.rewardId)
                const s = STATUS_STYLE[r.status]
                return (
                  <tr key={r.id} style={{ borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none' }}>
                    <td style={{ padding: '10px 14px', color: COLORS.greenDark, fontWeight: 600, cursor: 'pointer' }} onClick={() => customer && navigate(`/admin/clientes/${customer.id}`)}>{customer?.name ?? '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{reward?.name ?? '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{formatNumber(r.pointsUsed)}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{r.code}</td>
                    <td style={{ padding: '10px 14px', color: COLORS.onLightMuted }}>{formatDate(r.createdAt)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 3, background: s.bg, color: s.color }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      {r.status === 'pendiente' && (
                        <>
                          <button onClick={() => { markRedemptionUsed(r.id); showToast('Canje marcado como utilizado') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.green, fontFamily: FONTS.sans, fontSize: 11, marginRight: 10 }}>Marcar usado</button>
                          <button onClick={() => { cancelRedemption(r.id); showToast('Canje cancelado — puntos devueltos') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A4536', fontFamily: FONTS.sans, fontSize: 11 }}>Cancelar</button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <RedeemRewardModal open={formOpen} onClose={() => setFormOpen(false)} customers={customers} rewards={rewards}
        onConfirm={(payload) => {
          const result = redeemReward(payload)
          if (result.ok) showToast('Beneficio canjeado')
          return result
        }} />
    </div>
  )
}
