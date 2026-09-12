// Carta de ARBO PATAGONIA — estructura fácil de editar.
// Todos los precios son DEMO y deben reemplazarse por precios reales.
// `orderable: true` habilita el producto en /pedidos (con carrito).
// Los mismos datos alimentan /carta (solo visualización) y /pedidos.

const img = {
  cafe1: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700&q=80',
  cafe2: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&q=80',
  cafe3: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=700&q=80',
  tostada: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=700&q=80',
  huevos: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=700&q=80',
  medialunas: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=700&q=80',
  torta: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=700&q=80',
  brownie: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&q=80',
  alfajor: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700&q=80',
  trucha: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=700&q=80',
  empanadas: 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=700&q=80',
  sandwich: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=700&q=80',
  tabla: 'https://images.unsplash.com/photo-1626200926749-267b8dfd3d3f?w=700&q=80',
  picada: 'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?w=700&q=80',
  risotto: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=700&q=80',
  vino1: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=700&q=80',
  vino2: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=700&q=80',
  cerveza: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=700&q=80',
  limonada: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=700&q=80',
  postre1: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=700&q=80',
  postre2: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=700&q=80',
}

export const MENU_CATEGORIES = [
  { key: 'cafe',        label: 'Café' },
  { key: 'desayunos',   label: 'Desayunos' },
  { key: 'meriendas',   label: 'Meriendas' },
  { key: 'pasteleria',  label: 'Pastelería' },
  { key: 'almuerzos',   label: 'Almuerzos' },
  { key: 'sandwiches',  label: 'Sándwiches' },
  { key: 'picadas',     label: 'Picadas' },
  { key: 'platos',      label: 'Platos' },
  { key: 'vinos',       label: 'Vinos' },
  { key: 'bebidas',     label: 'Bebidas' },
  { key: 'postres',     label: 'Postres' },
]

export const MENU_ITEMS = [
  // CAFÉ
  { id: 'ca1', cat: 'cafe', name: 'Espresso', description: 'Blend de especialidad, tueste claro.', price: 2200, tags: [], orderable: true, img: img.cafe1 },
  { id: 'ca2', cat: 'cafe', name: 'Latte Arbo', description: 'Espresso doble y leche texturizada, receta de la casa.', price: 3200, tags: ['Signature'], orderable: true, img: img.cafe2 },
  { id: 'ca3', cat: 'cafe', name: 'Flat White', description: 'Ristretto doble, leche vaporizada, textura sedosa.', price: 3200, tags: [], orderable: true, img: img.cafe3 },
  { id: 'ca4', cat: 'cafe', name: 'Filtrado de Origen', description: 'Método Chemex, variedad rotativa de temporada.', price: 3000, tags: [], orderable: true, img: img.cafe1 },

  // DESAYUNOS
  { id: 'de1', cat: 'desayunos', name: 'Tostón de Palta', description: 'Pan artesanal, palta, huevo y tomates confitados.', price: 6800, tags: ['Signature'], orderable: true, img: img.tostada },
  { id: 'de2', cat: 'desayunos', name: 'Omelette Patagónico', description: 'Huevos de campo, queso ahumado y cebolla de verdeo.', price: 6200, tags: [], orderable: true, img: img.huevos },
  { id: 'de3', cat: 'desayunos', name: 'Desayuno Arbo', description: 'Café o té, jugo natural, medialunas y mermelada casera.', price: 5800, tags: ['Para compartir'], orderable: true, img: img.medialunas },
  { id: 'de4', cat: 'desayunos', name: 'Bowl de Estación', description: 'Yogur natural, granola de la casa, miel y frutas de temporada.', price: 4800, tags: ['Vegetariano'], orderable: true, img: img.medialunas },

  // MERIENDAS
  { id: 'me1', cat: 'meriendas', name: 'Merienda Completa', description: 'Té o café, tostadas, dos dips de la casa y fruta.', price: 5200, tags: [], orderable: true, img: img.tostada },
  { id: 'me2', cat: 'meriendas', name: 'Té Patagónico', description: 'Selección de hierbas de la región, tetera para dos.', price: 3400, tags: [], orderable: true, img: img.cafe2 },
  { id: 'me3', cat: 'meriendas', name: 'Licuado + Tostadas', description: 'Fruta de estación, tostadas con dos dips a elección.', price: 5000, tags: [], orderable: true, img: img.medialunas },

  // PASTELERÍA
  { id: 'pa1', cat: 'pasteleria', name: 'Torta del Día', description: 'Selección rotativa según la producción de la mañana.', price: 3400, tags: ['Estrella'], orderable: true, img: img.torta },
  { id: 'pa2', cat: 'pasteleria', name: 'Brownie de Chocolate', description: 'Chocolate 70%, nueces tostadas y sal marina.', price: 2800, tags: [], orderable: true, img: img.brownie },
  { id: 'pa3', cat: 'pasteleria', name: 'Alfajor de la Casa', description: 'Dulce de leche artesanal, baño de chocolate.', price: 2200, tags: [], orderable: true, img: img.alfajor },
  { id: 'pa4', cat: 'pasteleria', name: 'Medialunas x2', description: 'De manteca, horneadas cada mañana.', price: 1800, tags: [], orderable: true, img: img.medialunas },

  // ALMUERZOS
  { id: 'al1', cat: 'almuerzos', name: 'Trucha Patagónica', description: 'Trucha de la región, papines andinos y hierbas frescas.', price: 12800, tags: ['Signature'], orderable: true, img: img.trucha },
  { id: 'al2', cat: 'almuerzos', name: 'Empanadas Caseras', description: 'De carne cortada a cuchillo. Porción de 3 unidades.', price: 5400, tags: [], orderable: true, img: img.empanadas },
  { id: 'al3', cat: 'almuerzos', name: 'Risotto de Hongos', description: 'Hongos de estación, parmesano y manteca de hierbas.', price: 9800, tags: ['Vegetariano'], orderable: true, img: img.risotto },
  { id: 'al4', cat: 'almuerzos', name: 'Plato del Día', description: 'Propuesta del chef según mercado. Consultar en el local.', price: 8600, tags: [], orderable: true, img: img.risotto },

  // SÁNDWICHES
  { id: 'sa1', cat: 'sandwiches', name: 'Sándwich de Campo', description: 'Pan casero, jamón crudo, queso de campo y rúcula.', price: 6400, tags: [], orderable: true, img: img.sandwich },
  { id: 'sa2', cat: 'sandwiches', name: 'Tostado Arbo', description: 'Jamón, queso, tomate confitado, pan de masa madre.', price: 5600, tags: [], orderable: true, img: img.sandwich },
  { id: 'sa3', cat: 'sandwiches', name: 'Sándwich de Trucha Ahumada', description: 'Trucha ahumada de la casa, queso crema y eneldo.', price: 8200, tags: ['Signature'], orderable: true, img: img.trucha },

  // PICADAS
  { id: 'pi1', cat: 'picadas', name: 'Tabla Patagónica', description: 'Selección de quesos, fiambres y productos regionales.', price: 14800, tags: ['Para compartir'], orderable: true, img: img.tabla },
  { id: 'pi2', cat: 'picadas', name: 'Picada Arbo', description: 'Quesos, aceitunas, jamón crudo y pan casero. Para dos.', price: 11200, tags: ['Para compartir'], orderable: true, img: img.picada },

  // PLATOS
  { id: 'pl1', cat: 'platos', name: 'Cazuela de Cordero', description: 'Cordero patagónico a fuego lento, papines y vegetales.', price: 13800, tags: ['Signature'], orderable: true, img: img.risotto },
  { id: 'pl2', cat: 'platos', name: 'Tarta de Estación', description: 'Masa integral, vegetales de temporada, queso de cabra.', price: 8400, tags: ['Vegetariano'], orderable: true, img: img.risotto },

  // VINOS
  { id: 'vi1', cat: 'vinos', name: 'Copa Malbec Patagónico', description: 'Selección de bodegas de la región, cuerpo medio y frutal.', price: 4200, tags: [], orderable: true, img: img.vino1 },
  { id: 'vi2', cat: 'vinos', name: 'Copa Pinot Noir', description: 'Elegante y aromático, ideal con trucha o quesos suaves.', price: 4600, tags: ['Sommelier'], orderable: true, img: img.vino2 },
  { id: 'vi3', cat: 'vinos', name: 'Botella Malbec Reserva', description: 'Etiqueta seleccionada por nuestra sommelier.', price: 22000, tags: [], orderable: true, img: img.vino1 },
  { id: 'vi4', cat: 'vinos', name: 'Copa Espumante', description: 'Método tradicional, seco, burbuja fina.', price: 4800, tags: [], orderable: true, img: img.vino2 },

  // BEBIDAS
  { id: 'be1', cat: 'bebidas', name: 'Cerveza Artesanal Patagónica', description: 'Producción regional, rubia o IPA.', price: 3600, tags: [], orderable: true, img: img.cerveza },
  { id: 'be2', cat: 'bebidas', name: 'Limonada de la Casa', description: 'Limón, jengibre y menta fresca.', price: 2600, tags: [], orderable: true, img: img.limonada },
  { id: 'be3', cat: 'bebidas', name: 'Agua Mineral', description: 'Con o sin gas, 500ml.', price: 1600, tags: [], orderable: true, img: img.limonada },

  // POSTRES
  { id: 'po1', cat: 'postres', name: 'Postre Arbo', description: 'Creación de estación de nuestra pastelería. Consultar sabor del día.', price: 3800, tags: ['Estrella'], orderable: true, img: img.postre1 },
  { id: 'po2', cat: 'postres', name: 'Volcán de Chocolate', description: 'Centro fundente, helado de crema y nueces.', price: 4200, tags: [], orderable: true, img: img.postre2 },
]

export function getItemsByCategory(catKey) {
  return MENU_ITEMS.filter(i => i.cat === catKey)
}
