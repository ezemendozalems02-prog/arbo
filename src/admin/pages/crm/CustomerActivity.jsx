import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { RESERVATIONS } from '../../../mock/reservations'
import { buildTimeline } from '../../../services/customerEventService'
import { getCampaignRecipients } from '../../../services/campaignService'
import { formatDate, formatTime } from '../../utils/format'
import { EmptyState } from '../../components/Panel'

const EVENT_TYPES = [
  { key: 'todos', label: 'Todos' },
  { key: 'RESERVATION_COMPLETED', label: 'Reservas' },
  { key: 'ORDER_COMPLETED', label: 'Compras' },
  { key: 'LOYALTY_POINTS_EARNED', label: 'Puntos ganados' },
  { key: 'LOYALTY_POINTS_REDEEMED', label: 'Puntos usados' },
  { key: 'REWARD_REDEEMED', label: 'Canjes' },
  { key: 'CAMPAIGN_SENT', label: 'Campañas' },
]

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

// Feed global — se arma combinando el timeline de cada cliente (bloque 6/47):
// no existe un log plano separado, cada hecho ya vive en su propia fuente.
export default function CustomerActivity() {
  useEffect(() => { document.title = 'Actividad | ARBO OS' }, [])
  const navigate = useNavigate()
  const { customers, segments, campaigns, getTransactionsForCustomer, getRedemptionsForCustomer } = useCRM()
  const [typeFilter, setTypeFilter] = useState('todos')

  const now = new Date()
  const deps = { now, getRedemptionsForCustomer }
  const sentCampaigns = campaigns.filter(c => c.stats)

  const allEvents = customers.flatMap(customer => {
    const reservations = RESERVATIONS.filter(r => r.customerId === customer.id)
    const transactions = getTransactionsForCustomer(customer.id)
    const redemptions = getRedemptionsForCustomer(customer.id)
    const campaignSends = sentCampaigns
      .filter(c => getCampaignRecipients(c, segments, customers, deps).some(r => r.id === customer.id))
      .map(c => ({ campaign: c, sentAt: c.sentAt }))
    return buildTimeline(customer, { reservations, transactions, redemptions, notes: customer.notes, campaignSends })
      .map(e => ({ ...e, customer }))
  })

  const filtered = allEvents
    .filter(e => typeFilter === 'todos' || e.type === typeFilter)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 80)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <select style={inputStyle} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState label="Sin actividad." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {filtered.map((e, i) => (
            <button key={e.id} onClick={() => navigate(`/admin/clientes/${e.customer.id}`)}
              style={{
                display: 'flex', gap: 14, width: '100%', textAlign: 'left', padding: '12px 18px', cursor: 'pointer', background: 'none',
                borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', borderRight: 'none', borderBottom: 'none', borderLeft: 'none',
                fontFamily: FONTS.sans, fontSize: 13,
              }}>
              <span style={{ color: COLORS.onLightFaint, fontSize: 11, minWidth: 110 }}>{formatDate(e.timestamp)} {formatTime(e.timestamp)}</span>
              <span style={{ color: COLORS.green, fontWeight: 600, minWidth: 150 }}>{e.customer.name}</span>
              <span style={{ color: COLORS.onLight }}>{e.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
