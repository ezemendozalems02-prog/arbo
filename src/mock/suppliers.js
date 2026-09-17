// Proveedores (bloque 22) — 10 en total, cada uno cubre una o más
// categorías de insumos (src/mock/inventoryCategories.js).
export const SUPPLIER_STATUSES = ['activo', 'inactivo']

export const SUPPLIERS = [
  { id: 'sup1', name: 'Carnicería del Sur', businessName: 'Carnicería del Sur S.R.L.', cuit: '30-71234567-8', phone: '+54 9 2945 40-1122', email: 'ventas@carniceriadelsur.com.ar', address: 'Ruta 259 km 4, Trevelin', categories: ['carnes'], paymentTerms: '15 días', status: 'activo', notes: 'Entrega los martes y viernes.' },
  { id: 'sup2', name: 'Panadería Trevelin', businessName: 'Panificados Trevelin S.A.', cuit: '30-71234568-4', phone: '+54 9 2945 40-2233', email: 'pedidos@panaderiatrevelin.com.ar', address: 'San Martín 450, Trevelin', categories: ['panaderia'], paymentTerms: 'Contado', status: 'activo', notes: 'Producción diaria, pedir el día anterior.' },
  { id: 'sup3', name: 'Lácteos Cordillera', businessName: 'Lácteos Cordillera S.A.', cuit: '30-71234569-0', phone: '+54 9 2945 40-3344', email: 'comercial@lacteoscordillera.com.ar', address: 'Parque Industrial, Esquel', categories: ['lacteos'], paymentTerms: '30 días', status: 'activo', notes: '' },
  { id: 'sup4', name: 'Verdulería del Valle', businessName: 'Distribuidora del Valle S.R.L.', cuit: '30-71234570-3', phone: '+54 9 2945 40-4455', email: 'ventas@verduleriadelvalle.com.ar', address: 'Av. Fontana 780, Esquel', categories: ['verduras', 'frutas'], paymentTerms: '7 días', status: 'activo', notes: '' },
  { id: 'sup5', name: 'Distribuidora Patagonia Bebidas', businessName: 'Patagonia Bebidas S.A.', cuit: '30-71234571-1', phone: '+54 9 2945 40-5566', email: 'pedidos@patagoniabebidas.com.ar', address: 'Ruta 40 km 12, Esquel', categories: ['bebidas', 'alcohol'], paymentTerms: '30 días', status: 'activo', notes: '' },
  { id: 'sup6', name: 'Bodega Vientos del Sur', businessName: 'Bodega Vientos del Sur S.A.', cuit: '30-71234572-8', phone: '+54 9 261 400-1122', email: 'ventas@vientosdelsur.com.ar', address: 'Luján de Cuyo, Mendoza', categories: ['alcohol'], paymentTerms: '30 días', status: 'activo', notes: 'Envío mensual consolidado.' },
  { id: 'sup7', name: 'Tostadero Andino', businessName: 'Tostadero Andino S.R.L.', cuit: '30-71234573-4', phone: '+54 9 2945 40-6677', email: 'info@tostaderoandino.com.ar', address: 'Los Alerces 120, Esquel', categories: ['cafeteria'], paymentTerms: '15 días', status: 'activo', notes: '' },
  { id: 'sup8', name: 'Almacén Mayorista Esquel', businessName: 'Mayorista Esquel S.A.', cuit: '30-71234574-0', phone: '+54 9 2945 40-7788', email: 'ventas@mayoristaesquel.com.ar', address: 'Parque Industrial, Esquel', categories: ['almacen', 'condimentos'], paymentTerms: '30 días', status: 'activo', notes: '' },
  { id: 'sup9', name: 'Insumos Higiene Sur', businessName: 'Higiene Sur S.R.L.', cuit: '30-71234575-7', phone: '+54 9 2945 40-8899', email: 'pedidos@higienesur.com.ar', address: 'Av. Ameghino 300, Esquel', categories: ['limpieza', 'packaging'], paymentTerms: '15 días', status: 'activo', notes: '' },
  { id: 'sup10', name: 'Proveedor General Otros', businessName: 'Suministros Generales S.A.', cuit: '30-71234576-3', phone: '+54 9 2945 40-9900', email: 'contacto@suministrosgenerales.com.ar', address: 'Ruta 259 km 2, Trevelin', categories: ['otros', 'packaging'], paymentTerms: 'Contado', status: 'inactivo', notes: 'Sin pedidos en los últimos 3 meses.' },
]

export function getSupplierById(id) {
  return SUPPLIERS.find(s => s.id === id) ?? null
}
