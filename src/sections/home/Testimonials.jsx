import { COLORS, FONTS } from '../../styles/theme'
import { TESTIMONIALS } from '../../data/site'
import Reveal from '../../components/ui/Reveal'

export default function Testimonials() {
  return (
    <section style={{ background: COLORS.cream, padding: '100px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.08}>
            <div style={{ textAlign: 'center', padding: '0 12px' }}>
              <p style={{ color: COLORS.green, fontSize: 14, letterSpacing: '0.2em', marginBottom: 16 }}>{'★'.repeat(t.rating)}</p>
              <p style={{ fontFamily: FONTS.serif, fontSize: 19, color: COLORS.greenDark, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 16 }}>
                "{t.quote}"
              </p>
              <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.onLightFaint }}>
                {t.name}{t.demo ? ' · reseña demo' : ''}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
