// Categorías de insumos (bloque 5). Lista abierta: agregar una categoría
// nueva es sumar una fila acá, igual que src/mock/stations.js en Fase 3.
export const INVENTORY_CATEGORIES = [
  { key: 'carnes', label: 'Carnes' },
  { key: 'panaderia', label: 'Panadería' },
  { key: 'lacteos', label: 'Lácteos' },
  { key: 'verduras', label: 'Verduras' },
  { key: 'frutas', label: 'Frutas' },
  { key: 'bebidas', label: 'Bebidas' },
  { key: 'alcohol', label: 'Alcohol' },
  { key: 'cafeteria', label: 'Cafetería' },
  { key: 'almacen', label: 'Almacén' },
  { key: 'condimentos', label: 'Condimentos' },
  { key: 'limpieza', label: 'Limpieza' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'otros', label: 'Otros' },
]

export const INVENTORY_CATEGORY_LABELS = Object.fromEntries(INVENTORY_CATEGORIES.map(c => [c.key, c.label]))
