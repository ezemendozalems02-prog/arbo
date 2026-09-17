import { useEffect } from 'react'
import { COLORS, FONTS } from '../../styles/theme'
import { LeafIcon } from '../../components/ui/icons'

export default function ComingSoon({ title }) {
  useEffect(() => { document.title = `${title} | ARBO OS` }, [title])
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', minHeight: '50vh', border: `1px dashed ${COLORS.lineGreen}`, padding: '60px 24px',
    }}>
      <LeafIcon width={30} height={30} style={{ color: COLORS.green, marginBottom: 18 }} />
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: COLORS.green, marginBottom: 10 }}>
        Próximamente
      </p>
      <h2 style={{ fontFamily: FONTS.serif, fontSize: 28, color: COLORS.greenDark, marginBottom: 10 }}>{title}</h2>
      <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, maxWidth: 420 }}>
        Este módulo de ARBO OS todavía no está construido. Se incorpora en una próxima etapa de la Fase 1.
      </p>
    </div>
  )
}
