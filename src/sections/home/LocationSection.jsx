import { COLORS, FONTS } from '../../styles/theme'
import { SITE } from '../../data/site'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'

export default function LocationSection() {
  return (
    <section style={{ background: COLORS.black, padding: '120px 28px' }}>
      <div style={{ maxWidth: 1360, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 60, alignItems: 'center' }}>
        <Reveal dir="left">
          <SectionLabel index="09" label="Ubicación" color={COLORS.accent} style={{ marginBottom: 18 }} />
          <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(30px, 4vw, 48px)', color: COLORS.cream, fontWeight: 400, marginBottom: 28, lineHeight: 1.2 }}>
            En el corazón<br />de Trevelin
          </h2>
          <p style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.onDarkMuted, lineHeight: 2, marginBottom: 8 }}>
            {SITE.location.addressLine}<br />{SITE.location.city}, {SITE.location.province}<br />{SITE.location.country}
          </p>
          <div style={{ margin: '30px 0', borderTop: `1px solid ${COLORS.lineOnDark}`, paddingTop: 24 }}>
            {SITE.hours.map(h => (
              <div key={h.days} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 320, padding: '8px 0', borderBottom: `1px solid ${COLORS.lineOnDark}` }}>
                <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onDarkMuted }}>{h.days}</span>
                <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.cream, fontWeight: 500 }}>{h.time}</span>
              </div>
            ))}
            <p style={{ fontFamily: FONTS.sans, fontSize: 10, color: COLORS.onDarkFaint, marginTop: 10, letterSpacing: '0.04em' }}>
              Horarios de referencia — pueden variar según temporada.
            </p>
          </div>
          <Button href={SITE.location.mapsUrl} target="_blank" rel="noopener noreferrer" variant="outline-dark">Cómo llegar</Button>
        </Reveal>

        <Reveal dir="right" delay={0.1}>
          <div style={{ overflow: 'hidden', border: `1px solid ${COLORS.lineOnDark}` }}>
            <iframe
              title="Arbo Patagonia en el mapa"
              src={SITE.location.embedUrl}
              width="100%" height="440"
              style={{ display: 'block', border: 0, filter: 'grayscale(35%) contrast(1.08)' }}
              loading="lazy"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
