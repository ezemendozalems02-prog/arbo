import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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
  return <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={v ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.65, delay, ease: 'easeOut' }} style={style}>{children}</motion.div>
}

function FadeIn({ children, delay = 0, dir = 'up', style = {} }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const from = { opacity: 0, x: dir === 'left' ? -50 : dir === 'right' ? 50 : 0, y: dir === 'up' ? 36 : 0 }
  return <motion.div ref={ref} initial={from} animate={v ? { opacity: 1, x: 0, y: 0 } : {}} transition={{ duration: 0.75, delay, ease: 'easeOut' }} style={style}>{children}</motion.div>
}

const infoItems = [
  {
    title: 'Dirección',
    lines: ['Thames 1786', 'Palermo, CABA', 'Buenos Aires, Argentina'],
    cta: { label: 'Ver en Maps', href: 'https://maps.google.com/?q=Thames+1786+Palermo+Buenos+Aires' },
  },
  {
    title: 'Teléfono',
    lines: ['11 4444-5678'],
    cta: { label: 'Llamar ahora', href: 'tel:+541144445678' },
  },
  {
    title: 'Horarios',
    lines: ['Martes a Domingo', '09:00 — 00:00', 'Lunes: cerrado'],
  },
  {
    title: 'WhatsApp',
    lines: ['Reservas y consultas', 'Respondemos enseguida'],
    cta: { label: 'Abrir WhatsApp', href: 'https://wa.me/541144445678', green: true },
  },
]

const transport = [
  { icon: '🚇', title: 'Subte', desc: 'Línea D — Estación Palermo (6 min a pie). Línea B — Estación Dorrego (10 min).' },
  { icon: '🚌', title: 'Colectivos', desc: 'Líneas 15, 34, 55, 93, 141 y 168 por Thames y avenidas cercanas.' },
  { icon: '🚗', title: 'Auto', desc: 'Estacionamiento en la calle o playa en Soler y Thames, a 200m.' },
  { icon: '🚴', title: 'EcoBici', desc: 'Estación a 80m en Thames y Honduras. Ciclovía disponible todo el barrio.' },
]

const HOURS = [
  { days: 'Lunes', time: 'Cerrado' },
  { days: 'Martes a Viernes', time: '09:00 — 00:00' },
  { days: 'Sábado y Domingo', time: '09:00 — 01:00' },
]

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', personas: '2', fecha: '', hora: '', mensaje: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const msg = encodeURIComponent(
      `Hola MOULI! Quiero reservar una mesa.\n\nNombre: ${form.nombre}\nPersonas: ${form.personas}\nFecha: ${form.fecha}\nHorario: ${form.hora}\n${form.mensaje ? `Nota: ${form.mensaje}` : ''}`
    )
    window.open(`https://wa.me/541144445678?text=${msg}`, '_blank')
    setSent(true)
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px', background: 'rgba(49,77,57,0.35)',
    border: '1px solid rgba(76,107,80,0.3)', color: C.cream,
    fontFamily: "'Inter', sans-serif", fontSize: 14, outline: 'none',
    transition: 'border-color 0.25s', appearance: 'none',
  }

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '44vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 76, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1600&q=75" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,32,22,0.9) 0%, rgba(31,46,36,0.85) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '80px 24px 64px' }}>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.44em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>
            MOULI · Palermo
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(46px, 8vw, 88px)', color: C.cream, lineHeight: 0.95, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 20 }}>
            Reservas & Contacto
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, color: C.gold, fontStyle: 'italic' }}>
            Reservá tu lugar en la jungla.
          </motion.p>
        </div>
      </section>

      {/* INFO CARDS */}
      <section style={{ background: C.deep, padding: '80px 28px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {infoItems.map(({ title, lines, cta }, i) => (
            <FadeUp key={title} delay={i * 0.08}>
              <div style={{ padding: '36px 30px', background: 'rgba(31,46,36,0.65)', border: '1px solid rgba(76,107,80,0.2)', height: '100%', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(8px)' }}>
                <div style={{ width: 28, height: 2, background: C.gold, marginBottom: 18, opacity: 0.7 }} />
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.28em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>{title}</h3>
                <div style={{ flex: 1 }}>
                  {lines.map((l, j) => (
                    <p key={j} style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: j === 1 ? C.cream : C.muted, lineHeight: 2, fontWeight: j === 1 ? 500 : 400 }}>{l}</p>
                  ))}
                </div>
                {cta && (
                  <a href={cta.href} target="_blank" rel="noopener noreferrer"
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: C.dark,
                      background: cta.green ? '#4C6B50' : C.gold,
                      padding: '10px 20px', textDecoration: 'none', display: 'inline-block',
                      marginTop: 22, transition: 'background 0.25s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = cta.green ? '#5a7d5e' : '#cfc080'}
                    onMouseLeave={e => e.currentTarget.style.background = cta.green ? '#4C6B50' : C.gold}>
                    {cta.label}
                  </a>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* RESERVAS FORM + MAPA */}
      <section style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 72, alignItems: 'start' }}>

          {/* FORM */}
          <FadeIn dir="left">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>Formulario</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 3.5vw, 46px)', color: C.cream, fontWeight: 400, marginBottom: 10, lineHeight: 1.15 }}>
              Reservar Experiencia
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 36 }}>
              Completá el formulario y te contactamos por WhatsApp para confirmar.
            </p>

            {sent ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '40px 32px', background: 'rgba(76,107,80,0.25)', border: '1px solid rgba(76,107,80,0.4)', textAlign: 'center' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: C.cream, marginBottom: 12 }}>¡Reserva enviada!</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
                  Te redirigimos a WhatsApp para confirmar. ¡Nos vemos en la jungla!
                </p>
                <button onClick={() => setSent(false)}
                  style={{ marginTop: 24, fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, background: 'transparent', border: `1.5px solid ${C.gold}`, padding: '11px 24px', cursor: 'pointer' }}>
                  Nueva Reserva
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Nombre *</label>
                  <input required type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Tu nombre"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = C.gold}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,107,80,0.3)'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Personas *</label>
                    <select required value={form.personas} onChange={e => setForm(f => ({ ...f, personas: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      onFocus={e => e.target.style.borderColor = C.gold}
                      onBlur={e => e.target.style.borderColor = 'rgba(76,107,80,0.3)'}>
                      {[1,2,3,4,5,6,7,8,10,12,15].map(n => <option key={n} value={n}>{n} persona{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Horario *</label>
                    <select required value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      onFocus={e => e.target.style.borderColor = C.gold}
                      onBlur={e => e.target.style.borderColor = 'rgba(76,107,80,0.3)'}>
                      <option value="">Seleccionar</option>
                      {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'].map(h => <option key={h} value={h}>{h}hs</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Fecha *</label>
                  <input required type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                    onFocus={e => e.target.style.borderColor = C.gold}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,107,80,0.3)'}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Mensaje o requerimientos</label>
                  <textarea value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                    placeholder="Alergias, ocasión especial, pedido de menú, etc."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
                    onFocus={e => e.target.style.borderColor = C.gold}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,107,80,0.3)'}
                  />
                </div>
                <button type="submit"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: 'none', padding: '16px 32px', cursor: 'pointer', transition: 'background 0.28s', marginTop: 8 }}
                  onMouseEnter={e => e.target.style.background = '#cfc080'}
                  onMouseLeave={e => e.target.style.background = C.gold}>
                  RESERVAR EXPERIENCIA →
                </button>
              </form>
            )}
          </FadeIn>

          {/* HORARIOS + MAPA */}
          <FadeIn dir="right" delay={0.1}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 18 }}>Horarios</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 3.5vw, 42px)', color: C.cream, fontWeight: 400, marginBottom: 30, lineHeight: 1.15 }}>
              ¿Cuándo venís?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 44, border: '1px solid rgba(76,107,80,0.2)' }}>
              {HOURS.map(({ days, time }, i) => (
                <div key={days} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: i < HOURS.length - 1 ? '1px solid rgba(76,107,80,0.15)' : 'none', background: i % 2 === 0 ? 'rgba(49,77,57,0.2)' : 'transparent' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.muted }}>{days}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: time === 'Cerrado' ? 'rgba(243,239,231,0.35)' : C.cream, fontWeight: 500 }}>{time}</span>
                </div>
              ))}
            </div>

            <div style={{ overflow: 'hidden', border: '1px solid rgba(76,107,80,0.25)', marginBottom: 28 }}>
              <iframe
                title="MOULI en el mapa"
                src="https://maps.google.com/maps?q=Thames+1786+Palermo+Buenos+Aires&output=embed"
                width="100%" height="280" style={{ display: 'block', border: 0, filter: 'grayscale(40%) contrast(1.1)' }}
                allowFullScreen loading="lazy"
              />
            </div>
            <a href="https://maps.google.com/?q=Thames+1786+Palermo+Buenos+Aires" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, background: 'transparent', border: `1.5px solid ${C.gold}`, padding: '12px 26px', cursor: 'pointer', transition: 'all 0.28s' }}
                onMouseEnter={e => { e.target.style.background = C.gold; e.target.style.color = C.dark }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = C.gold }}>
                Cómo Llegar →
              </button>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* CÓMO LLEGAR */}
      <section style={{ background: C.deep, padding: '80px 28px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <FadeUp style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.36em', color: C.gold, textTransform: 'uppercase', marginBottom: 14 }}>Llegada</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 3.5vw, 46px)', color: C.cream, fontWeight: 400 }}>Cómo Llegar a la Jungla</h2>
          </FadeUp>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {transport.map(({ icon, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.07}>
                <div style={{ padding: '32px 26px', background: 'rgba(31,46,36,0.6)', border: '1px solid rgba(76,107,80,0.18)', height: '100%' }}>
                  <div style={{ fontSize: 26, marginBottom: 14 }}>{icon}</div>
                  <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, letterSpacing: '0.2em', color: C.gold, textTransform: 'uppercase', marginBottom: 12 }}>{title}</h4>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.muted, lineHeight: 1.75 }}>{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 28px', textAlign: 'center', borderTop: '1px solid rgba(76,107,80,0.15)' }}>
        <FadeUp>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 24, color: C.gold, fontStyle: 'italic', marginBottom: 20 }}>
            "Siempre hay lugar en la jungla."
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.muted, marginBottom: 36, lineHeight: 1.8 }}>
            Sin reserva también podés venir — pero para grupos o noches especiales, recomendamos reservar.
          </p>
          <a href="https://wa.me/541144445678" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.dark, background: C.gold, border: 'none', padding: '16px 48px', cursor: 'pointer', transition: 'background 0.28s' }}
              onMouseEnter={e => e.target.style.background = '#cfc080'}
              onMouseLeave={e => e.target.style.background = C.gold}>
              Escribir por WhatsApp
            </button>
          </a>
        </FadeUp>
      </section>
    </div>
  )
}
