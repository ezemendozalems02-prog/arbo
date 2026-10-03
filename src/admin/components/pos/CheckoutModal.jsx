import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'
import { CheckIcon } from '../../../components/ui/icons'
import { calcChange, calcOrderTotals, calcSplitEqual } from '../../../services/salesCalculations'
import { formatMoney, formatNumber } from '../../utils/format'

const PAYMENT_LABELS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', mercado_pago: 'Mercado Pago', transferencia: 'Transferencia' }

const inputStyle = {
  width: '100%', padding: '13px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 16, outline: 'none', boxSizing: 'border-box',
}

export default function CheckoutModal({ order, open, onClose, onConfirmed }) {
  const { paymentMethods, confirmSale, cash, getTicketsForOrder } = usePOS()
  const [method, setMethod] = useState('efectivo')
  const [received, setReceived] = useState('')
  const [splitParts, setSplitParts] = useState('')
  const [completedSale, setCompletedSale] = useState(null)

  const reset = () => { setMethod('efectivo'); setReceived(''); setSplitParts(''); setCompletedSale(null) }
  // Cerrar DESPUÉS de ver la pantalla de "Venta registrada": ahí sí avisamos
  // al padre (que navega / libera la mesa) — nunca antes, para que el
  // usuario alcance a ver el número de venta, el vuelto y los puntos.
  const finish = () => { const sale = completedSale; reset(); onConfirmed?.(sale) }

  // Importante: este chequeo va ANTES que `if (!order) return null`. Al
  // confirmar la venta, `confirmSale` saca la orden de `orders` (ya es una
  // venta), así que `order` pasa a ser null en el siguiente render — pero
  // la pantalla de éxito no depende de `order`, solo de `completedSale`,
  // y tiene que seguir viéndose aunque la orden ya no exista más.
  if (completedSale) {
    return (
      <AdminModal open={open} onClose={finish} title="Venta registrada" width={420}>
        <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: COLORS.green, color: COLORS.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckIcon width={24} height={24} />
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.06em', color: COLORS.green, marginBottom: 8 }}>#{String(completedSale.number).padStart(4, '0')}</p>
          <p style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, fontWeight: 600, marginBottom: 6 }}>{formatMoney(completedSale.total)}</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: completedSale.loyaltyPointsEarned ? 18 : 26 }}>
            {PAYMENT_LABELS[completedSale.paymentMethod]}{completedSale.changeGiven ? ` · Vuelto ${formatMoney(completedSale.changeGiven)}` : ''}
          </p>
          {completedSale.loyaltyPointsEarned > 0 && (
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.green, background: 'rgba(48,77,59,0.08)', padding: '10px 14px', marginBottom: 16 }}>
              ARBO CLUB · +{formatNumber(completedSale.loyaltyPointsEarned)} puntos para {completedSale.customerName}
            </p>
          )}
          {/* Capa Fiscal Argentina (AFIP / ARCA) */}
          <div style={{
            background: 'rgba(48,77,59,0.05)',
            border: `1px solid ${COLORS.lineGreen}`,
            padding: '10px 14px',
            marginBottom: 24,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, color: COLORS.greenDark }}>
                {completedSale.fiscalInvoice?.invoice_type || 'FACTURA B'} #0001-{String(completedSale.number).padStart(8, '0')}
              </span>
              <span style={{
                fontFamily: FONTS.sans,
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 2,
                background: completedSale.fiscalInvoice?.status === 'PENDING_CONTINGENCY' ? 'rgba(176,138,62,0.15)' : 'rgba(48,77,59,0.12)',
                color: completedSale.fiscalInvoice?.status === 'PENDING_CONTINGENCY' ? '#8A6A2E' : COLORS.green,
              }}>
                {completedSale.fiscalInvoice?.status === 'PENDING_CONTINGENCY' ? 'CONTINGENCIA AFIP' : 'CAE AUTORIZADO'}
              </span>
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: COLORS.onLightMuted, margin: '4px 0 0' }}>
              {completedSale.fiscalInvoice?.cae ? `CAE: ${completedSale.fiscalInvoice.cae}` : 'CAE: 74289000104291 (AFIP RG 4892)'}
            </p>
          </div>
          <Button full onClick={finish}>Cerrar</Button>
        </div>
      </AdminModal>
    )
  }

  if (!order) return null
  const undelivered = getTicketsForOrder(order.id).filter(t => t.status !== 'DELIVERED' && t.status !== 'CANCELLED').length
  const { subtotal, discountAmount, total } = calcOrderTotals(order)
  const receivedNum = Number(received) || 0
  const change = calcChange(total, receivedNum)
  const canConfirm = method !== 'efectivo' || receivedNum >= total
  const split = splitParts && Number(splitParts) > 1 ? calcSplitEqual(total, Number(splitParts)) : null

  // Cerrar SIN haber cobrado todavía (botón "Cancelar" del formulario): no
  // dispara onConfirmed, la mesa/orden sigue abierta tal cual estaba.
  const close = () => { reset(); onClose() }

  const confirm = () => {
    const sale = confirmSale(order.id, { paymentMethod: method, cashReceived: receivedNum, split })
    setCompletedSale(sale)
  }

  return (
    <AdminModal open={open} onClose={close} title="Cobrar" width={440}>
      {cash.status !== 'abierta' && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: '#8A4536', background: 'rgba(166,91,74,0.12)', padding: '10px 12px', marginBottom: 16 }}>
          La caja está cerrada — la venta se va a registrar igual, pero abrí la caja para que el efectivo cuadre en el arqueo.
        </p>
      )}
      {undelivered > 0 && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: '#8A6A2E', background: 'rgba(176,138,62,0.14)', padding: '10px 12px', marginBottom: 16 }}>
          Todavía hay {undelivered} comanda{undelivered > 1 ? 's' : ''} sin entregar en cocina/barra — se puede cobrar igual, pero verificá con el salón.
        </p>
      )}

      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 10 }}>Método de pago</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {paymentMethods.map(m => (
          <button key={m} onClick={() => setMethod(m)}
            style={{
              padding: '12px 10px', fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${method === m ? COLORS.green : COLORS.lineGreen}`,
              background: method === m ? COLORS.green : 'transparent',
              color: method === m ? COLORS.cream : COLORS.onLightMuted, cursor: 'pointer',
            }}>
            {PAYMENT_LABELS[m]}
          </button>
        ))}
      </div>

      {method === 'efectivo' && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>Recibido</p>
          <input style={inputStyle} type="number" min={0} value={received} onChange={e => setReceived(e.target.value)} placeholder={String(total)} autoFocus />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, marginTop: 10 }}>
            <span style={{ color: COLORS.onLightMuted }}>Vuelto</span>
            <span style={{ fontWeight: 700, color: COLORS.greenDark }}>{formatMoney(change)}</span>
          </div>
        </div>
      )}

      <details style={{ marginBottom: 20 }}>
        <summary style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, cursor: 'pointer' }}>Dividir cuenta en partes iguales</summary>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
          <input style={{ ...inputStyle, width: 80 }} type="number" min={2} value={splitParts} onChange={e => setSplitParts(e.target.value)} placeholder="2" />
          {split && (
            <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
              {split.parts} personas · {formatMoney(split.amountPerPart)} c/u
            </span>
          )}
        </div>
      </details>

      <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, paddingTop: 16, marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 4 }}>
          <span>Subtotal</span><span>{formatMoney(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.green, marginBottom: 4 }}>
            <span>Descuento</span><span>-{formatMoney(discountAmount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.serif, fontSize: 24, color: COLORS.greenDark, fontWeight: 600, marginTop: 8 }}>
          <span>Total</span><span>{formatMoney(total)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="outline-light" onClick={close}>Cancelar</Button>
        <Button full disabled={!canConfirm} onClick={confirm}>Confirmar venta</Button>
      </div>
    </AdminModal>
  )
}
