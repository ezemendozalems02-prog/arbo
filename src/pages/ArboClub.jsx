import { useEffect } from 'react'
import { COLORS, FONTS } from '../styles/theme'
import { CLUB, DEMO_MEMBER } from '../data/benefits'
import Reveal from '../components/ui/Reveal'
import Button from '../components/ui/Button'
import { CheckIcon } from '../components/ui/icons'

export default function ArboClub() {
  useEffect(() => { document.title = 'Arbo Club | Arbo Patagonia' }, [])
  const pct = Math.min(100, Math.round((DEMO_MEMBER.points / DEMO_MEMBER.nextTierPoints) * 100))
  const missing = DEMO_MEMBER.nextTierPoints - DEMO_MEMBER.points

  return (
    <div style={{ background: COLORS.cream, minHeight: '100vh' }}>
      <section style={{ position: 'relative', minHeight: '46vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 84, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=75" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(140deg, rgba(12,16,20,0.9) 0%, rgba(31,64,47,0.85) 100%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '70px 24px 60px' }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.4em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 16 }}>Fidelización</p>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(42px, 8vw, 76px)', color: COLORS.cream, fontWeight: 400, marginBottom: 14 }}>{CLUB.name}</h1>
          <p style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.accent, fontStyle: 'italic' }}>{CLUB.tagline}</p>
        </div>
      </section>

      {/* Demo member card */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px 0' }}>
        <Reveal>
          <div style={{ background: COLORS.greenDark, padding: '40px 36px', border: `1px solid ${COLORS.lineOnDark}` }}>
            <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 6 }}>Demo — vista de socio</p>
            <p style={{ fontFamily: FONTS.serif, fontSize: 46, color: COLORS.cream, fontWeight: 500, marginBottom: 4 }}>
              {DEMO_MEMBER.points.toLocaleString('es-AR')} <span style={{ fontSize: 16, fontFamily: FONTS.sans, color: COLORS.onDarkMuted, fontWeight: 400 }}>puntos</span>
            </p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onDarkMuted, marginBottom: 22 }}>
              Te faltan <strong style={{ color: COLORS.accent }}>{missing.toLocaleString('es-AR')}</strong> puntos para desbloquear tu próximo beneficio.
            </p>
            <div style={{ height: 6, background: 'rgba(244,240,228,0.14)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: COLORS.accent, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Tiers */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '90px 28px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.3em', color: COLORS.green, textTransform: 'uppercase', marginBottom: 14 }}>Niveles</p>
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(28px, 4vw, 44px)', color: COLORS.greenDark, fontWeight: 400 }}>De semilla a copa</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {CLUB.tiers.map((t, i) => (
            <Reveal key={t.key} delay={i * 0.08}>
              <div style={{
                padding: '38px 30px', background: t.key === DEMO_MEMBER.tierKey ? COLORS.greenDark : COLORS.warmWhite,
                border: `1px solid ${t.key === DEMO_MEMBER.tierKey ? COLORS.green : COLORS.lineGreen}`, height: '100%',
              }}>
                <p style={{
                  fontFamily: FONTS.sans, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
                  color: t.key === DEMO_MEMBER.tierKey ? COLORS.accent : COLORS.green,
                }}>
                  {t.key === DEMO_MEMBER.tierKey ? 'Tu nivel actual' : `Desde ${t.threshold.toLocaleString('es-AR')} pts`}
                </p>
                <h3 style={{ fontFamily: FONTS.serif, fontSize: 32, marginBottom: 4, color: t.key === DEMO_MEMBER.tierKey ? COLORS.cream : COLORS.greenDark }}>{t.name}</h3>
                <p style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 15, marginBottom: 22, color: t.key === DEMO_MEMBER.tierKey ? COLORS.accent : COLORS.green }}>{t.subtitle}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {t.benefits.map(b => (
                    <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: t.key === DEMO_MEMBER.tierKey ? COLORS.accent : COLORS.green, marginTop: 2 }}><CheckIcon width={14} height={14} /></span>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 13, lineHeight: 1.6, color: t.key === DEMO_MEMBER.tierKey ? COLORS.onDarkMuted : COLORS.onLightMuted }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Points rules */}
      <section style={{ background: COLORS.greenDark, padding: '90px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.3em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 14 }}>Cómo sumar puntos</p>
              <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(28px, 4vw, 42px)', color: COLORS.cream, fontWeight: 400 }}>Cada visita cuenta</h2>
            </div>
          </Reveal>
          <div style={{ border: `1px solid ${COLORS.lineOnDark}` }}>
            {CLUB.pointsRules.map((r, i) => (
              <div key={r.action} style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 22px', borderBottom: i < CLUB.pointsRules.length - 1 ? `1px solid ${COLORS.lineOnDark}` : 'none', background: i % 2 === 0 ? 'rgba(244,240,228,0.03)' : 'transparent' }}>
                <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onDarkMuted }}>{r.action}</span>
                <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.accent, fontWeight: 600 }}>{r.points}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '90px 28px', textAlign: 'center' }}>
        <Reveal>
          <p style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.greenDark, fontStyle: 'italic', marginBottom: 30, maxWidth: 520, marginInline: 'auto', lineHeight: 1.5 }}>
            "Arbo no es solo donde tomás un café. Arbo es un lugar al que querés volver."
          </p>
          <Button to="/reservas">Empezar a sumar puntos</Button>
        </Reveal>
      </section>
    </div>
  )
}
