export const formatMoney = (n) => `$${Math.round(n).toLocaleString('es-AR')}`
export const formatNumber = (n) => n.toLocaleString('es-AR')

export const formatQty = (qty, unit, unitShort) => {
  const short = unitShort?.[unit] ?? unit
  const rounded = Math.round(qty * 100) / 100
  return `${rounded.toLocaleString('es-AR')} ${short}`
}

export const formatDate = (date) =>
  date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatTime = (date) =>
  date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

export const formatDayLabel = (date) =>
  date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

export function timeAgo(date, now) {
  const diffMs = now - date
  const future = diffMs < 0
  const minutes = Math.round(Math.abs(diffMs) / 60000)
  if (minutes < 1) return 'recién'
  const wrap = (s) => (future ? `en ${s}` : `hace ${s}`)
  if (minutes < 60) return wrap(`${minutes} min`)
  const hours = Math.round(minutes / 60)
  if (hours < 24) return wrap(`${hours} h`)
  const days = Math.round(hours / 24)
  return wrap(`${days} d`)
}
