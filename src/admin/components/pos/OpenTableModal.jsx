import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

export default function OpenTableModal({ table, open, onClose, onOpenTable }) {
  const [partySize, setPartySize] = useState(2)
  if (!table) return null

  return (
    <AdminModal open={open} onClose={onClose} title={`Abrir Mesa ${table.number}`} width={360}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 10 }}>
        Cantidad de personas
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 26 }}>
        <button onClick={() => setPartySize(p => Math.max(1, p - 1))}
          style={{ width: 36, height: 36, border: `1px solid ${COLORS.lineGreen}`, background: COLORS.warmWhite, fontSize: 16, cursor: 'pointer' }}>−</button>
        <span style={{ fontFamily: FONTS.serif, fontSize: 32, color: COLORS.greenDark, minWidth: 40, textAlign: 'center' }}>{partySize}</span>
        <button onClick={() => setPartySize(p => Math.min(table.capacity, p + 1))}
          style={{ width: 36, height: 36, border: `1px solid ${COLORS.lineGreen}`, background: COLORS.warmWhite, fontSize: 16, cursor: 'pointer' }}>+</button>
      </div>
      <Button full onClick={() => onOpenTable(partySize)}>Abrir mesa</Button>
    </AdminModal>
  )
}
