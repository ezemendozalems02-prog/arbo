import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { INVENTORY_CATEGORY_LABELS } from '../../../mock/inventoryCategories'
import { UNIT_SHORT, UNIT_LABELS } from '../../../mock/units'
import { STOCK_MOVEMENT_LABELS } from '../../../mock/stockMovements'
import { WASTE_REASON_LABELS } from '../../../mock/waste'
import { PURCHASE_STATUS_LABELS } from '../../../mock/purchases'
import { formatMoney, formatQty, formatDate } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'
import StockStatusBadge from '../../components/inventory/StockStatusBadge'
import AdjustStockModal from '../../components/inventory/AdjustStockModal'
import RegisterWasteModal from '../../components/inventory/RegisterWasteModal'

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
    <span>{label}</span><span style={{ color: COLORS.onLight, fontWeight: 600 }}>{value}</span>
  </div>
)

export default function InventoryItemDetail() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { items, suppliers, movements, purchases, waste, getItemById, adjustStock, registerWaste } = useInventory()
  const item = getItemById(itemId)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [wasteOpen, setWasteOpen] = useState(false)

  useEffect(() => { document.title = item ? `${item.name} | ARBO OS` : 'Insumo | ARBO OS' }, [item])

  if (!item) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, marginBottom: 20 }}>No encontramos ese insumo.</p>
        <Button onClick={() => navigate('/admin/inventario')}>Volver a Inventario</Button>
      </div>
    )
  }

  const supplier = suppliers.find(s => s.id === item.primarySupplierId)
  const itemMovements = movements.filter(m => m.insumoId === item.id).sort((a, b) => b.createdAt - a.createdAt)
  const itemPurchases = purchases.filter(p => p.items.some(l => l.insumoId === item.id)).sort((a, b) => b.date - a.date)
  const itemWaste = waste.filter(w => w.insumoId === item.id).sort((a, b) => b.createdAt - a.createdAt)
  const lastReceivedPurchase = itemPurchases.find(p => p.status === 'recibida')

  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={() => navigate('/admin/inventario')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginBottom: 18, padding: 0 }}>
        ← Volver a Inventario
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.greenDark }}>{item.name}</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 4 }}>{item.code} · {INVENTORY_CATEGORY_LABELS[item.categoryKey]}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline-light" size="sm" onClick={() => setAdjustOpen(true)}>Ajustar stock</Button>
          <Button variant="outline-light" size="sm" onClick={() => setWasteOpen(true)}>Registrar merma</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: 20 }}>
        <Panel title="Ficha">
          <Row label="Estado" value={<StockStatusBadge item={item} />} />
          <Row label="Unidad de inventario" value={UNIT_LABELS[item.unit]} />
          <Row label="Stock actual" value={formatQty(item.currentStock, item.unit, UNIT_SHORT)} />
          <Row label="Stock mínimo" value={formatQty(item.stockMin, item.unit, UNIT_SHORT)} />
          <Row label="Stock máximo" value={formatQty(item.stockMax, item.unit, UNIT_SHORT)} />
          <Row label="Costo actual" value={formatMoney(item.lastCost)} />
          <Row label="Costo promedio" value={formatMoney(item.avgCost)} />
          <Row label="Valor total del stock" value={formatMoney(item.currentStock * item.avgCost)} />
          <Row label="Proveedor principal" value={supplier?.name ?? '—'} />
          <Row label="Última compra" value={lastReceivedPurchase ? formatDate(lastReceivedPurchase.date) : '—'} />
        </Panel>

        <Panel title="Mermas asociadas">
          {itemWaste.length === 0 ? <EmptyState label="Sin mermas registradas." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {itemWaste.map((w, i) => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <span style={{ color: COLORS.onLight }}>{formatQty(w.quantity, w.unit, UNIT_SHORT)} · {WASTE_REASON_LABELS[w.reason]}</span>
                  <span style={{ color: '#8A4536', fontWeight: 600 }}>{formatMoney(w.cost)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Panel title="Historial de movimientos">
          {itemMovements.length === 0 ? <EmptyState label="Sin movimientos." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {itemMovements.slice(0, 12).map((m, i) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <span style={{ color: COLORS.onLight }}>{STOCK_MOVEMENT_LABELS[m.type]}</span>
                  <span style={{ color: COLORS.onLightMuted }}>{m.stockBefore} → {m.stockAfter} {UNIT_SHORT[m.unit]}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Historial de compras">
          {itemPurchases.length === 0 ? <EmptyState label="Sin compras registradas." /> : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {itemPurchases.slice(0, 12).map((p, i) => (
                <button key={p.id} onClick={() => navigate(`/admin/compras/${p.id}`)} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
                  borderRight: 'none', borderBottom: 'none', borderLeft: 'none',
                  fontFamily: FONTS.sans, fontSize: 13, background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                }}>
                  <span style={{ color: COLORS.green }}>#{p.number} · {formatDate(p.date)}</span>
                  <span style={{ color: COLORS.onLightMuted }}>{PURCHASE_STATUS_LABELS[p.status]}</span>
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <AdjustStockModal item={item} open={adjustOpen} onClose={() => setAdjustOpen(false)}
        onConfirm={(payload) => { adjustStock(payload); showToast('Stock ajustado') }} />
      <RegisterWasteModal items={items} preselectedItemId={item.id} open={wasteOpen} onClose={() => setWasteOpen(false)}
        onConfirm={(payload) => { registerWaste(payload); showToast('Merma registrada') }} />
    </div>
  )
}
