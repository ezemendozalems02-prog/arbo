import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { SEGMENT_FIELDS, SEGMENT_OPERATORS } from '../../../mock/segments'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'
import { CloseIcon } from '../../../components/ui/icons'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }
const emptyRule = () => ({ field: SEGMENT_FIELDS[0].key, operator: '>=', value: '' })

// Bloque 20 — condiciones AND/OR combinadas: un solo operador lógico para
// todo el segmento (igual que en el ejemplo del brief), no árboles anidados.
export default function NewSegmentModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [op, setOp] = useState('AND')
  const [rules, setRules] = useState([emptyRule()])

  const valid = name.trim().length > 0 && rules.every(r => r.value !== '')
  const reset = () => { setName(''); setDescription(''); setOp('AND'); setRules([emptyRule()]) }
  const close = () => { reset(); onClose() }

  const updateRule = (i, patch) => setRules(rs => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r))
  const removeRule = (i) => setRules(rs => rs.filter((_, idx) => idx !== i))

  const submit = () => {
    if (!valid) return
    const parsedRules = rules.map(r => ({
      ...r,
      value: r.field === 'tier' ? r.value : r.field === 'hasPendingRedemption' ? r.value === 'true' : Number(r.value),
    }))
    onCreate({ name: name.trim(), description: description.trim(), conditions: { op, rules: parsedRules } })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Nuevo segmento" width={520}>
      <label style={labelStyle}>Nombre</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Clientes premium" autoFocus />
      <label style={labelStyle}>Descripción</label>
      <input style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Condiciones</label>
        <select style={{ ...inputStyle, width: 90, marginBottom: 0, padding: '6px 8px' }} value={op} onChange={e => setOp(e.target.value)}>
          <option value="AND">Y (AND)</option>
          <option value="OR">O (OR)</option>
        </select>
      </div>

      {rules.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <select style={{ ...inputStyle, marginBottom: 0, flex: 1.4 }} value={r.field} onChange={e => updateRule(i, { field: e.target.value })}>
            {SEGMENT_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          <select style={{ ...inputStyle, marginBottom: 0, width: 70 }} value={r.operator} onChange={e => updateRule(i, { operator: e.target.value })}>
            {SEGMENT_OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <input style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={r.value} onChange={e => updateRule(i, { value: e.target.value })} placeholder="Valor" />
          {rules.length > 1 && (
            <button onClick={() => removeRule(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.onLightFaint, padding: 4 }}>
              <CloseIcon width={14} height={14} />
            </button>
          )}
        </div>
      ))}

      <button onClick={() => setRules(rs => [...rs, emptyRule()])}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, padding: 0, marginBottom: 20 }}>
        + Agregar condición
      </button>

      <Button full disabled={!valid} onClick={submit}>Crear segmento</Button>
    </AdminModal>
  )
}
