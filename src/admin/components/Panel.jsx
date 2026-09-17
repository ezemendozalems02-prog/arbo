import { COLORS, FONTS } from '../../styles/theme'

export default function Panel({ title, action, children }) {
  return (
    <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: '20px 22px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.greenDark, fontWeight: 500 }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

export function EmptyState({ label }) {
  return (
    <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightFaint, padding: '24px 0', textAlign: 'center' }}>
      {label}
    </p>
  )
}
