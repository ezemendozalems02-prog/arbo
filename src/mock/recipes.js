// Recetas (bloque 9/10/13) — cada una referencia un producto real de
// src/mock/products.js por `productId` (nunca duplica el nombre/precio a
// mano) y una lista de ingredientes, cada uno `insumo` (src/mock/inventoryItems.js)
// o `recipe` (otra receta — bloque 13, recetas compuestas/preparados).
// "Salsa ARBO" es un preparado sin producto de venta propio (productId:
// null) que Tostado Arbo usa como ingrediente — el ejemplo de receta
// compuesta que pide el brief.
const ins = (refId, quantity, unit) => ({ kind: 'insumo', refId, quantity, unit })
const rec = (refId, quantity, unit) => ({ kind: 'recipe', refId, quantity, unit })

export const RECIPE_STATUSES = ['activa', 'inactiva']
export const PREPARADO_CATEGORY = 'preparados'

export const RECIPES = [
  {
    id: 'rec-salsa-arbo', name: 'Salsa ARBO', categoryKey: PREPARADO_CATEGORY, productId: null,
    description: 'Preparado base — mayonesa de la casa con especias, usada en varios platos.',
    yield: { qty: 1, unit: 'kilogramo' }, status: 'activa',
    ingredients: [ins('ins41', 700, 'gramo'), ins('ins42', 250, 'gramo'), ins('ins43', 20, 'gramo'), ins('ins44', 30, 'gramo')],
  },
  {
    id: 'rec-trucha', name: 'Trucha Patagónica', categoryKey: 'almuerzos', productId: 'al1',
    description: 'Trucha de la región, papines andinos y hierbas frescas.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins4', 220, 'gramo'), ins('ins20', 150, 'gramo'), ins('ins45', 20, 'mililitro'), ins('ins43', 3, 'gramo'), ins('ins44', 1, 'gramo')],
  },
  {
    id: 'rec-cazuela-cordero', name: 'Cazuela de Cordero', categoryKey: 'platos', productId: 'pl1',
    description: 'Cordero patagónico a fuego lento, papines y vegetales.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins3', 280, 'gramo'), ins('ins20', 180, 'gramo'), ins('ins18', 40, 'gramo'), ins('ins43', 4, 'gramo'), ins('ins44', 1, 'gramo')],
  },
  {
    id: 'rec-risotto', name: 'Risotto de Hongos', categoryKey: 'almuerzos', productId: 'al3',
    description: 'Hongos de estación, parmesano y manteca de hierbas.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins37', 120, 'gramo'), ins('ins14', 20, 'gramo'), ins('ins11', 30, 'gramo'), ins('ins18', 20, 'gramo'), ins('ins43', 2, 'gramo')],
  },
  {
    id: 'rec-plato-dia', name: 'Plato del Día', categoryKey: 'almuerzos', productId: 'al4',
    description: 'Propuesta del chef según mercado.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins2', 200, 'gramo'), ins('ins19', 150, 'gramo'), ins('ins16', 40, 'gramo'), ins('ins45', 15, 'mililitro'), ins('ins43', 3, 'gramo')],
  },
  {
    id: 'rec-toston-palta', name: 'Tostón de Palta', categoryKey: 'desayunos', productId: 'de1',
    description: 'Pan artesanal, palta, huevo y tomates confitados.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins9', 1, 'unidad'), ins('ins21', 100, 'gramo'), ins('ins15', 1, 'unidad'), ins('ins16', 40, 'gramo'), ins('ins43', 2, 'gramo')],
  },
  {
    id: 'rec-omelette', name: 'Omelette Patagónico', categoryKey: 'desayunos', productId: 'de2',
    description: 'Huevos de campo, queso ahumado y cebolla de verdeo.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins15', 3, 'unidad'), ins('ins10', 30, 'gramo'), ins('ins18', 20, 'gramo'), ins('ins14', 10, 'gramo'), ins('ins43', 2, 'gramo')],
  },
  {
    id: 'rec-sandwich-campo', name: 'Sándwich de Campo', categoryKey: 'sandwiches', productId: 'sa1',
    description: 'Pan casero, jamón crudo, queso de campo y rúcula.',
    yield: { qty: 1, unit: 'unidad' }, status: 'activa',
    ingredients: [ins('ins7', 1, 'unidad'), ins('ins5', 60, 'gramo'), ins('ins12', 50, 'gramo'), ins('ins22', 15, 'gramo')],
  },
  {
    id: 'rec-tostado-arbo', name: 'Tostado Arbo', categoryKey: 'sandwiches', productId: 'sa2',
    description: 'Jamón, queso, tomate confitado, pan de masa madre y Salsa ARBO.',
    yield: { qty: 1, unit: 'unidad' }, status: 'activa',
    ingredients: [ins('ins9', 1, 'unidad'), ins('ins5', 50, 'gramo'), ins('ins10', 40, 'gramo'), ins('ins16', 40, 'gramo'), rec('rec-salsa-arbo', 20, 'gramo')],
  },
  {
    id: 'rec-sandwich-trucha', name: 'Sándwich de Trucha Ahumada', categoryKey: 'sandwiches', productId: 'sa3',
    description: 'Trucha ahumada de la casa, queso crema y eneldo.',
    yield: { qty: 1, unit: 'unidad' }, status: 'activa',
    ingredients: [ins('ins9', 1, 'unidad'), ins('ins4', 80, 'gramo'), ins('ins10', 30, 'gramo'), ins('ins22', 10, 'gramo')],
  },
  {
    id: 'rec-tabla-patagonica', name: 'Tabla Patagónica', categoryKey: 'picadas', productId: 'pi1',
    description: 'Selección de quesos, fiambres y productos regionales.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins5', 100, 'gramo'), ins('ins10', 100, 'gramo'), ins('ins12', 80, 'gramo'), ins('ins23', 60, 'gramo'), ins('ins7', 2, 'unidad')],
  },
  {
    id: 'rec-picada-arbo', name: 'Picada Arbo', categoryKey: 'picadas', productId: 'pi2',
    description: 'Quesos, aceitunas, jamón crudo y pan casero.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins10', 90, 'gramo'), ins('ins23', 70, 'gramo'), ins('ins5', 80, 'gramo'), ins('ins7', 2, 'unidad')],
  },
  {
    id: 'rec-tarta-estacion', name: 'Tarta de Estación', categoryKey: 'platos', productId: 'pl2',
    description: 'Masa integral, vegetales de temporada, queso de cabra.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins35', 80, 'gramo'), ins('ins14', 40, 'gramo'), ins('ins11', 50, 'gramo'), ins('ins16', 40, 'gramo'), ins('ins18', 30, 'gramo')],
  },
  {
    id: 'rec-torta-dia', name: 'Torta del Día', categoryKey: 'pasteleria', productId: 'pa1',
    description: 'Selección rotativa según la producción de la mañana — rinde 8 porciones.',
    yield: { qty: 8, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins34', 300, 'gramo'), ins('ins36', 250, 'gramo'), ins('ins15', 4, 'unidad'), ins('ins14', 150, 'gramo'), ins('ins38', 200, 'gramo')],
  },
  {
    id: 'rec-volcan-chocolate', name: 'Volcán de Chocolate', categoryKey: 'postres', productId: 'po2',
    description: 'Centro fundente, helado de crema y nueces.',
    yield: { qty: 1, unit: 'porcion' }, status: 'activa',
    ingredients: [ins('ins39', 60, 'gramo'), ins('ins14', 40, 'gramo'), ins('ins15', 2, 'unidad'), ins('ins36', 30, 'gramo'), ins('ins40', 15, 'gramo')],
  },
]

export function getRecipeById(id) {
  return RECIPES.find(r => r.id === id) ?? null
}

export function getRecipeByProductId(productId) {
  return RECIPES.find(r => r.productId === productId) ?? null
}
