// Timeline del cliente — Fase 5, bloque 6/47. Se arma en el momento a partir
// de las fuentes ya existentes (reservas, ventas, puntos, canjes, notas,
// campañas) en vez de mantener un log duplicado: cada hecho ya vive en su
// propia tabla mock, esto solo lo ordena para lectura humana.
export function buildTimeline(customer, { reservations = [], sales = [], transactions = [], redemptions = [], notes = [], campaignSends = [] }) {
  const events = []

  for (const r of reservations) {
    events.push({
      id: `tl-res-${r.id}`, type: r.status === 'cancelada' ? 'RESERVATION_CANCELLED' : r.date <= new Date() ? 'RESERVATION_COMPLETED' : 'RESERVATION_CREATED',
      timestamp: r.date, label: `Reserva · ${r.party} personas · ${r.time} · ${r.status}`,
    })
  }
  for (const s of sales) {
    events.push({ id: `tl-sale-${s.id}`, type: 'ORDER_COMPLETED', timestamp: s.createdAt, label: `Compra · $${Math.round(s.total).toLocaleString('es-AR')}` })
  }
  for (const t of transactions) {
    const isEarn = t.amount > 0
    events.push({
      id: `tl-ptx-${t.id}`, type: isEarn ? 'LOYALTY_POINTS_EARNED' : 'LOYALTY_POINTS_REDEEMED',
      timestamp: t.createdAt, label: `${t.reason} · ${isEarn ? '+' : ''}${t.amount} pts`,
    })
  }
  for (const r of redemptions) {
    events.push({ id: `tl-rdm-${r.id}`, type: 'REWARD_REDEEMED', timestamp: r.createdAt, label: `Canje de beneficio · código ${r.code} · ${r.status}` })
  }
  for (const n of notes) {
    events.push({ id: `tl-note-${n.id}`, type: 'NOTE_ADDED', timestamp: n.createdAt, label: `Nota de ${n.user}: "${n.text}"` })
  }
  for (const { campaign, sentAt } of campaignSends) {
    events.push({ id: `tl-cmp-${campaign.id}`, type: 'CAMPAIGN_SENT', timestamp: sentAt, label: `Recibió la campaña "${campaign.name}"` })
  }

  return events
    .filter(e => e.timestamp)
    .sort((a, b) => b.timestamp - a.timestamp)
}
