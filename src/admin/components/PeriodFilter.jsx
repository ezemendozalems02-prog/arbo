import { COLORS, FONTS } from '../../styles/theme'
import { PERIODS } from '../utils/period'

const chipStyle = (active) => ({
  padding: '9px 12px', background: active ? COLORS.green : COLORS.warmWhite, border: `1.5px solid ${active ? COLORS.green : COLORS.lineGreen}`,
  color: active ? COLORS.cream : COLORS.onLightMuted, fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer',
})
const inputStyle = { padding: '9px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 12 }

export default function PeriodFilter({ period, onChange, custom, onCustomChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {PERIODS.map(p => (
        <button key={p.key} onClick={() => onChange(p.key)} style={chipStyle(period === p.key)}>{p.label}</button>
      ))}
      {period === 'personalizado' && (
        <>
          <input type="date" style={inputStyle} value={custom?.from ?? ''} onChange={e => onCustomChange({ ...custom, from: e.target.value })} />
          <input type="date" style={inputStyle} value={custom?.to ?? ''} onChange={e => onCustomChange({ ...custom, to: e.target.value })} />
        </>
      )}
    </div>
  )
}
