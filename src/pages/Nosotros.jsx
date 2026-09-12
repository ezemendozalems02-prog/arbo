import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'

const C = {
  dark:    '#1F2E24',
  deep:    '#314D39',
  mid:     '#4C6B50',
  moss:    '#8B9E78',
  beige:   '#D9D2C3',
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
  return <motion.div ref={ref} initial={{ opacity: 0, y: 44 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.75, delay, ease: 'easeOut' }} style={style}>{children}</motion.div>
}

function FadeIn({ children, delay = 0, dir = 'up', style = {} }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const from = { opacity: 0, x: dir === 'left' ? -60 : dir === 'right' ? 60 : 0, y: dir === 'up' ? 44 : 0 }
  return <motion.div ref={ref} initial={from} animate={v ? { opacity: 1, x: 0, y: 0 } : {}} transition={{ duration: 0.85, delay, ease: 'easeOut' }} style={style}>{children}</motion.div>
}

const pilares = [
  {
    label: 'Lo Natural',
    sub: 'Plantas, madera, luz, café',
    color: C.mid,
    text: 'Las plantas no son decoración — son la arquitectura. Más de cuarenta especies viven en el espacio: helechos colgantes, monsteras trepadoras, pothos que desbordan los estantes. La madera sin barnizar, la luz que entra cruda al mediodía, el aroma del espresso recién extraído.',
  },
  {
    label: 'Lo Sensorial',
    sub: 'Aromas, música, textura, pausa',
    color: C.gold,
    text: 'El cortado que llega en cerámica hecha a mano. La playlist analógica que nunca repite. El bowl de quinoa que huele a estación. MOULI es un lugar que se vive antes de que te des cuenta de que lo estás viviendo.',
  },
  {
    label: 'Lo Humano',
    sub: 'Encuentros, charlas, tiempo real',
    color: C.moss,
    text: 'No diseñamos MOULI para el delivery. Lo construimos para quedarse. Para la reunión que dura dos horas más de lo planeado, el trabajo que avanza mejor entre plantas, la conversación que necesitaba ese café para empezar.',
  },
]

export default function NuestraSelva() {
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const imgY = useTransform(scrollY, [0, 600], [0, 140])

  return (
    <div>
      {/* HERO */}
      <section ref={heroRef} style={{ position: 'relative', height: '72vh', minHeight: 520, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <motion.div style={{ position: 'absolute', inset: '-15%', y: imgY }}>
          <img src="https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1600&q=80" alt="Nuestra Selva"
            style={{ width: '100%', height: '130%', objectFit: 'cover' }} />
        </motion.div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(31,46,36,0.25) 0%, rgba(20,32,22,0.88) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px 88px' }}>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.44em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>
            — Thames 1786, Palermo —
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(46px, 8vw, 96px)', color: C.cream, lineHeight: 0.95, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 18 }}>
            Nuestra Selva
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, color: C.gold, fontStyle: 'italic', marginBottom: 0 }}>
            "La jungla escondida en Palermo."
          </motion.p>
          <motion.div initial={{ width: 0 }} animate={{ width: 56 }} transition={{ delay: 0.72, duration: 0.5 }}
            style={{ height: 1.5, background: C.gold, margin: '20px auto 0', opacity: 0.7 }} />
        </div>
      </section>

      {/* NARRATIVA */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '100px 28px' }}>
        {[
          {
            tag: 'El Origen',
            title: 'Una jungla que nació de una pregunta',
            body: [
              'MOULI empezó de una manera simple: queríamos un lugar donde quedarse. No un bar de paso, no un café donde la presión de desocupar la mesa se siente en el air. Un espacio real, con plantas reales, con café de verdad.',
              'El nombre viene del sánscrito. Mouli significa "corona" o "cima" — lo más alto. Pero también evoca algo más orgánico: un punto de encuentro, el centro de algo vivo. Eso quisimos construir en Palermo.',
            ],
          },
          {
            tag: 'El Espacio',
            title: 'La selva que creció adentro',
            body: [
              'Antes de pensar en el menú, pensamos en las plantas. Cada especie fue elegida por su capacidad de crear atmósfera: las monsteras que filtran la luz, los helechos que humedecen el ambiente, las pothos que trepan por los estantes de madera.',
              'El resultado es un espacio que se transforma con las estaciones. En verano, la luz entra cruda y las plantas explotan. En invierno, la selva se vuelve refugio — oscura, cálida, envolvente.',
            ],
          },
          {
            tag: 'El Café',
            title: 'De origen único, siempre',
            body: [
              'Trabajamos con tostadores seleccionados que priorizan el origen único y la trazabilidad. Cada mes rotamos la variedad del filtrado y del espresso, para que cada visita tenga algo nuevo que descubrir.',
              'El equipo de baristas conoce cada variedad que sirven. Pueden hablar del terroir del café etíope lo mismo que del proceso de fermentación del costarricense. Pero no hace falta saber nada — alcanza con pedirlo y confiar.',
            ],
          },
          {
            tag: 'La Cocina',
            title: 'Estación, origen, honestidad',
            body: [
              'La carta cambia cada dos meses según lo que ofrece la estación. Trabajamos con productores locales del cinturón verde de Buenos Aires. Nada congelado, nada artificial, nada que no podamos rastrear hasta su origen.',
              'El brunch del domingo es una institución propia: largo, generoso, sin apuro. La cocina del mediodía combina técnica moderna con ingredientes simples. Todo tiene nombres directos: lo que dice el menú es lo que llega al plato.',
            ],
          },
        ].map(({ tag, title, body }, i) => (
          <FadeUp key={tag} delay={0} style={{ marginBottom: 76, paddingLeft: i % 2 === 1 ? 30 : 0, borderLeft: i % 2 === 1 ? `2px solid rgba(76,107,80,0.35)` : 'none' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.32em', color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>{tag}</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 3.5vw, 42px)', color: C.cream, fontWeight: 400, marginBottom: 24, lineHeight: 1.2 }}>{title}</h2>
            {body.map((p, j) => (
              <p key={j} style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, color: C.muted, lineHeight: 1.9, marginBottom: 18 }}>{p}</p>
            ))}
          </FadeUp>
        ))}
      </section>

      {/* PALERMO */}
      <section style={{ background: C.deep, padding: '100px 28px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 68, alignItems: 'center' }}>
          <FadeIn dir="left">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.32em', color: C.gold, textTransform: 'uppercase', marginBottom: 16 }}>Palermo</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 3.5vw, 46px)', color: C.cream, fontWeight: 400, marginBottom: 24, lineHeight: 1.15 }}>El barrio que nos eligió</h2>
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, color: C.muted, lineHeight: 1.9, marginBottom: 20 }}>
              Palermo cambió muchas veces. Del barrio obrero al arty, del arty al turístico, del turístico al que volvió a ser de los de siempre — con capas nuevas encima. Thames 1786 está en ese Palermo de síntesis.
            </p>
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, color: C.muted, lineHeight: 1.9 }}>
              A pasos del bosque, cerca de las plazas donde la gente lleva a sus perros los domingos a la mañana. En una cuadra tranquila, con árboles que tocan los balcones. MOULI llegó a este lugar porque aquí ya había algo selvático.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 34 }}>
              {['Palermo Soho', 'Bosques de Palermo', 'Plazas y parques', 'Barrio artístico'].map(p => (
                <div key={p} style={{ background: 'rgba(31,46,36,0.7)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', border: '1px solid rgba(76,107,80,0.2)' }}>
                  <span style={{ color: C.gold, fontSize: 12 }}>✦</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.cream }}>{p}</span>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn dir="right" delay={0.1}>
            <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80" alt="Palermo"
              style={{ width: '100%', height: 500, objectFit: 'cover' }} />
          </FadeIn>
        </div>
      </section>

      {/* PILARES */}
      <section style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 68 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>Nuestra filosofía</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 4vw, 52px)', color: C.cream, fontWeight: 400 }}>Los tres pilares de MOULI</h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {pilares.map(({ label, sub, color, text }) => (
              <FadeUp key={label}>
                <div style={{ padding: '42px 34px', border: '1px solid rgba(76,107,80,0.2)', background: 'rgba(49,77,57,0.3)', height: '100%' }}>
                  <div style={{ width: 36, height: 2, background: color, marginBottom: 24 }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color, fontWeight: 500, marginBottom: 8 }}>{label}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, marginBottom: 22 }}>{sub}</p>
                  <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, color: C.muted, lineHeight: 1.85 }}>{text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.deep, padding: '88px 28px', textAlign: 'center' }}>
        <FadeUp>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 26, color: C.gold, fontStyle: 'italic', marginBottom: 36, lineHeight: 1.5 }}>
            "Una pausa en la jungla de Palermo."
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" style={{ textDecoration: 'none' }}>
              <button
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: `2px solid ${C.gold}`, padding: '14px 38px', cursor: 'pointer', transition: 'all 0.28s' }}
                onMouseEnter={e => { e.target.style.background = 'transparent'; e.target.style.color = C.gold }}
                onMouseLeave={e => { e.target.style.background = C.gold; e.target.style.color = C.dark }}>
                Ver la Carta
              </button>
            </Link>
            <Link to="/contacto" style={{ textDecoration: 'none' }}>
              <button
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, background: 'transparent', border: `2px solid ${C.gold}`, padding: '14px 38px', cursor: 'pointer', transition: 'all 0.28s' }}
                onMouseEnter={e => { e.target.style.background = C.gold; e.target.style.color = C.dark }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = C.gold }}>
                Reservar Mesa
              </button>
            </Link>
          </div>
        </FadeUp>
      </section>
    </div>
  )
}
