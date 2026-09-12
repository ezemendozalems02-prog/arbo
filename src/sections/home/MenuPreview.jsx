import { useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS, FONTS } from '../../styles/theme'
import { MENU_CATEGORIES, MENU_ITEMS } from '../../data/menu'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'

const money = (n) => `$${n.toLocaleString('es-AR')}`
const catLabel = (key) => MENU_CATEGORIES.find(c => c.key === key)?.label ?? ''

const featured = MENU_ITEMS.filter(i => i.tags.includes('Signature') || i.tags.includes('Estrella')).slice(0, 4)

function DishCard({ dish, index }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      className="arbo-dish-card"
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: COLORS.warmWhite, border: `1px solid ${hov ? COLORS.lineGreen : 'transparent'}`, transition: 'border-color 0.3s' }}
    >
      <div className="arbo-dish-img" style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <motion.img src={dish.img} alt={dish.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          animate={{ scale: hov ? 1.06 : 1 }} transition={{ duration: 0.5 }} />
        {dish.tags[0] && (
          <span style={{
            position: 'absolute', top: 10, left: 10, background: COLORS.greenDark, color: COLORS.cream,
            fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px',
          }}>
            {dish.tags[0]}
          </span>
        )}
      </div>
      <div className="arbo-dish-body" style={{ padding: '22px 22px 26px' }}>
        <p className="arbo-dish-cat" style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.green, marginBottom: 8, opacity: 0.85 }}>
          {catLabel(dish.cat)}
        </p>
        <div className="arbo-dish-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <h3 className="arbo-dish-title" style={{ fontFamily: FONTS.serif, fontSize: 21, color: COLORS.greenDark, fontWeight: 500, lineHeight: 1.2 }}>{dish.name}</h3>
          <div className="arbo-dish-price-block" style={{ textAlign: 'right', flexShrink: 0 }}>
            <p className="arbo-dish-price-label" style={{ fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.onLightFaint, marginBottom: 2 }}>Precio</p>
            <span className="arbo-dish-price" style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.green, fontWeight: 600 }}>{money(dish.price)}</span>
          </div>
        </div>
        <p className="arbo-dish-desc" style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, lineHeight: 1.65 }}>{dish.description}</p>
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
        <div className="arbo-dish-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 56 }}>
          {featured.map((d, i) => <DishCard key={d.id} dish={d} index={i} />)}
        </div>
        <Reveal>
          <div style={{ textAlign: 'center' }}>
            <Button to="/carta" variant="outline-light">Ver carta completa</Button>
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .arbo-dish-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .arbo-dish-img { height: 130px !important; }
          .arbo-dish-body { padding: 14px 12px 16px !important; }
          .arbo-dish-cat { font-size: 8px !important; margin-bottom: 5px !important; }
          .arbo-dish-row { flex-direction: column !important; gap: 4px !important; }
          .arbo-dish-title { font-size: 15px !important; line-height: 1.15 !important; }
          .arbo-dish-price-block { text-align: left !important; }
          .arbo-dish-price-label { font-size: 7px !important; }
          .arbo-dish-price { font-size: 15px !important; }
          .arbo-dish-desc {
            font-size: 11px !important; line-height: 1.5 !important;
            display: -webkit-box !important; -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 2 !important; overflow: hidden !important;
          }
        }
      `}</style>
    </section>
  )
}
