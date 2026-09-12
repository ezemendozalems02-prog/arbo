import { useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS, FONTS } from '../../styles/theme'
import { MENU_ITEMS } from '../../data/menu'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'

const money = (n) => `$${n.toLocaleString('es-AR')}`

const featured = MENU_ITEMS.filter(i => i.tags.includes('Signature') || i.tags.includes('Estrella')).slice(0, 4)

function DishCard({ dish, index }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: COLORS.warmWhite, border: `1px solid ${hov ? COLORS.lineGreen : 'transparent'}`, transition: 'border-color 0.3s' }}
    >
      <div style={{ height: 240, overflow: 'hidden' }}>
        <motion.img src={dish.img} alt={dish.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          animate={{ scale: hov ? 1.06 : 1 }} transition={{ duration: 0.5 }} />
      </div>
      <div style={{ padding: '22px 22px 26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <h3 style={{ fontFamily: FONTS.serif, fontSize: 21, color: COLORS.greenDark, fontWeight: 500, lineHeight: 1.2 }}>{dish.name}</h3>
          <span style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.green, fontWeight: 600, flexShrink: 0 }}>{money(dish.price)}</span>
        </div>
        <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, lineHeight: 1.65 }}>{dish.description}</p>
      </div>
    </motion.div>
  )
}

export default function MenuPreview() {
  return (
    <section style={{ background: COLORS.cream, padding: '120px 28px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <SectionLabel index="02" label="Lo que no podés perderte" color={COLORS.green} align="center" style={{ marginBottom: 16, justifyContent: 'center' }} />
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(32px, 4.5vw, 52px)', color: COLORS.greenDark, fontWeight: 400 }}>Carta Destacada</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 56 }}>
          {featured.map((d, i) => <DishCard key={d.id} dish={d} index={i} />)}
        </div>
        <Reveal>
          <div style={{ textAlign: 'center' }}>
            <Button to="/carta" variant="outline-light">Ver carta completa</Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
