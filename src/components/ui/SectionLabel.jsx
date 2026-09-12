import { COLORS, FONTS } from '../../styles/theme'

// "01 / CAFÉ" — eyebrow editorial reutilizado en toda la web.
export default function SectionLabel({ index, label, color = COLORS.green, align = 'left', style = {} }) {
  return (
    <p style={{
      fontFamily: FONTS.sans,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color,
      textAlign: align,
      display: 'flex',
      gap: 10,
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      alignItems: 'center',
      ...style,
    }}>
      {index && <span style={{ opacity: 0.55 }}>{index}</span>}
      {index && <span style={{ opacity: 0.4 }}>/</span>}
      <span>{label}</span>
    </p>
  )
}
