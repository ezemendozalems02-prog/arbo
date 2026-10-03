import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { REWARD_TYPES, REWARD_TYPE_LABELS } from '../../../mock/rewards'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

export default function NewRewardModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [type, setType] = useState(REWARD_TYPES[0])
  const [pointsCost, setPointsCost] = useState('')
  const [stock, setStock] = useState('')

  const cost = Number(pointsCost) || 0
  const valid = name.trim().length > 0 && cost > 0
  const reset = () => { setName(''); setType(REWARD_TYPES[0]); setPointsCost(''); setStock('') }
  const close = () => { reset(); onClose() }

  const submit = () => {
    if (!valid) return
    onCreate({ name: name.trim(), description: `Beneficio ARBO CLUB: ${name.trim().toLowerCase()}.`, type, pointsCost: cost, stock: stock ? Number(stock) : null })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Nuevo beneficio" width={420}>
      <label style={labelStyle}>Nombre</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Postre a elección" autoFocus />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select style={inputStyle} value={type} onChange={e => setType(e.target.value)}>
            {REWARD_TYPES.map(t => <option key={t} value={t}>{REWARD_TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Costo en puntos</label>
          <input style={inputStyle} type="number" min={0} value={pointsCost} onChange={e => setPointsCost(e.target.value)} />
        </div>
      </div>

      <label style={labelStyle}>Stock disponible</label>
      <input style={inputStyle} type="number" min={0} value={stock} onChange={e => setStock(e.target.value)} placeholder="Vacío = ilimitado" />

      <Button full disabled={!valid} onClick={submit}>Crear beneficio</Button>
    </AdminModal>
  )
}
