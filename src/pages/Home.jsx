import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useSite } from '../context/SiteContext'

const C = {
  dark:    '#1F2E24',
  deep:    '#314D39',
  mid:     '#4C6B50',
  light:   '#6B8F6B',
  moss:    '#8B9E78',
  beige:   '#D9D2C3',
  sand:    '#C9BFA8',
  cream:   '#F3EFE7',
  gold:    '#B8A96A',
  muted:   'rgba(243,239,231,0.6)',
  mutedDark: 'rgba(31,46,36,0.65)',
}

function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 44 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.75, delay, ease: [0.25, 0.46, 0.45, 0.94] }} style={style}>
      {children}
    </motion.div>
  )
}

function FadeIn({ children, delay = 0, dir = 'up', style = {} }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const from = { opacity: 0, x: dir === 'left' ? -60 : dir === 'right' ? 60 : 0, y: dir === 'up' ? 44 : 0 }
  return (
    <motion.div ref={ref} initial={from} animate={v ? { opacity: 1, x: 0, y: 0 } : {}} transition={{ duration: 0.85, delay, ease: [0.25, 0.46, 0.45, 0.94] }} style={style}>
      {children}
    </motion.div>
  )
}

const featured = [
  {
    title: 'Tostada Jungle',
    desc: 'Sourdough artesanal, palta, tomates cherry, semillas tostadas y flores comestibles.',
    price: '$3.800',
    img: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=700&q=80',
    tag: 'Brunch',
  },
  {
    title: 'Flat White MOULI',
    desc: 'Doble ristretto de origen único, leche oat vaporizada y arte latte de la casa.',
    price: '$2.200',
    img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&q=80',
    tag: 'Café',
  },
  {
    title: 'Bowl de la Selva',
    desc: 'Quinoa, verduras asadas de estación, kale crujiente y aliño de tahini con limón.',
    price: '$5.800',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80',
    tag: 'Cocina',
  },
  {
    title: 'Aperitivo Verde',
    desc: 'Gin botánico, pepino, elderflower, tónica artesanal y hierbas frescas.',
    price: '$4.200',
    img: 'https://images.unsplash.com/photo-1464219222984-216ebffaaf85?w=700&q=80',
    tag: 'Tragos',
  },
]

const eventos = [
  { day: 'Jueves', title: 'Jazz Nights', desc: 'Trío en vivo, medianoche en la jungla.', img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=700&q=80' },
  { day: 'Viernes', title: 'Noches de Vinilo', desc: 'DJ set analógico, tragos de autor.', img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=700&q=80' },
  { day: 'Domingo', title: 'Brunch Social', desc: 'Brunch largo, música suave, mesa grande.', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80' },
]

function DishCard({ dish, delay }) {
  const [hov, setHov] = useState(false)
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 50 }} animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, delay, ease: 'easeOut' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: C.deep, border: `1px solid ${hov ? 'rgba(184,169,106,0.35)' : 'rgba(76,107,80,0.2)'}`, transition: 'border-color 0.35s, transform 0.35s', transform: hov ? 'translateY(-4px)' : 'none' }}>

      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 3, background: 'rgba(31,46,36,0.85)', backdropFilter: 'blur(8px)', padding: '4px 12px', border: '1px solid rgba(184,169,106,0.3)' }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase' }}>{dish.tag}</span>
      </div>

      <div style={{ height: 280, overflow: 'hidden' }}>
        <motion.img src={dish.img} alt={dish.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          animate={{ scale: hov ? 1.07 : 1 }} transition={{ duration: 0.55 }} />
      </div>

      <motion.div
        initial={{ y: '100%' }} animate={{ y: hov ? '0%' : '100%' }} transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ position: 'absolute', bottom: 80, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(31,46,36,0.96))', padding: '48px 22px 18px' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(243,239,231,0.8)', lineHeight: 1.7 }}>{dish.desc}</p>
      </motion.div>

      <div style={{ padding: '18px 22px', borderTop: '1px solid rgba(76,107,80,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.cream, fontWeight: 500 }}>{dish.title}</h3>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.gold, fontWeight: 600 }}>{dish.price}</span>
        </div>
      </div>
    </motion.div>
  )
}

function EventCard({ ev, delay }) {
  const [hov, setHov] = useState(false)
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }} animate={v ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
      <div style={{ height: 380, overflow: 'hidden' }}>
        <motion.img src={ev.img} alt={ev.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: hov ? 'brightness(0.55)' : 'brightness(0.45)' }}
          animate={{ scale: hov ? 1.06 : 1 }} transition={{ duration: 0.6 }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '28px 26px' }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.25em', color: C.gold, textTransform: 'uppercase', marginBottom: 8 }}>{ev.day}</p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, color: C.cream, fontWeight: 500, marginBottom: 8, lineHeight: 1.15 }}>{ev.title}</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(243,239,231,0.75)', lineHeight: 1.6 }}>{ev.desc}</p>
        <motion.div animate={{ width: hov ? '100%' : 0 }} transition={{ duration: 0.35 }}
          style={{ height: 1.5, background: C.gold, marginTop: 18 }} />
      </div>
    </motion.div>
  )
}

export default function Home() {
  const { data } = useSite()
  const promos = data.promos.filter(p => p.visible !== false)
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const imgY = useTransform(scrollY, [0, 800], [0, 180])
  const textY = useTransform(scrollY, [0, 500], [0, 60])

  return (
    <div>
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div style={{ position: 'absolute', inset: '-20%', y: imgY }}>
          <img
            src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1800&q=85"
            alt="MOULI — Café en Palermo"
            style={{ width: '100%', height: '140%', objectFit: 'cover' }}
          />
        </motion.div>

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(31,46,36,0.35) 0%, rgba(31,46,36,0.6) 50%, rgba(20,32,22,0.96) 100%)' }} />

        <motion.div style={{ position: 'relative', textAlign: 'center', padding: '0 24px', maxWidth: 860, zIndex: 2, y: textY }}>
          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.48em', color: C.gold, textTransform: 'uppercase', marginBottom: 24, opacity: 0.9 }}>
            — Palermo, Buenos Aires —
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(72px, 13vw, 148px)', color: C.cream, lineHeight: 0.9, marginBottom: 30, fontWeight: 500, letterSpacing: '0.06em' }}>
            MOULI
          </motion.h1>

          <motion.div
            initial={{ width: 0 }} animate={{ width: 64 }} transition={{ delay: 0.85, duration: 0.7 }}
            style={{ height: 1, background: C.gold, margin: '0 auto 28px', opacity: 0.7 }} />

          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(18px, 2.5vw, 24px)', color: C.cream, fontStyle: 'italic', opacity: 0.85, marginBottom: 8, lineHeight: 1.5 }}>
            Un café de especialidad. Un restaurante.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.05 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 'clamp(18px, 2.5vw, 24px)', color: C.gold, fontStyle: 'italic', marginBottom: 48, lineHeight: 1.5 }}>
            Y la selva que despierta en la ciudad.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.2 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" style={{ textDecoration: 'none' }}>
              <button
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: `2px solid ${C.gold}`, padding: '15px 40px', cursor: 'pointer', transition: 'all 0.28s' }}
                onMouseEnter={e => { e.target.style.background = 'transparent'; e.target.style.color = C.gold }}
                onMouseLeave={e => { e.target.style.background = C.gold; e.target.style.color = C.dark }}>
                VER MENÚ
              </button>
            </Link>
            <Link to="/contacto" style={{ textDecoration: 'none' }}>
              <button
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.cream, background: 'transparent', border: `2px solid rgba(243,239,231,0.45)`, padding: '15px 40px', cursor: 'pointer', transition: 'all 0.28s' }}
                onMouseEnter={e => { e.target.style.borderColor = C.cream; e.target.style.background = 'rgba(243,239,231,0.08)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(243,239,231,0.45)'; e.target.style.background = 'transparent' }}>
                RESERVAR MESA
              </button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
          style={{ position: 'absolute', bottom: 36, left: '50%', zIndex: 2 }}
          className="bounce-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" opacity="0.7"><polyline points="6 9 12 15 18 9"/></svg>
        </motion.div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════ */}
      <div style={{ background: C.deep, borderTop: `1px solid rgba(184,169,106,0.2)`, borderBottom: `1px solid rgba(184,169,106,0.2)`, padding: '14px 0', overflow: 'hidden' }}>
        <div className="marquee-track">
          {[1, 2].map(k => (
            <span key={k} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: 500, letterSpacing: '0.32em', color: C.gold, textTransform: 'uppercase', opacity: 0.85 }}>
              &nbsp;&nbsp;CAFÉ DE ESPECIALIDAD&nbsp;&nbsp;·&nbsp;&nbsp;BRUNCH&nbsp;&nbsp;·&nbsp;&nbsp;PALERMO&nbsp;&nbsp;·&nbsp;&nbsp;JAZZ NIGHTS&nbsp;&nbsp;·&nbsp;&nbsp;PLANTAS&nbsp;&nbsp;·&nbsp;&nbsp;SELVA URBANA&nbsp;&nbsp;·&nbsp;&nbsp;COCINA DE ESTACIÓN&nbsp;&nbsp;·&nbsp;&nbsp;APERITIVO VERDE&nbsp;&nbsp;·&nbsp;&nbsp;ENCUENTROS&nbsp;&nbsp;·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ══ NUESTRA SELVA (teaser) ════════════════════════════ */}
      <section style={{ padding: '110px 28px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 80, alignItems: 'center' }}>
          <FadeIn dir="left">
            <div style={{ position: 'relative' }}>
              <div style={{ overflow: 'hidden' }}>
                <img src="/jungla-escondida.jpg" alt="La selva interior de MOULI"
                  style={{ width: '100%', height: 560, objectFit: 'cover' }} className="float-leaf-slow" />
              </div>
              <div style={{ position: 'absolute', bottom: -22, right: -22, background: C.gold, padding: '18px 26px', zIndex: 2 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: C.dark, lineHeight: 1, fontWeight: 700 }}>1786</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: C.dark, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3 }}>Thames, Palermo</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn dir="right" delay={0.12}>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>Nuestra Selva</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4vw, 54px)', color: C.cream, lineHeight: 1.1, marginBottom: 28, fontWeight: 400 }}>
                La jungla escondida<br /><em style={{ color: C.gold, fontStyle: 'italic' }}>en Palermo</em>
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.muted, lineHeight: 1.95, marginBottom: 28 }}>
                MOULI nació de una pregunta simple: ¿dónde queremos estar cuando necesitamos una pausa? La respuesta fue siempre la misma — en un lugar con plantas, buen café y tiempo real para hablar.
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.muted, lineHeight: 1.95, marginBottom: 40 }}>
                Construimos eso en el corazón de Palermo. Una jungla urbana donde la vegetación trepadora convive con el espresso de origen único y la cocina de estación.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44 }}>
                {[
                  'Café de especialidad, filtrado y cold brew',
                  'Cocina honesta con productos de estación',
                  'Más de 40 especies de plantas en el espacio',
                  'Eventos culturales, jazz y noches de vinilo',
                  'Espacio artístico y punto de encuentro',
                ].map(t => (
                  <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, color: C.mid, marginTop: 2 }}>✦</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.cream, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
              <Link to="/nuestra-selva" style={{ textDecoration: 'none' }}>
                <button
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, background: 'transparent', border: `1.5px solid ${C.gold}`, padding: '13px 30px', cursor: 'pointer', transition: 'all 0.28s' }}
                  onMouseEnter={e => { e.target.style.background = C.gold; e.target.style.color = C.dark }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = C.gold }}>
                  Conocer Nuestra Selva
                </button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ EXPERIENCIA MOULI ════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '110px 28px', overflow: 'hidden', background: C.deep }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>Lo que somos</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4.5vw, 56px)', color: C.cream, fontWeight: 400, marginBottom: 18 }}>La Experiencia MOULI</h2>
            <div style={{ width: 48, height: 1, background: C.gold, margin: '0 auto', opacity: 0.6 }} />
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {[
              {
                icon: '🌱',
                label: 'Lo Natural',
                sub: 'Las plantas, la madera, el café, la luz',
                text: 'Más de cuarenta especies viven en el espacio. La madera sin tratar, la luz filtrada entre hojas, el aroma del espresso. Lo natural no es una estética — es la estructura del lugar.',
                color: C.mid,
              },
              {
                icon: '☕',
                label: 'Lo Sensorial',
                sub: 'Los aromas, la música, la experiencia',
                text: 'El flat white que llega en taza de cerámica artesanal. La playlist que nunca repite. La textura del sourdough tostado. MOULI es un espacio que se vive a través de los sentidos.',
                color: C.gold,
              },
              {
                icon: '🌿',
                label: 'Lo Humano',
                sub: 'Los encuentros, las charlas, la pausa',
                text: 'No diseñamos MOULI para el delivery. Lo construimos para quedarse. Para la conversación que se alarga, el trabajo que avanza mejor con plantas alrededor, la reunión que termina siendo algo más.',
                color: C.moss,
              },
            ].map(({ icon, label, sub, text, color }, i) => (
              <FadeUp key={label} delay={i * 0.1}>
                <div style={{ padding: '44px 34px', background: 'rgba(31,46,36,0.6)', border: '1px solid rgba(76,107,80,0.25)', height: '100%', backdropFilter: 'blur(8px)' }}>
                  <div style={{ fontSize: 28, marginBottom: 20 }}>{icon}</div>
                  <div style={{ width: 36, height: 2, background: color, marginBottom: 22 }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color, fontWeight: 500, marginBottom: 8 }}>{label}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, marginBottom: 22 }}>{sub}</p>
                  <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, color: C.muted, lineHeight: 1.85 }}>{text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MENÚ DESTACADO ═══════════════════════════════════ */}
      <section style={{ padding: '110px 28px', background: C.dark }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>Lo que no podés perderte</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4.5vw, 56px)', color: C.cream, fontWeight: 400 }}>Menú Destacado</h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {featured.map((d, i) => <DishCard key={d.title} dish={d} delay={i * 0.1} />)}
          </div>
          <FadeUp style={{ textAlign: 'center', marginTop: 56 }}>
            <Link to="/menu" style={{ textDecoration: 'none' }}>
              <button
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.gold, background: 'transparent', border: `1.5px solid ${C.gold}`, padding: '15px 44px', cursor: 'pointer', transition: 'all 0.28s' }}
                onMouseEnter={e => { e.target.style.background = C.gold; e.target.style.color = C.dark }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = C.gold }}>
                VER CARTA COMPLETA
              </button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ══ EVENTOS EN LA JUNGLA ═════════════════════════════ */}
      <section style={{ position: 'relative', padding: '110px 28px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1600&q=70" alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,32,22,0.88)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1320, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>Agenda semanal</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4.5vw, 56px)', color: C.cream, fontWeight: 400 }}>Eventos en la Jungla</h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {eventos.map((ev, i) => <EventCard key={ev.title} ev={ev} delay={i * 0.1} />)}
          </div>
          <FadeUp style={{ textAlign: 'center', marginTop: 56 }}>
            <Link to="/galeria" style={{ textDecoration: 'none' }}>
              <button
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.cream, background: 'transparent', border: `1.5px solid rgba(243,239,231,0.4)`, padding: '15px 44px', cursor: 'pointer', transition: 'all 0.28s' }}
                onMouseEnter={e => { e.target.style.borderColor = C.cream }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(243,239,231,0.4)' }}>
                VER AGENDA COMPLETA
              </button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ══ PRÓXIMO EVENTO BANNER ═══════════════════════════ */}
      <section style={{ background: C.dark, borderTop: '1px solid rgba(184,169,106,0.18)', borderBottom: '1px solid rgba(184,169,106,0.18)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div style={{ overflow: 'hidden', minHeight: 380 }}>
            <img src="/banner-evento.jpg" alt="Jazz en la Jungla"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', minHeight: 380, display: 'block' }} />
          </div>
          <FadeUp style={{ display: 'flex' }}>
            <div style={{ padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, letterSpacing: '0.4em', color: C.gold, textTransform: 'uppercase', display: 'inline-block', marginBottom: 20, background: 'rgba(184,169,106,0.1)', padding: '5px 14px', border: '1px solid rgba(184,169,106,0.2)', width: 'fit-content' }}>
                ✦ Próximo Evento
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4vw, 54px)', color: C.cream, fontWeight: 400, marginBottom: 20, lineHeight: 1.1 }}>
                Jazz en la Jungla
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
                {[
                  { icon: '📅', text: 'Martes 19/05 · 20:30 hs' },
                  { icon: '📍', text: 'Borges 2205, Palermo' },
                  { icon: '🎷', text: 'Trío de jazz en vivo · Entrada libre' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="https://wa.me/541144445678" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: 'none', padding: '13px 32px', cursor: 'pointer', transition: 'background 0.25s' }}
                    onMouseEnter={e => e.target.style.background = '#cfc080'}
                    onMouseLeave={e => e.target.style.background = C.gold}>
                    Reservar lugar
                  </button>
                </a>
                <Link to="/galeria" style={{ textDecoration: 'none' }}>
                  <button
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, background: 'transparent', border: `1.5px solid rgba(184,169,106,0.45)`, padding: '13px 32px', cursor: 'pointer', transition: 'all 0.25s' }}
                    onMouseEnter={e => { e.target.style.borderColor = C.gold }}
                    onMouseLeave={e => { e.target.style.borderColor = 'rgba(184,169,106,0.45)' }}>
                    Ver agenda
                  </button>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══ PROMOS ═══════════════════════════════════════════ */}
      <section style={{ background: C.deep, padding: '100px 28px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>Del día</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 4vw, 50px)', color: C.cream, fontWeight: 400 }}>Combos de la Casa</h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {promos.map(({ label, price, id }, i) => (
              <FadeUp key={id || label} delay={i * 0.08}>
                <div style={{ background: 'rgba(31,46,36,0.7)', padding: '34px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 158, border: '1px solid rgba(76,107,80,0.2)', backdropFilter: 'blur(8px)' }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, color: C.cream, fontWeight: 400, lineHeight: 1.4 }}>{label}</p>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: C.gold, fontWeight: 600, marginTop: 18 }}>${price}</span>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RESERVAS CTA ═════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '120px 28px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="/jungla-2.jpg" alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,32,22,0.9) 0%, rgba(31,46,36,0.85) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 660, margin: '0 auto' }}>
          <FadeUp>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>Reservas & consultas</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 60px)', color: C.cream, lineHeight: 1.1, marginBottom: 26, fontWeight: 400 }}>
              ¿Querés reservar<br /><em style={{ color: C.gold, fontStyle: 'italic' }}>tu mesa?</em>
            </h2>
            <div style={{ width: 48, height: 1, background: C.gold, margin: '0 auto 28px', opacity: 0.6 }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: C.muted, lineHeight: 1.9, marginBottom: 44 }}>
              Escribinos por WhatsApp y confirmamos enseguida.<br />
              También podés visitarnos sin reserva — siempre hay lugar en la jungla.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://wa.me/541144445678" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: 'none', padding: '16px 44px', cursor: 'pointer', transition: 'background 0.28s' }}
                  onMouseEnter={e => e.target.style.background = '#cfc080'}
                  onMouseLeave={e => e.target.style.background = C.gold}>
                  RESERVAR EXPERIENCIA
                </button>
              </a>
              <Link to="/contacto" style={{ textDecoration: 'none' }}>
                <button
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.cream, background: 'transparent', border: `1.5px solid rgba(243,239,231,0.4)`, padding: '16px 44px', cursor: 'pointer', transition: 'all 0.28s' }}
                  onMouseEnter={e => { e.target.style.borderColor = C.cream }}
                  onMouseLeave={e => { e.target.style.borderColor = 'rgba(243,239,231,0.4)' }}>
                  VER CONTACTO
                </button>
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
