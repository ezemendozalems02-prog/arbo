import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { UNIT_SHORT } from '../../../mock/units'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '13px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 16,
}

// BLOQUE 18 — aumentar o disminuir stock, siempre con motivo. Nunca negativo:
// "disminuir" no puede pedir más de lo que hay.
export default function AdjustStockModal({ item, open, onClose, onConfirm }) {
  const [direction, setDirection] = useState('aumentar')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  if (!item) return null

  const qtyNum = Number(quantity) || 0
  const valid = qtyNum > 0 && reason.trim().length > 0 && (direction === 'aumentar' || qtyNum <= item.currentStock)

  const reset = () => { setDirection('aumentar'); setQuantity(''); setReason('') }
  const close = () => { reset(); onClose() }
  const submit = () => {
    if (!valid) return
    onConfirm({ insumoId: item.id, delta: direction === 'aumentar' ? qtyNum : -qtyNum, reason: reason.trim() })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title={`Ajustar stock — ${item.name}`} width={380}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, marginBottom: 16 }}>
        Stock actual: <strong>{item.currentStock} {UNIT_SHORT[item.unit]}</strong>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {['aumentar', 'disminuir'].map(d => (
          <button key={d} onClick={() => setDirection(d)}
            style={{
              padding: '11px 10px', fontFamily: FONTS.sans, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer', border: `1.5px solid ${direction === d ? COLORS.green : COLORS.lineGreen}`,
              background: direction === d ? COLORS.green : 'transparent', color: direction === d ? COLORS.cream : COLORS.onLightMuted,
            }}>
            {d}
          </button>
        ))}
      </div>

      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>Cantidad ({UNIT_SHORT[item.unit]})</p>
      <input style={inputStyle} type="number" min={0} value={quantity} onChange={e => setQuantity(e.target.value)} autoFocus />

      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>Motivo</p>
      <input style={inputStyle} value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Conteo de fin de mes" />

      {direction === 'disminuir' && qtyNum > item.currentStock && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: '#8A4536', marginTop: -8, marginBottom: 16 }}>No podés disminuir más de lo que hay en stock.</p>
      )}

      <Button full disabled={!valid} onClick={submit}>Confirmar ajuste</Button>
    </AdminModal>
  )
}
