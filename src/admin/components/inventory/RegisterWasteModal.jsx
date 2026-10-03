import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { WASTE_REASONS, WASTE_REASON_LABELS } from '../../../mock/waste'
import { UNIT_SHORT } from '../../../mock/units'
import { formatMoney } from '../../utils/format'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

// BLOQUE 15 — registrar merma: cantidad × costo = costo de merma, calculado
// en vivo mientras se completa el formulario.
export default function RegisterWasteModal({ items, open, onClose, onConfirm, preselectedItemId }) {
  const [insumoId, setInsumoId] = useState(preselectedItemId ?? items[0]?.id ?? '')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState(WASTE_REASONS[0])
  const [notes, setNotes] = useState('')

  const item = items.find(i => i.id === insumoId)
  const qtyNum = Number(quantity) || 0
  const estimatedCost = item ? qtyNum * item.avgCost : 0
  const valid = item && qtyNum > 0

  const reset = () => { setQuantity(''); setReason(WASTE_REASONS[0]); setNotes('') }
  const close = () => { reset(); onClose() }
  const submit = () => {
    if (!valid) return
    onConfirm({ insumoId: item.id, quantity: qtyNum, unit: item.unit, reason, notes: notes.trim() })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Registrar merma" width={420}>
      <label style={labelStyle}>Insumo</label>
      <select style={inputStyle} value={insumoId} onChange={e => setInsumoId(e.target.value)} disabled={!!preselectedItemId}>
        {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Cantidad {item ? `(${UNIT_SHORT[item.unit]})` : ''}</label>
          <input style={inputStyle} type="number" min={0} value={quantity} onChange={e => setQuantity(e.target.value)} autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Motivo</label>
          <select style={inputStyle} value={reason} onChange={e => setReason(e.target.value)}>
            {WASTE_REASONS.map(r => <option key={r} value={r}>{WASTE_REASON_LABELS[r]}</option>)}
          </select>
        </div>
      </div>

      <label style={labelStyle}>Observaciones</label>
      <input style={inputStyle} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, padding: '10px 0', borderTop: `1px solid ${COLORS.lineGreen}`, marginBottom: 16 }}>
        <span>Costo de la merma</span>
        <span style={{ fontWeight: 700, color: '#8A4536' }}>{formatMoney(estimatedCost)}</span>
      </div>

      <Button full disabled={!valid} onClick={submit}>Registrar merma</Button>
    </AdminModal>
  )
}
