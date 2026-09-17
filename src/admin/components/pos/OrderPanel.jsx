import { COLORS, FONTS } from '../../../styles/theme'
import { calcLineTotal, calcOrderTotals } from '../../../services/salesCalculations'
import { buildPendingTicketItems } from '../../../services/kitchenService'
import { formatMoney } from '../../utils/format'
import { EmptyState } from '../Panel'
import Button from '../../../components/ui/Button'

function QtyStepper({ value, onChange, min = 0 }) {
  const atFloor = value <= min
  const btnStyle = {
    width: 26, height: 26, border: `1px solid ${COLORS.lineGreen}`, background: COLORS.cream,
    color: COLORS.greenDark, fontSize: 14, fontWeight: 700, cursor: 'pointer', lineHeight: 1,
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button style={{ ...btnStyle, opacity: atFloor ? 0.35 : 1, cursor: atFloor ? 'not-allowed' : 'pointer' }}
        disabled={atFloor} onClick={() => onChange(value - 1)} aria-label="Restar">−</button>
      <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{value}</span>
      <button style={btnStyle} onClick={() => onChange(value + 1)} aria-label="Sumar">+</button>
    </div>
  )
}

export default function OrderPanel({
  order, headerLabel, onChangeQty, onRemove, onOpenDiscount, onOpenCustomer, onCheckout, onCancel, onSendKitchen,
}) {
  const items = order?.items ?? []
  const { subtotal, discountAmount, total } = calcOrderTotals(order ?? { items: [], discount: null })
  const pendingCount = order ? buildPendingTicketItems(order).reduce((sum, it) => sum + it.quantity, 0) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${COLORS.lineGreen}` }}>
        <p style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.greenDark }}>{headerLabel}</p>
        {order?.customerName ? (
          <button onClick={onOpenCustomer} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginTop: 4 }}>
            {order.customerName}
          </button>
        ) : (
          <button onClick={onOpenCustomer} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 4, textDecoration: 'underline' }}>
            + Asociar cliente
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 18px' }}>
        {items.length === 0 ? (
          <EmptyState label="Todavía no agregaste productos." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((item, i) => (
              <div key={item.id} style={{ padding: '12px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 600, color: COLORS.onLight }}>{item.name}</span>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: COLORS.greenDark, flexShrink: 0 }}>{formatMoney(calcLineTotal(item))}</span>
                </div>
                {item.modifiers.length > 0 && (
                  <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 3 }}>
                    {item.modifiers.map(m => m.optionName).join(' · ')}
                  </p>
                )}
                {item.sentQty > 0 && (
                  <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.green, marginTop: 3 }}>
                    ✓ {item.sentQty} enviado{item.sentQty > 1 ? 's' : ''} a cocina
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <QtyStepper value={item.quantity} onChange={(q) => onChangeQty(item.id, q)} min={item.sentQty ?? 0} />
                  {(item.sentQty ?? 0) === 0 && (
                    <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, textDecoration: 'underline' }}>
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px', borderTop: `1px solid ${COLORS.lineGreen}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 6 }}>
          <span>Subtotal</span><span>{formatMoney(subtotal)}</span>
        </div>
        <button onClick={onOpenDiscount} style={{
          display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: FONTS.sans, fontSize: 13, color: discountAmount > 0 ? COLORS.green : COLORS.onLightFaint, marginBottom: 6, padding: 0,
        }}>
          <span style={{ textDecoration: 'underline' }}>Descuento</span>
          <span>{discountAmount > 0 ? `-${formatMoney(discountAmount)}` : 'Agregar'}</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.serif, fontSize: 24, color: COLORS.greenDark, fontWeight: 600, padding: '10px 0 16px' }}>
          <span>Total</span><span>{formatMoney(total)}</span>
        </div>
        {onSendKitchen && items.length > 0 && (
          <Button full variant={pendingCount > 0 ? 'solid-light' : 'outline-light'} disabled={pendingCount === 0} onClick={onSendKitchen} style={{ marginBottom: 10 }}>
            {pendingCount > 0 ? `Enviar comanda (${pendingCount})` : 'Comanda enviada'}
          </Button>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          {onCancel && <Button variant="outline-light" onClick={onCancel}>Cancelar</Button>}
          <Button full disabled={items.length === 0} onClick={onCheckout}>Cobrar</Button>
        </div>
      </div>
    </div>
  )
}
