import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { AUTOMATION_TRIGGERS, AUTOMATION_TRIGGER_LABELS, AUTOMATION_ACTIONS, AUTOMATION_ACTION_LABELS } from '../../../mock/automations'
import AdminModal from '../AdminModal'
import Button from '../../../components/ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }
const NEEDS_DAYS = ['CUSTOMER_INACTIVE', 'POINTS_EXPIRING']

export default function NewAutomationModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState(AUTOMATION_TRIGGERS[0])
  const [days, setDays] = useState('30')
  const [action, setAction] = useState(AUTOMATION_ACTIONS[0])
  const [message, setMessage] = useState('')

  const valid = name.trim().length > 0 && message.trim().length > 0
  const reset = () => { setName(''); setTrigger(AUTOMATION_TRIGGERS[0]); setDays('30'); setAction(AUTOMATION_ACTIONS[0]); setMessage('') }
  const close = () => { reset(); onClose() }

  const submit = () => {
    if (!valid) return
    onCreate({
      name: name.trim(), trigger, action, message: message.trim(),
      condition: NEEDS_DAYS.includes(trigger) ? { days: Number(days) || 30 } : null,
    })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Nueva automatización" width={440}>
      <label style={labelStyle}>Nombre</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Reactivar inactivos 45 días" autoFocus />

      <label style={labelStyle}>Disparador (trigger)</label>
      <select style={inputStyle} value={trigger} onChange={e => setTrigger(e.target.value)}>
        {AUTOMATION_TRIGGERS.map(t => <option key={t} value={t}>{AUTOMATION_TRIGGER_LABELS[t]}</option>)}
      </select>

      {NEEDS_DAYS.includes(trigger) && (
        <>
          <label style={labelStyle}>Días de condición</label>
          <input style={inputStyle} type="number" min={1} value={days} onChange={e => setDays(e.target.value)} />
        </>
      )}

      <label style={labelStyle}>Acción</label>
      <select style={inputStyle} value={action} onChange={e => setAction(e.target.value)}>
        {AUTOMATION_ACTIONS.map(a => <option key={a} value={a}>{AUTOMATION_ACTION_LABELS[a]}</option>)}
      </select>

      <label style={labelStyle}>Mensaje / detalle de la acción</label>
      <input style={inputStyle} value={message} onChange={e => setMessage(e.target.value)} placeholder="Ej: Hola {{firstName}}..." />

      <Button full disabled={!valid} onClick={submit}>Crear automatización</Button>
    </AdminModal>
  )
}
