import { COLORS, FONTS } from '../../styles/theme'
import { CLUB, DEMO_MEMBER } from '../../data/benefits'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'

export default function ClubSection() {
  const pct = Math.min(100, Math.round((DEMO_MEMBER.points / DEMO_MEMBER.nextTierPoints) * 100))
  const missing = DEMO_MEMBER.nextTierPoints - DEMO_MEMBER.points

  return (
    <section style={{ background: COLORS.cream, padding: '120px 28px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 72, alignItems: 'center' }}>
        <Reveal dir="left">
          <SectionLabel index="06" label="Fidelización" color={COLORS.green} style={{ marginBottom: 18 }} />
          <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(32px, 4vw, 50px)', color: COLORS.greenDark, fontWeight: 400, marginBottom: 16, lineHeight: 1.15 }}>
            {CLUB.name}
          </h2>
          <p style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.green, fontStyle: 'italic', marginBottom: 24 }}>{CLUB.tagline}</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.onLightMuted, lineHeight: 1.9, marginBottom: 36, maxWidth: 460 }}>
            Sumá puntos con cada visita, reserva y evento. Desbloqueá beneficios exclusivos
            a medida que tu vínculo con Arbo crece.
          </p>
          <Button to="/arbo-club" variant="outline-light">Conocer Arbo Club</Button>
        </Reveal>

        <Reveal dir="right" delay={0.1}>
          <div style={{ background: COLORS.greenDark, padding: '40px 36px', border: `1px solid ${COLORS.lineOnDark}` }}>
            <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.2em', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 6 }}>Demo — vista de socio</p>
            <p style={{ fontFamily: FONTS.serif, fontSize: 42, color: COLORS.cream, fontWeight: 500, marginBottom: 4 }}>
              {DEMO_MEMBER.points.toLocaleString('es-AR')} <span style={{ fontSize: 16, fontFamily: FONTS.sans, color: COLORS.onDarkMuted, fontWeight: 400 }}>puntos</span>
            </p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onDarkMuted, marginBottom: 22 }}>
              Te faltan <strong style={{ color: COLORS.accent }}>{missing.toLocaleString('es-AR')}</strong> para tu próximo beneficio.
            </p>
            <div style={{ height: 6, background: 'rgba(244,240,228,0.14)', marginBottom: 30, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: COLORS.accent, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {CLUB.tiers.map(t => (
                <div key={t.key} style={{
                  flex: 1, textAlign: 'center', padding: '14px 8px',
                  border: `1px solid ${t.key === DEMO_MEMBER.tierKey ? COLORS.accent : COLORS.lineOnDark}`,
                  background: t.key === DEMO_MEMBER.tierKey ? 'rgba(143,174,149,0.1)' : 'transparent',
                }}>
                  <p style={{ fontFamily: FONTS.serif, fontSize: 15, color: t.key === DEMO_MEMBER.tierKey ? COLORS.accent : COLORS.cream, marginBottom: 4 }}>{t.name}</p>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.onDarkFaint }}>{t.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
