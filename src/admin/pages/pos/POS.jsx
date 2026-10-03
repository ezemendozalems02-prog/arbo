import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { useToast } from '../../context/ToastContext'
import Button from '../../ui/Button'
import CategoryTabs from '../../components/pos/CategoryTabs'
import ProductGrid from '../../components/pos/ProductGrid'
import OrderPanel from '../../components/pos/OrderPanel'
import ModifierPickerModal from '../../components/pos/ModifierPickerModal'
import DiscountModal from '../../components/pos/DiscountModal'
import CustomerPickerModal from '../../components/pos/CustomerPickerModal'
import CheckoutModal from '../../components/pos/CheckoutModal'

export default function POS() {
  useEffect(() => { document.title = 'POS | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get('table')
  const {
    getTable, getOrder, startCounterOrder, counterOrderId,
    addItemToOrder, updateItemQuantity, removeItem, setOrderDiscount, setOrderCustomer, cancelOrder,
    sendKitchenTickets,
  } = usePOS()

  const [activeCategory, setActiveCategory] = useState('todos')
  const [modifierProduct, setModifierProduct] = useState(null)
  const [discountOpen, setDiscountOpen] = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const table = tableId ? getTable(tableId) : null

  // Sin mesa seleccionada: arrancamos (o retomamos) una orden de mostrador.
  useEffect(() => {
    if (!tableId && !counterOrderId) startCounterOrder()
  }, [tableId, counterOrderId, startCounterOrder])

  // Una mesa se abre siempre desde Mesas (asigna personas primero) — el POS
  // nunca la auto-abre. Si llegamos acá con una mesa que ya no tiene orden
  // (libre recién cobrada, o un link directo a una mesa libre), mostramos un
  // estado explícito en vez de crear una orden nueva en silencio: un efecto
  // que "reabriera" la mesa automáticamente volvería a ocuparla apenas se
  // libera al confirmar una venta, justo mientras esta pantalla sigue montada.
  // OJO: esto NUNCA debe cortar el return antes del <CheckoutModal> de más
  // abajo — la pantalla de "venta registrada" se ve justo después de que la
  // mesa quede libre, mientras seguimos en esta misma URL.
  const tableIsFree = Boolean(tableId && table && !table.orderId)

  const orderId = tableId ? table?.orderId : counterOrderId
  const order = orderId ? getOrder(orderId) : null
  const headerLabel = table ? `Mesa ${table.number}` : 'Mostrador'

  const handleSelectProduct = (product) => {
    if (!orderId) return
    if (product.modifierGroups.length > 0) { setModifierProduct(product); return }
    addItemToOrder(orderId, product, [])
    showToast(`Agregado: ${product.name}`)
  }

  const handleConfirmModifiers = (modifiers) => {
    addItemToOrder(orderId, modifierProduct, modifiers)
    showToast(`Agregado: ${modifierProduct.name}`)
    setModifierProduct(null)
  }

  const handleCancel = () => {
    if (!orderId) return
    if (!confirm('¿Cancelar esta orden? Se perderán los productos agregados.')) return
    cancelOrder(orderId)
    showToast('Orden cancelada')
    navigate(table ? '/admin/mesas' : '/admin/pos')
  }

  const handleSendKitchen = () => {
    if (!orderId) return
    const created = sendKitchenTickets(orderId)
    if (created.length === 0) return
    showToast(`Comanda${created.length > 1 ? 's' : ''} enviada${created.length > 1 ? 's' : ''}: ${created.map(t => `#${t.code}`).join(', ')}`)
  }

  const handleSaleConfirmed = (sale) => {
    setCheckoutOpen(false)
    showToast(`Venta #${String(sale.number).padStart(4, '0')} registrada`)
    navigate(table ? '/admin/mesas' : '/admin/pos')
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 20, alignItems: 'start' }}>
      {tableIsFree ? (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.greenDark, marginBottom: 10 }}>Mesa {table.number} está libre</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 24 }}>Abrila desde el mapa de mesas para empezar una orden.</p>
          <Button onClick={() => navigate('/admin/mesas')}>Ir a Mesas</Button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted }}>
              {headerLabel}
              {table?.status === 'ocupada' && <span style={{ color: COLORS.green, fontWeight: 600 }}> · Ocupada</span>}
            </p>
            <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
            <ProductGrid category={activeCategory} onSelect={handleSelectProduct} />
          </div>

          <div style={{ position: 'sticky', top: 84, height: 'calc(100vh - 120px)' }}>
            <OrderPanel
              order={order}
              headerLabel={headerLabel}
              onChangeQty={(itemId, qty) => updateItemQuantity(orderId, itemId, qty)}
              onRemove={(itemId) => removeItem(orderId, itemId)}
              onOpenDiscount={() => setDiscountOpen(true)}
              onOpenCustomer={() => setCustomerOpen(true)}
              onCheckout={() => setCheckoutOpen(true)}
              onCancel={handleCancel}
              onSendKitchen={handleSendKitchen}
            />
          </div>
        </>
      )}

      <ModifierPickerModal product={modifierProduct} open={!!modifierProduct} onClose={() => setModifierProduct(null)} onConfirm={handleConfirmModifiers} />
      {order && <DiscountModal order={order} open={discountOpen} onClose={() => setDiscountOpen(false)} onApply={(d) => { setOrderDiscount(orderId, d); setDiscountOpen(false) }} />}
      <CustomerPickerModal open={customerOpen} onClose={() => setCustomerOpen(false)} currentCustomerId={order?.customerId}
        onSelect={(customerId) => { setOrderCustomer(orderId, customerId); setCustomerOpen(false) }} />
      <CheckoutModal order={order} open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onConfirmed={handleSaleConfirmed} />
    </div>
  )
}
