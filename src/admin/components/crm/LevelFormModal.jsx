import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import AdminModal from '../AdminModal'
import Button from '../../../components/ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

// Bloque 13 — niveles configurables: crear o editar (mismo formulario), sin
// asumir que SEMILLA/RAÍZ/COPA son los únicos nombres posibles.
// AdminModal desmonta sus children cuando `open` es false (ver AdminModal.jsx),
// así que cada apertura es un mount nuevo: alcanza con useState(() => ...)
// leyendo editingLevel una sola vez, sin useEffect ni setState en efecto.
export default function LevelFormModal({ open, onClose, onSubmit, editingLevel, nextOrder }) {
  const [name, setName] = useState(() => editingLevel?.name ?? '')
  const [subtitle, setSubtitle] = useState(() => editingLevel?.subtitle ?? '')
  const [pointsRequired, setPointsRequired] = useState(() => editingLevel ? String(editingLevel.pointsRequired) : '')
  const [color, setColor] = useState(() => editingLevel?.color ?? '#304D3B')
  const [benefits, setBenefits] = useState(() => editingLevel?.benefits.join(', ') ?? '')

  const valid = name.trim().length > 0 && pointsRequired !== ''
  const submit = () => {
    if (!valid) return
    onSubmit({
      name: name.trim().toUpperCase(), subtitle: subtitle.trim(), pointsRequired: Number(pointsRequired),
      color, benefits: benefits.split(',').map(b => b.trim()).filter(Boolean),
      order: editingLevel?.order ?? nextOrder, key: editingLevel?.key ?? name.trim().toLowerCase(),
    })
    onClose()
  }

  return (
    <AdminModal open={open} onClose={onClose} title={editingLevel ? 'Editar nivel' : 'Nuevo nivel'} width={420}>
      <label style={labelStyle}>Nombre</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: PLATINO" autoFocus />
      <label style={labelStyle}>Subtítulo</label>
      <input style={inputStyle} value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Ej: Para los más fieles." />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Puntos requeridos</label>
          <input style={inputStyle} type="number" min={0} value={pointsRequired} onChange={e => setPointsRequired(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Color</label>
          <input style={{ ...inputStyle, padding: 4, height: 44 }} type="color" value={color} onChange={e => setColor(e.target.value)} />
        </div>
      </div>

      <label style={labelStyle}>Beneficios (separados por coma)</label>
      <input style={inputStyle} value={benefits} onChange={e => setBenefits(e.target.value)} placeholder="Beneficio 1, Beneficio 2" />

      <Button full disabled={!valid} onClick={submit}>{editingLevel ? 'Guardar cambios' : 'Crear nivel'}</Button>
    </AdminModal>
  )
}
