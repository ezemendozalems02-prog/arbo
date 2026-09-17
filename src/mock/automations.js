// Automatizaciones basadas en eventos — Fase 5, bloque 26/27/28. Todo lo que
// dispara una automatización queda SIMULADO (automationService.simulateRun):
// nunca se envía un WhatsApp/email real, solo se registra qué habría pasado.
export const AUTOMATION_TRIGGERS = [
  'CUSTOMER_CREATED', 'FIRST_PURCHASE', 'RESERVATION_COMPLETED', 'BIRTHDAY',
  'CUSTOMER_INACTIVE', 'REWARD_UNLOCKED', 'POINTS_EXPIRING', 'REWARD_REDEEMED', 'PURCHASE_COMPLETED',
]
export const AUTOMATION_TRIGGER_LABELS = {
  CUSTOMER_CREATED: 'Nuevo cliente', FIRST_PURCHASE: 'Primera compra', RESERVATION_COMPLETED: 'Reserva completada',
  BIRTHDAY: 'Cumpleaños', CUSTOMER_INACTIVE: 'Cliente inactivo', REWARD_UNLOCKED: 'Beneficio desbloqueado',
  POINTS_EXPIRING: 'Puntos por vencer', REWARD_REDEEMED: 'Canje realizado', PURCHASE_COMPLETED: 'Compra realizada',
}
export const AUTOMATION_ACTIONS = ['SEND_WHATSAPP', 'SEND_EMAIL', 'ADD_POINTS', 'CREATE_REWARD', 'ADD_TAG', 'CREATE_NOTIFICATION', 'LOG_EVENT']
export const AUTOMATION_ACTION_LABELS = {
  SEND_WHATSAPP: 'Enviar WhatsApp', SEND_EMAIL: 'Enviar email', ADD_POINTS: 'Agregar puntos', CREATE_REWARD: 'Crear beneficio',
  ADD_TAG: 'Agregar etiqueta', CREATE_NOTIFICATION: 'Crear notificación', LOG_EVENT: 'Registrar evento',
}
export const AUTOMATION_STATUSES = ['activa', 'pausada']

const RAW = [
  ['Bienvenida a nuevo cliente', 'CUSTOMER_CREATED', null, 'SEND_WHATSAPP', 'Hola {{firstName}}, ¡bienvenido a ARBO!', 'activa', 41],
  ['Bono primera compra', 'FIRST_PURCHASE', null, 'ADD_POINTS', '+100 puntos de bienvenida', 'activa', 28],
  ['Agradecimiento post-reserva', 'RESERVATION_COMPLETED', null, 'SEND_EMAIL', 'Gracias por reservar en ARBO, {{firstName}}.', 'activa', 63],
  ['Cumpleaños ARBO', 'BIRTHDAY', null, 'CREATE_REWARD', 'Postre de cortesía para {{firstName}} 🎂', 'activa', 19],
  ['Cliente inactivo 30 días', 'CUSTOMER_INACTIVE', { days: 30 }, 'SEND_WHATSAPP', 'Hola {{firstName}}, hace un tiempo no te vemos por ARBO 🌿', 'activa', 34],
  ['Cliente inactivo 60 días', 'CUSTOMER_INACTIVE', { days: 60 }, 'ADD_TAG', 'Etiqueta: en riesgo', 'pausada', 4],
  ['Aviso de beneficio desbloqueado', 'REWARD_UNLOCKED', null, 'CREATE_NOTIFICATION', '{{firstName}}, desbloqueaste un nuevo beneficio.', 'activa', 22],
  ['Alerta de puntos por vencer', 'POINTS_EXPIRING', { days: 15 }, 'SEND_EMAIL', 'Tus {{points}} puntos vencen pronto, {{firstName}}.', 'pausada', 7],
  ['Confirmación de canje', 'REWARD_REDEEMED', null, 'LOG_EVENT', 'Canje registrado para {{firstName}}', 'activa', 51],
  ['Puntos por compra confirmada', 'PURCHASE_COMPLETED', null, 'ADD_POINTS', 'Puntos acreditados por la compra', 'activa', 77],
]

export const AUTOMATIONS = RAW.map(([name, trigger, condition, action, message, status, timesTriggered], i) => ({
  id: `aut-${i + 1}`,
  name,
  trigger,
  condition,
  action,
  message,
  status,
  timesTriggered,
  lastRun: null,
  runLog: [],
}))

export function getAutomationById(id) {
  return AUTOMATIONS.find(a => a.id === id) ?? null
}
