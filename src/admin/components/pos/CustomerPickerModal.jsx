import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { CUSTOMERS } from '../../../mock/customers'
import { usePOS } from '../../../context/POSContext'
import AdminModal from '../AdminModal'
import { formatNumber } from '../../utils/format'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}

export default function CustomerPickerModal({ open, onClose, onSelect, currentCustomerId }) {
  const navigate = useNavigate()
  const { getCustomerWithLivePoints } = usePOS()
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const results = q.length >= 2 ? CUSTOMERS.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8) : []

  return (
    <AdminModal open={open} onClose={onClose} title="Asociar cliente" width={420}>
      <input style={inputStyle} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre..." autoFocus />

      {currentCustomerId && (
        <button onClick={() => navigate(`/admin/clientes/${currentCustomerId}`)}
          style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, padding: 0, marginTop: -8, marginBottom: 14 }}>
          Ver ficha 360 del cliente →
        </button>
      )}

      <button onClick={() => onSelect(null)}
        style={{
          width: '100%', textAlign: 'left', padding: '12px 14px', marginBottom: 14, cursor: 'pointer',
          border: `1.5px solid ${!currentCustomerId ? COLORS.green : COLORS.lineGreen}`,
          background: !currentCustomerId ? 'rgba(48,77,59,0.08)' : 'transparent',
          fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight,
        }}>
        Venta sin cliente
      </button>

      {q.length >= 2 && results.length === 0 && (
        <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightFaint, textAlign: 'center', padding: '12px 0' }}>
          Sin resultados para "{query}".
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map(c => {
          const live = getCustomerWithLivePoints(c.id)
          const isSelected = currentCustomerId === c.id
          return (
            <button key={c.id} onClick={() => onSelect(c.id)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', cursor: 'pointer',
                border: `1.5px solid ${isSelected ? COLORS.green : COLORS.lineGreen}`,
                background: isSelected ? 'rgba(48,77,59,0.08)' : 'transparent', textAlign: 'left',
              }}>
              <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.green }}>
                {live.tier.name} · {formatNumber(live.points)} pts
              </span>
            </button>
          )
        })}
      </div>
    </AdminModal>
  )
}
