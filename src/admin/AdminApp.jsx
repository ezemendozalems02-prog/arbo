import { Route, Routes, Navigate } from 'react-router-dom'
import { POSProvider } from '../context/POSContext'
import { InventoryProvider } from '../context/InventoryContext'
import { CRMProvider } from '../context/CRMContext'
import { OfflineProvider } from '../context/OfflineContext'
import { ToastProvider } from './context/ToastContext'
import AdminLayout from './layout/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import { ADMIN_ROUTES } from './nav.config'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import POS from './pages/pos/POS'
import Mesas from './pages/pos/Mesas'
import Caja from './pages/pos/Caja'
import Ventas from './pages/pos/Ventas'
import VentaDetail from './pages/pos/VentaDetail'
import FiscalDashboard from './pages/fiscal/FiscalDashboard'
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
import Warehouses from './pages/inventory/Warehouses'
import StockTransfers from './pages/inventory/StockTransfers'
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
import SalesReports from './pages/reports/SalesReports'
import ProductsReports from './pages/reports/ProductsReports'
import CustomersReports from './pages/reports/CustomersReports'
import PurchaseSuggestions from './pages/inventory/PurchaseSuggestions'

function toRelativePath(path) {
  const rel = path.replace(/^\/admin/, '')
  return rel === '' ? '/' : rel
}

const PAGES = {
  '/admin': Dashboard,
  '/admin/pos': POS,
  '/admin/mesas': Mesas,
  '/admin/caja': Caja,
  '/admin/ventas': Ventas,
  '/admin/fiscal': FiscalDashboard,
  '/admin/cocina': KDS,
  '/admin/comandas': Comandas,
  '/admin/inventario': InventoryDashboard,
  '/admin/depositos': Warehouses,
  '/admin/warehouses': Warehouses,
  '/admin/transferencias': StockTransfers,
  '/admin/transfers': StockTransfers,
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
  '/admin/reportes/ventas': SalesReports,
  '/admin/reportes/productos': ProductsReports,
  '/admin/reportes/clientes': CustomersReports,
  '/admin/compras-sugeridas': PurchaseSuggestions,
}

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
    <OfflineProvider>
      <ToastProvider>
        <POSProvider>
          <InventoryProvider>
            <CRMProvider>
              <Routes>
                {/* Ruta pública de login para administradores y empleados */}
                <Route path="login" element={<Login />} />

                {/* Todas las rutas de administración están estrictamente protegidas */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
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
                          {/* Fallback interno */}
                          <Route path="*" element={<Navigate to="/admin" replace />} />
                        </Routes>
                      </AdminLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </CRMProvider>
          </InventoryProvider>
        </POSProvider>
      </ToastProvider>
    </OfflineProvider>
  )
}
