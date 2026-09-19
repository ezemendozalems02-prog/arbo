import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { COLORS, FONTS } from '../../styles/theme'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { ADMIN_ROUTES } from '../nav.config'
import { MenuIcon, CloseIcon } from '../../components/ui/icons'
import AdminSidebar from './AdminSidebar'
import ConnectivityBanner from '../components/ConnectivityBanner'

const SIDEBAR_WIDTH = 260

// Rutas de detalle sin entrada propia en el sidebar (nav.config.js) — un
// título fijo para cada prefijo, en vez de encadenar startsWith() sueltos.
const DETAIL_TITLES = [
  ['/admin/ventas/', 'Detalle de venta'],
  ['/admin/inventario/fisico', 'Inventario físico'],
  ['/admin/inventario/', 'Ficha de insumo'],
  ['/admin/recetas/', 'Receta'],
  ['/admin/compras/', 'Detalle de compra'],
  ['/admin/proveedores/', 'Proveedor'],
  ['/admin/marketing/campanas/', 'Campaña'],
  ['/admin/clientes/segmentos', 'Segmentos'],
  ['/admin/clientes/actividad', 'Actividad'],
  ['/admin/clientes/', 'Cliente'],
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const currentRoute = ADMIN_ROUTES.find(r => r.path === location.pathname)
  const detailTitle = DETAIL_TITLES.find(([prefix]) => location.pathname.startsWith(prefix))?.[1]
  const title = currentRoute?.label ?? detailTitle ?? 'ARBO OS'
  // El KDS es una pantalla de cocina, no un panel de administración más: se
  // ve a distancia durante el servicio, así que controla su propio fondo y
  // márgenes en vez de quedar encajonado en el padding estándar del admin.
  const isKDS = location.pathname === '/admin/cocina'

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, display: 'flex' }}>
      {!isMobile && (
        <aside style={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
          <div style={{ position: 'fixed', top: 0, left: 0, width: SIDEBAR_WIDTH, height: '100vh' }}>
            <AdminSidebar />
          </div>
        </aside>
      )}

      {isMobile && drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,20,0.6)', zIndex: 500 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, width: 'min(280px, 82vw)', height: '100vh', zIndex: 501 }}>
            <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 100, background: 'rgba(247,241,227,0.97)', backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${COLORS.lineGreen}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isMobile && (
              <button onClick={() => setDrawerOpen(o => !o)} aria-label="Abrir menú"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.greenDark, padding: 4 }}>
                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            )}
            <h1 style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.greenDark, fontWeight: 500 }}>{title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ConnectivityBanner />
            <Link to="/" style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.green, textDecoration: 'none' }}>
              ← Ver sitio
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: isKDS ? 0 : (isMobile ? '20px 16px 60px' : '28px 32px 70px') }}>
          {children}
        </main>
      </div>
    </div>
  )
}
