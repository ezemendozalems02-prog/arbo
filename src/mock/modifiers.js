// Grupos de modificadores — entidad propia (no texto concatenado), pensada
// para migrar 1:1 a las futuras tablas `modifier_groups` / `modifier_options`.
// Cada producto (src/mock/products.js) referencia grupos por `key`.
export const MODIFIER_GROUPS = {
  leche: {
    key: 'leche',
    name: 'Leche',
    required: true,
    min: 1,
    max: 1,
    options: [
      { key: 'entera', name: 'Entera', priceDelta: 0 },
      { key: 'descremada', name: 'Descremada', priceDelta: 0 },
      { key: 'vegetal', name: 'Vegetal', priceDelta: 500 },
    ],
  },
  extras_cafe: {
    key: 'extras_cafe',
    name: 'Extras',
    required: false,
    min: 0,
    max: 3,
    options: [
      { key: 'shot_extra', name: 'Shot extra', priceDelta: 700 },
      { key: 'caramelo', name: 'Caramelo', priceDelta: 500 },
      { key: 'canela', name: 'Canela', priceDelta: 300 },
    ],
  },
  punto_carne: {
    key: 'punto_carne',
    name: 'Punto de cocción',
    required: true,
    min: 1,
    max: 1,
    options: [
      { key: 'jugoso', name: 'Jugoso', priceDelta: 0 },
      { key: 'a_punto', name: 'A punto', priceDelta: 0 },
      { key: 'bien_cocido', name: 'Bien cocido', priceDelta: 0 },
    ],
  },
  extras_platos: {
    key: 'extras_platos',
    name: 'Extras',
    required: false,
    min: 0,
    max: 2,
    options: [
      { key: 'papas_extra', name: 'Porción extra de guarnición', priceDelta: 1800 },
      { key: 'salsa_extra', name: 'Salsa extra', priceDelta: 600 },
    ],
  },
}

export function getModifierGroup(key) {
  return MODIFIER_GROUPS[key]
}
