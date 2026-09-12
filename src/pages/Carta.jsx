import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS, FONTS } from '../styles/theme'
import { SITE } from '../data/site'
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menu'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'

const money = (n) => `$${n.toLocaleString('es-AR')}`

function MenuRow({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
      style={{ padding: '24px 0', borderBottom: `1px solid ${COLORS.lineGreen}`, display: 'flex', gap: 20, alignItems: 'flex-start' }}
    >
      <img src={item.img} alt="" loading="lazy" style={{ width: 84, height: 84, objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'baseline', marginBottom: 6 }}>
          <h3 style={{ fontFamily: FONTS.serif, fontSize: 21, color: COLORS.greenDark, fontWeight: 500 }}>{item.name}</h3>
          <span style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.green, fontWeight: 600, flexShrink: 0 }}>{money(item.price)}</span>
        </div>
        <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, lineHeight: 1.65, marginBottom: item.tags.length ? 10 : 0 }}>{item.description}</p>
        {item.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {item.tags.map(tag => (
              <span key={tag} style={{ fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.green, border: `1px solid ${COLORS.lineGreen}`, padding: '3px 9px' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Carta() {
  useEffect(() => { document.title = 'Carta | Arbo Patagonia' }, [])
  const [active, setActive] = useState(MENU_CATEGORIES[0].key)
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
      const offset = (filterRef.current?.offsetHeight ?? 52) + 110
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
    <div style={{ background: COLORS.cream }}>
      <section style={{ position: 'relative', minHeight: '42vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 84, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={SITE.images.cafe} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(12,16,20,0.88) 0%, rgba(31,64,47,0.82) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '70px 24px 60px' }}>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.4em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 16 }}>
            Arbo Patagonia
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            style={{ fontFamily: FONTS.serif, fontSize: 'clamp(46px, 8vw, 84px)', color: COLORS.cream, fontWeight: 400, lineHeight: 0.98, marginBottom: 18 }}>
            Nuestra Carta
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.accent, fontStyle: 'italic' }}>
            Café, vino y todo lo que crece en la Patagonia.
          </motion.p>
        </div>
      </section>

      <div ref={filterRef} style={{ position: 'sticky', top: 68, zIndex: 90, background: 'rgba(247,241,227,0.97)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${COLORS.lineGreen}`, overflowX: 'auto' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 28px', display: 'flex' }}>
          {MENU_CATEGORIES.map(({ key, label }) => (
            <button key={key} onClick={() => scrollTo(key)}
              style={{
                fontFamily: FONTS.sans, fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: active === key ? COLORS.green : COLORS.onLightFaint,
                background: 'none', border: 'none', borderBottom: active === key ? `2px solid ${COLORS.green}` : '2px solid transparent',
                padding: '16px 18px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 28px 100px' }}>
        {MENU_CATEGORIES.map(({ key, label }) => {
          const items = MENU_ITEMS.filter(i => i.cat === key)
          if (!items.length) return null
          return (
            <div key={key} ref={el => sectionRefs.current[key] = el} style={{ marginBottom: 70 }}>
              <Reveal style={{ marginBottom: 8 }}>
                <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(28px, 3.2vw, 38px)', color: COLORS.greenDark, fontWeight: 400 }}>{label}</h2>
              </Reveal>
              <div>
                {items.map((item, i) => <MenuRow key={item.id} item={item} index={i} />)}
              </div>
            </div>
          )
        })}
      </div>

      <section style={{ background: COLORS.greenDark, padding: '80px 28px', textAlign: 'center' }}>
        <Reveal>
          <p style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.accent, fontStyle: 'italic', marginBottom: 20 }}>
            ¿Tenés consultas sobre alergias o requerimientos dietarios?
          </p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onDarkMuted, marginBottom: 32, lineHeight: 1.8, maxWidth: 520, marginInline: 'auto' }}>
            Escribinos por WhatsApp y te asesoramos. Contamos con opciones sin lactosa y vegetarianas.
          </p>
          <Button href={`https://wa.me/${SITE.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</Button>
        </Reveal>
      </section>
    </div>
  )
}
