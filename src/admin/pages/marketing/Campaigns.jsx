import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { CAMPAIGN_CHANNEL_LABELS, CAMPAIGN_STATUS_LABELS } from '../../../mock/campaigns'
import { formatNumber, formatDate } from '../../utils/format'
import StatCard from '../../components/StatCard'
import { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'
import NewCampaignModal from '../../components/crm/NewCampaignModal'

const STATUS_STYLE = {
  DRAFT: { bg: 'rgba(31,64,47,0.1)', color: COLORS.onLightMuted },
  SCHEDULED: { bg: 'rgba(176,138,62,0.16)', color: '#8A6A2E' },
  ACTIVE: { bg: 'rgba(48,77,59,0.16)', color: '#1F402F' },
  COMPLETED: { bg: 'rgba(48,77,59,0.1)', color: '#304D3B' },
  CANCELLED: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536' },
}

// Bloque 21/45 — hub de marketing: KPIs + listado. "Enviar" siempre simula
// (ver campaignService.simulateSend), nunca hay un canal real detrás.
export default function Campaigns() {
  useEffect(() => { document.title = 'Campañas | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { campaigns, segments, automations, createCampaign } = useCRM()
  const [formOpen, setFormOpen] = useState(false)

  const active = campaigns.filter(c => c.status === 'ACTIVE').length
  const scheduled = campaigns.filter(c => c.status === 'SCHEDULED').length
  const completed = campaigns.filter(c => c.status === 'COMPLETED').length
  const drafts = campaigns.filter(c => c.status === 'DRAFT').length
  const totalReached = campaigns.filter(c => c.stats).reduce((s, c) => s + c.stats.reached, 0)
  const totalRedemptions = campaigns.filter(c => c.stats).reduce((s, c) => s + c.stats.redemptions, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightFaint }}>
        Datos de demostración — ningún envío es real todavía.
      </p>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <StatCard label="Activas" value={formatNumber(active)} />
        <StatCard label="Programadas" value={formatNumber(scheduled)} />
        <StatCard label="Finalizadas" value={formatNumber(completed)} />
        <StatCard label="Borradores" value={formatNumber(drafts)} />
        <StatCard label="Clientes alcanzados" value={formatNumber(totalReached)} />
        <StatCard label="Canjes atribuidos" value={formatNumber(totalRedemptions)} />
        <StatCard label="Automatizaciones activas" value={formatNumber(automations.filter(a => a.status === 'activa').length)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nueva campaña</Button>
      </div>

      {campaigns.length === 0 ? <EmptyState label="Sin campañas." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {campaigns.map((c, i) => {
            const segment = segments.find(s => s.id === c.segmentId)
            const s = STATUS_STYLE[c.status]
            return (
              <button key={c.id} onClick={() => navigate(`/admin/marketing/campanas/${c.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, width: '100%', textAlign: 'left',
                  padding: '14px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
                  borderRight: 'none', borderBottom: 'none', borderLeft: 'none', background: 'none', cursor: 'pointer', fontFamily: FONTS.sans,
                }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: COLORS.onLightFaint, marginTop: 2 }}>
                    {segment?.name ?? '—'} · {CAMPAIGN_CHANNEL_LABELS[c.channel]} {c.sentAt ? `· ${formatDate(c.sentAt)}` : ''}
                  </p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 3, background: s.bg, color: s.color, flexShrink: 0 }}>
                  {CAMPAIGN_STATUS_LABELS[c.status]}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <NewCampaignModal open={formOpen} onClose={() => setFormOpen(false)} segments={segments}
        onCreate={(data) => { createCampaign(data); showToast(`Campaña "${data.name}" creada como borrador`) }} />
    </div>
  )
}
