import { useEffect, useMemo } from 'react'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { usePOS } from '../../context/POSContext'
import { useInventory } from '../../context/InventoryContext'
import {
  getDashboardPendingOrders, getDashboardSummary, getRecentActivity, getRecentReservations,
  getRecentSales, getSalesByHour, getSalesByLastDays, getTopProducts,
} from '../../services/dashboardService'
import { getStockStatus } from '../../services/inventoryCostService'
import { calcRecipeSummary } from '../../services/recipeCostService'
import { PRODUCTS } from '../../mock/products'
import StatCard from '../components/StatCard'
import Panel from '../components/Panel'
import BarChart from '../components/BarChart'
import TopProductsList from '../components/TopProductsList'
import RecentSalesList from '../components/RecentSalesList'
import RecentReservationsList from '../components/RecentReservationsList'
import PendingOrdersList from '../components/PendingOrdersList'
import ActivityFeed from '../components/ActivityFeed'
import { formatMoney, formatNumber } from '../utils/format'

const gridStyle = { display: 'grid', gap: 20 }

export default function Dashboard() {
  useEffect(() => { document.title = 'Dashboard | ARBO OS' }, [])
  const isMobile = useIsMobile()
  const { tables } = usePOS()
  const { items, recipes, purchases, waste, getItemById, getRecipeById } = useInventory()

  // Se calcula una sola vez por montaje del panel: los mocks son estáticos,
  // así evitamos recalcular listas/ordenamientos en cada re-render.
  const summary = useMemo(() => getDashboardSummary(), [])
  const salesByHour = useMemo(() => getSalesByHour(), [])
  const salesByDay = useMemo(() => getSalesByLastDays(7), [])
  const topProducts = useMemo(() => getTopProducts(5), [])
  const recentSales = useMemo(() => getRecentSales(6), [])
  const recentReservations = useMemo(() => getRecentReservations(6), [])
  const pendingOrders = useMemo(() => getDashboardPendingOrders(6), [])
  const activity = useMemo(() => getRecentActivity(8), [])

  // BLOQUE 38 — tablero principal ampliado con inventario/costos, sin tocar
  // el resumen de ventas/reservas de Fase 1 de arriba.
  const now = new Date()
  const occupiedTables = tables.filter(t => t.status === 'ocupada').length
  const stockLowCount = items.filter(i => getStockStatus(i) !== 'NORMAL').length
  const purchases30d = purchases.filter(p => p.status === 'recibida' && (now - p.receivedAt) <= 30 * 86400000).reduce((s, p) => s + p.total, 0)
  const waste30d = waste.filter(w => (now - w.createdAt) <= 30 * 86400000).reduce((s, w) => s + w.cost, 0)
  const productRecipes = recipes.filter(r => r.productId)
  const foodCostPcts = productRecipes.map(r => {
    const product = PRODUCTS.find(p => p.id === r.productId)
    return calcRecipeSummary(r, product?.price ?? 0, { getInsumo: getItemById, getRecipe: getRecipeById }).foodCostPct
  })
  const avgFoodCost = foodCostPcts.length ? foodCostPcts.reduce((s, p) => s + p, 0) / foodCostPcts.length : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard label="Ventas de hoy" value={formatMoney(summary.salesToday)} />
        <StatCard label="Pedidos" value={formatNumber(summary.ordersToday)} />
        <StatCard label="Reservas" value={formatNumber(summary.reservationsToday)} />
        <StatCard label="Clientes" value={formatNumber(summary.customersTotal)} />
        <StatCard label="Ticket promedio" value={formatMoney(summary.avgTicket)} />
      </div>

      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard label="Mesas ocupadas" value={`${occupiedTables} / ${tables.length}`} />
        <StatCard label="Stock bajo" value={formatNumber(stockLowCount)} />
        <StatCard label="Compras (30 días)" value={formatMoney(purchases30d)} />
        <StatCard label="Merma (30 días)" value={formatMoney(waste30d)} />
        <StatCard label="Food cost promedio" value={`${avgFoodCost.toFixed(1)}%`} />
      </div>

      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Panel title="Ventas por hora">
          <BarChart data={salesByHour.map(h => ({ label: h.label, total: h.total }))} />
        </Panel>
        <Panel title="Ventas — últimos 7 días">
          <BarChart data={salesByDay.map(d => ({ label: d.label, total: d.total }))} />
        </Panel>
      </div>

      <div style={{ ...gridStyle, gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.1fr) minmax(0, 1fr)' }}>
        <Panel title="Productos más vendidos">
          <TopProductsList rows={topProducts} />
        </Panel>
        <Panel title="Pedidos pendientes">
          <PendingOrdersList orders={pendingOrders} />
        </Panel>
      </div>

      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Panel title="Últimas ventas">
          <RecentSalesList orders={recentSales} />
        </Panel>
        <Panel title="Próximas reservas">
          <RecentReservationsList reservations={recentReservations} />
        </Panel>
        <Panel title="Actividad reciente">
          <ActivityFeed events={activity} />
        </Panel>
      </div>
    </div>
  )
}
