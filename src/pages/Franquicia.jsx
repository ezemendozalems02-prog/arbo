import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../styles/theme'
import { FRANCHISE } from '../data/franchise'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import { CheckIcon } from '../components/ui/icons'

const inputStyle = {
  width: '100%', padding: '13px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const label = { fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.16em', color: COLORS.onLightMuted, textTransform: 'uppercase', display: 'block', marginBottom: 8 }

function DossierForm() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', telefono: '', ciudad: '', capital: '', mensaje: '' })
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setSent(true) // DEMO — no hay backend; en producción esto envía el formulario a un endpoint real.
  }

  if (sent) {
    return (
      <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: '44px 36px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: COLORS.green, color: COLORS.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
          <CheckIcon width={24} height={24} />
        </div>
        <h3 style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.greenDark, marginBottom: 10 }}>Solicitud recibida</h3>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, lineHeight: 1.8 }}>
          Nuestro equipo va a contactarte para compartir el dossier de franquicias.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={label}>Nombre *</label>
        <input required style={inputStyle} value={form.nombre} onChange={set('nombre')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={label}>Empresa</label>
          <input style={inputStyle} value={form.empresa} onChange={set('empresa')} />
        </div>
        <div>
          <label style={label}>Ciudad / país</label>
          <input style={inputStyle} value={form.ciudad} onChange={set('ciudad')} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={label}>Email *</label>
          <input required type="email" style={inputStyle} value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label style={label}>Teléfono *</label>
          <input required style={inputStyle} value={form.telefono} onChange={set('telefono')} />
        </div>
      </div>
      <div>
        <label style={label}>Capital estimado disponible</label>
        <input style={inputStyle} value={form.capital} onChange={set('capital')} placeholder="Opcional" />
      </div>
      <div>
        <label style={label}>Mensaje</label>
        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }} value={form.mensaje} onChange={set('mensaje')} />
      </div>
      <Button type="submit" full>Solicitar dossier</Button>
    </form>
  )
}

export default function Franquicia() {
  useEffect(() => { document.title = 'Franquicias | Arbo Patagonia' }, [])

  return (
    <div style={{ background: COLORS.cream, minHeight: '100vh' }}>
      <section style={{ position: 'relative', minHeight: '48vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 84, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1600&q=75" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(12,16,20,0.9) 0%, rgba(31,64,47,0.85) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '70px 24px 60px', maxWidth: 760 }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.4em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 16 }}>Franquicias</p>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(36px, 6.5vw, 62px)', color: COLORS.cream, fontWeight: 400, lineHeight: 1.15, marginBottom: 18 }}>
            {FRANCHISE.headline}
          </h1>
          <p style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.onDarkMuted, lineHeight: 1.85 }}>{FRANCHISE.intro}</p>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 28px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.3em', color: COLORS.green, textTransform: 'uppercase', marginBottom: 14 }}>El concepto</p>
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(28px, 4vw, 44px)', color: COLORS.greenDark, fontWeight: 400 }}>Un modelo pensado para crecer</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
          {FRANCHISE.pillars.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.06}>
              <div style={{ padding: '32px 28px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, height: '100%' }}>
                <div style={{ width: 30, height: 2, background: COLORS.green, marginBottom: 18 }} />
                <h3 style={{ fontFamily: FONTS.serif, fontSize: 21, color: COLORS.greenDark, marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, lineHeight: 1.7 }}>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ background: COLORS.greenDark, padding: '90px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, marginBottom: 20 }}>
              {FRANCHISE.stats.map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: FONTS.serif, fontSize: 46, color: COLORS.accent, fontWeight: 500 }}>{s.value}</p>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', color: COLORS.onDarkMuted, textTransform: 'uppercase' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onDarkFaint, letterSpacing: '0.06em' }}>
              Datos demostrativos — no representan cifras confirmadas.
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 64 }}>
        <Reveal dir="left">
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.3em', color: COLORS.green, textTransform: 'uppercase', marginBottom: 16 }}>¿Por qué Arbo?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FRANCHISE.why.map(item => (
              <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: COLORS.green, marginTop: 3 }}><CheckIcon width={15} height={15} /></span>
                <span style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLight, lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal dir="right" delay={0.1}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.3em', color: COLORS.green, textTransform: 'uppercase', marginBottom: 16 }}>Quiero recibir información</p>
          <DossierForm />
        </Reveal>
      </section>
    </div>
  )
}
