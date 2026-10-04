// Plano del salón de ARBO Trevelin — solo presentación.
// Las mesas (número, zona, capacidad, estado) siguen viniendo de
// mock/tables.js + POSContext; acá se define únicamente DÓNDE se dibuja
// cada una. Para mover una mesa en el mapa, cambiá sus coordenadas.
//
// Coordenadas en unidades de plano: el salón mide 100 de ancho por
// FLOOR_HEIGHT de alto. (x, y) es el CENTRO de la mesa.

export const FLOOR_WIDTH = 100
export const FLOOR_HEIGHT = 74

export const ZONES = [
  { key: 'ventana', label: 'Ventanal', area: { x: 3, y: 3, w: 80, h: 17 } },
  { key: 'interior', label: 'Salón', area: { x: 3, y: 22, w: 94, h: 30 } },
  { key: 'exterior', label: 'Terraza', area: { x: 3, y: 56, w: 94, h: 15 } },
]

// shape: 'square' | 'round' | 'long' (mesa larga para grupos)
export const TABLE_LAYOUT = {
  // Ventanal — fila contra el vidrio
  5: { x: 12, y: 11.5, shape: 'square' },
  6: { x: 31, y: 11.5, shape: 'square' },
  7: { x: 50, y: 11.5, shape: 'square' },
  14: { x: 69, y: 11.5, shape: 'square' },

  // Salón — dos filas + mesa larga junto a la barra
  1: { x: 12, y: 30, shape: 'round' },
  2: { x: 27, y: 30, shape: 'round' },
  13: { x: 42, y: 30, shape: 'round' },
  3: { x: 14, y: 44, shape: 'square' },
  4: { x: 32, y: 44, shape: 'square' },
  8: { x: 56, y: 44, shape: 'long' },

  // Terraza
  9: { x: 13, y: 63.5, shape: 'round' },
  10: { x: 31, y: 63.5, shape: 'round' },
  11: { x: 48, y: 63.5, shape: 'round' },
  12: { x: 69, y: 63.5, shape: 'long' },
}

// Elementos fijos del local (no interactivos) para orientarse en el plano.
export const FIXTURES = [
  { key: 'barra', label: 'Barra', x: 74, y: 25, w: 21, h: 24 },
  { key: 'cocina', label: 'Cocina', x: 86, y: 3, w: 11, h: 17, muted: true },
]

export const ENTRANCE = { x: 3, y: 47, label: 'Entrada' }
