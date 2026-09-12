import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSite } from '../context/SiteContext'

const C = {
  dark:    '#1F2E24',
  deep:    '#314D39',
  mid:     '#4C6B50',
  cream:   '#F3EFE7',
  gold:    '#B8A96A',
  muted:   'rgba(243,239,231,0.6)',
}

function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.62, delay, ease: 'easeOut' }} style={style}>{children}</motion.div>
}

function MenuItem({ item, delay }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '26px 28px',
        background: hov ? 'rgba(49,77,57,0.5)' : 'rgba(49,77,57,0.25)',
        border: `1px solid ${hov ? 'rgba(184,169,106,0.35)' : 'rgba(76,107,80,0.18)'}`,
        transition: 'all 0.28s',
      }}
    >
      {item.badge && (
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.2em',
          textTransform: 'uppercase', background: C.mid, color: C.cream,
          padding: '3px 10px', marginBottom: 12, display: 'inline-block',
        }}>
          {item.badge}
        </span>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.cream, fontWeight: 400, lineHeight: 1.2, flex: 1 }}>{item.name}</h4>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.gold, fontWeight: 600, flexShrink: 0 }}>${item.price}</span>
      </div>
      {item.description && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.72, marginTop: 10 }}>{item.description}</p>
      )}
    </motion.div>
  )
}

const catIcons = {
  cafe: '☕',
  brunch: '🌿',
  pasteleria: '🥐',
  cocina: '🍃',
  tragos: '🌱',
}

export default function Menu() {
  const { data } = useSite()
  const menuData = data.menu
  const categories = Object.entries(menuData).map(([key, val]) => ({ key, label: val.label }))
  const firstKey = categories[0]?.key || 'cafe'
  const [active, setActive] = useState(firstKey)
  const filterRef = useRef(null)
  const sectionRefs = useRef({})

  const scrollTo = (key) => {
    setActive(key)
    const el = sectionRefs.current[key]
    if (el) {
      const offset = (filterRef.current?.offsetHeight ?? 52) + 84
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const handler = () => {
      const offset = (filterRef.current?.offsetHeight ?? 52) + 100
      for (const [key, el] of Object.entries(sectionRefs.current)) {
        if (!el) continue
        const { top, bottom } = el.getBoundingClientRect()
        if (top <= offset && bottom > offset) { setActive(key); break }
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '44vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 76, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=75" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,32,22,0.88) 0%, rgba(31,46,36,0.82) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 24px 64px' }}>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.44em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>
            MOULI · Palermo
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(48px, 8vw, 88px)', color: C.cream, lineHeight: 0.95, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 20 }}>
            Nuestra Carta
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, color: C.gold, fontStyle: 'italic' }}>
            Café, cocina y todo lo que crece en la jungla.
          </motion.p>
        </div>
      </section>

      {/* FILTRO STICKY */}
      <div ref={filterRef} style={{ position: 'sticky', top: 76, zIndex: 98, background: 'rgba(31,46,36,0.97)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(76,107,80,0.25)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px', display: 'flex', gap: 0 }}>
          {categories.map(({ key, label }) => (
            <button key={key} onClick={() => scrollTo(key)}
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: active === key ? C.gold : 'rgba(243,239,231,0.6)',
                background: 'none', border: 'none', borderBottom: active === key ? `2px solid ${C.gold}` : '2px solid transparent',
                padding: '18px 22px', cursor: 'pointer', transition: 'all 0.25s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (active !== key) e.currentTarget.style.color = C.cream }}
              onMouseLeave={e => { if (active !== key) e.currentTarget.style.color = 'rgba(243,239,231,0.6)' }}>
              {catIcons[key] ? `${catIcons[key]} ` : ''}{label}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIONES */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '64px 28px 100px' }}>
        {categories.map(({ key, label }) => {
          const items = menuData[key]?.items?.filter(i => i.visible !== false) ?? []
          if (!items.length) return null
          return (
            <div key={key} ref={el => sectionRefs.current[key] = el} style={{ marginBottom: 80 }}>
              <FadeUp style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(76,107,80,0.2)' }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.4em', color: C.gold, textTransform: 'uppercase' }}>
                    {catIcons[key] || '✦'} {label}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(76,107,80,0.2)' }} />
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 3.5vw, 44px)', color: C.cream, fontWeight: 400, textAlign: 'center' }}>{label}</h2>
              </FadeUp>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                {items.map((item, i) => (
                  <MenuItem key={item.id} item={item} delay={i * 0.06} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <section style={{ background: C.deep, padding: '72px 28px', textAlign: 'center', borderTop: '1px solid rgba(76,107,80,0.2)' }}>
        <FadeUp>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, color: C.gold, fontStyle: 'italic', marginBottom: 24 }}>
            ¿Tenés preguntas sobre la carta o alergias?
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.8 }}>
            Escribinos y te asesoramos. Podemos adaptar varios platos a requerimientos dietarios.
          </p>
          <a href="https://wa.me/541144445678" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: 'none', padding: '14px 40px', cursor: 'pointer', transition: 'background 0.28s' }}
              onMouseEnter={e => e.target.style.background = '#cfc080'}
              onMouseLeave={e => e.target.style.background = C.gold}>
              Consultar por WhatsApp
            </button>
          </a>
        </FadeUp>
      </section>

      <style>{`
        @media (max-width: 768px) {
          div[style*="sticky"] button { padding: 16px 14px !important; font-size: 10px !important; }
        }
      `}</style>
    </div>
  )
}
