import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const C = {
  dark:    '#1F2E24',
  deep:    '#314D39',
  mid:     '#4C6B50',
  cream:   '#F3EFE7',
  gold:    '#B8A96A',
  muted:   'rgba(243,239,231,0.6)',
}

const CATS = ['Todos', 'Brunch', 'Café', 'Pastelería', 'Cocina', 'Tragos']

const PRODUCTS = [
  {
    id: 1, name: 'Tostada Jungle', cat: 'Brunch', price: 3800,
    desc: 'Sourdough artesanal, palta, tomates cherry, semillas y flores comestibles.',
    img: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80',
  },
  {
    id: 2, name: 'Croissant de Manteca', cat: 'Pastelería', price: 1800,
    desc: 'Croissant francés elaborado en casa cada mañana. Crocante por fuera, aireado por dentro.',
    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
  },
  {
    id: 3, name: 'Bowl de la Selva', cat: 'Cocina', price: 5800,
    desc: 'Quinoa, verduras asadas de estación, kale crujiente y aliño de tahini con limón.',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  },
  {
    id: 4, name: 'Flat White MOULI', cat: 'Café', price: 2200,
    desc: 'Doble ristretto de origen único con leche oat vaporizada. Arte latte de la casa.',
    img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  },
  {
    id: 5, name: 'Brownie Jungle', cat: 'Pastelería', price: 2400,
    desc: 'Chocolate 70%, nueces tostadas, sal marina en escamas y caramelo.',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
  },
  {
    id: 6, name: 'Aperitivo Verde', cat: 'Tragos', price: 4200,
    desc: 'Gin botánico, pepino fresco, elderflower, tónica artesanal e hierbas.',
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
  },
  {
    id: 7, name: 'Café Filtrado', cat: 'Café', price: 1800,
    desc: 'Método pour-over o Chemex según el origen del día. Preparado al momento.',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
  },
  {
    id: 8, name: 'Huevos MOULI', cat: 'Brunch', price: 4200,
    desc: 'Huevos pochados con tomatines asados, pesto de albahaca y ricotta fresca.',
    img: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80',
  },
  {
    id: 9, name: 'Tarta del Día', cat: 'Pastelería', price: 2800,
    desc: 'Masa de almendras, crema de vainilla y fruta de estación. Varía cada día.',
    img: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?w=600&q=80',
  },
  {
    id: 10, name: 'Limonada Selvática', cat: 'Tragos', price: 2000,
    desc: 'Limón exprimido, jengibre, menta fresca y agua con gas. Sin azúcar.',
    img: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&q=80',
  },
  {
    id: 11, name: 'Burrata con Pesto', cat: 'Cocina', price: 5400,
    desc: 'Burrata fresca, tomates heirloom, pesto de albahaca y pan de masa madre.',
    img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
  },
  {
    id: 12, name: 'Matcha Latte', cat: 'Café', price: 2800,
    desc: 'Matcha ceremonial japonés con leche oat vaporizada. Endulzado con miel.',
    img: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&q=80',
  },
]

function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); obs.disconnect() }
    }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.62, delay, ease: 'easeOut' }} style={style}>
      {children}
    </motion.div>
  )
}

function ProductCard({ product, onAdd, cartQty }) {
  const [hov, setHov] = useState(false)
  const [flash, setFlash] = useState(false)

  const handleAdd = () => {
    onAdd(product)
    setFlash(true)
    setTimeout(() => setFlash(false), 900)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: C.deep,
        border: `1px solid ${hov ? 'rgba(184,169,106,0.35)' : 'rgba(76,107,80,0.2)'}`,
        overflow: 'hidden',
        transition: 'all 0.28s',
        transform: hov ? 'translateY(-4px)' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <div style={{ position: 'relative', height: 220, overflow: 'hidden', flexShrink: 0 }}>
        <motion.img src={product.img} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          animate={{ scale: hov ? 1.06 : 1 }} transition={{ duration: 0.5 }} />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', background: C.mid, color: C.cream, padding: '3px 10px' }}>
            {product.cat}
          </span>
        </div>
        {cartQty > 0 && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: C.gold, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: C.dark }}>{cartQty}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.cream, fontWeight: 500, flex: 1, lineHeight: 1.2 }}>{product.name}</h3>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.gold, fontWeight: 600, flexShrink: 0 }}>
            ${product.price.toLocaleString('es-AR')}
          </span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.65, marginBottom: 18, flex: 1 }}>{product.desc}</p>
        <button onClick={handleAdd}
          style={{
            width: '100%',
            fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: flash ? C.dark : C.gold,
            background: flash ? C.gold : 'transparent',
            border: `1.5px solid ${C.gold}`,
            padding: '11px 0', cursor: 'pointer', transition: 'all 0.25s',
          }}>
          {flash ? '✓ Agregado' : '+ Agregar al carrito'}
        </button>
      </div>
    </motion.div>
  )
}

export default function TakeAway() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCat, setActiveCat] = useState('Todos')
  const [name, setName] = useState('')
  const [showModal, setShowModal] = useState(false)

  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(i => i.id === product.id)
      if (found) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0)
    )
  }

  const clearCart = () => { setCart([]); setCartOpen(false) }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  const sendWhatsApp = () => {
    const lines = cart.map(i => `• ${i.qty}x ${i.name} ($${(i.price * i.qty).toLocaleString('es-AR')})`)
    const msg = [
      `Hola MOULI! 🌿 Quiero hacer un pedido take away:`,
      ``,
      ...lines,
      ``,
      `Total: $${total.toLocaleString('es-AR')}`,
      name ? `Nombre: ${name}` : '',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/541144445678?text=${encodeURIComponent(msg)}`, '_blank')
    setShowModal(false)
  }

  const filtered = activeCat === 'Todos' ? PRODUCTS : PRODUCTS.filter(p => p.cat === activeCat)
  const getQty = (id) => cart.find(i => i.id === id)?.qty ?? 0

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 76, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1600&q=75" alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,32,22,0.9) 0%, rgba(31,46,36,0.85) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 24px 64px' }}>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.44em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>
            MOULI · Palermo
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(48px, 8vw, 88px)', color: C.cream, lineHeight: 0.95, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 20 }}>
            Take Away
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, color: C.gold, fontStyle: 'italic' }}>
            Elegí, armá tu pedido y lo retirás en el local.
          </motion.p>
        </div>
      </section>

      {/* INFO BAR */}
      <div style={{ background: C.deep, padding: '14px 28px', borderBottom: '1px solid rgba(76,107,80,0.25)', display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
        {[
          { icon: '⏱', text: 'Retiro en 15–20 min' },
          { icon: '📍', text: 'Borges 2205, Palermo' },
          { icon: '📞', text: '11 4444-5678' },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.muted, letterSpacing: '0.08em' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* STICKY CATEGORY FILTER */}
      <div style={{ position: 'sticky', top: 76, zIndex: 98, background: 'rgba(31,46,36,0.97)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(76,107,80,0.25)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px', display: 'flex', gap: 0 }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: activeCat === cat ? C.gold : 'rgba(243,239,231,0.6)',
                background: 'none', border: 'none',
                borderBottom: activeCat === cat ? `2px solid ${C.gold}` : '2px solid transparent',
                padding: '18px 22px', cursor: 'pointer', transition: 'all 0.25s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (activeCat !== cat) e.currentTarget.style.color = C.cream }}
              onMouseLeave={e => { if (activeCat !== cat) e.currentTarget.style.color = 'rgba(243,239,231,0.6)' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '64px 28px 140px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} cartQty={getQty(p.id)} />
          ))}
        </div>
      </div>

      {/* FLOATING CART BUTTON */}
      <AnimatePresence>
        {count > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={() => setCartOpen(true)}
            style={{
              position: 'fixed', bottom: 32, right: 32, zIndex: 400,
              background: C.gold, border: 'none', cursor: 'pointer',
              padding: '15px 28px',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
              transition: 'background 0.25s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#cfc080'}
            onMouseLeave={e => e.currentTarget.style.background = C.gold}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.dark }}>
              Ver pedido
            </span>
            <span style={{ background: C.dark, color: C.gold, borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {count}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* CART OVERLAY + DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(20,32,22,0.7)', zIndex: 500, backdropFilter: 'blur(4px)' }} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 'min(440px, 100vw)',
                background: C.dark, zIndex: 501,
                display: 'flex', flexDirection: 'column',
                borderLeft: '1px solid rgba(76,107,80,0.3)',
              }}>
              {/* Header */}
              <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(76,107,80,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase' }}>Mi Pedido</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.cream, fontWeight: 400, marginTop: 4 }}>
                    {count} {count === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <button onClick={() => setCartOpen(false)}
                  style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', padding: 8, lineHeight: 1 }}>✕</button>
              </div>

              {/* Items */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(76,107,80,0.15)' }}>
                    <img src={item.img} alt={item.name}
                      style={{ width: 64, height: 64, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: C.cream, fontWeight: 500, marginBottom: 4, lineHeight: 1.2 }}>{item.name}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.gold }}>
                        ${(item.price * item.qty).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(76,107,80,0.35)', flexShrink: 0 }}>
                      <button onClick={() => updateQty(item.id, -1)}
                        style={{ background: 'none', border: 'none', color: C.cream, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(76,107,80,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        −
                      </button>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.cream, width: 28, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)}
                        style={{ background: 'none', border: 'none', color: C.cream, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(76,107,80,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '20px 28px', borderTop: '1px solid rgba(76,107,80,0.25)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.14em', color: C.muted, textTransform: 'uppercase' }}>Total estimado</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: C.gold, fontWeight: 600 }}>
                    ${total.toLocaleString('es-AR')}
                  </span>
                </div>
                <button onClick={() => { setCartOpen(false); setShowModal(true) }}
                  style={{ width: '100%', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: 'none', padding: '16px', cursor: 'pointer', transition: 'background 0.25s', marginBottom: 10 }}
                  onMouseEnter={e => e.target.style.background = '#cfc080'}
                  onMouseLeave={e => e.target.style.background = C.gold}>
                  Terminar pedido por WhatsApp
                </button>
                <button onClick={clearCart}
                  style={{ width: '100%', background: 'none', border: '1px solid rgba(76,107,80,0.3)', color: C.muted, fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.target.style.borderColor = 'rgba(76,107,80,0.6)'}
                  onMouseLeave={e => e.target.style.borderColor = 'rgba(76,107,80,0.3)'}>
                  Vaciar carrito
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NAME MODAL */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(20,32,22,0.88)', zIndex: 600, backdropFilter: 'blur(6px)' }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.28 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'fixed', top: '50%', left: '50%', zIndex: 601,
                transform: 'translate(-50%, -50%)',
                background: C.deep, padding: '44px 40px',
                border: '1px solid rgba(76,107,80,0.35)',
                width: 'min(420px, calc(100vw - 48px))',
              }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase', marginBottom: 12 }}>
                Casi listo
              </p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: C.cream, fontWeight: 400, marginBottom: 10 }}>
                ¿Cómo te llamás?
              </h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.muted, marginBottom: 28, lineHeight: 1.7 }}>
                Ingresá tu nombre para que el equipo de MOULI pueda identificar tu pedido al retirarlo.
              </p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendWhatsApp()}
                placeholder="Tu nombre"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(31,46,36,0.8)', border: '1px solid rgba(76,107,80,0.4)',
                  color: C.cream, fontFamily: "'Inter', sans-serif", fontSize: 14,
                  padding: '13px 16px', outline: 'none', marginBottom: 20,
                }} />
              <button onClick={sendWhatsApp}
                style={{ width: '100%', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: 'none', padding: '15px', cursor: 'pointer', transition: 'background 0.25s' }}
                onMouseEnter={e => e.target.style.background = '#cfc080'}
                onMouseLeave={e => e.target.style.background = C.gold}>
                Enviar pedido por WhatsApp
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          div[style*="sticky"] button { padding: 16px 14px !important; font-size: 10px !important; }
        }
      `}</style>
    </div>
  )
}
