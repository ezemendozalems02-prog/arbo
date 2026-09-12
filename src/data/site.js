// Datos centrales de la marca. Editar acá para actualizar el sitio entero
// sin tocar componentes. Los horarios y algunos textos están marcados
// como DEMO porque pueden variar — reemplazar con datos confirmados.

export const SITE = {
  brand: 'ARBO PATAGONIA',
  shortName: 'ARBO',
  tagline: 'Wine & Café',
  taglineLong: 'Cafetería de Especialidad',

  location: {
    addressLine: 'Av. Maestro Williams N.º 10',
    city: 'Trevelin',
    province: 'Chubut',
    country: 'Argentina',
    full: 'Av. Maestro Williams N.º 10, Trevelin, Chubut, Argentina',
    mapsQuery: 'Av. Maestro Williams 10, Trevelin, Chubut, Argentina',
    mapsUrl: 'https://maps.google.com/?q=Av.+Maestro+Williams+10,+Trevelin,+Chubut,+Argentina',
    embedUrl: 'https://maps.google.com/maps?q=Av.+Maestro+Williams+10,+Trevelin,+Chubut,+Argentina&output=embed',
  },

  contact: {
    phoneDisplay: '+54 2945 68-8602',
    // DEMO: formato WhatsApp Argentina (54 9 + código de área + número). Verificar antes de producción.
    whatsapp: '5492945688602',
    instagramHandle: '@arbo.patagonia',
    instagramUrl: 'https://www.instagram.com/arbo.patagonia/',
    externalMenuUrl: 'https://menu.fu.do/arbocafe/qr-menu',
    email: 'hola@arbopatagonia.com', // DEMO — reemplazar por email real
  },

  // DEMO — los horarios pueden variar según temporada. Mantener actualizado.
  hours: [
    { days: 'Lunes a viernes', time: '07:30 — 21:30' },
    { days: 'Sábado y domingo', time: '08:00 — 21:30' },
  ],

  nav: [
    { label: 'Inicio', to: '/' },
    { label: 'Carta', to: '/carta' },
    { label: 'Pedidos', to: '/pedidos' },
    { label: 'Reservas', to: '/reservas' },
    { label: 'Eventos', to: '/eventos' },
    { label: 'Franquicia', to: '/franquicia' },
    { label: 'Arbo Club', to: '/arbo-club' },
  ],

  footerLinks: [
    { label: 'Inicio', to: '/' },
    { label: 'Carta', to: '/carta' },
    { label: 'Pedidos', to: '/pedidos' },
    { label: 'Reservas', to: '/reservas' },
    { label: 'Eventos', to: '/eventos' },
    { label: 'Franquicia', to: '/franquicia' },
    { label: 'Arbo Club', to: '/arbo-club' },
  ],

  whatsappMessage: 'Hola Arbo, quiero hacer una consulta.',

  // Imágenes editoriales DEMO — reemplazar por fotografía real del local cuando esté disponible.
  images: {
    heroVideo: '',
    hero: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1800&q=85',
    manifesto: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80',
    vino: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1000&q=80',
    gastronomia: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80',
    momentos: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1000&q=80',
    location: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1400&q=80',
    patagonia: 'https://images.unsplash.com/photo-1518623001395-125242310d0c?w=1600&q=80',
  },
}

// DEMO — marcados explícitamente como testimonios de ejemplo, reemplazables por reseñas reales.
export const TESTIMONIALS = [
  {
    id: 't1',
    demo: true,
    quote: 'Una experiencia cálida, buen café y una ubicación increíble frente a la plaza.',
    name: 'Cliente Arbo',
    rating: 5,
  },
  {
    id: 't2',
    demo: true,
    quote: 'La tostada de palta y la carta de vinos son un gran combo. Volvemos siempre.',
    name: 'Cliente Arbo',
    rating: 5,
  },
  {
    id: 't3',
    demo: true,
    quote: 'Ambiente tranquilo, atención cercana y opciones sin lactosa. Se nota el cuidado.',
    name: 'Cliente Arbo',
    rating: 5,
  },
]
