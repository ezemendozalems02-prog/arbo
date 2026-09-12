import { COLORS, FONTS } from '../../styles/theme'
import { FRANCHISE } from '../../data/franchise'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'

export default function FranchiseTeaser() {
  return (
    <section style={{ background: COLORS.greenDark, padding: '120px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <SectionLabel index="07" label="Franquicias" color={COLORS.accent} align="center" style={{ marginBottom: 18, justifyContent: 'center' }} />
          <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(30px, 4vw, 48px)', color: COLORS.cream, fontWeight: 400, marginBottom: 22, lineHeight: 1.2 }}>
            {FRANCHISE.headline}
          </h2>
          <p style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.onDarkMuted, lineHeight: 1.85, marginBottom: 52, maxWidth: 620, marginInline: 'auto' }}>
            {FRANCHISE.intro}
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, marginBottom: 52 }}>
          {FRANCHISE.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div>
                <p style={{ fontFamily: FONTS.serif, fontSize: 44, color: COLORS.accent, fontWeight: 500, marginBottom: 6 }}>{s.value}</p>
                <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', color: COLORS.onDarkMuted, textTransform: 'uppercase' }}>{s.label}</p>
                {s.demo && <p style={{ fontFamily: FONTS.sans, fontSize: 9, color: COLORS.onDarkFaint, marginTop: 4, letterSpacing: '0.1em' }}>Dato demostrativo</p>}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <Button to="/franquicia" variant="outline-dark">Explorar franquicias</Button>
        </Reveal>
      </div>
    </section>
  )
}
