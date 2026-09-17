import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { usePOS } from '../../../context/POSContext'
import { PRODUCTS } from '../../../mock/products'
import { calcRecipeSummary } from '../../../services/recipeCostService'
import { calculateOrderCost } from '../../../services/inventoryConsumptionService'
import { calcInventoryTotalValue } from '../../../services/inventoryCostService'
import { formatMoney } from '../../utils/format'
import StatCard from '../../components/StatCard'
import Panel, { EmptyState } from '../../components/Panel'

const PERIODS = [
  { key: 'hoy', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: 'mes', label: 'Mes actual' },
]

function periodRange(period) {
  const now = new Date()
  if (period === 'hoy') return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: now }
  if (period === '7d') return { from: new Date(now.getTime() - 7 * 86400000), to: now }
  if (period === '30d') return { from: new Date(now.getTime() - 30 * 86400000), to: now }
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now } // mes actual
}

const inputStyle = {
  padding: '9px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer',
}

export default function Costs() {
  useEffect(() => { document.title = 'Costos | ARBO OS' }, [])
  const { items, recipes, purchases, waste, getItemById, getRecipeById, getRecipeByProductId } = useInventory()
  const { sales } = usePOS()
  const [period, setPeriod] = useState('30d')

  const { from, to } = periodRange(period)
  const salesInPeriod = sales.filter(s => s.createdAt >= from && s.createdAt <= to)
  const purchasesInPeriod = purchases.filter(p => p.status === 'recibida' && p.receivedAt && p.receivedAt >= from && p.receivedAt <= to)
  const wasteInPeriod = waste.filter(w => w.status === 'registrada' && w.createdAt >= from && w.createdAt <= to)

  const getInsumo = (id) => getItemById(id)
  const getRecipe = (id) => getRecipeById(id)

  const productRows = recipes
    .filter(r => r.productId)
    .map(recipe => {
      const product = PRODUCTS.find(p => p.id === recipe.productId)
      const summary = calcRecipeSummary(recipe, product?.price ?? 0, { getInsumo, getRecipe })
      return { recipe, product, ...summary }
    })
    .filter(r => r.product)

  const avgFoodCost = productRows.length ? productRows.reduce((s, r) => s + r.foodCostPct, 0) / productRows.length : 0
  const avgCost = productRows.length ? productRows.reduce((s, r) => s + r.cost, 0) / productRows.length : 0
  const topCost = [...productRows].sort((a, b) => b.cost - a.cost).slice(0, 5)
  const lowestMargin = [...productRows].sort((a, b) => a.margin - b.margin).slice(0, 5)

  const consumptionCost = salesInPeriod.reduce((sum, sale) => sum + calculateOrderCost(sale, { getRecipeByProductId, getRecipe, getInsumo }).totalCost, 0)

  const purchasesTotal = purchasesInPeriod.reduce((s, p) => s + p.total, 0)
  const wasteTotal = wasteInPeriod.reduce((s, w) => s + w.cost, 0)
  const inventoryValue = calcInventoryTotalValue(items)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            style={{ ...inputStyle, border: `1.5px solid ${period === p.key ? COLORS.green : COLORS.lineGreen}`, background: period === p.key ? COLORS.green : COLORS.warmWhite, color: period === p.key ? COLORS.cream : COLORS.onLightMuted }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard label="Food cost general" value={`${avgFoodCost.toFixed(1)}%`} />
        <StatCard label="Costo promedio por producto" value={formatMoney(avgCost)} />
        <StatCard label="Compras del período" value={formatMoney(purchasesTotal)} />
        <StatCard label="Mermas del período" value={formatMoney(wasteTotal)} />
        <StatCard label="Valor de inventario" value={formatMoney(inventoryValue)} />
        <StatCard label="Consumo teórico (ventas)" value={formatMoney(consumptionCost)} hint={`${salesInPeriod.length} venta${salesInPeriod.length === 1 ? '' : 's'}`} />
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Panel title="Mayor costo">
          {topCost.length === 0 ? <EmptyState label="Sin recetas cargadas." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topCost.map(({ product, cost }, i) => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <span style={{ color: COLORS.onLight }}>{product.name}</span>
                  <span style={{ color: COLORS.onLightMuted, fontWeight: 600 }}>{formatMoney(cost)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Menor margen">
          {lowestMargin.length === 0 ? <EmptyState label="Sin recetas cargadas." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {lowestMargin.map(({ product, margin }, i) => (
                <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <span style={{ color: COLORS.onLight }}>{product.name}</span>
                  <span style={{ color: margin >= 0 ? COLORS.green : '#8A4536', fontWeight: 600 }}>{formatMoney(margin)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Análisis de productos">
        {productRows.length === 0 ? <EmptyState label="Todavía no hay recetas con producto asociado." /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                  <th style={{ padding: '8px 10px' }}>Producto</th>
                  <th style={{ padding: '8px 10px' }}>Precio</th>
                  <th style={{ padding: '8px 10px' }}>Costo</th>
                  <th style={{ padding: '8px 10px' }}>Margen</th>
                  <th style={{ padding: '8px 10px' }}>Food cost %</th>
                  <th style={{ padding: '8px 10px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {productRows.sort((a, b) => a.product.name.localeCompare(b.product.name)).map(({ recipe, product, price, cost, margin, foodCostPct }) => (
                  <tr key={recipe.id} style={{ borderTop: `1px solid ${COLORS.lineGreen}` }}>
                    <td style={{ padding: '10px', color: COLORS.greenDark, fontWeight: 600 }}>{product.name}</td>
                    <td style={{ padding: '10px' }}>{formatMoney(price)}</td>
                    <td style={{ padding: '10px' }}>{formatMoney(cost)}</td>
                    <td style={{ padding: '10px', color: margin >= 0 ? COLORS.green : '#8A4536' }}>{formatMoney(margin)}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: foodCostPct > 35 ? '#8A4536' : COLORS.greenDark }}>{foodCostPct.toFixed(1)}%</td>
                    <td style={{ padding: '10px', textTransform: 'capitalize', color: COLORS.onLightMuted }}>{recipe.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
