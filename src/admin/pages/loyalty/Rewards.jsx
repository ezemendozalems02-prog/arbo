import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { REWARD_TYPE_LABELS } from '../../../mock/rewards'
import { isRewardActive } from '../../../services/rewardService'
import { formatNumber, formatDate } from '../../utils/format'
import { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'
import NewRewardModal from '../../components/crm/NewRewardModal'

const STATUS_STYLE = {
  activo: { bg: 'rgba(48,77,59,0.1)', color: '#304D3B' },
  inactivo: { bg: 'rgba(31,64,47,0.1)', color: COLORS.onLightMuted },
  agotado: { bg: 'rgba(176,138,62,0.16)', color: '#8A6A2E' },
  vencido: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536' },
}

export default function Rewards() {
  useEffect(() => { document.title = 'Beneficios ARBO Club | ARBO OS' }, [])
  const { showToast } = useToast()
  const { rewards, createReward } = useCRM()
  const [formOpen, setFormOpen] = useState(false)
  const now = new Date()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nuevo beneficio</Button>
      </div>

      {rewards.length === 0 ? <EmptyState label="Sin beneficios." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13, minWidth: 700 }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                <th style={{ padding: '10px 14px' }}>Nombre</th>
                <th style={{ padding: '10px 14px' }}>Tipo</th>
                <th style={{ padding: '10px 14px' }}>Puntos</th>
                <th style={{ padding: '10px 14px' }}>Stock</th>
                <th style={{ padding: '10px 14px' }}>Canjeados</th>
                <th style={{ padding: '10px 14px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r, i) => {
                const active = isRewardActive(r, now)
                const status = r.status === 'vencido' ? 'vencido' : active ? 'activo' : (r.stock !== null && r.redeemedCount >= r.stock) ? 'agotado' : 'inactivo'
                const s = STATUS_STYLE[status]
                return (
                  <tr key={r.id} style={{ borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none' }}>
                    <td style={{ padding: '10px 14px', color: COLORS.greenDark, fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: '10px 14px', color: COLORS.onLightMuted }}>{REWARD_TYPE_LABELS[r.type]}</td>
                    <td style={{ padding: '10px 14px' }}>{formatNumber(r.pointsCost)}</td>
                    <td style={{ padding: '10px 14px', color: COLORS.onLightMuted }}>{r.stock === null ? 'Ilimitado' : `${r.stock - r.redeemedCount} / ${r.stock}`}</td>
                    <td style={{ padding: '10px 14px' }}>{formatNumber(r.redeemedCount)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 3, background: s.bg, color: s.color }}>
                        {status}{r.endDate ? ` · ${formatDate(r.endDate)}` : ''}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <NewRewardModal open={formOpen} onClose={() => setFormOpen(false)}
        onCreate={(data) => { createReward(data); showToast(`Beneficio "${data.name}" creado`) }} />
    </div>
  )
}
