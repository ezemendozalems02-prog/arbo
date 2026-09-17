import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import AdminModal from '../AdminModal'
import { calcOrderTotals, calcSplitEqual } from '../../../services/salesCalculations'
import { formatMoney } from '../../utils/format'

export default function SplitBillModal({ order, open, onClose }) {
  const [parts, setParts] = useState(2)
  if (!order) return null
  const { total } = calcOrderTotals(order)
  const split = calcSplitEqual(total, parts)

  return (
    <AdminModal open={open} onClose={onClose} title="Dividir cuenta" width={380}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 18 }}>
        División equitativa del total. La división por producto llega en una próxima etapa.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 24 }}>
        <button onClick={() => setParts(p => Math.max(2, p - 1))}
          style={{ width: 36, height: 36, border: `1px solid ${COLORS.lineGreen}`, background: COLORS.warmWhite, fontSize: 16, cursor: 'pointer' }}>−</button>
        <span style={{ fontFamily: FONTS.serif, fontSize: 32, color: COLORS.greenDark, minWidth: 40, textAlign: 'center' }}>{parts}</span>
        <button onClick={() => setParts(p => p + 1)}
          style={{ width: 36, height: 36, border: `1px solid ${COLORS.lineGreen}`, background: COLORS.warmWhite, fontSize: 16, cursor: 'pointer' }}>+</button>
      </div>

      <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, padding: '18px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>
          {split.parts} personas
        </p>
        <p style={{ fontFamily: FONTS.serif, fontSize: 30, color: COLORS.greenDark, fontWeight: 600 }}>{formatMoney(split.amountPerPart)}</p>
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 4 }}>cada una · total {formatMoney(total)}</p>
      </div>
    </AdminModal>
  )
}
