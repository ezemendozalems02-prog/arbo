import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { ORDERS } from '../../../mock/orders'
import { CAMPAIGN_CHANNEL_LABELS, CAMPAIGN_STATUS_LABELS } from '../../../mock/campaigns'
import { previewAudience, getCampaignRecipients } from '../../../services/campaignService'
import { renderMessage } from '../../../services/campaignTemplateService'
import { formatMoney, formatNumber, formatDate } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
    <span>{label}</span><span style={{ color: COLORS.onLight, fontWeight: 600 }}>{value}</span>
  </div>
)

// Bloque 24/46 — preview de audiencia antes de enviar, y atribución
// (campaignId/customerId/orderId) calculada contra pedidos reales del mock
// posteriores al envío — nunca se afirma causalidad, solo coincidencia temporal.
export default function CampaignDetail() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { customers, segments, getCampaignById, getRedemptionsForCustomer, sendCampaign, cancelCampaign } = useCRM()
  const campaign = getCampaignById(campaignId)

  useEffect(() => { document.title = campaign ? `${campaign.name} | ARBO OS` : 'Campaña | ARBO OS' }, [campaign])

  if (!campaign) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, marginBottom: 20 }}>No encontramos esa campaña.</p>
        <Button onClick={() => navigate('/admin/marketing/campanas')}>Volver a Campañas</Button>
      </div>
    )
  }

  const now = new Date()
  const deps = { now, getRedemptionsForCustomer }
  const segment = segments.find(s => s.id === campaign.segmentId)
  const preview = previewAudience(campaign, segments, customers, deps)
  const recipients = campaign.stats ? getCampaignRecipients(campaign, segments, customers, deps) : []
  const attribution = campaign.sentAt
    ? recipients.flatMap(c => ORDERS.filter(o => o.customerId === c.id && o.createdAt > campaign.sentAt && (o.createdAt - campaign.sentAt) <= 7 * 86400000).map(o => ({ customer: c, order: o })))
    : []

  return (
    <div style={{ maxWidth: 640 }}>
      <button onClick={() => navigate('/admin/marketing/campanas')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginBottom: 18, padding: 0 }}>
        ← Volver a Campañas
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.greenDark }}>{campaign.name}</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 4 }}>{segment?.name} · {CAMPAIGN_CHANNEL_LABELS[campaign.channel]}</p>
        </div>
        {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="outline-light" size="sm" onClick={() => cancelCampaign(campaign.id)}>Cancelar</Button>
            <Button size="sm" onClick={() => { sendCampaign(campaign.id); showToast('Envío simulado — sin canal real detrás') }}>Enviar ahora (simulado)</Button>
          </div>
        )}
      </div>

      <Panel title="Mensaje">
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLight, fontStyle: 'italic', marginBottom: 10 }}>"{campaign.message}"</p>
        {preview.sample[0] && (
          <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint }}>
            Ejemplo personalizado para {preview.sample[0].name}: "{renderMessage(campaign.message, preview.sample[0])}"
          </p>
        )}
      </Panel>

      <div style={{ height: 20 }} />

      <Panel title="Audiencia">
        <Row label="Estado" value={CAMPAIGN_STATUS_LABELS[campaign.status]} />
        <Row label="Esta campaña alcanzaría a" value={`${formatNumber(preview.count)} clientes`} />
        {campaign.stats && <Row label="Enviada el" value={formatDate(campaign.sentAt)} />}
      </Panel>

      {campaign.stats && (
        <>
          <div style={{ height: 20 }} />
          <Panel title="Estadísticas (demo)">
            <Row label="Alcanzados" value={formatNumber(campaign.stats.reached)} />
            <Row label="Aperturas" value={formatNumber(campaign.stats.opens)} />
            <Row label="Clicks" value={formatNumber(campaign.stats.clicks)} />
            <Row label="Canjes" value={formatNumber(campaign.stats.redemptions)} />
            <Row label="Conversión" value={`${campaign.stats.conversion}%`} />
          </Panel>

          <div style={{ height: 20 }} />
          <Panel title="Atribución (demo)">
            {attribution.length === 0 ? <EmptyState label="Sin compras posteriores atribuibles todavía." /> : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {attribution.slice(0, 10).map(({ customer, order }, i) => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                    <span style={{ color: COLORS.onLight }}>{customer.name} · {order.id}</span>
                    <span style={{ color: COLORS.onLightMuted }}>{formatMoney(order.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
