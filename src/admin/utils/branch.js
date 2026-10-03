import { SITE } from '../../data/site'

// Estado de la sucursal a partir de los horarios publicados en data/site.js
// ("Lunes a viernes" / "Sábado y domingo", "07:30 — 21:30").
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.trim().split(':').map(Number)
  return h * 60 + m
}

export function getBranchStatus(date) {
  const weekend = date.getDay() === 0 || date.getDay() === 6
  const slot = SITE.hours.find(h => (weekend ? /s[aá]bado|domingo/i : /lunes|viernes/i).test(h.days))
  const name = SITE.location.city
  if (!slot) return { name, open: null, label: name }
  const [from, to] = slot.time.split(/—|-/).map(toMinutes)
  const now = date.getHours() * 60 + date.getMinutes()
  const open = now >= from && now < to
  return { name, open, label: open ? `Abierto hasta las ${slot.time.split(/—|-/)[1].trim()}` : 'Cerrado' }
}
