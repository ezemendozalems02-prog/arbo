import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { RESERVATIONS } from '../../../mock/reservations'
import { ORDERS, ORDER_STATUS_LABELS } from '../../../mock/orders'
import { REWARD_TYPE_LABELS } from '../../../mock/rewards'
import { POINT_TXN_LABELS } from '../../../mock/loyaltyTransactions'
import { buildTimeline } from '../../../services/customerEventService'
import { calcCLV, calcRFM } from '../../../services/customerAnalyticsService'
import { isRewardActive, canAffordReward } from '../../../services/rewardService'
import { getCampaignRecipients } from '../../../services/campaignService'
import { renderMessage } from '../../../services/campaignTemplateService'
import { formatMoney, formatNumber, formatDate, formatTime } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import Tabs from '../../components/Tabs'
import Button from '../../ui/Button'
import RedeemRewardModal from '../../components/crm/RedeemRewardModal'
import AdjustPointsModal from '../../components/crm/AdjustPointsModal'

const inputStyle = {
  width: '100%', padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none', boxSizing: 'border-box',
}
const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
    <span>{label}</span><span style={{ color: COLORS.onLight, fontWeight: 600 }}>{value}</span>
  </div>
)
const TABS = [
  { key: 'perfil', label: 'Perfil' }, { key: 'reservas', label: 'Reservas' }, { key: 'compras', label: 'Compras' },
  { key: 'club', label: 'ARBO Club' }, { key: 'campanas', label: 'Campañas' }, { key: 'timeline', label: 'Timeline' },
]

export default function CustomerDetail() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { customers, rewards, campaigns, segments, getCustomerById, getTransactionsForCustomer, getRedemptionsForCustomer,
    addCustomerNote, setCustomerTags, updateConsent, adjustPoints, redeemReward } = useCRM()
  const customer = getCustomerById(customerId)
  const [tab, setTab] = useState('perfil')
  const [noteText, setNoteText] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)

  useEffect(() => { document.title = customer ? `${customer.name} | ARBO OS` : 'Cliente | ARBO OS' }, [customer])

  if (!customer) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, marginBottom: 20 }}>No encontramos ese cliente.</p>
        <Button onClick={() => navigate('/admin/clientes')}>Volver a Clientes</Button>
      </div>
    )
  }

  const now = new Date()
  const reservations = RESERVATIONS.filter(r => r.customerId === customer.id).sort((a, b) => b.date - a.date)
  const orders = ORDERS.filter(o => o.customerId === customer.id).sort((a, b) => b.createdAt - a.createdAt)
  const transactions = getTransactionsForCustomer(customer.id)
  const redemptions = getRedemptionsForCustomer(customer.id)
  const deps = { now, getRedemptionsForCustomer }
  const campaignSends = campaigns
    .filter(c => c.stats)
    .filter(c => getCampaignRecipients(c, segments, customers, deps).some(r => r.id === customer.id))
    .map(c => ({ campaign: c, sentAt: c.sentAt }))
  const timeline = buildTimeline(customer, { reservations, transactions, redemptions, notes: customer.notes, campaignSends })

  const pointsEarnedLifetime = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const pointsUsedLifetime = transactions.filter(t => t.type === 'REDEEM').reduce((s, t) => s + Math.abs(t.amount), 0)
  const availableRewards = rewards.filter(r => isRewardActive(r, now) && canAffordReward(r, customer.points))
  const clv = calcCLV(customer, { now })
  const rfm = calcRFM(customer, { now })

  return (
    <div style={{ maxWidth: 900 }}>
      <button onClick={() => navigate('/admin/clientes')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginBottom: 18, padding: 0 }}>
        ← Volver a Clientes
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.greenDark }}>{customer.name}</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 4 }}>{customer.email} · {customer.phone}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline-light" size="sm" onClick={() => setAdjustOpen(true)}>Ajustar puntos</Button>
          <Button size="sm" onClick={() => setRedeemOpen(true)}>Canjear beneficio</Button>
        </div>
      </div>

      <Tabs options={TABS} active={tab} onChange={setTab} />

      {tab === 'perfil' && (
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <Panel title="Información">
            <Row label="Nombre" value={customer.name} />
            <Row label="Email" value={customer.email || '—'} />
            <Row label="Teléfono" value={customer.phone || '—'} />
            <Row label="Fecha de nacimiento" value={customer.birthDate ? formatDate(customer.birthDate) : '—'} />
            <Row label="Cliente desde" value={formatDate(customer.createdAt)} />
          </Panel>
          <Panel title="Actividad">
            <Row label="Última visita" value={formatDate(customer.lastActivity)} />
            <Row label="Cantidad de visitas" value={formatNumber(customer.visits)} />
            <Row label="Total gastado" value={formatMoney(customer.totalSpent)} />
            <Row label="Ticket promedio" value={formatMoney(customer.avgTicket)} />
            <Row label="CLV estimado" value={`${formatMoney(clv.value)} (estimado)`} />
          </Panel>
          <Panel title="RFM">
            <Row label="Recency" value={`${rfm.recencyDays} días`} />
            <Row label="Frequency" value={`${rfm.frequency} visitas`} />
            <Row label="Monetary" value={formatMoney(rfm.monetary)} />
          </Panel>
          <Panel title="Consentimientos">
            {['email', 'whatsapp', 'marketing'].map(k => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, cursor: 'pointer' }}>
                <input type="checkbox" checked={customer.consent[k]} onChange={e => updateConsent(customer.id, { [k]: e.target.checked })} />
                Acepta {k === 'email' ? 'email' : k === 'whatsapp' ? 'WhatsApp' : 'marketing'}
              </label>
            ))}
          </Panel>
          <Panel title="Etiquetas">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {customer.tags.map(t => (
                <span key={t} onClick={() => setCustomerTags(customer.id, customer.tags.filter(x => x !== t))}
                  style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: COLORS.cream, background: COLORS.green, padding: '4px 9px', cursor: 'pointer' }}>
                  {t} ×
                </span>
              ))}
              {customer.tags.length === 0 && <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint }}>Sin etiquetas.</span>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Nueva etiqueta" />
              <Button size="sm" onClick={() => { if (tagInput.trim()) { setCustomerTags(customer.id, [...customer.tags, tagInput.trim()]); setTagInput('') } }}>Agregar</Button>
            </div>
          </Panel>
          <Panel title="Notas internas">
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Ej: prefiere mesa exterior" />
              <Button size="sm" onClick={() => { if (noteText.trim()) { addCustomerNote(customer.id, noteText.trim()); setNoteText(''); showToast('Nota agregada') } }}>Agregar</Button>
            </div>
            {customer.notes.length === 0 ? <EmptyState label="Sin notas todavía." /> : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {customer.notes.map((n, i) => (
                  <div key={n.id} style={{ padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>
                    "{n.text}" <span style={{ color: COLORS.onLightFaint, fontSize: 11 }}>— {n.user}, {formatDate(n.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      {tab === 'reservas' && (
        <Panel title="Reservas">
          {reservations.length === 0 ? <EmptyState label="Sin reservas registradas." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {reservations.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <span style={{ color: COLORS.onLight }}>{formatDate(r.date)} · {r.time} · {r.party} personas · Mesa {r.tableNumber}</span>
                  <span style={{ textTransform: 'capitalize', color: COLORS.onLightMuted }}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === 'compras' && (
        <Panel title="Compras">
          {orders.length === 0 ? <EmptyState label="Sin compras registradas." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {orders.map((o, i) => (
                <div key={o.id} style={{ padding: '9px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: COLORS.green, fontWeight: 600 }}>{o.id} · {formatDate(o.createdAt)} {formatTime(o.createdAt)}</span>
                    <span style={{ fontWeight: 700, color: COLORS.greenDark }}>{formatMoney(o.total)}</span>
                  </div>
                  <p style={{ color: COLORS.onLightFaint, fontSize: 12, marginTop: 2 }}>
                    {o.items.map(it => `${it.qty}× ${it.name}`).join(', ')} · {o.paymentMethod} · {ORDER_STATUS_LABELS[o.status]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === 'club' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <Panel title="ARBO Club">
              <Row label="Nivel" value={customer.tier?.name ?? '—'} />
              <Row label="Puntos actuales" value={formatNumber(customer.points)} />
              <Row label="Puntos históricos" value={formatNumber(pointsEarnedLifetime)} />
              <Row label="Puntos utilizados" value={formatNumber(pointsUsedLifetime)} />
              <Row label="Beneficios disponibles" value={formatNumber(availableRewards.length)} />
              <Row label="Beneficios utilizados" value={formatNumber(redemptions.filter(r => r.status === 'utilizado').length)} />
            </Panel>
          </div>
          <Panel title="Historial de canjes">
            {redemptions.length === 0 ? <EmptyState label="Sin canjes todavía." /> : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {redemptions.map((r, i) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                    <span style={{ color: COLORS.onLight }}>{REWARD_TYPE_LABELS[rewards.find(rw => rw.id === r.rewardId)?.type] ?? ''} · {rewards.find(rw => rw.id === r.rewardId)?.name} · {r.code}</span>
                    <span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700, color: COLORS.onLightMuted }}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Movimientos de puntos">
            {transactions.length === 0 ? <EmptyState label="Sin movimientos." /> : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {transactions.slice(0, 15).map((t, i) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                    <span style={{ color: COLORS.onLight }}>{POINT_TXN_LABELS[t.type]} · {t.reason}</span>
                    <span style={{ fontWeight: 700, color: t.amount >= 0 ? COLORS.green : '#8A4536' }}>{t.amount >= 0 ? '+' : ''}{t.amount} pts</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      {tab === 'campanas' && (
        <Panel title="Campañas recibidas">
          {campaignSends.length === 0 ? <EmptyState label="No recibió campañas todavía." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {campaignSends.map(({ campaign }, i) => (
                <div key={campaign.id} style={{ padding: '9px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: COLORS.green, fontWeight: 600 }}>{campaign.name}</span>
                    <span style={{ color: COLORS.onLightMuted }}>{formatDate(campaign.sentAt)}</span>
                  </div>
                  <p style={{ color: COLORS.onLightFaint, fontSize: 12, marginTop: 2 }}>"{renderMessage(campaign.message, customer)}"</p>
                  <p style={{ color: COLORS.onLightFaint, fontSize: 11, marginTop: 2 }}>
                    Estadísticas agregadas de la campaña (demo): {campaign.stats.opens} aperturas · {campaign.stats.clicks} clicks · {campaign.stats.redemptions} canjes
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {tab === 'timeline' && (
        <Panel title="Timeline">
          {timeline.length === 0 ? <EmptyState label="Sin actividad registrada." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {timeline.slice(0, 40).map((e, i) => (
                <div key={e.id} style={{ display: 'flex', gap: 14, padding: '9px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <span style={{ color: COLORS.onLightFaint, fontSize: 11, minWidth: 90 }}>{formatDate(e.timestamp)}</span>
                  <span style={{ color: COLORS.onLight }}>{e.label}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      <RedeemRewardModal open={redeemOpen} onClose={() => setRedeemOpen(false)} customers={[customer]} rewards={rewards}
        preselectedCustomerId={customer.id} onConfirm={(payload) => {
          const result = redeemReward(payload)
          if (result.ok) showToast('Beneficio canjeado')
          return result
        }} />
      <AdjustPointsModal open={adjustOpen} onClose={() => setAdjustOpen(false)} customers={[customer]} preselectedCustomerId={customer.id}
        onConfirm={(payload) => { adjustPoints(payload); showToast('Movimiento registrado') }} />
    </div>
  )
}
