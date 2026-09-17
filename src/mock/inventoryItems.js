// Insumos (bloque 4/5/7) — catálogo determinístico (igual que PRODUCTS o
// CUSTOMERS: mismos datos en cada carga, no se generan al azar en cada
// render). El estado EN VIVO (stock que sube/baja con compras, mermas y
// ajustes) lo mantiene InventoryContext, que arranca desde esta lista.
import { MOCK_NOW } from './config'

const updatedAt = new Date(MOCK_NOW.getTime() - 2 * 86400000)

// [id, nombre, categoría, unidad de stock, mínimo, máximo, actual, costo, proveedor, código]
const RAW = [
  ['ins1', 'Carne vacuna', 'carnes', 'kilogramo', 10, 40, 18, 12000, 'sup1', 'CAR-001'],
  ['ins2', 'Pollo', 'carnes', 'kilogramo', 8, 30, 14, 4200, 'sup1', 'CAR-002'],
  ['ins3', 'Cordero patagónico', 'carnes', 'kilogramo', 6, 25, 11, 14500, 'sup1', 'CAR-003'],
  ['ins4', 'Trucha fresca', 'carnes', 'kilogramo', 5, 20, 9, 9800, 'sup1', 'CAR-004'],
  ['ins5', 'Jamón crudo', 'carnes', 'kilogramo', 3, 12, 5.5, 15800, 'sup1', 'CAR-005'],

  ['ins6', 'Pan brioche', 'panaderia', 'unidad', 20, 80, 45, 900, 'sup2', 'PAN-001'],
  ['ins7', 'Pan de campo', 'panaderia', 'unidad', 15, 60, 28, 650, 'sup2', 'PAN-002'],
  ['ins8', 'Medialunas de manteca', 'panaderia', 'unidad', 30, 120, 64, 380, 'sup2', 'PAN-003'],
  ['ins9', 'Pan de masa madre', 'panaderia', 'unidad', 10, 40, 16, 1100, 'sup2', 'PAN-004'],

  ['ins10', 'Queso cheddar', 'lacteos', 'kilogramo', 3, 15, 5.4, 8500, 'sup3', 'LAC-001'],
  ['ins11', 'Queso de cabra', 'lacteos', 'kilogramo', 3, 12, 2, 11200, 'sup3', 'LAC-002'],
  ['ins12', 'Queso de campo', 'lacteos', 'kilogramo', 3, 12, 6.2, 9600, 'sup3', 'LAC-003'],
  ['ins13', 'Leche entera', 'lacteos', 'litro', 10, 40, 22, 1400, 'sup3', 'LAC-004'],
  ['ins14', 'Manteca', 'lacteos', 'kilogramo', 2, 10, 4.5, 5200, 'sup3', 'LAC-005'],
  ['ins15', 'Huevos', 'lacteos', 'unidad', 60, 240, 132, 220, 'sup3', 'LAC-006'],

  ['ins16', 'Tomate', 'verduras', 'kilogramo', 5, 25, 8, 2000, 'sup4', 'VER-001'],
  ['ins17', 'Lechuga', 'verduras', 'kilogramo', 4, 18, 6.5, 1800, 'sup4', 'VER-002'],
  ['ins18', 'Cebolla', 'verduras', 'kilogramo', 6, 25, 12, 1200, 'sup4', 'VER-003'],
  ['ins19', 'Papa', 'verduras', 'kilogramo', 10, 50, 24, 1100, 'sup4', 'VER-004'],
  ['ins20', 'Papines andinos', 'verduras', 'kilogramo', 8, 30, 0, 1650, 'sup4', 'VER-005'],
  ['ins21', 'Palta', 'verduras', 'kilogramo', 4, 15, 7.2, 3400, 'sup4', 'VER-006'],
  ['ins22', 'Rúcula', 'verduras', 'kilogramo', 2, 8, 3.1, 2600, 'sup4', 'VER-007'],
  ['ins23', 'Aceitunas', 'verduras', 'kilogramo', 2, 10, 4.4, 4800, 'sup4', 'VER-008'],

  ['ins24', 'Limón', 'frutas', 'kilogramo', 3, 15, 5.6, 2400, 'sup4', 'FRU-001'],
  ['ins25', 'Frutos rojos', 'frutas', 'kilogramo', 2, 10, 1, 6800, 'sup4', 'FRU-002'],

  ['ins26', 'Agua mineral', 'bebidas', 'botella', 20, 100, 58, 900, 'sup5', 'BEB-001'],
  ['ins27', 'Gaseosa cola', 'bebidas', 'botella', 15, 80, 40, 1500, 'sup5', 'BEB-002'],

  ['ins28', 'Copa Malbec Reserva', 'alcohol', 'botella', 4, 20, 2, 9500, 'sup6', 'ALC-001'],
  ['ins29', 'Cerveza artesanal', 'alcohol', 'botella', 10, 50, 26, 2200, 'sup5', 'ALC-002'],
  ['ins30', 'Espumante', 'alcohol', 'botella', 4, 18, 0, 8200, 'sup6', 'ALC-003'],
  ['ins31', 'Vino Pinot Noir', 'alcohol', 'botella', 4, 18, 6, 9900, 'sup6', 'ALC-004'],

  ['ins32', 'Café en grano', 'cafeteria', 'kilogramo', 4, 20, 9.2, 14500, 'sup7', 'CAF-001'],
  ['ins33', 'Té patagónico (caja x25)', 'cafeteria', 'caja', 3, 15, 7, 6200, 'sup7', 'CAF-002'],

  ['ins34', 'Harina 000', 'almacen', 'kilogramo', 8, 40, 19, 1300, 'sup8', 'ALM-001'],
  ['ins35', 'Harina integral', 'almacen', 'kilogramo', 3, 15, 6.4, 1700, 'sup8', 'ALM-002'],
  ['ins36', 'Azúcar', 'almacen', 'kilogramo', 6, 30, 14, 1100, 'sup8', 'ALM-003'],
  ['ins37', 'Arroz', 'almacen', 'kilogramo', 5, 25, 11, 1400, 'sup8', 'ALM-004'],
  ['ins38', 'Dulce de leche', 'almacen', 'kilogramo', 3, 15, 6.8, 3200, 'sup8', 'ALM-005'],
  ['ins39', 'Chocolate 70%', 'almacen', 'kilogramo', 2, 10, 4.2, 9200, 'sup8', 'ALM-006'],
  ['ins40', 'Nueces', 'almacen', 'kilogramo', 2, 8, 3.6, 8600, 'sup8', 'ALM-007'],
  ['ins41', 'Mayonesa', 'almacen', 'kilogramo', 2, 10, 5.1, 2800, 'sup8', 'ALM-008'],
  ['ins42', 'Mostaza', 'almacen', 'kilogramo', 1, 6, 2.4, 3100, 'sup8', 'ALM-009'],

  ['ins43', 'Sal', 'condimentos', 'kilogramo', 2, 10, 5.5, 700, 'sup8', 'CON-001'],
  ['ins44', 'Pimienta negra', 'condimentos', 'kilogramo', 1, 5, 0.3, 9800, 'sup8', 'CON-002'],
  ['ins45', 'Aceite de oliva', 'condimentos', 'litro', 3, 15, 6.2, 5600, 'sup8', 'CON-003'],

  ['ins46', 'Detergente', 'limpieza', 'litro', 3, 15, 1, 2100, 'sup9', 'LIM-001'],
  ['ins47', 'Servilletas', 'limpieza', 'pack', 5, 25, 12, 3400, 'sup9', 'LIM-002'],

  ['ins48', 'Vasos de cartón', 'packaging', 'pack', 5, 25, 14, 4200, 'sup9', 'PAC-001'],
  ['ins49', 'Cajas para delivery', 'packaging', 'unidad', 30, 150, 72, 180, 'sup10', 'PAC-002'],

  ['ins50', 'Hielo', 'otros', 'kilogramo', 10, 40, 0, 450, 'sup10', 'OTR-001'],
]

export const INVENTORY_ITEMS = RAW.map(([id, name, categoryKey, unit, stockMin, stockMax, currentStock, avgCost, primarySupplierId, code]) => ({
  id, name, categoryKey, unit, stockMin, stockMax, currentStock,
  avgCost, lastCost: avgCost, primarySupplierId, code, active: true, updatedAt,
}))

export function getInventoryItemById(id) {
  return INVENTORY_ITEMS.find(i => i.id === id) ?? null
}
