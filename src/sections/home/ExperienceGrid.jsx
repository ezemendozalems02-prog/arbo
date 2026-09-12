import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { COLORS, FONTS } from '../../styles/theme'
import { SITE } from '../../data/site'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import { ArrowRightIcon } from '../../components/ui/icons'

const EXPERIENCES = [
  { key: 'cafe', title: 'Café', phrase: 'Especialidad en cada taza.', img: SITE.images.cafe, to: '/carta' },
  { key: 'vino', title: 'Vino', phrase: 'Una selección para descubrir.', img: SITE.images.vino, to: '/carta' },
  { key: 'gastronomia', title: 'Gastronomía', phrase: 'Sabores para compartir.', img: SITE.images.gastronomia, to: '/carta' },
  { key: 'momentos', title: 'Momentos', phrase: 'Eventos que quedan.', img: SITE.images.momentos, to: '/eventos' },
]

function ExperienceCard({ exp, index }) {
  const [hov, setHov] = useState(false)
  return (
    <Link to={exp.to} style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, delay: index * 0.08 }}
        style={{ position: 'relative', overflow: 'hidden', height: 460, cursor: 'pointer' }}
      >
        <motion.img src={exp.img} alt={exp.title} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          animate={{ scale: hov ? 1.06 : 1 }} transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }} />
        <div style={{ position: 'absolute', inset: 0, background: hov ? 'rgba(12,16,20,0.35)' : 'rgba(12,16,20,0.55)', transition: 'background 0.4s' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px 26px' }}>
          <motion.h3 animate={{ y: hov ? -6 : 0 }} transition={{ duration: 0.35 }}
            style={{ fontFamily: FONTS.serif, fontSize: 34, color: COLORS.cream, fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {exp.title}
          </motion.h3>
          <p style={{ fontFamily: FONTS.serif, fontSize: 16, color: COLORS.accent, fontStyle: 'italic', marginBottom: 14 }}>{exp.phrase}</p>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: hov ? 1 : 0, y: hov ? 0 : 8 }} transition={{ duration: 0.25 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.cream }}>
            Ver más <ArrowRightIcon width={14} height={14} />
          </motion.div>
        </div>
      </motion.div>
    </Link>
  )
}

export default function ExperienceGrid() {
  return (
    <section style={{ background: COLORS.greenDark, padding: '120px 0' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '0 28px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <SectionLabel index="01" label="La experiencia Arbo" color={COLORS.accent} align="center" style={{ marginBottom: 16, justifyContent: 'center' }} />
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(32px, 4.5vw, 52px)', color: COLORS.cream, fontWeight: 400 }}>
              Cuatro formas de vivir Arbo
            </h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 4 }}>
          {EXPERIENCES.map((exp, i) => <ExperienceCard key={exp.key} exp={exp} index={i} />)}
        </div>
      </div>
    </section>
  )
}
