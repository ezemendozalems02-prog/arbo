import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

function PhotoCard({ photo, delay, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', breakInside: 'avoid', marginBottom: 16, border: `1px solid ${hov ? 'rgba(184,169,106,0.4)' : 'transparent'}`, transition: 'border-color 0.3s' }}
    >
      <motion.img src={photo.src} alt={photo.title} loading="lazy"
        style={{ width: '100%', display: 'block', objectFit: 'cover' }}
        animate={{ scale: hov ? 1.04 : 1 }} transition={{ duration: 0.48 }} />
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: hov ? 1 : 0 }} transition={{ duration: 0.25 }}
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,32,22,0.88) 0%, transparent 55%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '22px 18px' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', background: C.mid, color: C.cream, padding: '3px 10px', marginBottom: 8, display: 'inline-block', width: 'fit-content' }}>{photo.cat}</span>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(243,239,231,0.85)', lineHeight: 1.5 }}>{photo.title}</p>
      </motion.div>
    </motion.div>
  )
}

const eventsList = [
  {
    day: 'Cada Jueves',
    title: 'Jazz Nights',
    desc: 'Trío en vivo desde las 21hs. Reservas recomendadas.',
    img: '/evento-1.jpg',
    tag: 'Música en vivo',
  },
  {
    day: 'Cada Viernes',
    title: 'Noches de Vinilo',
    desc: 'DJ set analógico, tragos de autor y la jungla de noche.',
    img: '/evento-4.jpg',
    tag: 'DJ Set',
  },
  {
    day: 'Cada Domingo',
    title: 'Brunch Social',
    desc: 'Brunch largo de 10 a 15hs. Música suave, mesas grandes.',
    img: '/jungla-2.jpg',
    tag: 'Brunch',
  },
  {
    day: 'Mensual',
    title: 'Noches de Poesía',
    desc: 'Lectura de autores invitados. Entrada libre. Copa incluida.',
    img: '/evento-2.jpg',
    tag: 'Cultural',
  },
]

export default function Galeria() {
  const { data } = useSite()
  const photos = data.gallery.filter(p => p.visible !== false)
  const allCats = ['Todos', ...new Set(photos.map(p => p.cat))]
  const [filter, setFilter] = useState('Todos')
  const [lb, setLb] = useState(null)
  const [tab, setTab] = useState('galeria')

  const filtered = filter === 'Todos' ? photos : photos.filter(p => p.cat === filter)

  const prevPhoto = () => setLb(i => (i - 1 + filtered.length) % filtered.length)
  const nextPhoto = () => setLb(i => (i + 1) % filtered.length)

  useEffect(() => {
    const handler = (e) => {
      if (lb === null) return
      if (e.key === 'Escape') setLb(null)
      if (e.key === 'ArrowLeft') prevPhoto()
      if (e.key === 'ArrowRight') nextPhoto()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lb, filtered.length])

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '44vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 76, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1600&q=70" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,32,22,0.88) 0%, rgba(31,46,36,0.82) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 24px 64px' }}>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.44em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>
            MOULI · Agenda & Galería
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(46px, 8vw, 88px)', color: C.cream, lineHeight: 0.95, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 20 }}>
            Eventos & Galería
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, color: C.gold, fontStyle: 'italic' }}>
            Música, cultura y la selva de noche.
          </motion.p>
        </div>
      </section>

      {/* TABS */}
      <div style={{ background: 'rgba(31,46,36,0.97)', backdropFilter: 'blur(18px)', borderBottom: '1px solid rgba(76,107,80,0.25)', position: 'sticky', top: 76, zIndex: 98 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px', display: 'flex' }}>
          {[{ key: 'eventos', label: 'Eventos' }, { key: 'galeria', label: 'Galería' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: tab === key ? C.gold : 'rgba(243,239,231,0.55)', background: 'none', border: 'none', borderBottom: tab === key ? `2px solid ${C.gold}` : '2px solid transparent', padding: '18px 28px', cursor: 'pointer', transition: 'all 0.25s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── EVENTOS ── */}
        {tab === 'eventos' && (
          <motion.div key="eventos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div style={{ maxWidth: 1320, margin: '0 auto', padding: '72px 28px 100px' }}>
              <FadeUp style={{ textAlign: 'center', marginBottom: 64 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>Agenda Semanal</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 4vw, 52px)', color: C.cream, fontWeight: 400 }}>La Selva de Noche</h2>
              </FadeUp>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                {eventsList.map((ev, i) => (
                  <FadeUp key={ev.title} delay={i * 0.08}>
                    <div style={{ position: 'relative', overflow: 'hidden', background: C.deep, border: '1px solid rgba(76,107,80,0.2)' }}>
                      <div style={{ height: 260, overflow: 'hidden' }}>
                        <img src={ev.img} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }} />
                      </div>
                      <div style={{ padding: '28px 26px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase' }}>{ev.day}</span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.16em', background: C.mid, color: C.cream, padding: '3px 10px', textTransform: 'uppercase' }}>{ev.tag}</span>
                        </div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: C.cream, fontWeight: 400, marginBottom: 10, lineHeight: 1.15 }}>{ev.title}</h3>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{ev.desc}</p>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
              <FadeUp style={{ textAlign: 'center', marginTop: 60 }}>
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, color: C.gold, fontStyle: 'italic', marginBottom: 28 }}>
                  Eventos especiales y fechas únicas en nuestro Instagram
                </p>
                <a href="https://instagram.com/mouli.palermo" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: 'none', padding: '14px 36px', cursor: 'pointer', transition: 'background 0.28s' }}
                    onMouseEnter={e => e.target.style.background = '#cfc080'}
                    onMouseLeave={e => e.target.style.background = C.gold}>
                    Ver Instagram
                  </button>
                </a>
              </FadeUp>
            </div>
          </motion.div>
        )}

        {/* ── GALERÍA ── */}
        {tab === 'galeria' && (
          <motion.div key="galeria" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <div style={{ maxWidth: 1320, margin: '0 auto', padding: '56px 28px 100px' }}>
              {/* Filtros */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
                {allCats.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: filter === cat ? C.dark : C.muted,
                      background: filter === cat ? C.gold : 'transparent',
                      border: `1px solid ${filter === cat ? C.gold : 'rgba(76,107,80,0.3)'}`,
                      padding: '8px 18px', cursor: 'pointer', transition: 'all 0.25s',
                    }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Masonry grid */}
              <motion.div
                layout
                style={{ columns: '3 220px', columnGap: 16 }}>
                <AnimatePresence>
                  {filtered.map((photo, i) => (
                    <PhotoCard key={photo.id} photo={photo} delay={i * 0.04} onClick={() => setLb(i)} />
                  ))}
                </AnimatePresence>
              </motion.div>

              <FadeUp style={{ textAlign: 'center', marginTop: 60 }}>
                <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, color: C.gold, fontStyle: 'italic', marginBottom: 24 }}>
                  Seguinos para ver la jungla en tiempo real
                </p>
                <a href="https://instagram.com/mouli.palermo" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, background: 'transparent', border: `1.5px solid ${C.gold}`, padding: '14px 36px', cursor: 'pointer', transition: 'all 0.28s' }}
                    onMouseEnter={e => { e.target.style.background = C.gold; e.target.style.color = C.dark }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = C.gold }}>
                    @mouli.palermo
                  </button>
                </a>
              </FadeUp>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lb !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLb(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(20,32,22,0.96)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }}>
            <button onClick={e => { e.stopPropagation(); prevPhoto() }}
              style={{ position: 'absolute', left: 20, background: 'rgba(243,239,231,0.1)', border: '1px solid rgba(243,239,231,0.2)', color: '#fff', width: 48, height: 48, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(243,239,231,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(243,239,231,0.1)'}>‹</button>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '82vw', maxHeight: '82vh', textAlign: 'center' }}>
              <img src={filtered[lb]?.src} alt={filtered[lb]?.title} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(243,239,231,0.6)', marginTop: 14, letterSpacing: '0.1em' }}>
                {filtered[lb]?.title}
              </p>
            </motion.div>
            <button onClick={e => { e.stopPropagation(); nextPhoto() }}
              style={{ position: 'absolute', right: 20, background: 'rgba(243,239,231,0.1)', border: '1px solid rgba(243,239,231,0.2)', color: '#fff', width: 48, height: 48, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(243,239,231,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(243,239,231,0.1)'}>›</button>
            <button onClick={() => setLb(null)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(243,239,231,0.6)', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
