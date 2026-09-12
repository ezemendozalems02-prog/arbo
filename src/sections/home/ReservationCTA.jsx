import { COLORS, FONTS } from '../../styles/theme'
import { SITE } from '../../data/site'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'

export default function ReservationCTA() {
  return (
    <section style={{ position: 'relative', padding: '130px 28px', textAlign: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src={SITE.images.patagonia} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(12,16,20,0.88) 0%, rgba(31,64,47,0.82) 100%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 660, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel index="05" label="Reservas" color={COLORS.accent} align="center" style={{ marginBottom: 18, justifyContent: 'center' }} />
          <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(34px, 5vw, 58px)', color: COLORS.cream, lineHeight: 1.15, marginBottom: 26, fontWeight: 400 }}>
            Una mesa. Una copa.<br /><em style={{ color: COLORS.accent, fontStyle: 'italic' }}>Un momento.</em>
          </h2>
          <p style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.onDarkMuted, lineHeight: 1.9, marginBottom: 44 }}>
            Reservá tu lugar en Arbo en minutos. Elegís fecha, horario y tipo de mesa.
          </p>
          <Button to="/reservas" size="lg">Reservar mi mesa</Button>
        </Reveal>
      </div>
    </section>
  )
}
