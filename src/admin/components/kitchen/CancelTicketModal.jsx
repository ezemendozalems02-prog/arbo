import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import AdminModal from '../AdminModal'
import Button from '../../../components/ui/Button'

const REASONS = ['Cliente canceló', 'Producto sin stock', 'Error de carga', 'Otro motivo']

// BLOQUE 23 — cancelar deja registro (motivo, usuario, hora) en vez de
// hacer desaparecer la comanda.
export default function CancelTicketModal({ ticket, open, onClose, onConfirm }) {
  const [reason, setReason] = useState(REASONS[0])
  if (!ticket) return null

  return (
    <AdminModal open={open} onClose={onClose} title={`Cancelar comanda #${ticket.code}`} width={380}>
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 10 }}>Motivo</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {REASONS.map(r => (
          <button key={r} onClick={() => setReason(r)}
            style={{
              textAlign: 'left', padding: '10px 12px', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 13,
              border: `1.5px solid ${reason === r ? COLORS.green : COLORS.lineGreen}`,
              background: reason === r ? 'rgba(48,77,59,0.08)' : 'transparent', color: COLORS.onLight,
            }}>
            {r}
          </button>
        ))}
      </div>
      <Button full onClick={() => onConfirm(reason)}>Confirmar cancelación</Button>
    </AdminModal>
  )
}
