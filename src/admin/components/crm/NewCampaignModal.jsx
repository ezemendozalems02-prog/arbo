import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { CAMPAIGN_CHANNELS, CAMPAIGN_CHANNEL_LABELS } from '../../../mock/campaigns'
import { TEMPLATE_VARIABLES } from '../../../services/campaignTemplateService'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

export default function NewCampaignModal({ open, onClose, onCreate, segments }) {
  const [name, setName] = useState('')
  const [segmentId, setSegmentId] = useState(segments[0]?.id ?? '')
  const [channel, setChannel] = useState(CAMPAIGN_CHANNELS[0])
  const [message, setMessage] = useState('')

  const valid = name.trim().length > 0 && segmentId && message.trim().length > 0
  const reset = () => { setName(''); setChannel(CAMPAIGN_CHANNELS[0]); setMessage('') }
  const close = () => { reset(); onClose() }

  const submit = () => {
    if (!valid) return
    onCreate({ name: name.trim(), description: '', segmentId, channel, message: message.trim() })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Nueva campaña" width={460}>
      <label style={labelStyle}>Nombre</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Reactivación de inactivos" autoFocus />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Segmento</label>
          <select style={inputStyle} value={segmentId} onChange={e => setSegmentId(e.target.value)}>
            {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Canal</label>
          <select style={inputStyle} value={channel} onChange={e => setChannel(e.target.value)}>
            {CAMPAIGN_CHANNELS.map(c => <option key={c} value={c}>{CAMPAIGN_CHANNEL_LABELS[c]}</option>)}
          </select>
        </div>
      </div>

      <label style={labelStyle}>Mensaje</label>
      <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={message} onChange={e => setMessage(e.target.value)}
        placeholder="Hola {{firstName}}, tenés {{points}} puntos disponibles..." />
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: -8, marginBottom: 18 }}>
        Variables disponibles: {TEMPLATE_VARIABLES.map(v => `{{${v}}}`).join(', ')}
      </p>

      <Button full disabled={!valid} onClick={submit}>Crear campaña (borrador)</Button>
    </AdminModal>
  )
}
