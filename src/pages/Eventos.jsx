import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLORS, FONTS } from '../styles/theme'
import { SITE } from '../data/site'
import { EVENT_CATEGORIES, EVENTS } from '../data/events'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import Portal from '../components/ui/Portal'
import { CloseIcon } from '../components/ui/icons'

const money = (n) => n ? `$${n.toLocaleString('es-AR')}` : ''
const dateFmt = (iso) => iso ? new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'A confirmar'

function EventCard({ ev, onOpen }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55 }}
      style={{
        background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', textAlign: 'left', width: '100%', padding: 0, font: 'inherit',
        color: 'inherit', borderRadius: 0,
      }}
      onClick={() => onOpen(ev)}
      aria-label={`Ver experiencia: ${ev.title}`}
    >
      <div style={{ height: 220, overflow: 'hidden' }}>
        <img src={ev.image} alt={ev.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '22px 22px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.2em', color: COLORS.green, textTransform: 'uppercase' }}>{ev.category}</span>
          <span style={{ fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.16em', background: COLORS.greenSoft, color: COLORS.green, padding: '3px 10px', textTransform: 'uppercase' }}>
            {ev.date ? dateFmt(ev.date) : 'A convenir'}
          </span>
        </div>
        <h3 style={{ fontFamily: FONTS.serif, fontSize: 25, color: COLORS.greenDark, fontWeight: 500, marginBottom: 10, lineHeight: 1.15 }}>{ev.title}</h3>
        <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, lineHeight: 1.65, marginBottom: 18, flex: 1 }}>{ev.description}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.green, fontWeight: 600 }}>
            {ev.priceLabel || money(ev.price) || 'Consultar'}
          </span>
          <span style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.greenDark, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Ver experiencia
          </span>
        </div>
      </div>
    </motion.button>
  )
}

function EventModal({ ev, onClose }) {
  const waMsg = encodeURIComponent(`Hola Arbo! Quiero reservar mi lugar en "${ev.title}".`)
  useLockBodyScroll(true)
  return (
    <Portal>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,20,0.75)', zIndex: 600 }} />
      <motion.div
        role="dialog" aria-modal="true" aria-label={ev.title}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.3 }}
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 601,
          background: COLORS.cream, width: 'min(560px, calc(100vw - 32px))', maxHeight: '86vh', overflowY: 'auto',
        }}>
        <div style={{ position: 'relative', height: 220 }}>
          <img src={ev.image} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={onClose} aria-label="Cerrar"
            style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(12,16,20,0.6)', border: 'none', color: COLORS.cream, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <CloseIcon width={16} height={16} />
          </button>
        </div>
        <div style={{ padding: '32px 32px 36px' }}>
          <span style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.24em', color: COLORS.green, textTransform: 'uppercase' }}>{ev.category}</span>
          <h2 style={{ fontFamily: FONTS.serif, fontSize: 32, color: COLORS.greenDark, margin: '10px 0 16px', lineHeight: 1.1 }}>{ev.title}</h2>
          <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, lineHeight: 1.85, marginBottom: 22 }}>{ev.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 14, marginBottom: 22 }}>
            <div><p style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.onLightFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Fecha</p><p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.greenDark, textTransform: 'capitalize' }}>{dateFmt(ev.date)}</p></div>
            {ev.time && <div><p style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.onLightFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Hora</p><p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.greenDark }}>{ev.time} hs</p></div>}
            {ev.duration && <div><p style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.onLightFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Duración</p><p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.greenDark }}>{ev.duration}</p></div>}
            {ev.capacity && <div><p style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.onLightFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Cupos</p><p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.greenDark }}>{ev.availableSpots} de {ev.capacity} disponibles</p></div>}
          </div>

          {ev.includes && (
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.onLightFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Incluye</p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {ev.includes.map(i => <li key={i} style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, lineHeight: 1.9 }}>{i}</li>)}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.green, fontWeight: 600 }}>{ev.priceLabel || money(ev.price) || 'Consultar'}</span>
            {ev.demo && <span style={{ fontFamily: FONTS.sans, fontSize: 9, color: COLORS.onLightFaint }}>Datos demostrativos</span>}
          </div>

          <Button full href={`https://wa.me/${SITE.contact.whatsapp}?text=${waMsg}`} target="_blank" rel="noopener noreferrer">
            Reservar mi lugar
          </Button>
        </div>
      </motion.div>
    </Portal>
  )
}

export default function Eventos() {
  useEffect(() => { document.title = 'Eventos & Experiencias | Arbo Patagonia' }, [])
  const [filter, setFilter] = useState('Todos')
  const [active, setActive] = useState(null)
  const filtered = filter === 'Todos' ? EVENTS : EVENTS.filter(e => e.category === filter)

  return (
    <div style={{ background: COLORS.cream, minHeight: '100vh' }}>
      <section style={{ position: 'relative', minHeight: '44vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 84, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=75" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(12,16,20,0.88) 0%, rgba(31,64,47,0.82) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '70px 24px 60px' }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.4em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 16 }}>Agenda Arbo</p>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(42px, 8vw, 76px)', color: COLORS.cream, fontWeight: 400, marginBottom: 14 }}>Eventos &amp; Experiencias</h1>
          <p style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.accent, fontStyle: 'italic' }}>Momentos que merecen un lugar especial.</p>
        </div>
      </section>

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '56px 28px 100px' }}>
        <Reveal>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
            {EVENT_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: filter === cat ? COLORS.cream : COLORS.onLightMuted,
                  background: filter === cat ? COLORS.green : 'transparent',
                  border: `1px solid ${filter === cat ? COLORS.green : COLORS.lineGreen}`,
                  padding: '9px 18px', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {filtered.length === 0 ? (
            <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
              No hay experiencias en esta categoría por ahora.
            </p>
          ) : filtered.map(ev => <EventCard key={ev.id} ev={ev} onOpen={setActive} />)}
        </div>
      </div>

      <AnimatePresence>
        {active && <EventModal ev={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
