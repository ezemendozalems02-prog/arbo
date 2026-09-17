import { COLORS, FONTS } from '../../styles/theme'

export default function StatCard({ label, value, hint }) {
  return (
    <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: '20px 22px' }}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 10 }}>
        {label}
      </p>
      <p style={{ fontFamily: FONTS.sans, fontSize: 30, fontWeight: 700, color: COLORS.greenDark, lineHeight: 1.1 }}>
        {value}
      </p>
      {hint && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 8 }}>{hint}</p>
      )}
    </div>
  )
}
