import { COLORS, FONTS } from '../../styles/theme'
import Reveal from '../../components/ui/Reveal'

export default function Manifesto() {
  return (
    <section style={{ background: COLORS.cream, padding: '140px 28px', textAlign: 'center' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{
            fontFamily: FONTS.serif, fontSize: 'clamp(34px, 5.5vw, 60px)', color: COLORS.greenDark,
            lineHeight: 1.18, fontWeight: 400, marginBottom: 36,
          }}>
            Más que un café.<br /><em style={{ fontStyle: 'italic' }}>Un lugar para quedarse.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 16, color: COLORS.onLightMuted, lineHeight: 1.95, marginBottom: 44, maxWidth: 620, marginInline: 'auto' }}>
            Arbo nace como un punto de encuentro alrededor del café, el vino y la gastronomía,
            en el corazón de Trevelin. Un espacio para bajar el ritmo, compartir una copa
            y dejar que la Patagonia entre por la ventana.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 30, height: 1, background: COLORS.green, opacity: 0.5 }} />
            <span style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.36em', color: COLORS.green, textTransform: 'uppercase' }}>
              Trevelin · Patagonia Argentina
            </span>
            <div style={{ width: 30, height: 1, background: COLORS.green, opacity: 0.5 }} />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
