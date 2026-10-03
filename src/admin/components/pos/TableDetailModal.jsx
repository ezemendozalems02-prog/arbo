import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { useToast } from '../../context/ToastContext'
import { calcLineTotal, calcOrderTotals } from '../../../services/salesCalculations'
import { buildPendingTicketItems } from '../../../services/kitchenService'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'
import { EmptyState } from '../Panel'
import { formatMoney } from '../../utils/format'
import CheckoutModal from './CheckoutModal'
import SplitBillModal from './SplitBillModal'
import KitchenStatusPanel from '../kitchen/KitchenStatusPanel'

export default function TableDetailModal({ table, order, open, onClose, onAddProducts, onCancelOrder, onSaleConfirmed }) {
  const { sendKitchenTickets, deliverTicket, getTicketsForOrder } = usePOS()
  const { showToast } = useToast()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [splitOpen, setSplitOpen] = useState(false)

  // Importante: <CheckoutModal> siempre se renderiza, aunque `order` sea
  // null. Al confirmar una venta la mesa queda libre y `order` desaparece
  // en el siguiente render (ya es una venta, no una orden abierta) — pero
  // CheckoutModal debe seguir de pie para mostrar su propia pantalla de
  // "venta registrada", que ya no depende de `order`. Si cortáramos acá con
  // `if (!table || !order) return null`, esa pantalla desaparecería sola.
  if (!table) return null

  const totals = order ? calcOrderTotals(order) : { subtotal: 0, discountAmount: 0, total: 0 }
  const tickets = order ? getTicketsForOrder(order.id) : []
  const pendingCount = order ? buildPendingTicketItems(order).reduce((sum, it) => sum + it.quantity, 0) : 0

  const handleSendKitchen = () => {
    const created = sendKitchenTickets(order.id)
    if (created.length === 0) return
    showToast(`Comanda${created.length > 1 ? 's' : ''} enviada${created.length > 1 ? 's' : ''}: ${created.map(t => `#${t.code}`).join(', ')}`)
  }

  return (
    <>
      {order && (
        <AdminModal open={open && !checkoutOpen && !splitOpen} onClose={onClose} title={`Mesa ${table.number}`} width={420}>
          <div style={{ display: 'flex', gap: 18, fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, marginBottom: 18 }}>
            <span>{order.customerName ?? 'Sin cliente asociado'}</span>
            {order.partySize && <span>· {order.partySize} personas</span>}
          </div>

          <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 10 }}>Orden</p>
          {order.items.length === 0 ? (
            <EmptyState label="Todavía no se agregaron productos." />
          ) : (
            <div style={{ marginBottom: 18 }}>
              {order.items.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>
                  <span>{item.quantity}× {item.name}</span>
                  <span>{formatMoney(calcLineTotal(item))}</span>
                </div>
              ))}
            </div>
          )}

          <KitchenStatusPanel tickets={tickets} onDeliver={deliverTicket} />

          <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, paddingTop: 12, marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 4 }}>
              <span>Subtotal</span><span>{formatMoney(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.green, marginBottom: 4 }}>
                <span>Descuento</span><span>-{formatMoney(totals.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.serif, fontSize: 22, color: COLORS.greenDark, fontWeight: 600, marginTop: 6 }}>
              <span>Total</span><span>{formatMoney(totals.total)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button onClick={onAddProducts}>Agregar productos</Button>
            {pendingCount > 0 && (
              <Button variant="solid-light" onClick={handleSendKitchen}>Enviar comanda ({pendingCount})</Button>
            )}
            <Button disabled={order.items.length === 0} onClick={() => setCheckoutOpen(true)}>Cobrar</Button>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="outline-light" disabled={order.items.length === 0} onClick={() => setSplitOpen(true)}>Dividir cuenta</Button>
              <Button variant="outline-light" onClick={onCancelOrder}>Cancelar</Button>
            </div>
          </div>
        </AdminModal>
      )}

      <CheckoutModal order={order} open={checkoutOpen} onClose={() => setCheckoutOpen(false)}
        onConfirmed={(sale) => { setCheckoutOpen(false); onSaleConfirmed(sale) }} />
      {order && <SplitBillModal order={order} open={splitOpen} onClose={() => setSplitOpen(false)} />}
    </>
  )
}
