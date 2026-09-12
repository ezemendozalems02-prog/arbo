import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { COLORS, FONTS } from '../../styles/theme'
import { SITE } from '../../data/site'
import Button from '../../components/ui/Button'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

export default function Hero() {
  const ref = useRef(null)
  const { scrollY } = useScroll()
  const imgY = useTransform(scrollY, [0, 800], [0, 160])
  const reduced = usePrefersReducedMotion()

  return (
    <section ref={ref} style={{ position: 'relative', height: '100svh', minHeight: 640, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div style={{ position: 'absolute', inset: '-15%', y: reduced ? 0 : imgY }}
        initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}>
        <img
          src={SITE.images.hero}
          alt="Bosque y montañas verdes de la Patagonia, entorno de Arbo en Trevelin"
          style={{ width: '100%', height: '130%', objectFit: 'cover' }}
        />
      </motion.div>

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,30,20,0.14) 0%, rgba(20,35,24,0.4) 50%, rgba(12,20,15,0.86) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 880 }}>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.5em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 26 }}>
          Trevelin · Patagonia Argentina
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: FONTS.serif, fontSize: 'clamp(64px, 13vw, 150px)', color: COLORS.cream, lineHeight: 0.92, fontWeight: 500, letterSpacing: '0.05em', marginBottom: 8 }}>
          ARBO
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.75 }}
          style={{ fontFamily: FONTS.sans, fontSize: 13, letterSpacing: '0.5em', color: COLORS.onDarkMuted, textTransform: 'uppercase', marginBottom: 34 }}>
          Wine &amp; Café
        </motion.p>

        <motion.div initial={{ width: 0 }} animate={{ width: 60 }} transition={{ delay: 1, duration: 0.7 }}
          style={{ height: 1, background: COLORS.accent, margin: '0 auto 30px', opacity: 0.75 }} />

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.05 }}
          style={{ fontFamily: FONTS.serif, fontSize: 'clamp(19px, 2.6vw, 26px)', color: COLORS.cream, fontStyle: 'italic', marginBottom: 14, lineHeight: 1.5 }}>
          "Un punto de encuentro en el corazón de Trevelin."
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.2 }}
          style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.onDarkMuted, marginBottom: 46, lineHeight: 1.7 }}>
          Café de especialidad, vinos y gastronomía en una experiencia patagónica.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.35 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button to="/reservas" variant="solid-dark" size="lg">Reservar una mesa</Button>
          <Button to="/carta" variant="outline-dark" size="lg">Explorar la carta</Button>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}
        style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.34em', color: COLORS.onDarkMuted, textTransform: 'uppercase' }}>Scroll</span>
        <div className="arbo-bounce" style={{ width: 1, height: 34, background: 'linear-gradient(to bottom, rgba(244,240,228,0.6), transparent)' }} />
      </motion.div>
    </section>
  )
}
