import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

export default function NewCustomerModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const valid = name.trim().length > 1
  const reset = () => { setName(''); setEmail(''); setPhone('') }
  const close = () => { reset(); onClose() }
  const submit = () => {
    if (!valid) return
    onCreate({ name: name.trim(), email: email.trim(), phone: phone.trim() })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Nuevo cliente" width={420}>
      <label style={labelStyle}>Nombre y apellido</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Sofía Fernández" autoFocus />
      <label style={labelStyle}>Email</label>
      <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="Opcional" />
      <label style={labelStyle}>Teléfono</label>
      <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Opcional" />
      <Button full disabled={!valid} onClick={submit}>Crear cliente</Button>
    </AdminModal>
  )
}
