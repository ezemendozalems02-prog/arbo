import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { POINT_TXN_TYPES, POINT_TXN_LABELS } from '../../../mock/loyaltyTransactions'
import { formatNumber } from '../../utils/format'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }
const NEGATIVE_TYPES = ['REDEEM', 'EXPIRED']

// Bloque 9 — movimiento manual de puntos: nunca se toca el saldo directo,
// siempre queda una transacción con motivo (mismo principio que ajustar
// stock en Fase 4).
export default function AdjustPointsModal({ open, onClose, onConfirm, customers, preselectedCustomerId }) {
  const [customerId, setCustomerId] = useState(preselectedCustomerId ?? customers[0]?.id ?? '')
  const [type, setType] = useState('ADJUSTMENT')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const customer = customers.find(c => c.id === customerId)
  const qty = Math.abs(Number(amount)) || 0
  const signedAmount = NEGATIVE_TYPES.includes(type) ? -qty : qty
  const valid = customer && qty > 0 && reason.trim().length > 0

  const reset = () => { setType('ADJUSTMENT'); setAmount(''); setReason('') }
  const close = () => { reset(); onClose() }
  const submit = () => {
    if (!valid) return
    onConfirm({ customerId, type, amount: signedAmount, reason: reason.trim() })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Movimiento de puntos" width={420}>
      {!preselectedCustomerId && (
        <>
          <label style={labelStyle}>Cliente</label>
          <select style={inputStyle} value={customerId} onChange={e => setCustomerId(e.target.value)}>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} · {formatNumber(c.points)} pts</option>)}
          </select>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select style={inputStyle} value={type} onChange={e => setType(e.target.value)}>
            {POINT_TXN_TYPES.filter(t => t !== 'REDEEM').map(t => <option key={t} value={t}>{POINT_TXN_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Puntos</label>
          <input style={inputStyle} type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
      </div>

      <label style={labelStyle}>Motivo</label>
      <input style={inputStyle} value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Compensación por demora" />

      {customer && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, marginBottom: 16 }}>
          Saldo actual: {formatNumber(customer.points)} pts → nuevo saldo estimado: <strong>{formatNumber(Math.max(0, customer.points + signedAmount))} pts</strong>
        </p>
      )}

      <Button full disabled={!valid} onClick={submit}>Registrar movimiento</Button>
    </AdminModal>
  )
}
