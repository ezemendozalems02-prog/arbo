import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { PURCHASE_STATUS_LABELS } from '../../../mock/purchases'
import { UNIT_LABELS } from '../../../mock/units'
import { formatMoney, formatDate } from '../../utils/format'
import Panel from '../../components/Panel'
import Button from '../../../components/ui/Button'

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
    <span>{label}</span><span style={{ color: COLORS.onLight, fontWeight: 600 }}>{value}</span>
  </div>
)

export default function PurchaseDetail() {
  const { purchaseId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { getPurchaseById, getSupplierById, getItemById, receivePurchase, cancelPurchase } = useInventory()
  const purchase = getPurchaseById(purchaseId)

  useEffect(() => { document.title = purchase ? `Compra #${purchase.number} | ARBO OS` : 'Compra | ARBO OS' }, [purchase])

  if (!purchase) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, marginBottom: 20 }}>No encontramos esa compra.</p>
        <Button onClick={() => navigate('/admin/compras')}>Volver a Compras</Button>
      </div>
    )
  }

  const supplier = getSupplierById(purchase.supplierId)
  const canAct = purchase.status === 'pendiente' || purchase.status === 'borrador'

  const handleReceive = () => {
    receivePurchase(purchase.id)
    showToast(`Compra #${purchase.number} recibida — stock actualizado`)
  }
  const handleCancel = () => {
    if (!confirm('¿Cancelar esta compra?')) return
    cancelPurchase(purchase.id)
    showToast('Compra cancelada')
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <button onClick={() => navigate('/admin/compras')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginBottom: 18, padding: 0 }}>
        ← Volver a Compras
      </button>

      <Panel title={`Compra #${purchase.number}`}>
        <Row label="Proveedor" value={supplier?.name ?? '—'} />
        <Row label="Fecha" value={formatDate(purchase.date)} />
        <Row label="Estado" value={PURCHASE_STATUS_LABELS[purchase.status]} />
        {purchase.receivedAt && <Row label="Recibida" value={formatDate(purchase.receivedAt)} />}

        <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, margin: '14px 0' }} />

        {purchase.items.map((line, i) => {
          const insumo = getItemById(line.insumoId)
          return (
            <div key={i} style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>
                <span>{line.quantity} {UNIT_LABELS[line.unit]} — {insumo?.name ?? line.insumoId}</span>
                <span>{formatMoney(line.subtotal)}</span>
              </div>
              {line.unitsToStock > 1 && insumo && line.unit !== insumo.unit && (
                <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 2 }}>
                  1 {UNIT_LABELS[line.unit]} = {line.unitsToStock} {UNIT_LABELS[insumo.unit]} de stock
                </p>
              )}
            </div>
          )
        })}

        <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, margin: '14px 0' }} />

        <Row label="Subtotal" value={formatMoney(purchase.subtotal)} />
        <Row label={`IVA (${purchase.taxRate}%)`} value={formatMoney(purchase.taxAmount)} />
        <Row label="Total" value={formatMoney(purchase.total)} />
        {purchase.notes && <Row label="Observaciones" value={purchase.notes} />}

        {canAct && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Button onClick={handleReceive}>Marcar como recibida</Button>
            <Button variant="outline-light" onClick={handleCancel}>Cancelar compra</Button>
          </div>
        )}
      </Panel>
    </div>
  )
}
