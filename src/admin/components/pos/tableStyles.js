import { CalendarClock, Check, Clock, Receipt } from 'lucide-react'

// Colores de servicio: sólidos y de alto contraste para leer el salón de un
// vistazo (también a distancia, en tablet). Siempre van con ícono + texto:
// el estado nunca depende solo del color.
export const TABLE_STATUS_STYLE = {
  libre: { bg: '#3F7F57', fg: '#FFFFFF', ring: '#2F6545', seat: '#A9C9B4', Icon: Check, short: 'Libre', tiny: 'Libre' },
  ocupada: { bg: '#B24A35', fg: '#FFFFFF', ring: '#8F3A29', seat: '#E2A99C', Icon: Clock, short: 'Ocupada', tiny: 'Ocup.' },
  reservada: { bg: '#2F6890', fg: '#FFFFFF', ring: '#245273', seat: '#A6C3D9', Icon: CalendarClock, short: 'Reservada', tiny: 'Res.' },
  pago_pendiente: { bg: '#E3A63B', fg: '#2B1F08', ring: '#B9852A', seat: '#F0D29A', Icon: Receipt, short: 'Por cobrar', tiny: 'Cobrar' },
}

export const STATUS_ORDER = ['libre', 'ocupada', 'reservada', 'pago_pendiente']

// Tamaño en unidades de plano según forma y capacidad.
export function tableSize(shape, capacity) {
  if (shape === 'long') return { w: 19, h: 10 }
  const s = capacity <= 2 ? 9 : 11
  return { w: s, h: s * 1.06 }
}
