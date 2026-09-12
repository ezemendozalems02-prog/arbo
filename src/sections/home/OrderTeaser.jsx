import { COLORS, FONTS } from '../../styles/theme'
import { SITE } from '../../data/site'
import SectionLabel from '../../components/ui/SectionLabel'
import Reveal from '../../components/ui/Reveal'
import Button from '../../components/ui/Button'

export default function OrderTeaser() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: 420 }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src={SITE.images.gastronomia} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(12,16,20,0.88) 0%, rgba(48,77,59,0.72) 100%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto', padding: '110px 28px', textAlign: 'center' }}>
        <Reveal>
          <SectionLabel index="03" label="Pedí Arbo" color={COLORS.accent} align="center" style={{ marginBottom: 18, justifyContent: 'center' }} />
          <h2 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(32px, 4.5vw, 52px)', color: COLORS.cream, fontWeight: 400, marginBottom: 22, lineHeight: 1.15 }}>
            Arbo, directo a tu mesa.
          </h2>
          <p style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.onDarkMuted, lineHeight: 1.8, marginBottom: 40, maxWidth: 520, marginInline: 'auto' }}>
            Elegí tu carta favorita, armá el pedido y coordiná delivery o retiro en el local.
          </p>
          <Button to="/pedidos" size="lg">Pedir ahora</Button>
        </Reveal>
      </div>
    </section>
  )
}
