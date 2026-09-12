import { useEffect } from 'react'
import { COLORS, FONTS } from '../styles/theme'

// Páginas legales placeholder — DEMO. Reemplazar por textos legales reales
// antes de producción.
function LegalPage({ title, children }) {
  return (
    <div style={{ background: COLORS.cream, minHeight: '100vh', paddingTop: 140, paddingBottom: 100 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }}>
        <h1 style={{ fontFamily: FONTS.serif, fontSize: 'clamp(32px, 5vw, 48px)', color: COLORS.greenDark, marginBottom: 28 }}>{title}</h1>
        <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.onLightMuted, lineHeight: 1.9 }}>{children}</p>
      </div>
    </div>
  )
}

export function Privacidad() {
  useEffect(() => { document.title = 'Privacidad | Arbo Patagonia' }, [])
  return (
    <LegalPage title="Política de Privacidad">
      Contenido demostrativo. Este sitio es un prototipo — los textos legales definitivos
      sobre tratamiento de datos personales deben ser redactados y aprobados antes de publicar en producción.
    </LegalPage>
  )
}

export function Terminos() {
  useEffect(() => { document.title = 'Términos | Arbo Patagonia' }, [])
  return (
    <LegalPage title="Términos y Condiciones">
      Contenido demostrativo. Este sitio es un prototipo — los términos y condiciones definitivos
      de uso, reservas y pedidos deben ser redactados y aprobados antes de publicar en producción.
    </LegalPage>
  )
}
