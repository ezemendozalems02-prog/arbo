import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'
import { calcDiscountAmount, calcSubtotal } from '../../../services/salesCalculations'
import { formatMoney } from '../../utils/format'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 15, outline: 'none', boxSizing: 'border-box',
}

export default function DiscountModal({ order, open, onClose, onApply }) {
  const [type, setType] = useState(order?.discount?.type ?? 'percent')
  const [value, setValue] = useState(order?.discount?.value ?? '')

  if (!order) return null
  const subtotal = calcSubtotal(order.items)
  const numericValue = Number(value) || 0
  const preview = calcDiscountAmount(subtotal, { type, value: numericValue })

  const apply = () => {
    if (numericValue <= 0) { onApply(null); return }
    onApply({ type, value: numericValue })
  }

  return (
    <AdminModal open={open} onClose={onClose} title="Aplicar descuento" width={380}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {[{ v: 'percent', l: 'Porcentaje' }, { v: 'amount', l: 'Monto fijo' }].map(o => (
          <button key={o.v} onClick={() => setType(o.v)}
            style={{
              flex: 1, padding: '11px 10px', fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
              border: `1.5px solid ${type === o.v ? COLORS.green : COLORS.lineGreen}`,
              background: type === o.v ? COLORS.green : 'transparent',
              color: type === o.v ? COLORS.cream : COLORS.onLightMuted, cursor: 'pointer',
            }}>
            {o.l}
          </button>
        ))}
      </div>

      <input
        style={inputStyle} type="number" min={0} value={value}
        placeholder={type === 'percent' ? 'Ej: 10' : 'Ej: 2000'}
        onChange={e => setValue(e.target.value)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, margin: '18px 0' }}>
        <span>Descuento aplicado</span>
        <span style={{ color: COLORS.greenDark, fontWeight: 700 }}>-{formatMoney(preview)}</span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {order.discount && <Button variant="outline-light" onClick={() => onApply(null)}>Quitar</Button>}
        <Button full onClick={apply}>Aplicar</Button>
      </div>
    </AdminModal>
  )
}
