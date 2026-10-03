import { useMemo, useState } from 'react'
import {
  AlertTriangle, Armchair, BookOpen, CalendarDays, ClipboardList, Coins, Receipt, Trash2, TrendingUp, Truck, Users, Wallet,
} from 'lucide-react'
import { usePOS } from '../../context/POSContext'
import { useInventory } from '../../context/InventoryContext'
import {
  getDashboardPendingOrders, getDashboardSummary, getRecentActivity, getRecentReservations,
  getRecentSales, getSalesByHour, getSalesByLastDays, getTopProducts, getYesterdaySummary,
} from '../../services/dashboardService'
import { getStockStatus } from '../../services/inventoryCostService'
import { calcRecipeSummary } from '../../services/recipeCostService'
import { PRODUCTS } from '../../mock/products'
import { MOCK_NOW } from '../../mock/config'
import Panel from '../components/Panel'
import BarChart from '../components/BarChart'
import TopProductsList from '../components/TopProductsList'
import RecentSalesList from '../components/RecentSalesList'
import RecentReservationsList from '../components/RecentReservationsList'
import PendingOrdersList from '../components/PendingOrdersList'
import ActivityFeed from '../components/ActivityFeed'
import DashboardHero from '../components/dashboard/DashboardHero'
import MetricCard from '../ui/MetricCard'
import { InsightCard } from '../ui/Card'
import { formatMoney, formatNumber } from '../utils/format'
import { OS, TYPE } from '../styles/tokens'

const pctChange = (now, before) => (before > 0 ? ((now - before) / before) * 100 : null)

function SectionTitle({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, margin: '8px 2px -4px' }}>
      <h2 style={TYPE.label}>{children}</h2>
      {hint && <p style={TYPE.caption}>{hint}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { tables } = usePOS()
  const { items, recipes, purchases, waste, getItemById, getRecipeById } = useInventory()
  const [chartRange, setChartRange] = useState('week')

  // Los mocks son estáticos: se calcula una sola vez por montaje.
  const summary = useMemo(() => getDashboardSummary(), [])
  const yesterday = useMemo(() => getYesterdaySummary(), [])
  const salesByHour = useMemo(() => getSalesByHour(), [])
  const salesByDay = useMemo(() => getSalesByLastDays(7), [])
  const topProducts = useMemo(() => getTopProducts(5), [])
  const recentSales = useMemo(() => getRecentSales(6), [])
  const recentReservations = useMemo(() => getRecentReservations(5), [])
  const pendingOrders = useMemo(() => getDashboardPendingOrders(6), [])
  const pendingTotal = useMemo(() => getDashboardPendingOrders(999).length, [])
  const activity = useMemo(() => getRecentActivity(7), [])

  // Indicadores de inventario/costos: mismos cálculos que el tablero anterior,
  // sin cambios (incluido `new Date()` como referencia de los 30 días).
  const now = new Date()
  const occupiedTables = tables.filter(t => t.status === 'ocupada').length
  const stockLowCount = items.filter(i => getStockStatus(i) !== 'NORMAL').length
  const purchases30d = purchases.filter(p => p.status === 'recibida' && (now - p.receivedAt) <= 30 * 86400000).reduce((s, p) => s + p.total, 0)
  const waste30d = waste.filter(w => (now - w.createdAt) <= 30 * 86400000).reduce((s, w) => s + w.cost, 0)
  const avgFoodCost = useMemo(() => {
    const pcts = recipes.filter(r => r.productId).map(r => {
      const product = PRODUCTS.find(p => p.id === r.productId)
      return calcRecipeSummary(r, product?.price ?? 0, { getInsumo: getItemById, getRecipe: getRecipeById }).foodCostPct
    })
    return pcts.length ? pcts.reduce((s, p) => s + p, 0) / pcts.length : 0
  }, [recipes, getItemById, getRecipeById])

  const highlights = [
    `${formatNumber(summary.ordersToday)} pedidos`,
    `${formatNumber(summary.reservationsToday)} reservas`,
    `${occupiedTables} de ${tables.length} mesas ocupadas`,
    ...(pendingTotal ? [`${pendingTotal} pedidos en curso`] : []),
  ]

  const chartData = chartRange === 'week'
    ? salesByDay.map(d => ({ label: d.label, total: d.total }))
    : salesByHour.map(h => ({ label: h.label, total: h.total }))
  const chartTotal = chartData.reduce((s, d) => s + d.total, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <DashboardHero highlights={highlights} />

      <div data-tour="dashboard-metrics" className="os-metrics" style={{ display: 'grid', gap: 16 }}>
        <MetricCard icon={Wallet} label="Ventas hoy" value={formatMoney(summary.salesToday)}
          delta={{ value: pctChange(summary.salesToday, yesterday.salesToday), label: 'vs ayer' }}
          trend={salesByDay.map(d => d.total)} />
        <MetricCard icon={Receipt} label="Pedidos" value={formatNumber(summary.ordersToday)}
          delta={{ value: pctChange(summary.ordersToday, yesterday.ordersToday), label: 'vs ayer' }} />
        <MetricCard icon={TrendingUp} label="Ticket promedio" value={formatMoney(summary.avgTicket)}
          delta={{ value: pctChange(summary.avgTicket, yesterday.avgTicket), label: 'vs ayer' }} />
        <MetricCard icon={Armchair} label="Mesas" value={`${occupiedTables} / ${tables.length}`}
          progress={tables.length ? occupiedTables / tables.length : 0} hint="ocupadas ahora" to="/admin/mesas" />
        <MetricCard icon={AlertTriangle} label="Stock bajo" value={formatNumber(stockLowCount)}
          tone={stockLowCount > 0 ? 'warning' : undefined}
          hint={stockLowCount > 0 ? 'insumos para reponer' : 'todo en orden'} to="/admin/inventario" />
        <MetricCard icon={Users} label="Clientes" value={formatNumber(summary.customersTotal)} hint="en la base" to="/admin/clientes" />
      </div>

      <div className="os-dash-row" style={{ display: 'grid', gap: 20, alignItems: 'stretch' }}>
        <div style={{ minWidth: 0 }}>
          <Panel
            title="Ventas"
            description={chartRange === 'week' ? `Últimos 7 días · ${formatMoney(chartTotal)}` : `Hoy por hora · ${formatMoney(chartTotal)}`}
            icon={Coins}
            action={
              <div className="os-segmented" role="group" aria-label="Rango del gráfico">
                <button type="button" aria-pressed={chartRange === 'week'} onClick={() => setChartRange('week')}>7 días</button>
                <button type="button" aria-pressed={chartRange === 'today'} onClick={() => setChartRange('today')}>Hoy</button>
              </div>
            }>
            <BarChart data={chartData} height={230} highlightLast={chartRange === 'week'}
              emptyLabel="Todavía no hay ventas en este período." />
          </Panel>
        </div>
        <Panel title="Pedidos en curso" description="Esperando preparación o entrega" icon={ClipboardList}>
          <PendingOrdersList orders={pendingOrders} />
        </Panel>
      </div>

      <SectionTitle hint="Últimos 30 días">Gestión</SectionTitle>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))' }}>
        <InsightCard icon={CalendarDays} label="Reservas de hoy" value={formatNumber(summary.reservationsToday)} />
        <InsightCard icon={Truck} label="Compras recibidas" value={formatMoney(purchases30d)} to="/admin/compras" />
        <InsightCard icon={Trash2} label="Merma" value={formatMoney(waste30d)} tone={waste30d > 0 ? 'warning' : undefined} to="/admin/mermas" />
        <InsightCard icon={BookOpen} label="Food cost promedio" value={`${avgFoodCost.toFixed(1)}%`} to="/admin/costos" />
      </div>

      <SectionTitle>Movimiento del día</SectionTitle>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        <Panel title="Más vendidos" description="Últimos 7 días">
          <TopProductsList rows={topProducts} />
        </Panel>
        <Panel title="Próximas reservas">
          <RecentReservationsList reservations={recentReservations} />
        </Panel>
        <Panel title="Últimas ventas">
          <RecentSalesList orders={recentSales} />
        </Panel>
        <Panel title="Actividad reciente">
          <ActivityFeed events={activity} />
        </Panel>
      </div>

      <style>{`
        .os-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        @media (min-width: 1680px) { .os-metrics { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .os-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px !important; } }
        .os-dash-row { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
        @media (max-width: 1100px) { .os-dash-row { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
      <p className="os-hint" style={{ textAlign: 'center', color: OS.color.ink3, marginTop: 4 }}>
        Datos de demostración al {MOCK_NOW.toLocaleDateString('es-AR')}.
      </p>
    </div>
  )
}
