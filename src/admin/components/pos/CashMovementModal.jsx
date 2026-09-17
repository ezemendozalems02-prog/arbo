import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import AdminModal from '../AdminModal'
import Button from '../../../components/ui/Button'

const inputStyle = {
  width: '100%', padding: '13px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 16,
}

export default function CashMovementModal({ type, open, onClose, onConfirm }) {
  const [amount, setAmount] = useState('')
  const [concept, setConcept] = useState('')
  const title = type === 'ingreso' ? 'Registrar ingreso' : 'Registrar egreso'
  const amountNum = Number(amount) || 0

  const confirm = () => {
    onConfirm({ type, amount: amountNum, concept: concept.trim() || (type === 'ingreso' ? 'Ingreso manual' : 'Egreso manual') })
    setAmount(''); setConcept('')
  }

  return (
    <AdminModal open={open} onClose={onClose} title={title} width={360}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>Monto</p>
      <input style={inputStyle} type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>Concepto</p>
      <input style={inputStyle} value={concept} onChange={e => setConcept(e.target.value)} placeholder={type === 'ingreso' ? 'Ej: Vuelto de caja chica' : 'Ej: Compra de insumos'} />
      <Button full disabled={amountNum <= 0} onClick={confirm}>Confirmar</Button>
    </AdminModal>
  )
}
