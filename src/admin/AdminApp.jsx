import { Route, Routes } from 'react-router-dom'
import { POSProvider } from '../context/POSContext'
import { InventoryProvider } from '../context/InventoryContext'
import { CRMProvider } from '../context/CRMContext'
import { ToastProvider } from './context/ToastContext'
import AdminLayout from './layout/AdminLayout'
import { ADMIN_ROUTES } from './nav.config'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import POS from './pages/pos/POS'
import Mesas from './pages/pos/Mesas'
import Caja from './pages/pos/Caja'
import Ventas from './pages/pos/Ventas'
import VentaDetail from './pages/pos/VentaDetail'
import KDS from './pages/kitchen/KDS'
import Comandas from './pages/kitchen/Comandas'
import InventoryDashboard from './pages/inventory/InventoryDashboard'
import InventoryItemDetail from './pages/inventory/InventoryItemDetail'
import PhysicalInventory from './pages/inventory/PhysicalInventory'
import Recipes from './pages/inventory/Recipes'
import RecipeDetail from './pages/inventory/RecipeDetail'
import Purchases from './pages/inventory/Purchases'
import PurchaseDetail from './pages/inventory/PurchaseDetail'
import Suppliers from './pages/inventory/Suppliers'
import SupplierDetail from './pages/inventory/SupplierDetail'
import Waste from './pages/inventory/Waste'
import Movements from './pages/inventory/Movements'
import Costs from './pages/inventory/Costs'
import CustomersDashboard from './pages/crm/CustomersDashboard'
import CustomerDetail from './pages/crm/CustomerDetail'
import Segments from './pages/crm/Segments'
import CustomerActivity from './pages/crm/CustomerActivity'
import LoyaltyDashboard from './pages/loyalty/LoyaltyDashboard'
import Members from './pages/loyalty/Members'
import Levels from './pages/loyalty/Levels'
import Rewards from './pages/loyalty/Rewards'
import Redemptions from './pages/loyalty/Redemptions'
import PointsTransactions from './pages/loyalty/PointsTransactions'
import Campaigns from './pages/marketing/Campaigns'
import CampaignDetail from './pages/marketing/CampaignDetail'
import Automations from './pages/marketing/Automations'
import CustomerAnalytics from './pages/analytics/CustomerAnalytics'
import Retention from './pages/analytics/Retention'
import Cohorts from './pages/analytics/Cohorts'
import RFM from './pages/analytics/RFM'

// Este componente cuelga de <Route path="/admin/*"> en App.jsx, así que
// React Router recorta ese prefijo antes de matchear acá adentro: las rutas
// hijas se declaran relativas a "/admin" (nav.config.js sigue usando paths
// absolutos para el sidebar y los <Link>, que no se ven afectados).
function toRelativePath(path) {
  const rel = path.replace(/^\/admin/, '')
  return rel === '' ? '/' : rel
}

// Un módulo entra acá con su componente real y pasa a `available: true` en
// nav.config.js. Lo que no tiene entrada cae al fallback "Próximamente".
const PAGES = {
  '/admin': Dashboard,
  '/admin/pos': POS,
  '/admin/mesas': Mesas,
  '/admin/caja': Caja,
  '/admin/ventas': Ventas,
  '/admin/cocina': KDS,
  '/admin/comandas': Comandas,
  '/admin/inventario': InventoryDashboard,
  '/admin/recetas': Recipes,
  '/admin/compras': Purchases,
  '/admin/proveedores': Suppliers,
  '/admin/mermas': Waste,
  '/admin/movimientos': Movements,
  '/admin/costos': Costs,
  '/admin/clientes': CustomersDashboard,
  '/admin/clientes/segmentos': Segments,
  '/admin/clientes/actividad': CustomerActivity,
  '/admin/loyalty': LoyaltyDashboard,
  '/admin/loyalty/miembros': Members,
  '/admin/loyalty/niveles': Levels,
  '/admin/loyalty/beneficios': Rewards,
  '/admin/loyalty/canjes': Redemptions,
  '/admin/loyalty/movimientos': PointsTransactions,
  '/admin/marketing/campanas': Campaigns,
  '/admin/automatizaciones': Automations,
  '/admin/analisis/clientes': CustomerAnalytics,
  '/admin/analisis/retencion': Retention,
  '/admin/analisis/cohortes': Cohorts,
  '/admin/analisis/rfm': RFM,
}

// Rutas de detalle (no viven en nav.config.js porque no tienen su propia
// entrada de sidebar) — mismo patrón que /admin/ventas/:saleId en Fase 2.
const DETAIL_ROUTES = [
  { path: '/admin/ventas/:saleId', element: <VentaDetail /> },
  { path: '/admin/inventario/fisico', element: <PhysicalInventory /> },
  { path: '/admin/inventario/:itemId', element: <InventoryItemDetail /> },
  { path: '/admin/recetas/:recipeId', element: <RecipeDetail /> },
  { path: '/admin/compras/:purchaseId', element: <PurchaseDetail /> },
  { path: '/admin/proveedores/:supplierId', element: <SupplierDetail /> },
  { path: '/admin/clientes/:customerId', element: <CustomerDetail /> },
  { path: '/admin/marketing/campanas/:campaignId', element: <CampaignDetail /> },
]

export default function AdminApp() {
  return (
    <ToastProvider>
      <POSProvider>
        <InventoryProvider>
          <CRMProvider>
            <AdminLayout>
              <Routes>
                {ADMIN_ROUTES.map(route => {
                  const Page = PAGES[route.path]
                  return (
                    <Route
                      key={route.path}
                      path={toRelativePath(route.path)}
                      element={Page ? <Page /> : <ComingSoon title={route.label} />}
                    />
                  )
                })}
                {DETAIL_ROUTES.map(({ path, element }) => (
                  <Route key={path} path={toRelativePath(path)} element={element} />
                ))}
              </Routes>
            </AdminLayout>
          </CRMProvider>
        </InventoryProvider>
      </POSProvider>
    </ToastProvider>
  )
}
