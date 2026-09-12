import { useState } from 'react'
import { motion } from 'framer-motion'
import { COLORS, FONTS } from '../../styles/theme'
import { EVENTS } from '../../data/events'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'

const dateFmt = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'long' }) : 'A confirmar'

function EventCard({ ev, index }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
    >
      <div style={{ height: 320, overflow: 'hidden' }}>
        <motion.img src={ev.image} alt={ev.title} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
          animate={{ scale: hov ? 1.06 : 1 }} transition={{ duration: 0.6 }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '26px 24px' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.24em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 8 }}>
          {ev.category} · {dateFmt(ev.date)}
        </p>
        <h3 style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.cream, fontWeight: 500, marginBottom: 6, lineHeight: 1.15 }}>{ev.title}</h3>
        <motion.div animate={{ width: hov ? '100%' : 0 }} transition={{ duration: 0.35 }} style={{ height: 1.5, background: COLORS.accent, marginTop: 14 }} />
      </div>
    </motion.div>
  )
}

export default function UpcomingEvents() {
  const upcoming = EVENTS.filter(e => e.date).slice(0, 3)
  return (
    <section style={{ background: COLORS.greenDark, padding: '120px 28px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <SectionLabel index="04" label="Agenda" color={COLORS.accent} align="center" style={{ marginBottom: 16, justifyContent: 'center' }} />
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(32px, 4.5vw, 52px)', color: COLORS.cream, fontWeight: 400 }}>Eventos &amp; Experiencias</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 56 }}>
          {upcoming.map((ev, i) => <EventCard key={ev.id} ev={ev} index={i} />)}
        </div>
        <Reveal>
          <div style={{ textAlign: 'center' }}>
            <Button to="/eventos" variant="outline-dark">Ver agenda completa</Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
