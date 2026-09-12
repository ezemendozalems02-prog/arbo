import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLORS, FONTS } from '../styles/theme'
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menu'
import { useCartContext } from '../context/CartContext'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import Portal from '../components/ui/Portal'
import { CheckIcon } from '../components/ui/icons'

const money = (n) => `$${n.toLocaleString('es-AR')}`
const ORDERABLE_CATS = MENU_CATEGORIES.filter(c => MENU_ITEMS.some(i => i.cat === c.key && i.orderable))

function ProductCard({ item, qty, onAdd }) {
  const [flash, setFlash] = useState(false)
  const handleAdd = () => { onAdd(item); setFlash(true); setTimeout(() => setFlash(false), 700) }
  return (
    <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 190, overflow: 'hidden' }}>
        <img src={item.img} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {qty > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: COLORS.green, color: COLORS.cream, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.sans, fontSize: 12, fontWeight: 700 }}>
            {qty}
          </div>
        )}
      </div>
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
          <h3 style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.greenDark, fontWeight: 500, lineHeight: 1.2 }}>{item.name}</h3>
          <span style={{ fontFamily: FONTS.serif, fontSize: 17, color: COLORS.green, fontWeight: 600, flexShrink: 0 }}>{money(item.price)}</span>
        </div>
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{item.description}</p>
        <button onClick={handleAdd} aria-label={`Agregar ${item.name} al carrito`}
          style={{
            width: '100%', fontFamily: FONTS.sans, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: flash ? COLORS.cream : COLORS.green, background: flash ? COLORS.green : 'transparent',
            border: `1.5px solid ${COLORS.green}`, padding: '11px 0', cursor: 'pointer', transition: 'all 0.2s',
          }}>
          {flash ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><CheckIcon width={13} height={13} /> Agregado</span> : '+ Agregar'}
        </button>
      </div>
    </div>
  )
}

function DeliveryStep({ form, setForm, onNext }) {
  const inputStyle = {
    width: '100%', padding: '13px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
    color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const label = { fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.16em', color: COLORS.onLightMuted, textTransform: 'uppercase', display: 'block', marginBottom: 7 }
  const valid = form.nombre.trim() && form.telefono.trim() && (form.method === 'retiro' || form.direccion.trim())

  return (
    <div>
      <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.3em', color: COLORS.green, textTransform: 'uppercase', marginBottom: 10 }}>Paso 1 de 3</p>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, marginBottom: 26 }}>Datos de entrega</h2>

      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        {[{ v: 'delivery', l: 'Delivery' }, { v: 'retiro', l: 'Retiro en local' }].map(m => (
          <button key={m.v} onClick={() => setForm(f => ({ ...f, method: m.v }))}
            style={{
              flex: 1, padding: '13px 10px', fontFamily: FONTS.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              border: `1.5px solid ${form.method === m.v ? COLORS.green : COLORS.lineGreen}`,
              background: form.method === m.v ? COLORS.green : 'transparent',
              color: form.method === m.v ? COLORS.cream : COLORS.onLightMuted, cursor: 'pointer', transition: 'all 0.2s',
            }}>
            {m.l}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={label}>Nombre *</label>
        <input style={inputStyle} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={label}>Teléfono *</label>
        <input style={inputStyle} value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="Tu teléfono" />
      </div>
      {form.method === 'delivery' && (
        <div style={{ marginBottom: 16 }}>
          <label style={label}>Dirección *</label>
          <input style={inputStyle} value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} placeholder="Calle y número" />
        </div>
      )}
      <div style={{ marginBottom: 26 }}>
        <label style={label}>Indicaciones</label>
        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} rows={3} value={form.indicaciones}
          onChange={e => setForm(f => ({ ...f, indicaciones: e.target.value }))} placeholder="Piso, referencias, alergias, etc." />
      </div>
      <Button full disabled={!valid} onClick={onNext}>Continuar</Button>
    </div>
  )
}

function SummaryStep({ items, subtotal, delivery, total, form, onBack, onConfirm }) {
  return (
    <div>
      <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.3em', color: COLORS.green, textTransform: 'uppercase', marginBottom: 10 }}>Paso 2 de 3</p>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, marginBottom: 26 }}>Resumen del pedido</h2>

      <div style={{ marginBottom: 24 }}>
        {items.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${COLORS.lineGreen}`, fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>
            <span>{i.qty}× {i.name}</span>
            <span>{money(i.price * i.qty)}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24, fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <span>{form.method === 'delivery' ? 'Delivery (demo)' : 'Retiro en local'}</span>
          <span>{form.method === 'delivery' ? money(delivery) : '$0'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: `1px solid ${COLORS.lineGreen}`, marginTop: 8, fontFamily: FONTS.serif, fontSize: 22, color: COLORS.greenDark, fontWeight: 600 }}>
          <span>Total</span><span>{money(total)}</span>
        </div>
      </div>

      <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: '18px 20px', marginBottom: 28, fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, lineHeight: 1.8 }}>
        <strong style={{ color: COLORS.greenDark }}>{form.nombre}</strong> · {form.telefono}<br />
        {form.method === 'delivery' ? form.direccion : 'Retira en el local'}
        {form.indicaciones && <><br />{form.indicaciones}</>}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="outline-light" onClick={onBack}>Volver</Button>
        <Button full onClick={onConfirm}>Confirmar pedido</Button>
      </div>
    </div>
  )
}

function DoneStep({ orderId, onNewOrder }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: COLORS.green, color: COLORS.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 26px' }}>
        <CheckIcon width={26} height={26} />
      </div>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 32, color: COLORS.greenDark, marginBottom: 12 }}>Pedido recibido</h2>
      <p style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.onLightMuted, marginBottom: 22 }}>Te avisaremos cuando esté listo.</p>
      <p style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: '0.08em', color: COLORS.green, marginBottom: 34 }}>#{orderId}</p>
      <Button onClick={onNewOrder}>Hacer otro pedido</Button>
    </div>
  )
}

export default function Pedidos() {
  useEffect(() => { document.title = 'Pedidos | Arbo Patagonia' }, [])
  const { items, addItem, subtotal, itemCount, clearCart, setDrawerOpen, checkoutOpen, setCheckoutOpen, DELIVERY_FEE } = useCartContext()
  const [activeCat, setActiveCat] = useState(ORDERABLE_CATS[0]?.key)
  const [step, setStep] = useState('delivery')
  const [orderId, setOrderId] = useState(null)
  const [form, setForm] = useState({ method: 'delivery', nombre: '', telefono: '', direccion: '', indicaciones: '' })
  useLockBodyScroll(checkoutOpen)

  const getQty = (id) => items.find(i => i.id === id)?.qty ?? 0
  const filtered = MENU_ITEMS.filter(i => i.orderable && i.cat === activeCat)
  const delivery = form.method === 'delivery' ? DELIVERY_FEE : 0
  const total = subtotal + delivery

  const confirmOrder = () => {
    setOrderId(`ARBO-${Math.floor(1000 + Math.random() * 9000)}`)
    setStep('done')
    clearCart()
  }
  const newOrder = () => {
    setCheckoutOpen(false)
    setStep('delivery')
    setForm({ method: 'delivery', nombre: '', telefono: '', direccion: '', indicaciones: '' })
  }

  return (
    <div style={{ background: COLORS.cream, minHeight: '100vh' }}>
      <section style={{ position: 'relative', minHeight: '38vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 84, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1600&q=75" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(12,16,20,0.9) 0%, rgba(31,64,47,0.85) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '70px 24px 56px' }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.4em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 16 }}>Delivery &amp; Take Away</p>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(42px, 8vw, 76px)', color: COLORS.cream, fontWeight: 400, marginBottom: 14 }}>Pedí Arbo</h1>
          <p style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.accent, fontStyle: 'italic' }}>Elegí, armá tu pedido y coordinamos la entrega.</p>
        </div>
      </section>

      <div style={{ position: 'sticky', top: 68, zIndex: 90, background: 'rgba(247,241,227,0.97)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${COLORS.lineGreen}`, overflowX: 'auto' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 28px', display: 'flex' }}>
          {ORDERABLE_CATS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveCat(key)}
              style={{
                fontFamily: FONTS.sans, fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: activeCat === key ? COLORS.green : COLORS.onLightFaint,
                background: 'none', border: 'none', borderBottom: activeCat === key ? `2px solid ${COLORS.green}` : '2px solid transparent',
                padding: '16px 18px', cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '48px 28px 140px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 22 }}>
          {filtered.map(item => (
            <Reveal key={item.id}><ProductCard item={item} qty={getQty(item.id)} onAdd={addItem} /></Reveal>
          ))}
        </div>
      </div>

      {/* Barra de carrito — flotante en desktop, sticky inferior en mobile */}
      <AnimatePresence>
        {itemCount > 0 && !checkoutOpen && (
          <motion.button
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            onClick={() => setDrawerOpen(true)}
            className="arbo-cart-bar"
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 300,
              background: COLORS.greenDark, border: 'none', cursor: 'pointer',
              padding: '16px 24px calc(16px + env(safe-area-inset-bottom))',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 -8px 30px rgba(12,16,20,0.25)',
            }}>
            <span style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.cream }}>
              Carrito · {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
            </span>
            <span style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.accent, fontWeight: 600 }}>{money(subtotal)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Checkout modal */}
      <Portal>
        <AnimatePresence>
          {checkoutOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => step !== 'done' && setCheckoutOpen(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,20,0.7)', zIndex: 600 }} />
              <motion.div
                role="dialog" aria-modal="true"
                initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 601,
                  background: COLORS.cream, width: 'min(520px, calc(100vw - 32px))', maxHeight: '88vh', overflowY: 'auto',
                  padding: '40px 28px',
                }}>
                {step === 'delivery' && <DeliveryStep form={form} setForm={setForm} onNext={() => setStep('summary')} />}
                {step === 'summary' && <SummaryStep items={items} subtotal={subtotal} delivery={delivery} total={total} form={form} onBack={() => setStep('delivery')} onConfirm={confirmOrder} />}
                {step === 'done' && <DoneStep orderId={orderId} onNewOrder={newOrder} />}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>

      <style>{`@media (min-width: 769px) { .arbo-cart-bar { left: auto; right: 24px; bottom: 24px; width: 320px; } }`}</style>
    </div>
  )
}
