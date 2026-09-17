import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { useInventory } from '../../../context/InventoryContext'
import { calcLineTotal } from '../../../services/salesCalculations'
import { calculateOrderConsumption, calculateOrderCost } from '../../../services/inventoryConsumptionService'
import { UNIT_SHORT } from '../../../mock/units'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'
import { formatMoney, formatNumber, formatQty } from '../../utils/format'

const PAYMENT_LABELS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', mercado_pago: 'Mercado Pago', transferencia: 'Transferencia' }
const SALE_STATUS_LABELS = { aprobado: 'Aprobada', rechazado: 'Rechazada', cancelado: 'Cancelada' }

const Row = ({ label, value, strong }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontFamily: FONTS.sans, fontSize: strong ? 15 : 13, fontWeight: strong ? 700 : 400, color: strong ? COLORS.greenDark : COLORS.onLightMuted }}>
    <span>{label}</span><span>{value}</span>
  </div>
)

export default function VentaDetail() {
  const { saleId } = useParams()
  const navigate = useNavigate()
  const { getSaleById } = usePOS()
  const { getItemById, getRecipeByProductId, getRecipeById } = useInventory()
  const sale = getSaleById(saleId)

  useEffect(() => { document.title = sale ? `Venta #${sale.number} | ARBO OS` : 'Venta | ARBO OS' }, [sale])

  // BLOQUE 26/27/28 — consumo e costo teórico de esta venta, calculado a
  // partir de las recetas de Inventario. Puramente informativo: esta venta
  // ya se cobró (Fase 2) y esto no descuenta stock (ver nota en
  // InventoryContext) — muestra lo que HABRÍA que descontar.
  const deps = { getRecipeByProductId, getRecipe: getRecipeById, getInsumo: getItemById }
  const consumption = sale ? calculateOrderConsumption(sale, deps) : []
  const costBreakdown = sale ? calculateOrderCost(sale, deps) : null

  if (!sale) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, marginBottom: 20 }}>No encontramos esa venta.</p>
        <Button onClick={() => navigate('/admin/ventas')}>Volver a Ventas</Button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <button onClick={() => navigate('/admin/ventas')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginBottom: 18, padding: 0 }}>
        ← Volver a Ventas
      </button>

      <Panel title={`Venta #${String(sale.number).padStart(4, '0')}`}>
        <Row label="Fecha" value={sale.createdAt.toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} />
        <Row label="Mesa" value={sale.tableNumber ? `Mesa ${sale.tableNumber}` : 'Mostrador'} />
        <Row label="Cliente" value={sale.customerName ?? 'Sin cliente'} />

        <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, margin: '14px 0' }} />

        {sale.items.map(item => (
          <div key={item.id} style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>
              <span>{item.quantity}× {item.name}</span>
              <span>{formatMoney(calcLineTotal(item))}</span>
            </div>
            {item.modifiers.length > 0 && (
              <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 2 }}>
                {item.modifiers.map(m => m.optionName).join(' · ')}
              </p>
            )}
          </div>
        ))}

        <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, margin: '14px 0' }} />

        <Row label="Subtotal" value={formatMoney(sale.subtotal)} />
        {sale.discountAmount > 0 && <Row label="Descuento" value={`-${formatMoney(sale.discountAmount)}`} />}
        <Row label="Total" value={formatMoney(sale.total)} strong />

        <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, margin: '14px 0' }} />

        <Row label="Método de pago" value={PAYMENT_LABELS[sale.paymentMethod]} />
        {sale.paymentMethod === 'efectivo' && (
          <>
            <Row label="Recibido" value={formatMoney(sale.cashReceived)} />
            <Row label="Vuelto" value={formatMoney(sale.changeGiven)} />
          </>
        )}
        {sale.split && <Row label="División" value={`${sale.split.parts} personas · ${formatMoney(sale.split.amountPerPart)} c/u`} />}
        {sale.loyaltyPointsEarned > 0 && <Row label="ARBO CLUB" value={`+${formatNumber(sale.loyaltyPointsEarned)} puntos`} />}
        <Row label="Estado" value={SALE_STATUS_LABELS[sale.paymentStatus]} strong />
      </Panel>

      <div style={{ height: 20 }} />

      <Panel title="Inventario — consumo teórico">
        {consumption.length === 0 ? (
          <EmptyState label="Ningún producto de esta venta tiene receta cargada todavía." />
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 14 }}>
              {consumption.map((c, i) => (
                <div key={c.insumoId} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>
                  <span>{getItemById(c.insumoId)?.name ?? c.insumoId}</span>
                  <span style={{ color: '#8A4536' }}>{formatQty(-c.quantity, c.unit, UNIT_SHORT)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, paddingTop: 10 }}>
              <Row label="Costo teórico de ingredientes" value={formatMoney(costBreakdown.totalCost)} />
              <Row label="Margen estimado" value={formatMoney(costBreakdown.margin)} strong />
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}
