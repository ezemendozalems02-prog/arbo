import { useEffect, useMemo, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { formatMoney } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import { calculatePurchaseSuggestions } from '../../../services/domain/analyticsEngine'

export default function PurchaseSuggestions() {
  useEffect(() => {
    document.title = 'Compras Sugeridas | ARBO OS'
  }, [])

  const { items: inventoryItems, movements, purchases } = useInventory()
  const [selectedSupplier, setSelectedSupplier] = useState('ALL')

  // Transformar estado del inventario para el motor analítico determinístico
  const analyticsState = useMemo(() => {
    const domainIngredients = inventoryItems.map(i => ({
      id: i.id,
      name: i.name,
      base_unit: i.unit || 'kg',
      current_cost_unit: i.costPerUnit || i.cost || 0,
      target_stock_level: i.stockMax || i.stockMin || 10,
      min_stock: i.stockMin || 5,
      package_factor: i.packageFactor || (i.unit === 'kg' ? 5 : 1), // Factor de empaque de ejemplo o configurado
      packaging_unit: i.packagingUnit || (i.unit === 'kg' ? 'Bolsa 5kg' : 'Caja'),
      primary_supplier_id: i.primarySupplierId || null,
      organization_id: 'org_arbo_main',
      is_active: true,
    }))

    const domainMovements = (movements || []).map(m => ({
      id: m.id,
      organization_id: 'org_arbo_main',
      ingredient_id: m.insumoId || m.itemId,
      quantity_delta: m.qtyDelta || m.delta || 0,
    }))

    // Insumos sin movimientos inicializan con el stock actual conocido
    for (const item of inventoryItems) {
      if (!domainMovements.some(m => m.ingredient_id === item.id)) {
        domainMovements.push({
          id: `init_${item.id}`,
          organization_id: 'org_arbo_main',
          ingredient_id: item.id,
          quantity_delta: item.currentStock || 0,
        })
      }
    }

    return {
      ingredients: domainIngredients,
      inventoryMovements: domainMovements,
      stockTransfers: [],
      stockTransferItems: [],
    }
  }, [inventoryItems, movements])

  const report = useMemo(() => {
    return calculatePurchaseSuggestions({
      state: analyticsState,
      organizationId: 'org_arbo_main',
    })
  }, [analyticsState])

  const suggestions = report.suggestions || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.green, margin: 0 }}>
          Gestión de Compras Sugeridas
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.onLightMuted }}>
          Recomendaciones de abastecimiento calculadas determinísticamente según stock actual, stock en tránsito y factor de empaque del proveedor.
        </p>
      </div>

      <div style={{ padding: '12px 16px', background: 'rgba(31,64,47,0.06)', border: `1px solid ${COLORS.green}`, borderRadius: 4 }}>
        <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 600 }}>
          REGLA NORMATIVA DE FASE 9: Las compras sugeridas tienen estado <strong>SUGGESTED</strong> y no generan órdenes de compra reales automáticamente sin revisión humana.
        </div>
      </div>

      <Panel title={`Insumos con Necesidad de Reposición (${suggestions.length})`}>
        {suggestions.length === 0 ? (
          <EmptyState label="Todos los insumos se encuentran en niveles óptimos de stock. No hay compras sugeridas pendientes." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {suggestions.map(s => (
              <div
                key={s.ingredientId}
                style={{
                  padding: 16,
                  border: `1px solid ${COLORS.lineGreen}`,
                  borderRadius: 4,
                  background: COLORS.warmWhite,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontFamily: FONTS.sans, fontSize: 16, fontWeight: 700, color: COLORS.onLight }}>
                      {s.ingredientName}
                    </span>
                    <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, background: 'rgba(176,138,62,0.15)', color: '#8A6A2E', padding: '3px 8px', borderRadius: 3 }}>
                      {s.status}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: COLORS.onLightMuted }}>Sugerencia de Pedido:</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.green }}>
                      {s.suggestedQuantity} {s.baseUnit} ({s.suggestedPackages} {s.packagingUnit})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, fontSize: 12, color: COLORS.onLightMuted, background: '#FAFAFA', padding: 10, borderRadius: 4 }}>
                  <div>Stock Actual: <strong>{s.currentStock} {s.baseUnit}</strong></div>
                  <div>En Tránsito: <strong>{s.inTransitStock} {s.baseUnit}</strong></div>
                  <div>Stock Objetivo: <strong>{s.targetStock} {s.baseUnit}</strong></div>
                  <div>Déficit Neto: <strong>{s.netDeficit} {s.baseUnit}</strong></div>
                  <div>Factor Empaque: <strong>{s.packageFactor} {s.baseUnit}/bulto</strong></div>
                  <div>Costo Estimado: <strong>{formatMoney(s.estimatedCost)}</strong></div>
                </div>

                <div style={{ fontSize: 12, color: COLORS.onLight, background: 'rgba(0,0,0,0.02)', padding: '8px 12px', borderLeft: `3px solid ${COLORS.green}` }}>
                  <strong>Explicación:</strong> {s.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
