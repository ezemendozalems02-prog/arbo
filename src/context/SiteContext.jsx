import { createContext, useContext, useState, useCallback } from 'react'

export const DEFAULT_DATA = {
  info: {
    name:      'MOULI',
    tagline:   'Café · Cocina · Encuentros',
    address:   'Thames 1786, Palermo, CABA',
    phone:     '11 4444-5678',
    whatsapp:  '541144445678',
    instagram: 'mouli.palermo',
    facebook:  '',
    hours: [
      { day: 'Martes a Domingo', time: '09:00 — 00:00' },
      { day: 'Lunes',            time: 'Cerrado' },
    ],
    mapsUrl: 'https://maps.google.com/?q=Thames+1786+Palermo+Buenos+Aires',
  },

  images: {
    hero:     'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1800&q=85',
    about:    'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=900&q=80',
    music:    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1600&q=75',
    nosotros: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1600&q=80',
    barrio:   'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  },

  promos: [
    { id: 'pr1', label: 'Flat White + Tostada Jungle',  price: '4200', visible: true },
    { id: 'pr2', label: 'Bowl de la Selva + Jugo',      price: '5800', visible: true },
    { id: 'pr3', label: 'Brunch MOULI (2 personas)',     price: '9500', visible: true },
    { id: 'pr4', label: 'Aperitivo + Tabla de Origen',  price: '7200', visible: true },
  ],

  menu: {
    cafe: {
      label: 'Café',
      items: [
        { id: 'ca1', name: 'Espresso',      description: 'Simple shot. Blend de origen único, tueste claro.',          price: '1600', badge: '', visible: true },
        { id: 'ca2', name: 'Cortado',       description: 'Espresso con un toque de leche cremosa.',                    price: '1800', badge: '', visible: true },
        { id: 'ca3', name: 'Flat White',    description: 'Doble ristretto con leche vaporizada, textura sedosa.',      price: '2200', badge: 'Signature', visible: true },
        { id: 'ca4', name: 'Cappuccino',    description: 'Espresso, leche vaporizada y micro espuma.',                 price: '2200', badge: '', visible: true },
        { id: 'ca5', name: 'Cold Brew',     description: 'Extracción en frío 18 hs. Solo o con leche.',               price: '2600', badge: '', visible: true },
        { id: 'ca6', name: 'Filtrado',      description: 'Método Chemex o V60 según la variedad del día.',             price: '2400', badge: '', visible: true },
        { id: 'ca7', name: 'Matcha Latte',  description: 'Matcha ceremonial japonés, leche oat.',                     price: '2800', badge: '', visible: true },
        { id: 'ca8', name: 'Té & Infusiones',description: 'Selección de blends naturales. Copa de aromas.',           price: '1800', badge: '', visible: true },
      ],
    },
    brunch: {
      label: 'Brunch',
      items: [
        { id: 'br1', name: 'Tostada Jungle',    description: 'Sourdough, palta, tomates cherry, semillas y flores.',   price: '3800', badge: 'Estrella', visible: true },
        { id: 'br2', name: 'Huevos MOULI',      description: 'Huevos pochados, tomatines asados, pesto y ricotta.',   price: '4200', badge: '', visible: true },
        { id: 'br3', name: 'Granola Bowl',      description: 'Granola artesanal, yogur natural, miel, frutas.',       price: '3200', badge: '', visible: true },
        { id: 'br4', name: 'Porridge Selva',    description: 'Avena cremosa, plátano, manteca de maní, cacao.',       price: '3000', badge: '', visible: true },
        { id: 'br5', name: 'Sandwich de Campo', description: 'Pan casero, mozzarella, tomate seco, rúcula, pesto.',   price: '4600', badge: '', visible: true },
        { id: 'br6', name: 'French Toast',      description: 'Pan brioche, frutos rojos, crema de avellanas.',        price: '4200', badge: '', visible: true },
      ],
    },
    pasteleria: {
      label: 'Pastelería',
      items: [
        { id: 'pa1', name: 'Croissant de Manteca',  description: 'Hojaldrado, elaborado en casa cada mañana.',         price: '1800', badge: '', visible: true },
        { id: 'pa2', name: 'Pain au Chocolat',      description: 'Masa hojaldrada, chocolate belga al 70%.',           price: '2200', badge: '', visible: true },
        { id: 'pa3', name: 'Tarta del Día',         description: 'Masa de almendras, crema y fruta de estación.',      price: '2800', badge: 'Estrella', visible: true },
        { id: 'pa4', name: 'Brownie Jungle',        description: 'Chocolate 70%, nueces, sal marina, caramelo.',       price: '2400', badge: '', visible: true },
        { id: 'pa5', name: 'Budín de Limón',        description: 'Húmedo, con glaseado de limón y jengibre.',         price: '2000', badge: '', visible: true },
        { id: 'pa6', name: 'Alfajor de Avellanas',  description: 'Masa sin gluten, ganache de avellanas y cacao.',    price: '1800', badge: '', visible: true },
      ],
    },
    cocina: {
      label: 'Cocina',
      items: [
        { id: 'co1', name: 'Bowl de la Selva',      description: 'Quinoa, verduras asadas, kale, aliño de tahini.',    price: '5800', badge: 'Signature', visible: true },
        { id: 'co2', name: 'Tartare de Salmón',     description: 'Salmón, aguacate, pepino, sésamo y limón.',         price: '6800', badge: '', visible: true },
        { id: 'co3', name: 'Burrata con Pesto',     description: 'Burrata fresca, tomates heirloom, pesto de albahaca.', price: '5400', badge: '', visible: true },
        { id: 'co4', name: 'Tabla de Origen',       description: 'Quesos artesanales, fiambres curados, pickles, pan.', price: '7800', badge: '', visible: true },
        { id: 'co5', name: 'Risotto de Hongos',     description: 'Hongos de temporada, parmesano, trufa y manteca.',  price: '6200', badge: '', visible: true },
        { id: 'co6', name: 'Tarta Vegetal',         description: 'Masa integral, crema de zapallo, semillas tostadas.', price: '4800', badge: '', visible: true },
      ],
    },
    tragos: {
      label: 'Tragos & Bebidas',
      items: [
        { id: 'tr1', name: 'Aperitivo Verde',       description: 'Gin, pepino, elderflower, tónica y hierbas.',       price: '4200', badge: 'Signature', visible: true },
        { id: 'tr2', name: 'Jungle Spritz',         description: 'Aperol, pepino, prosecco, romero y naranja.',       price: '4600', badge: '', visible: true },
        { id: 'tr3', name: 'Agua de Jamaica',       description: 'Jamaica fría con limón y menta fresca.',            price: '2200', badge: '', visible: true },
        { id: 'tr4', name: 'Kombucha de la Casa',   description: 'Fermentación propia, sabores rotativos.',           price: '2600', badge: '', visible: true },
        { id: 'tr5', name: 'Copa Natural',          description: 'Vinos biodinámicos seleccionados por la sommelier.', price: '3200', badge: '', visible: true },
        { id: 'tr6', name: 'Cerveza Artesanal',     description: 'Rubia, amber o stout. Producción local.',           price: '2800', badge: '', visible: true },
        { id: 'tr7', name: 'Limonada Selvática',    description: 'Limón, jengibre, menta y agua con gas.',            price: '2000', badge: '', visible: true },
        { id: 'tr8', name: 'Agua Mineral',          description: 'Con o sin gas, 500ml.',                            price: '1200', badge: '', visible: true },
      ],
    },
  },

  gallery: [
    { id: 'g1',  src: '/jungla-escondida.jpg', title: 'La jungla escondida', cat: 'Ambiente', visible: true },
    { id: 'g2',  src: '/jungla-2.jpg',         title: 'El espacio de noche', cat: 'Ambiente', visible: true },
    { id: 'g3',  src: '/evento-1.jpg',          title: 'Jazz Nights', cat: 'Eventos', visible: true },
    { id: 'g4',  src: '/evento-2.jpg',          title: 'La selva de noche', cat: 'Eventos', visible: true },
    { id: 'g5',  src: '/evento-3.jpg',          title: 'Música en vivo', cat: 'Eventos', visible: true },
    { id: 'g6',  src: '/evento-4.jpg',          title: 'Set de vinilo', cat: 'Eventos', visible: true },
    { id: 'g7',  src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80', title: 'Espresso de origen', cat: 'Café', visible: true },
    { id: 'g8',  src: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=900&q=80', title: 'Bowl de la Selva', cat: 'Cocina', visible: true },
    { id: 'g9',  src: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=900&q=80', title: 'Pastelería del día', cat: 'Pastelería', visible: true },
    { id: 'g10', src: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=900&q=80', title: 'Tabla de Origen', cat: 'Cocina', visible: true },
    { id: 'g11', src: 'https://images.unsplash.com/photo-1464219222984-216ebffaaf85?w=900&q=80', title: 'Aperitivo Verde', cat: 'Tragos', visible: true },
    { id: 'g12', src: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=900&q=80', title: 'Café de mañana', cat: 'Café', visible: true },
  ],
}

const SiteContext = createContext(null)
const KEY = 'mouli_data'

function load() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null } catch { return null }
}

function deepMerge(base, over) {
  const r = { ...base }
  for (const k of Object.keys(over)) {
    if (over[k] !== null && typeof over[k] === 'object' && !Array.isArray(over[k])) {
      r[k] = deepMerge(base[k] || {}, over[k])
    } else {
      r[k] = over[k]
    }
  }
  return r
}

export function SiteProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = load()
    return saved ? deepMerge(DEFAULT_DATA, saved) : DEFAULT_DATA
  })
  const [toastVisible, setToastVisible] = useState(false)

  const persist = useCallback((next) => {
    setData(next)
    localStorage.setItem(KEY, JSON.stringify(next))
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2400)
  }, [])

  const updateInfo    = useCallback((info)    => persist({ ...data, info }),    [data, persist])
  const updateImages  = useCallback((images)  => persist({ ...data, images }),  [data, persist])
  const updateMenu    = useCallback((menu)    => persist({ ...data, menu }),    [data, persist])
  const updateGallery = useCallback((gallery) => persist({ ...data, gallery }), [data, persist])
  const updatePromos  = useCallback((promos)  => persist({ ...data, promos }),  [data, persist])
  const resetAll      = useCallback(() => { localStorage.removeItem(KEY); setData(DEFAULT_DATA) }, [])

  const save = { updateInfo, updateImages, updateMenu, updateGallery, updatePromos, resetAll }

  return (
    <SiteContext.Provider value={{ data, ...save, toastVisible }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  return useContext(SiteContext)
}
