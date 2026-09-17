import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { INVENTORY_CATEGORIES } from '../../../mock/inventoryCategories'
import AdminModal from '../AdminModal'
import Button from '../../../components/ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

export default function NewSupplierModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [cuit, setCuit] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [categories, setCategories] = useState([])
  const [paymentTerms, setPaymentTerms] = useState('')

  const reset = () => { setName(''); setBusinessName(''); setCuit(''); setPhone(''); setEmail(''); setCategories([]); setPaymentTerms('') }
  const close = () => { reset(); onClose() }
  const valid = name.trim().length > 0 && categories.length > 0

  const toggleCategory = (key) => setCategories(cs => cs.includes(key) ? cs.filter(c => c !== key) : [...cs, key])

  const submit = () => {
    if (!valid) return
    onCreate({ name: name.trim(), businessName: businessName.trim() || name.trim(), cuit, phone, email, address: '', categories, paymentTerms, notes: '' })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Nuevo proveedor" width={440}>
      <label style={labelStyle}>Nombre</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Distribuidora del Sur" autoFocus />
      <label style={labelStyle}>Razón social</label>
      <input style={inputStyle} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ej: Distribuidora del Sur S.R.L." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>CUIT</label>
          <input style={inputStyle} value={cuit} onChange={e => setCuit(e.target.value)} placeholder="30-12345678-9" />
        </div>
        <div>
          <label style={labelStyle}>Teléfono</label>
          <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>

      <label style={labelStyle}>Email</label>
      <input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />

      <label style={labelStyle}>Categorías que provee</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {INVENTORY_CATEGORIES.map(c => {
          const active = categories.includes(c.key)
          return (
            <button key={c.key} onClick={() => toggleCategory(c.key)}
              style={{
                padding: '6px 12px', fontFamily: FONTS.sans, fontSize: 11, cursor: 'pointer',
                border: `1.5px solid ${active ? COLORS.green : COLORS.lineGreen}`,
                background: active ? COLORS.green : 'transparent', color: active ? COLORS.cream : COLORS.onLightMuted,
              }}>
              {c.label}
            </button>
          )
        })}
      </div>

      <label style={labelStyle}>Condiciones de pago</label>
      <input style={inputStyle} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Ej: 30 días" />

      <Button full disabled={!valid} onClick={submit}>Crear proveedor</Button>
    </AdminModal>
  )
}
