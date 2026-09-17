// Campañas de marketing — Fase 5, bloque 21/22/23. Nunca se envía nada real
// (bloque 22): "enviar" solo simula alcance/aperturas/clicks vía
// campaignService.simulateSend, que reutiliza este mismo array como estado
// inicial dentro de CRMContext.
import { createRng, MOCK_NOW } from './config'

export const CAMPAIGN_CHANNELS = ['WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP']
export const CAMPAIGN_CHANNEL_LABELS = { WHATSAPP: 'WhatsApp', EMAIL: 'Email', PUSH: 'Push', IN_APP: 'In-app' }
export const CAMPAIGN_STATUSES = ['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']
export const CAMPAIGN_STATUS_LABELS = {
  DRAFT: 'Borrador', SCHEDULED: 'Programada', ACTIVE: 'Activa', COMPLETED: 'Finalizada', CANCELLED: 'Cancelada',
}

const rng = createRng(3131)

function statsFor(reached) {
  const opens = Math.round(reached * (0.35 + rng() * 0.3))
  const clicks = Math.round(opens * (0.2 + rng() * 0.25))
  const redemptions = Math.round(clicks * (0.1 + rng() * 0.2))
  return { reached, opens, clicks, redemptions, conversion: reached ? Math.round((redemptions / reached) * 1000) / 10 : 0 }
}

const RAW = [
  ['Bienvenida ARBO CLUB', 'seg-nuevos', 'WHATSAPP', 'Hola {{firstName}}, ¡bienvenido a ARBO CLUB! Ya tenés {{points}} puntos disponibles.', 'COMPLETED', -12],
  ['Volvé a ARBO', 'seg-inactivos', 'EMAIL', 'Hola {{firstName}}, hace un tiempo no te vemos por ARBO 🌿. Te esperamos con algo especial.', 'COMPLETED', -6],
  ['Beneficio sin usar', 'seg-beneficio-sin-usar', 'PUSH', 'Hola {{firstName}}, tenés un beneficio esperando en ARBO CLUB. ¡No dejes que se venza!', 'COMPLETED', -3],
  ['Cata exclusiva COPA/RAÍZ', 'seg-club-alto', 'WHATSAPP', 'Hola {{firstName}}, como socio {{loyaltyLevel}} te invitamos a nuestra próxima cata exclusiva.', 'ACTIVE', 0],
  ['Puntos disponibles', 'seg-con-puntos', 'IN_APP', 'Hola {{firstName}}, tenés {{points}} puntos disponibles en ARBO CLUB. ¡Canjealos hoy!', 'COMPLETED', -20],
  ['Clientes VIP: acceso anticipado', 'seg-vip', 'EMAIL', 'Hola {{firstName}}, por ser cliente VIP tenés acceso anticipado a nuestro nuevo menú de temporada.', 'SCHEDULED', 3],
  ['Reactivación alto gasto', 'seg-alto-gasto', 'WHATSAPP', 'Hola {{firstName}}, te extrañamos en ARBO. Tu mesa favorita te espera.', 'DRAFT', null],
  ['Primera reserva', 'seg-nunca-reservaron', 'PUSH', 'Hola {{firstName}}, ¿probaste reservar tu mesa desde la web? Es más rápido.', 'DRAFT', null],
  ['Frecuentes premium: doble puntos', 'seg-frecuentes-premium', 'EMAIL', 'Hola {{firstName}}, este fin de semana sumás el doble de puntos en cada compra.', 'COMPLETED', -1],
  ['Cumpleaños del mes', 'seg-frecuentes', 'WHATSAPP', 'Feliz cumpleaños, {{firstName}} 🎂 Te regalamos un postre de cortesía en tu próxima visita.', 'CANCELLED', -8],
]

export const CAMPAIGNS = RAW.map(([name, segmentId, channel, message, status, dayOffset], i) => {
  const isSent = status === 'COMPLETED' || status === 'ACTIVE'
  const sentAt = dayOffset !== null ? new Date(MOCK_NOW.getTime() + dayOffset * 86400000) : null
  const reached = isSent ? 20 + Math.floor(rng() * 300) : 0
  return {
    id: `cmp-${i + 1}`,
    name,
    description: `Campaña dirigida al segmento asociado, vía ${CAMPAIGN_CHANNEL_LABELS[channel]}.`,
    segmentId,
    channel,
    message,
    status,
    scheduledAt: sentAt,
    sentAt: status === 'COMPLETED' ? sentAt : null,
    stats: isSent ? statsFor(reached) : null,
    createdAt: new Date(MOCK_NOW.getTime() - (30 + i * 3) * 86400000),
  }
})

export function getCampaignById(id) {
  return CAMPAIGNS.find(c => c.id === id) ?? null
}
