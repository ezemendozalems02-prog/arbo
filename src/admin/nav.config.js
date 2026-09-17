// Fuente única de la navegación administrativa: el sidebar y el router
// (AdminApp.jsx) leen de esta misma lista, así nunca quedan desincronizados.
// `available: false` = módulo todavía no construido -> pantalla "Próximamente".
export const ADMIN_NAV = [
  {
    group: null,
    items: [
      { path: '/admin', label: 'Dashboard', available: true },
    ],
  },
  {
    group: 'Operación',
    items: [
      { path: '/admin/pos', label: 'POS', available: true },
      { path: '/admin/mesas', label: 'Mesas', available: true },
      { path: '/admin/comandas', label: 'Comandas', available: true },
      { path: '/admin/cocina', label: 'Cocina', available: true },
      { path: '/admin/caja', label: 'Caja', available: true },
    ],
  },
  {
    group: 'Ventas',
    items: [
      { path: '/admin/ventas', label: 'Ventas', available: true },
      { path: '/admin/pedidos', label: 'Pedidos', available: false },
      { path: '/admin/reservas', label: 'Reservas', available: false },
    ],
  },
  {
    group: 'Inventario',
    items: [
      { path: '/admin/inventario', label: 'Inventario', available: true },
      { path: '/admin/recetas', label: 'Recetas', available: true },
      { path: '/admin/compras', label: 'Compras', available: true },
      { path: '/admin/proveedores', label: 'Proveedores', available: true },
      { path: '/admin/mermas', label: 'Mermas', available: true },
      { path: '/admin/movimientos', label: 'Movimientos', available: true },
    ],
  },
  {
    group: 'Catálogo',
    items: [
      { path: '/admin/productos', label: 'Productos', available: false },
      { path: '/admin/categorias', label: 'Categorías', available: false },
      { path: '/admin/modificadores', label: 'Modificadores', available: false },
    ],
  },
  {
    group: 'Clientes',
    items: [
      { path: '/admin/clientes', label: 'Clientes', available: true },
      { path: '/admin/clientes/segmentos', label: 'Segmentos', available: true },
      { path: '/admin/clientes/actividad', label: 'Actividad', available: true },
    ],
  },
  {
    group: 'ARBO Club',
    items: [
      { path: '/admin/loyalty', label: 'Dashboard', available: true },
      { path: '/admin/loyalty/miembros', label: 'Miembros', available: true },
      { path: '/admin/loyalty/niveles', label: 'Niveles', available: true },
      { path: '/admin/loyalty/beneficios', label: 'Beneficios', available: true },
      { path: '/admin/loyalty/canjes', label: 'Canjes', available: true },
      { path: '/admin/loyalty/movimientos', label: 'Movimientos', available: true },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { path: '/admin/marketing/campanas', label: 'Campañas', available: true },
      { path: '/admin/automatizaciones', label: 'Automatizaciones', available: true },
    ],
  },
  {
    group: 'Análisis',
    items: [
      { path: '/admin/costos', label: 'Costos', available: true },
      { path: '/admin/analisis/clientes', label: 'Clientes', available: true },
      { path: '/admin/analisis/retencion', label: 'Retención', available: true },
      { path: '/admin/analisis/cohortes', label: 'Cohortes', available: true },
      { path: '/admin/analisis/rfm', label: 'RFM', available: true },
    ],
  },
  {
    group: 'Reportes',
    items: [
      { path: '/admin/reportes/ventas', label: 'Ventas', available: false },
      { path: '/admin/reportes/productos', label: 'Productos', available: false },
      { path: '/admin/reportes/clientes', label: 'Clientes', available: false },
    ],
  },
  {
    group: null,
    items: [
      { path: '/admin/configuracion', label: 'Configuración', available: false },
    ],
  },
]

export const ADMIN_ROUTES = ADMIN_NAV.flatMap(g => g.items)
