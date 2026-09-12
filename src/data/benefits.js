// ARBO CLUB — programa de fidelización. Sistema de puntos y niveles DEMO.

export const CLUB = {
  name: 'ARBO CLUB',
  tagline: 'Más momentos. Más beneficios.',
  pointsRules: [
    { action: 'Compra en el local o pedidos', points: '1 punto cada $100' },
    { action: 'Reserva confirmada', points: '+50 puntos' },
    { action: 'Asistencia a eventos', points: '+100 puntos' },
    { action: 'Recomendar a un amigo', points: '+80 puntos' },
    { action: 'Cumpleaños', points: 'Beneficio especial del mes' },
  ],
  tiers: [
    {
      key: 'semilla',
      name: 'SEMILLA',
      subtitle: 'Para comenzar.',
      threshold: 0,
      benefits: ['Bienvenida con café de cortesía', 'Acceso al newsletter de eventos', 'Promociones generales'],
    },
    {
      key: 'raiz',
      name: 'RAÍZ',
      subtitle: 'Para quienes vuelven.',
      threshold: 1000,
      benefits: ['10% de descuento en pastelería', 'Acceso anticipado a eventos', 'Café de cortesía en tu cumpleaños'],
    },
    {
      key: 'copa',
      name: 'COPA',
      subtitle: 'Para quienes viven Arbo.',
      threshold: 3000,
      benefits: ['15% de descuento en toda la carta', 'Invitación a catas exclusivas', 'Experiencia de cumpleaños especial', 'Prioridad en reservas'],
    },
  ],
}

// DEMO — estado de ejemplo de un socio, para ilustrar la UI de puntos.
export const DEMO_MEMBER = {
  points: 1240,
  tierKey: 'raiz',
  nextTierPoints: 3000,
}
