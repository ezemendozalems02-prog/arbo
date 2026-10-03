import {
  Armchair, BarChart3, BookOpen, ChefHat, ClipboardList, Coins, Gem, LayoutDashboard, LineChart,
  Megaphone, Package, ShoppingBag, Store, Trash2, Truck, Users, Workflow,
} from 'lucide-react'

// Fuente única de la navegación administrativa: sidebar, router (AdminApp),
// breadcrumb, encabezado de página y paleta de comandos leen de acá, así
// nunca quedan desincronizados.
//
// - `description`: responde "¿qué puedo hacer acá?" en el encabezado.
// - `children`: módulos relacionados, desplegables en el sidebar.
// - Un ítem sin `path` propio (ej. Reportes) lleva a su primer hijo.
export const ADMIN_NAV = [
  {
    group: 'Operación',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, description: 'Esto es lo que está pasando en ARBO hoy.' },
      {
        path: '/admin/pos', label: 'POS', overviewLabel: 'Punto de venta', icon: ShoppingBag, description: 'Registrá ventas, aplicá beneficios y cobrá en segundos.',
        children: [
          { path: '/admin/caja', label: 'Caja', description: 'Apertura, movimientos y cierre de caja del turno.' },
          { path: '/admin/ventas', label: 'Ventas', description: 'Historial de ventas y detalle de cada ticket.' },
          { path: '/admin/fiscal', label: 'Fiscal & AFIP', description: 'Facturación electrónica, CAE y estado de cada comprobante.' },
        ],
      },
      { path: '/admin/mesas', label: 'Mesas', icon: Armchair, description: 'El salón en tiempo real: ocupación y estado de cada mesa.' },
      { path: '/admin/comandas', label: 'Comandas', icon: ClipboardList, description: 'Seguimiento de cada comanda enviada a cocina y barra.' },
      { path: '/admin/cocina', label: 'Cocina', icon: ChefHat, description: 'Pantalla de cocina por estaciones.' },
    ],
  },
  {
    group: 'Gestión',
    items: [
      {
        path: '/admin/inventario', label: 'Inventario', overviewLabel: 'Insumos', icon: Package, description: 'Controlá tus insumos y mantené el stock bajo control.',
        children: [
          { path: '/admin/movimientos', label: 'Movimientos de stock', description: 'Entradas, salidas y ajustes de stock, con su motivo.' },
          { path: '/admin/depositos', label: 'Depósitos', description: 'Dónde está guardado cada insumo, por sucursal y depósito.' },
          { path: '/admin/transferencias', label: 'Transferencias', description: 'Mové stock entre depósitos y sucursales.' },
        ],
      },
      { path: '/admin/recetas', label: 'Recetas', icon: BookOpen, description: 'Cuánto cuesta producir cada plato y cuánto deja.' },
      {
        path: '/admin/compras', label: 'Compras', overviewLabel: 'Órdenes de compra', icon: Truck, description: 'Pedidos a proveedores, recepción y costos.',
        children: [
          { path: '/admin/compras-sugeridas', label: 'Compras sugeridas', description: 'Qué conviene comprar según tu stock y consumo.' },
        ],
      },
      { path: '/admin/proveedores', label: 'Proveedores', icon: Store, description: 'Tus proveedores, sus condiciones y el historial de compras.' },
      { path: '/admin/mermas', label: 'Mermas', icon: Trash2, description: 'Registrá pérdidas y entendé dónde se va el costo.' },
    ],
  },
  {
    group: 'Clientes',
    items: [
      {
        path: '/admin/clientes', label: 'Clientes', overviewLabel: 'Todos los clientes', icon: Users, description: 'Conocé a tus clientes: visitas, compras y comportamiento.',
        children: [
          { path: '/admin/clientes/segmentos', label: 'Segmentos', description: 'Agrupá clientes para entenderlos y hablarles mejor.' },
          { path: '/admin/clientes/actividad', label: 'Actividad', description: 'Todo lo que hicieron tus clientes, en orden.' },
        ],
      },
      {
        path: '/admin/loyalty', label: 'ARBO Club', overviewLabel: 'Resumen', icon: Gem, description: 'Puntos, niveles y beneficios de la membresía.',
        children: [
          { path: '/admin/loyalty/miembros', label: 'Miembros', description: 'Quiénes forman parte del club y en qué nivel están.' },
          { path: '/admin/loyalty/niveles', label: 'Niveles', description: 'Qué hace falta para subir de nivel y qué se gana.' },
          { path: '/admin/loyalty/beneficios', label: 'Beneficios', description: 'Recompensas que los socios pueden canjear.' },
          { path: '/admin/loyalty/canjes', label: 'Canjes', description: 'Beneficios canjeados y su estado.' },
          { path: '/admin/loyalty/movimientos', label: 'Movimientos de puntos', description: 'Cada punto sumado o usado, con su origen.' },
        ],
      },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { path: '/admin/marketing/campanas', label: 'Campañas', icon: Megaphone, description: 'Creá campañas para volver a conectar con tus clientes.' },
      { path: '/admin/automatizaciones', label: 'Automatizaciones', icon: Workflow, description: 'Mensajes que salen solos en el momento justo.' },
    ],
  },
  {
    group: 'Análisis',
    items: [
      {
        path: null, label: 'Reportes', icon: BarChart3, matchPrefix: '/admin/reportes',
        children: [
          { path: '/admin/reportes/ventas', label: 'Ventas', description: 'Cómo vendés: por día, canal, medio de pago y franja horaria.' },
          { path: '/admin/reportes/productos', label: 'Productos', description: 'Qué se vende, cuánto deja y qué conviene revisar.' },
          { path: '/admin/reportes/clientes', label: 'Clientes', description: 'Quiénes compran, con qué frecuencia y cuánto gastan.' },
        ],
      },
      {
        path: null, label: 'Analítica', icon: LineChart, matchPrefix: '/admin/analisis',
        children: [
          { path: '/admin/analisis/clientes', label: 'Clientes', description: 'Cómo crece y se comporta tu base de clientes.' },
          { path: '/admin/analisis/retencion', label: 'Retención', description: 'Cuántos clientes vuelven y cada cuánto.' },
          { path: '/admin/analisis/cohortes', label: 'Cohortes', description: 'El comportamiento de cada camada de clientes.' },
          { path: '/admin/analisis/rfm', label: 'RFM', description: 'Clientes según recencia, frecuencia y gasto.' },
        ],
      },
      { path: '/admin/costos', label: 'Costos', icon: Coins, description: 'Food cost, márgenes y evolución de costos.' },
    ],
  },
]

// Módulos todavía no construidos: tienen ruta (pantalla "Próximamente") pero
// no ocupan lugar en el sidebar.
const UPCOMING = [
  { path: '/admin/pedidos', label: 'Pedidos' },
  { path: '/admin/reservas', label: 'Reservas' },
  { path: '/admin/productos', label: 'Productos' },
  { path: '/admin/categorias', label: 'Categorías' },
  { path: '/admin/modificadores', label: 'Modificadores' },
  { path: '/admin/configuracion', label: 'Configuración' },
]

// Rutas de detalle: sin entrada en el sidebar, pero con título y padre para
// el breadcrumb. El orden importa (prefijo más específico primero).
const DETAILS = [
  { prefix: '/admin/ventas/', label: 'Detalle de venta', parent: '/admin/ventas' },
  { prefix: '/admin/inventario/fisico', label: 'Inventario físico', parent: '/admin/inventario', description: 'Conteo físico para conciliar el stock real con el del sistema.' },
  { prefix: '/admin/inventario/', label: 'Ficha de insumo', parent: '/admin/inventario' },
  { prefix: '/admin/recetas/', label: 'Receta', parent: '/admin/recetas' },
  { prefix: '/admin/compras/', label: 'Detalle de compra', parent: '/admin/compras' },
  { prefix: '/admin/proveedores/', label: 'Proveedor', parent: '/admin/proveedores' },
  { prefix: '/admin/marketing/campanas/', label: 'Campaña', parent: '/admin/marketing/campanas' },
  { prefix: '/admin/clientes/', label: 'Perfil del cliente', parent: '/admin/clientes' },
]

// Lista plana de entradas navegables, con su grupo y padre.
export const NAV_ENTRIES = ADMIN_NAV.flatMap(({ group, items }) =>
  items.flatMap(item => [
    ...(item.path ? [{ ...item, group, parent: null }] : []),
    ...(item.children ?? []).map(child => ({ ...child, group, parent: item, icon: item.icon })),
  ]))

export const ADMIN_ROUTES = [
  ...NAV_ENTRIES.map(e => ({ path: e.path, label: e.label, available: true })),
  ...UPCOMING.map(e => ({ ...e, available: false })),
]

export const itemHref = (item) => item.path ?? item.children?.[0]?.path

export const isItemActive = (item, pathname) => {
  if (item.path === '/admin') return pathname === '/admin'
  const own = item.path && (pathname === item.path || pathname.startsWith(`${item.path}/`))
  const viaPrefix = item.matchPrefix && pathname.startsWith(item.matchPrefix)
  const viaChild = item.children?.some(c => pathname === c.path || pathname.startsWith(`${c.path}/`))
  return Boolean(own || viaPrefix || viaChild)
}

// Contexto de la pantalla actual: título, descripción y breadcrumb.
export function getPageMeta(pathname) {
  const entry = NAV_ENTRIES.find(e => e.path === pathname)
  if (entry) {
    const crumbs = [{ label: entry.group }]
    if (entry.parent) crumbs.push({ label: entry.parent.label, to: itemHref(entry.parent) })
    crumbs.push({ label: entry.label })
    return { title: entry.label, description: entry.description, crumbs }
  }
  const detail = DETAILS.find(d => pathname.startsWith(d.prefix))
  if (detail) {
    const parent = NAV_ENTRIES.find(e => e.path === detail.parent)
    return {
      title: detail.label,
      description: detail.description,
      crumbs: [
        ...(parent ? [{ label: parent.group }, { label: parent.label, to: parent.path }] : []),
        { label: detail.label },
      ],
    }
  }
  const upcoming = UPCOMING.find(u => u.path === pathname)
  return { title: upcoming?.label ?? 'ARBO OS', description: null, crumbs: [{ label: upcoming?.label ?? 'ARBO OS' }] }
}
