import { AnimatePresence, motion } from 'framer-motion'
import { COLORS, FONTS } from '../styles/theme'
import { useCartContext } from '../context/CartContext'
import Button from './ui/Button'

const money = (n) => `$${n.toLocaleString('es-AR')}`

export default function CartDrawer({ onCheckout }) {
  const { items, increaseQuantity, decreaseQuantity, removeItem, subtotal, itemCount, drawerOpen, setDrawerOpen } = useCartContext()

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,20,0.6)', zIndex: 500, backdropFilter: 'blur(3px)' }}
          />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Carrito de pedidos"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: 'easeInOut' }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 501,
              width: 'min(440px, 100vw)', background: COLORS.black,
              display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${COLORS.lineOnDark}`,
            }}
          >
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${COLORS.lineOnDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.3em', color: COLORS.green, textTransform: 'uppercase' }}>Tu pedido</p>
                <p style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.cream, marginTop: 4 }}>
                  {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Cerrar carrito"
                style={{ background: 'none', border: 'none', color: COLORS.onDarkMuted, fontSize: 22, cursor: 'pointer', padding: 8, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 12px' }}>
                  <p style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.cream, marginBottom: 10 }}>Tu carrito está vacío</p>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onDarkMuted, lineHeight: 1.7 }}>
                    Agregá productos desde Pedí Arbo para empezar.
                  </p>
                </div>
              ) : items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${COLORS.lineOnDark}` }}>
                  <img src={item.img} alt="" style={{ width: 62, height: 62, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: FONTS.serif, fontSize: 17, color: COLORS.cream, marginBottom: 4, lineHeight: 1.2 }}>{item.name}</p>
                    <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.green }}>{money(item.price * item.qty)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${COLORS.lineOnDark}`, flexShrink: 0 }}>
                    <button onClick={() => decreaseQuantity(item.id)} aria-label={`Quitar una unidad de ${item.name}`}
                      style={{ background: 'none', border: 'none', color: COLORS.cream, width: 30, height: 30, cursor: 'pointer', fontSize: 15 }}>−</button>
                    <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.cream, width: 24, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => increaseQuantity(item.id)} aria-label={`Agregar una unidad de ${item.name}`}
                      style={{ background: 'none', border: 'none', color: COLORS.cream, width: 30, height: 30, cursor: 'pointer', fontSize: 15 }}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} aria-label={`Quitar ${item.name} del carrito`}
                    style={{ background: 'none', border: 'none', color: COLORS.onDarkFaint, fontSize: 16, cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div style={{ padding: '20px 28px', borderTop: `1px solid ${COLORS.lineOnDark}`, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.14em', color: COLORS.onDarkMuted, textTransform: 'uppercase' }}>Subtotal</span>
                  <span style={{ fontFamily: FONTS.serif, fontSize: 28, color: COLORS.green }}>{money(subtotal)}</span>
                </div>
                <Button full onClick={onCheckout}>Continuar pedido</Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
