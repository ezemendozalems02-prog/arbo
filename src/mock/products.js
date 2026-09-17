// Fuente única de productos para todo ARBO OS.
// Reutiliza la carta real (src/data/menu.js) — la misma que ya alimenta
// /carta y /pedidos — en vez de duplicarla para el panel administrativo.
// Cuando exista Supabase, este archivo es el único que cambia: el resto
// de los módulos (POS, comandas, cocina, reportes) siguen leyendo de acá.
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menu'

export const CATEGORIES = MENU_CATEGORIES.map(c => ({ ...c, active: true }))

// Asociación producto -> grupos de modificadores (src/mock/modifiers.js).
// Vive acá (capa POS/admin) y no en data/menu.js: la carta pública no
// necesita saberlo, pero el POS sí para armar la línea de venta.
const MODIFIER_GROUPS_BY_PRODUCT = {
  ca1: ['leche', 'extras_cafe'],
  ca2: ['leche', 'extras_cafe'],
  ca3: ['leche', 'extras_cafe'],
  ca4: ['extras_cafe'],
  pl1: ['punto_carne', 'extras_platos'],
  al1: ['extras_platos'],
  al3: ['extras_platos'],
  al4: ['extras_platos'],
  pl2: ['extras_platos'],
}

// Sector de preparación por categoría (Fase 3, bloque 3). Vive acá — no en
// data/menu.js — por la misma razón que los modificadores: es una necesidad
// del panel operativo, no de la carta pública. Café/vinos/bebidas se sirven
// directo en barra; el resto pasa por cocina (incluida pastelería/postres:
// el sector "Pastelería" todavía no está activo — ver src/mock/stations.js).
const STATION_BY_CATEGORY = {
  cafe: 'bar',
  vinos: 'bar',
  bebidas: 'bar',
  desayunos: 'cocina',
  meriendas: 'cocina',
  pasteleria: 'cocina',
  almuerzos: 'cocina',
  sandwiches: 'cocina',
  picadas: 'cocina',
  platos: 'cocina',
  postres: 'cocina',
}

export const PRODUCTS = MENU_ITEMS.map(item => ({
  ...item,
  active: true,
  featured: item.tags.includes('Signature') || item.tags.includes('Estrella'),
  modifierGroups: MODIFIER_GROUPS_BY_PRODUCT[item.id] ?? [],
  station: STATION_BY_CATEGORY[item.cat] ?? 'cocina',
}))

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id)
}

export function getCategoryByKey(key) {
  return CATEGORIES.find(c => c.key === key)
}

export function getProductsByCategory(catKey) {
  return PRODUCTS.filter(p => p.cat === catKey)
}
