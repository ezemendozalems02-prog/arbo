import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'
import { calcCashDifference } from '../../../services/cashCalculations'
import { formatMoney } from '../../utils/format'

const inputStyle = {
  width: '100%', padding: '13px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 16, outline: 'none', boxSizing: 'border-box',
}

export default function CloseCashModal({ expectedCash, open, onClose, onConfirm }) {
  const [declared, setDeclared] = useState('')
  const declaredNum = Number(declared) || 0
  const diff = calcCashDifference(expectedCash, declaredNum)

  return (
    <AdminModal open={open} onClose={onClose} title="Cerrar caja" width={380}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 18 }}>
        <span>Efectivo esperado</span>
        <span style={{ fontWeight: 700, color: COLORS.greenDark }}>{formatMoney(expectedCash)}</span>
      </div>

      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>Efectivo real contado</p>
      <input style={{ ...inputStyle, marginBottom: 18 }} type="number" min={0} value={declared} onChange={e => setDeclared(e.target.value)} autoFocus />

      {declared !== '' && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '12px 14px', marginBottom: 22,
          background: diff === 0 ? 'rgba(48,77,59,0.08)' : 'rgba(166,91,74,0.12)',
          fontFamily: FONTS.sans, fontSize: 13, color: diff === 0 ? COLORS.greenDark : '#8A4536', fontWeight: 700,
        }}>
          <span>Diferencia</span>
          <span>{diff > 0 ? `+${formatMoney(diff)}` : formatMoney(diff)}</span>
        </div>
      )}

      <Button full disabled={declared === ''} onClick={() => onConfirm(declaredNum)}>Cerrar caja</Button>
    </AdminModal>
  )
}
