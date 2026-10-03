import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { INVENTORY_CATEGORIES, INVENTORY_CATEGORY_LABELS } from '../../../mock/inventoryCategories'
import { UNIT_SHORT } from '../../../mock/units'
import { STOCK_MOVEMENT_LABELS } from '../../../mock/stockMovements'
import { calcInventoryTotalValue, getStockStatus } from '../../../services/inventoryCostService'
import { suggestPurchases } from '../../../services/purchaseSuggestionService'
import { formatMoney, formatQty } from '../../utils/format'
import StatCard from '../../components/StatCard'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'
import StockStatusBadge from '../../components/inventory/StockStatusBadge'
import NewInsumoModal from '../../components/inventory/NewInsumoModal'
import AdjustStockModal from '../../components/inventory/AdjustStockModal'
import RegisterWasteModal from '../../components/inventory/RegisterWasteModal'

const MOCK_NOW = new Date()
const isWithinDays = (date, days) => (MOCK_NOW - date) <= days * 86400000

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

export default function InventoryDashboard() {
  useEffect(() => { document.title = 'Inventario | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { items, suppliers, purchases, waste, movements, createInsumo, adjustStock, registerWaste } = useInventory()

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [newInsumoOpen, setNewInsumoOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [wasteTarget, setWasteTarget] = useState(null)

  const stockLow = items.filter(i => getStockStatus(i) === 'STOCK_BAJO')
  const stockOut = items.filter(i => getStockStatus(i) === 'AGOTADO')
  const inventoryValue = calcInventoryTotalValue(items)
  const purchasesThisPeriod = purchases.filter(p => p.status === 'recibida' && isWithinDays(p.receivedAt ?? p.date, 30)).reduce((s, p) => s + p.total, 0)
  const wasteThisPeriod = waste.filter(w => isWithinDays(w.createdAt, 30)).reduce((s, w) => s + w.cost, 0)
  const suggestions = useMemo(() => suggestPurchases(items), [items])
  const recentMovements = [...movements].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...items]
      .filter(i => categoryFilter === 'todas' || i.categoryKey === categoryFilter)
      .filter(i => statusFilter === 'todos' || getStockStatus(i) === statusFilter)
      .filter(i => !q || i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items, query, categoryFilter, statusFilter])

  const supplierName = (id) => suppliers.find(s => s.id === id)?.name ?? '—'
  const insumoName = (id) => items.find(i => i.id === id)?.name ?? id

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <StatCard label="Stock total" value={items.length} hint="insumos activos" />
        <StatCard label="Stock bajo" value={stockLow.length} />
        <StatCard label="Agotados" value={stockOut.length} />
        <StatCard label="Valor inventario" value={formatMoney(inventoryValue)} />
        <StatCard label="Compras (30 días)" value={formatMoney(purchasesThisPeriod)} />
        <StatCard label="Mermas (30 días)" value={formatMoney(wasteThisPeriod)} />
      </div>

      {suggestions.length > 0 && (
        <Panel title="Necesita reposición">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map(s => (
              <div key={s.itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: `1px solid ${COLORS.lineGreen}`, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 600, color: COLORS.onLight }}>{insumoName(s.itemId)}</span>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginLeft: 8 }}>
                    actual {formatQty(s.currentStock, s.unit, UNIT_SHORT)} · mínimo {formatQty(s.stockMin, s.unit, UNIT_SHORT)} · {supplierName(s.supplierId)}
                  </span>
                </div>
                <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: s.status === 'AGOTADO' ? '#8A4536' : '#8A6A2E' }}>
                  Comprar {formatQty(s.suggestedQty, s.unit, UNIT_SHORT)}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Últimos movimientos">
        {recentMovements.length === 0 ? <EmptyState label="Todavía no hay movimientos." /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentMovements.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                <span style={{ color: COLORS.onLight }}>{insumoName(m.insumoId)} · {STOCK_MOVEMENT_LABELS[m.type]}</span>
                <span style={{ color: COLORS.onLightMuted }}>{m.stockBefore} → {m.stockAfter} {UNIT_SHORT[m.unit]}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Insumos" action={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline-light" size="sm" onClick={() => navigate('/admin/inventario/fisico')}>Inventario físico</Button>
          <Button size="sm" onClick={() => setNewInsumoOpen(true)}>Nuevo insumo</Button>
        </div>
      }>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o código..." />
          <select style={inputStyle} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="todas">Todas las categorías</option>
            {INVENTORY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <select style={inputStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="NORMAL">Normal</option>
            <option value="STOCK_BAJO">Stock bajo</option>
            <option value="AGOTADO">Agotado</option>
          </select>
        </div>

        {filtered.length === 0 ? <EmptyState label="Sin resultados para este filtro." /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                  <th style={{ padding: '8px 10px' }}>Nombre</th>
                  <th style={{ padding: '8px 10px' }}>Categoría</th>
                  <th style={{ padding: '8px 10px' }}>Stock</th>
                  <th style={{ padding: '8px 10px' }}>Costo unit.</th>
                  <th style={{ padding: '8px 10px' }}>Valor stock</th>
                  <th style={{ padding: '8px 10px' }}>Proveedor</th>
                  <th style={{ padding: '8px 10px' }}>Estado</th>
                  <th style={{ padding: '8px 10px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} style={{ borderTop: `1px solid ${COLORS.lineGreen}` }}>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => navigate(`/admin/inventario/${item.id}`)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.greenDark, fontWeight: 600, textAlign: 'left' }}>{item.name}</button>
                    </td>
                    <td style={{ padding: '10px', color: COLORS.onLightMuted }}>{INVENTORY_CATEGORY_LABELS[item.categoryKey]}</td>
                    <td style={{ padding: '10px' }}>{formatQty(item.currentStock, item.unit, UNIT_SHORT)}</td>
                    <td style={{ padding: '10px' }}>{formatMoney(item.avgCost)}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{formatMoney(item.currentStock * item.avgCost)}</td>
                    <td style={{ padding: '10px', color: COLORS.onLightMuted }}>{supplierName(item.primarySupplierId)}</td>
                    <td style={{ padding: '10px' }}><StockStatusBadge item={item} /></td>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setAdjustTarget(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: COLORS.green, textDecoration: 'underline', marginRight: 10 }}>Ajustar</button>
                      <button onClick={() => setWasteTarget(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#8A4536', textDecoration: 'underline' }}>Merma</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <NewInsumoModal open={newInsumoOpen} onClose={() => setNewInsumoOpen(false)} suppliers={suppliers.filter(s => s.status === 'activo')}
        onCreate={(data) => { createInsumo(data); showToast(`Insumo "${data.name}" creado`) }} />
      <AdjustStockModal item={adjustTarget} open={!!adjustTarget} onClose={() => setAdjustTarget(null)}
        onConfirm={(payload) => { adjustStock(payload); showToast('Stock ajustado') }} />
      <RegisterWasteModal items={items} preselectedItemId={wasteTarget?.id} open={!!wasteTarget} onClose={() => setWasteTarget(null)}
        onConfirm={(payload) => { registerWaste(payload); showToast('Merma registrada') }} />
    </div>
  )
}
