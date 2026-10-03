import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { INVENTORY_CATEGORY_LABELS } from '../../../mock/inventoryCategories'
import { PURCHASE_STATUS_LABELS } from '../../../mock/purchases'
import { formatMoney, formatDate } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
    <span>{label}</span><span style={{ color: COLORS.onLight, fontWeight: 600 }}>{value}</span>
  </div>
)

export default function SupplierDetail() {
  const { supplierId } = useParams()
  const navigate = useNavigate()
  const { getSupplierById, items, purchases } = useInventory()
  const supplier = getSupplierById(supplierId)

  useEffect(() => { document.title = supplier ? `${supplier.name} | ARBO OS` : 'Proveedor | ARBO OS' }, [supplier])

  if (!supplier) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, marginBottom: 20 }}>No encontramos ese proveedor.</p>
        <Button onClick={() => navigate('/admin/proveedores')}>Volver a Proveedores</Button>
      </div>
    )
  }

  const suppliedItems = items.filter(i => i.primarySupplierId === supplier.id)
  const supplierPurchases = purchases.filter(p => p.supplierId === supplier.id).sort((a, b) => b.date - a.date)
  const receivedPurchases = supplierPurchases.filter(p => p.status === 'recibida')
  const totalPurchased = receivedPurchases.reduce((s, p) => s + p.total, 0)
  const avgPurchase = receivedPurchases.length ? totalPurchased / receivedPurchases.length : 0

  return (
    <div style={{ maxWidth: 720 }}>
      <button onClick={() => navigate('/admin/proveedores')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginBottom: 18, padding: 0 }}>
        ← Volver a Proveedores
      </button>

      <p style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.greenDark, marginBottom: 4 }}>{supplier.name}</p>
      <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginBottom: 20 }}>{supplier.businessName} · {supplier.cuit}</p>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: 20 }}>
        <Panel title="Datos">
          <Row label="Teléfono" value={supplier.phone || '—'} />
          <Row label="Email" value={supplier.email || '—'} />
          <Row label="Condiciones de pago" value={supplier.paymentTerms || '—'} />
          <Row label="Categorías" value={supplier.categories.map(c => INVENTORY_CATEGORY_LABELS[c]).join(', ') || '—'} />
          <Row label="Estado" value={supplier.status} />
        </Panel>

        <Panel title="Resumen de compras">
          <Row label="Total comprado" value={formatMoney(totalPurchased)} />
          <Row label="Promedio de compra" value={formatMoney(avgPurchase)} />
          <Row label="Compras recibidas" value={receivedPurchases.length} />
        </Panel>
      </div>

      <Panel title="Productos que provee">
        {suppliedItems.length === 0 ? <EmptyState label="Sin insumos asignados." /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {suppliedItems.map((i, idx) => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: idx > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                <span style={{ color: COLORS.onLight }}>{i.name}</span>
                <span style={{ color: COLORS.onLightMuted }}>{formatMoney(i.avgCost)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div style={{ height: 20 }} />

      <Panel title="Últimas compras">
        {supplierPurchases.length === 0 ? <EmptyState label="Sin compras registradas." /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {supplierPurchases.slice(0, 10).map((p, i) => (
              <button key={p.id} onClick={() => navigate(`/admin/compras/${p.id}`)} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
                borderRight: 'none', borderBottom: 'none', borderLeft: 'none',
                fontFamily: FONTS.sans, fontSize: 13, background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              }}>
                <span style={{ color: COLORS.green }}>#{p.number} · {formatDate(p.date)}</span>
                <span style={{ color: COLORS.onLightMuted }}>{PURCHASE_STATUS_LABELS[p.status]} · {formatMoney(p.total)}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
