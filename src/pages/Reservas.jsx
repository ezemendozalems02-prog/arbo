import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COLORS, FONTS } from '../styles/theme'
import { SITE } from '../data/site'
import Button from '../components/ui/Button'
import { CheckIcon } from '../components/ui/icons'

const TIMES = ['12:30', '13:00', '13:30', '19:30', '20:00', '20:30', '21:00']
const PARTY_SIZES = ['1', '2', '3', '4', '5', '6+']
const TABLE_TYPES = [
  { key: 'interior', label: 'Interior' },
  { key: 'ventana', label: 'Ventana' },
  { key: 'exterior', label: 'Exterior' },
  { key: 'preferencia', label: 'Sin preferencia' },
]
const STEPS = ['Fecha', 'Horario', 'Personas', 'Mesa', 'Datos', 'Confirmación']

const label = { fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.16em', color: COLORS.onLightMuted, textTransform: 'uppercase', display: 'block', marginBottom: 10 }
const inputStyle = {
  width: '100%', padding: '13px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

function PillGroup({ options, value, onChange, getLabel = (o) => o, getKey = (o) => o }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {options.map(opt => {
        const k = getKey(opt)
        const active = value === k
        return (
          <button key={k} onClick={() => onChange(k)}
            style={{
              padding: '13px 22px', fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
              border: `1.5px solid ${active ? COLORS.green : COLORS.lineGreen}`,
              background: active ? COLORS.green : 'transparent',
              color: active ? COLORS.cream : COLORS.onLight, cursor: 'pointer', transition: 'all 0.2s',
            }}>
            {getLabel(opt)}
          </button>
        )
      })}
    </div>
  )
}

export default function Reservas() {
  useEffect(() => { document.title = 'Reservas | Arbo Patagonia' }, [])
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ date: '', time: '', party: '2', table: 'interior', nombre: '', email: '', telefono: '' })
  const [reservationId, setReservationId] = useState(null)

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  const canNext = [
    !!data.date,
    !!data.time,
    !!data.party,
    !!data.table,
    data.nombre.trim() && data.email.trim() && data.telefono.trim(),
    true,
  ][step]

  const next = () => {
    if (step === 4) {
      setReservationId(`ARBO-${Math.floor(1000 + Math.random() * 9000)}`)
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => setStep(s => Math.max(s - 1, 0))

  const dateLabel = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  const resetAll = () => {
    setStep(0)
    setData({ date: '', time: '', party: '2', table: 'interior', nombre: '', email: '', telefono: '' })
    setReservationId(null)
  }

  return (
    <div style={{ background: COLORS.cream, minHeight: '100vh' }}>
      <section style={{ position: 'relative', minHeight: '38vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 84, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={SITE.images.momentos} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(12,16,20,0.9) 0%, rgba(31,64,47,0.85) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '70px 24px 56px' }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.4em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 16 }}>Reservas</p>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(42px, 8vw, 76px)', color: COLORS.cream, fontWeight: 400, marginBottom: 14 }}>Reservá tu mesa</h1>
          <p style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.accent, fontStyle: 'italic' }}>Tu próximo momento en Arbo empieza acá.</p>
        </div>
      </section>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 120px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 44 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 2, background: i <= step ? COLORS.green : COLORS.lineGreen, marginBottom: 8, transition: 'background 0.3s' }} />
              <span className="arbo-step-label" style={{ fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: i <= step ? COLORS.green : COLORS.onLightFaint }}>{s}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.3em', color: COLORS.green, textTransform: 'uppercase', marginBottom: 10 }}>
              Paso {step + 1} de {STEPS.length}
            </p>

            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, marginBottom: 26 }}>¿Qué día venís?</h2>
                <label style={label}>Fecha</label>
                <input type="date" min={minDate} value={data.date} onChange={e => setData(d => ({ ...d, date: e.target.value }))} style={inputStyle} />
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, marginBottom: 26 }}>Elegí el horario</h2>
                <PillGroup options={TIMES} value={data.time} onChange={v => setData(d => ({ ...d, time: v }))} />
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, marginBottom: 26 }}>¿Cuántos son?</h2>
                <PillGroup options={PARTY_SIZES} value={data.party} onChange={v => setData(d => ({ ...d, party: v }))} />
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, marginBottom: 26 }}>Preferencia de mesa</h2>
                <PillGroup options={TABLE_TYPES} value={data.table} onChange={v => setData(d => ({ ...d, table: v }))} getLabel={o => o.label} getKey={o => o.key} />
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, marginBottom: 26 }}>Tus datos</h2>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>Nombre *</label>
                  <input style={inputStyle} value={data.nombre} onChange={e => setData(d => ({ ...d, nombre: e.target.value }))} placeholder="Tu nombre" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>Email *</label>
                  <input type="email" style={inputStyle} value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} placeholder="tu@email.com" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>Teléfono *</label>
                  <input style={inputStyle} value={data.telefono} onChange={e => setData(d => ({ ...d, telefono: e.target.value }))} placeholder="Tu teléfono" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div style={{ textAlign: 'center' }}>
                {!reservationId ? null : (
                  <>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: COLORS.green, color: COLORS.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 26px' }}>
                      <CheckIcon width={26} height={26} />
                    </div>
                    <h2 style={{ fontFamily: FONTS.serif, fontSize: 32, color: COLORS.greenDark, marginBottom: 20 }}>Reserva confirmada</h2>
                    <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: '28px 26px', marginBottom: 26, textAlign: 'left' }}>
                      <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.24em', color: COLORS.green, textTransform: 'uppercase', marginBottom: 12 }}>Arbo Patagonia</p>
                      <p style={{ fontFamily: FONTS.serif, fontSize: 22, color: COLORS.greenDark, textTransform: 'capitalize', marginBottom: 6 }}>{dateLabel}</p>
                      <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, lineHeight: 1.9 }}>
                        {data.time} hs · {data.party} {data.party === '1' ? 'persona' : 'personas'}<br />
                        Mesa {TABLE_TYPES.find(t => t.key === data.table)?.label.toLowerCase()}<br />
                        {data.nombre}
                      </p>
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.08em', color: COLORS.green, marginBottom: 30 }}>#{reservationId}</p>
                    <Button onClick={resetAll}>Hacer otra reserva</Button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step < 5 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            {step > 0 && <Button variant="outline-light" onClick={back}>Volver</Button>}
            <Button full disabled={!canNext} onClick={next}>{step === 4 ? 'Confirmar reserva' : 'Continuar'}</Button>
          </div>
        )}
      </div>

      <style>{`@media (max-width: 560px) { .arbo-step-label { display: none !important; } }`}</style>
    </div>
  )
}
