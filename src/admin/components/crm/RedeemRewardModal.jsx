import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { isRewardActive, canAffordReward } from '../../../services/rewardService'
import { formatNumber } from '../../utils/format'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

// Bloque 15 — Cliente -> selecciona beneficio -> verificar puntos -> confirmar.
export default function RedeemRewardModal({ open, onClose, onConfirm, customers, rewards, preselectedCustomerId }) {
  const [customerId, setCustomerId] = useState(preselectedCustomerId ?? customers[0]?.id ?? '')
  const [rewardId, setRewardId] = useState(rewards[0]?.id ?? '')
  const [error, setError] = useState('')

  const customer = customers.find(c => c.id === customerId)
  const reward = rewards.find(r => r.id === rewardId)
  const now = new Date()
  const isActive = reward ? isRewardActive(reward, now) : false
  const canAfford = customer && reward ? canAffordReward(reward, customer.points) : false
  const valid = customer && reward && isActive && canAfford

  const reset = () => { setRewardId(rewards[0]?.id ?? ''); setError('') }
  const close = () => { reset(); onClose() }

  const submit = () => {
    if (!valid) return
    const result = onConfirm({ customerId, rewardId })
    if (result?.ok === false) { setError(result.error); return }
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Canjear beneficio" width={420}>
      {!preselectedCustomerId && (
        <>
          <label style={labelStyle}>Cliente</label>
          <select style={inputStyle} value={customerId} onChange={e => setCustomerId(e.target.value)}>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} · {formatNumber(c.points)} pts</option>)}
          </select>
        </>
      )}

      <label style={labelStyle}>Beneficio</label>
      <select style={inputStyle} value={rewardId} onChange={e => { setRewardId(e.target.value); setError('') }}>
        {rewards.map(r => <option key={r.id} value={r.id}>{r.name} · {formatNumber(r.pointsCost)} pts</option>)}
      </select>

      {customer && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, marginBottom: 14 }}>
          Saldo del cliente: <strong>{formatNumber(customer.points)} pts</strong>
        </p>
      )}

      {reward && !isActive && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: '#8A4536', marginBottom: 14 }}>Este beneficio no está disponible.</p>
      )}
      {reward && isActive && !canAfford && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: '#8A4536', marginBottom: 14 }}>Puntos insuficientes para este canje.</p>
      )}
      {error && <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: '#8A4536', marginBottom: 14 }}>{error}</p>}

      <Button full disabled={!valid} onClick={submit}>Confirmar canje</Button>
    </AdminModal>
  )
}
