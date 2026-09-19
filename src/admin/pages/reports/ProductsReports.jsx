import { useEffect, useState, useMemo } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { usePOS } from '../../../context/POSContext'
import { PRODUCTS } from '../../../mock/products'
import { formatMoney } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import { calculateKasavanaSmithMatrix, analyzeRecipeFoodCost, ANALYTICS_THRESHOLDS } from '../../../services/domain/analyticsEngine'

const QUADRANT_COLORS = {
  STAR: { bg: 'rgba(31,64,47,0.12)', border: '#1F402F', text: '#1F402F', label: 'Estrella (Star)', desc: 'Alta Popularidad / Alta Rentabilidad' },
  PLOWHORSE: { bg: 'rgba(176,138,62,0.12)', border: '#8A6A2E', text: '#8A6A2E', label: 'Caballo de Batalla (Plowhorse)', desc: 'Alta Popularidad / Baja Rentabilidad' },
  PUZZLE: { bg: 'rgba(70,90,120,0.12)', border: '#2C4460', text: '#2C4460', label: 'Rompecabezas (Puzzle)', desc: 'Baja Popularidad / Alta Rentabilidad' },
  DOG: { bg: 'rgba(166,91,74,0.12)', border: '#8A4536', text: '#8A4536', label: 'Perro (Dog)', desc: 'Baja Popularidad / Baja Rentabilidad' },
}

export default function ProductsReports() {
  useEffect(() => {
    document.title = 'Reporte de Productos & Menú | ARBO OS'
  }, [])

  const { recipes, items: inventoryItems } = useInventory()
  const { sales } = usePOS()
  const [selectedQuadrant, setSelectedQuadrant] = useState('ALL')

  // Normalizar estado para el motor analítico
  const analyticsState = useMemo(() => {
    const domainProducts = PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      base_price: p.price,
      organization_id: 'org_arbo_main',
      is_active: true,
    }))

    const domainRecipes = recipes.map(r => ({
      id: r.id,
      product_id: r.productId,
      productId: r.productId,
      waste_percentage: r.wastePct || 0,
      yield_portions: r.yield || 1,
      is_active: true,
    }))

    const domainRecipeItems = recipes.flatMap(r => {
      return (r.items || []).map((it, idx) => ({
        id: `${r.id}_it_${idx}`,
        recipe_id: r.id,
        ingredient_id: it.insumoId || it.id,
        quantity: it.qty || 1,
        unit: it.unit || 'g',
      }))
    })

    const domainIngredients = inventoryItems.map(i => ({
      id: i.id,
      name: i.name,
      base_unit: i.unit || 'kg',
      current_cost_unit: i.costPerUnit || i.cost || 0,
    }))

    const domainSales = sales.map(s => ({
      id: s.id,
      organization_id: 'org_arbo_main',
      status: s.status === 'aprobado' || s.status === 'PAID' ? 'PAID' : s.status,
      created_at: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    }))

    const domainSaleItems = sales.flatMap(s => {
      return (s.items || []).map(it => ({
        sale_id: s.id,
        product_id: it.productId || it.id,
        quantity: it.qty || it.quantity || 1,
      }))
    })

    return {
      products: domainProducts,
      recipes: domainRecipes,
      recipeItems: domainRecipeItems,
      ingredients: domainIngredients,
      sales: domainSales,
      saleItems: domainSaleItems,
    }
  }, [recipes, inventoryItems, sales])

  // Cálculo de la Matriz Kasavana-Smith
  const kasavanaReport = useMemo(() => {
    return calculateKasavanaSmithMatrix({
      state: analyticsState,
      organizationId: 'org_arbo_main',
      periodKey: '30d',
    })
  }, [analyticsState])

  // Alertas de Food Cost Crítico
  const foodCostAlerts = useMemo(() => {
    return PRODUCTS.map(p => {
      const analysis = analyzeRecipeFoodCost({
        state: analyticsState,
        organizationId: 'org_arbo_main',
        productId: p.id,
      })
      return { product: p, ...analysis }
    }).filter(a => a.hasRecipe && a.alertStatus === 'CRITICAL')
  }, [analyticsState])

  const filteredKasavanaItems = selectedQuadrant === 'ALL'
    ? kasavanaReport.items
    : kasavanaReport.items.filter(i => i.category === selectedQuadrant)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.green, margin: 0 }}>
          Ingeniería de Menú & Rentabilidad
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.onLightMuted }}>
          Clasificación Kasavana-Smith (Star, Plowhorse, Puzzle, Dog) y Alertas de Food Cost Crítico.
        </p>
      </div>

      {/* Alertas de Food Cost Crítico (> 35%) */}
      {foodCostAlerts.length > 0 && (
        <Panel title={`Alertas: Food Cost Crítico (> ${ANALYTICS_THRESHOLDS.FOOD_COST_CRITICAL}%)`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {foodCostAlerts.map(alert => (
              <div
                key={alert.productId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(166,91,74,0.08)',
                  border: '1px solid #8A4536',
                  borderRadius: 4,
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#8A4536', fontSize: 14 }}>
                    {alert.productName} — Food Cost: {alert.foodCostPct}% (Límite: 35.00%)
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.onLightMuted, marginTop: 3 }}>
                    Precio actual: {formatMoney(alert.effectivePrice)} | Costo receta: {formatMoney(alert.costPerPortion)} |
                    Insumo mayor costo: <strong>{alert.highestImpactIngredient?.name || 'N/A'}</strong> ({alert.highestImpactIngredient?.pctOfTotalCost}% del costo total)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: COLORS.onLightMuted }}>Precio sugerido (Food Cost 30%):</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.green }}>
                    {formatMoney(alert.recommendedPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Matriz Kasavana-Smith */}
      <Panel title="Matriz de Popularidad y Rentabilidad (Kasavana-Smith)">
        {kasavanaReport.insufficientData ? (
          <EmptyState label={kasavanaReport.reason} />
        ) : (
          <div>
            {/* Selector de cuadrante */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedQuadrant('ALL')}
                style={{
                  padding: '8px 14px',
                  border: `1.5px solid ${selectedQuadrant === 'ALL' ? COLORS.green : COLORS.lineGreen}`,
                  background: selectedQuadrant === 'ALL' ? COLORS.green : COLORS.warmWhite,
                  color: selectedQuadrant === 'ALL' ? COLORS.cream : COLORS.onLight,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Todos ({kasavanaReport.items.length})
              </button>

              {['STAR', 'PLOWHORSE', 'PUZZLE', 'DOG'].map(q => {
                const conf = QUADRANT_COLORS[q]
                const count = kasavanaReport.quadrants[q].length
                const active = selectedQuadrant === q
                return (
                  <button
                    key={q}
                    onClick={() => setSelectedQuadrant(q)}
                    style={{
                      padding: '8px 14px',
                      border: `1.5px solid ${active ? conf.border : COLORS.lineGreen}`,
                      background: active ? conf.bg : COLORS.warmWhite,
                      color: active ? conf.text : COLORS.onLightMuted,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {conf.label} ({count})
                  </button>
                )
              })}
            </div>

            {/* Benchmark informativos */}
            <div style={{ fontSize: 12, color: COLORS.onLightMuted, marginBottom: 16, padding: '8px 12px', background: '#FAFAFA', border: `1px solid ${COLORS.lineGreen}` }}>
              Promedio de ventas del período: <strong>{kasavanaReport.averageUnitsSold} unidades</strong> |
              Margen de contribución benchmark: <strong>{formatMoney(kasavanaReport.benchmarkMargin)}</strong>
            </div>

            {/* Listado de ítems clasificados */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {filteredKasavanaItems.map(item => {
                const conf = QUADRANT_COLORS[item.category]
                return (
                  <div
                    key={item.productId}
                    style={{
                      padding: 14,
                      background: COLORS.warmWhite,
                      border: `1.5px solid ${conf.border}`,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.onLight }}>
                        {item.productName}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3, background: conf.bg, color: conf.text }}>
                        {item.category}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: COLORS.onLightMuted, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, margin: '8px 0' }}>
                      <div>Precio: <strong>{formatMoney(item.price)}</strong></div>
                      <div>Costo: <strong>{formatMoney(item.cost)}</strong></div>
                      <div>Margen: <strong>{formatMoney(item.unitMargin)}</strong></div>
                      <div>Vendidos: <strong>{item.unitsSold} u.</strong></div>
                    </div>

                    <div style={{ fontSize: 11, color: COLORS.onLightMuted, borderTop: `1px solid ${COLORS.lineGreen}`, paddingTop: 8 }}>
                      {item.explanation}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}
