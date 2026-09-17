import { COLORS, FONTS } from '../../styles/theme'

// Barra de pestañas genérica — mismo lenguaje visual que CategoryTabs (POS),
// generalizado para usarse en el perfil 360 del cliente y donde haga falta.
export default function Tabs({ options, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 18, WebkitOverflowScrolling: 'touch' }}>
      {options.map(t => {
        const isActive = active === t.key
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
            style={{
              flexShrink: 0, padding: '9px 18px', fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
              border: `1.5px solid ${isActive ? COLORS.green : COLORS.lineGreen}`,
              background: isActive ? COLORS.green : 'transparent',
              color: isActive ? COLORS.cream : COLORS.onLightMuted, transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
