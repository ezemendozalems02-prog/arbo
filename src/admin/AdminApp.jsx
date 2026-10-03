import { lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { POSProvider } from '../context/POSContext'
import { InventoryProvider } from '../context/InventoryContext'
import { CRMProvider } from '../context/CRMContext'
import { OfflineProvider } from '../context/OfflineContext'
import { ToastProvider } from './context/ToastContext'
import AdminLayout from './layout/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { ADMIN_ROUTES } from './nav.config'
import './styles/os.css'

// Cada módulo se descarga recién cuando se visita (code-splitting): el POS
// no carga el peso de Análisis ni viceversa. Mientras tanto se ve el
// skeleton del <Suspense> de AdminLayout.
const Login = lazy(() => import('./pages/auth/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const POS = lazy(() => import('./pages/pos/POS'))
const Mesas = lazy(() => import('./pages/pos/Mesas'))
const Caja = lazy(() => import('./pages/pos/Caja'))
const Ventas = lazy(() => import('./pages/pos/Ventas'))
const VentaDetail = lazy(() => import('./pages/pos/VentaDetail'))
const FiscalDashboard = lazy(() => import('./pages/fiscal/FiscalDashboard'))
const KDS = lazy(() => import('./pages/kitchen/KDS'))
const Comandas = lazy(() => import('./pages/kitchen/Comandas'))
const InventoryDashboard = lazy(() => import('./pages/inventory/InventoryDashboard'))
const InventoryItemDetail = lazy(() => import('./pages/inventory/InventoryItemDetail'))
const PhysicalInventory = lazy(() => import('./pages/inventory/PhysicalInventory'))
const Recipes = lazy(() => import('./pages/inventory/Recipes'))
const RecipeDetail = lazy(() => import('./pages/inventory/RecipeDetail'))
const Purchases = lazy(() => import('./pages/inventory/Purchases'))
const PurchaseDetail = lazy(() => import('./pages/inventory/PurchaseDetail'))
const Suppliers = lazy(() => import('./pages/inventory/Suppliers'))
const SupplierDetail = lazy(() => import('./pages/inventory/SupplierDetail'))
const Waste = lazy(() => import('./pages/inventory/Waste'))
const Movements = lazy(() => import('./pages/inventory/Movements'))
const Costs = lazy(() => import('./pages/inventory/Costs'))
const Warehouses = lazy(() => import('./pages/inventory/Warehouses'))
const StockTransfers = lazy(() => import('./pages/inventory/StockTransfers'))
const CustomersDashboard = lazy(() => import('./pages/crm/CustomersDashboard'))
const CustomerDetail = lazy(() => import('./pages/crm/CustomerDetail'))
const Segments = lazy(() => import('./pages/crm/Segments'))
const CustomerActivity = lazy(() => import('./pages/crm/CustomerActivity'))
const LoyaltyDashboard = lazy(() => import('./pages/loyalty/LoyaltyDashboard'))
const Members = lazy(() => import('./pages/loyalty/Members'))
const Levels = lazy(() => import('./pages/loyalty/Levels'))
const Rewards = lazy(() => import('./pages/loyalty/Rewards'))
const Redemptions = lazy(() => import('./pages/loyalty/Redemptions'))
const PointsTransactions = lazy(() => import('./pages/loyalty/PointsTransactions'))
const Campaigns = lazy(() => import('./pages/marketing/Campaigns'))
const CampaignDetail = lazy(() => import('./pages/marketing/CampaignDetail'))
const Automations = lazy(() => import('./pages/marketing/Automations'))
const CustomerAnalytics = lazy(() => import('./pages/analytics/CustomerAnalytics'))
const Retention = lazy(() => import('./pages/analytics/Retention'))
const Cohorts = lazy(() => import('./pages/analytics/Cohorts'))
const RFM = lazy(() => import('./pages/analytics/RFM'))
const SalesReports = lazy(() => import('./pages/reports/SalesReports'))
const ProductsReports = lazy(() => import('./pages/reports/ProductsReports'))
const CustomersReports = lazy(() => import('./pages/reports/CustomersReports'))
const PurchaseSuggestions = lazy(() => import('./pages/inventory/PurchaseSuggestions'))

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
