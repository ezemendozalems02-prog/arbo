// Beneficios canjeables de ARBO CLUB — Fase 5, bloque 14.
import { createRng, MOCK_NOW } from './config'

export const REWARD_TYPES = ['DESCUENTO', 'PRODUCTO_GRATIS', 'BEBIDA', 'POSTRE', 'EXPERIENCIA', 'EVENTO', 'OTRO']
export const REWARD_TYPE_LABELS = {
  DESCUENTO: 'Descuento', PRODUCTO_GRATIS: 'Producto gratis', BEBIDA: 'Bebida', POSTRE: 'Postre',
  EXPERIENCIA: 'Experiencia', EVENTO: 'Evento', OTRO: 'Otro',
}
export const REWARD_STATUSES = ['activo', 'inactivo', 'agotado', 'vencido']

const rng = createRng(6410)

const RAW = [
  ['Café de cortesía', 'BEBIDA', 150, null],
  ['10% off en pastelería', 'DESCUENTO', 400, null],
  ['Copa de vino de la casa', 'BEBIDA', 500, 40],
  ['Postre a elección', 'POSTRE', 600, 30],
  ['15% off en toda la carta', 'DESCUENTO', 900, null],
  ['Tabla de quesos regionales', 'PRODUCTO_GRATIS', 1200, 20],
  ['Entrada a elección', 'PRODUCTO_GRATIS', 800, 25],
  ['Botella de espumante', 'BEBIDA', 1800, 15],
  ['Cata de vinos ARBO (2 personas)', 'EXPERIENCIA', 2500, 10],
  ['Torta del día completa', 'POSTRE', 2200, 8],
  ['20% off en tu próxima compra', 'DESCUENTO', 1100, null],
  ['Desayuno para dos', 'EXPERIENCIA', 1600, 12],
  ['Acceso VIP a evento ARBO', 'EVENTO', 3000, 6],
  ['Clase de café de especialidad', 'EXPERIENCIA', 2000, 10],
  ['Merienda completa', 'PRODUCTO_GRATIS', 1400, 18],
  ['2x1 en tragos de autor', 'DESCUENTO', 700, null],
  ['Vale $5.000 en carta', 'OTRO', 1000, 20],
  ['Vale $10.000 en carta', 'OTRO', 2000, 12],
  ['Cumpleaños ARBO: postre + foto', 'EVENTO', 500, null],
  ['Curso de cocina patagónica', 'EXPERIENCIA', 4000, 5],
]

const startDate = new Date(MOCK_NOW.getTime() - 60 * 86400000)

export const REWARDS = RAW.map(([name, type, pointsCost, stock], i) => {
  const redeemedCount = Math.floor(rng() * (stock ? Math.min(stock, 8) : 10))
  const isExpiredDemo = i === RAW.length - 1 // último, "Curso de cocina", vencido para mostrar el estado
  const isOutOfStock = stock !== null && redeemedCount >= stock
  return {
    id: `rwd-${i + 1}`,
    name,
    description: `Beneficio ARBO CLUB: ${name.toLowerCase()}.`,
    type,
    pointsCost,
    startDate,
    endDate: isExpiredDemo ? new Date(MOCK_NOW.getTime() - 5 * 86400000) : null,
    stock,
    redeemedCount,
    status: isExpiredDemo ? 'vencido' : isOutOfStock ? 'agotado' : 'activo',
  }
})

export function getRewardById(id) {
  return REWARDS.find(r => r.id === id) ?? null
}
