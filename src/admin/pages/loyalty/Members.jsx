import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { formatNumber } from '../../utils/format'
import { EmptyState } from '../../components/Panel'

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

// Bloque 44 — vista de "miembros" enfocada en ARBO CLUB (nivel/puntos/canjes),
// reutiliza los mismos clientes de CRM en vez de mantener una lista aparte.
export default function Members() {
  useEffect(() => { document.title = 'Miembros ARBO Club | ARBO OS' }, [])
  const navigate = useNavigate()
  const { customers, levels, getRedemptionsForCustomer } = useCRM()
  const [levelFilter, setLevelFilter] = useState('todos')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const rows = customers
    .filter(c => levelFilter === 'todos' || c.tier?.key === levelFilter)
    .filter(c => !q || c.name.toLowerCase().includes(q))
    .sort((a, b) => b.points - a.points)

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar socio..." />
        <select style={inputStyle} value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
          <option value="todos">Todos los niveles</option>
          {levels.map(l => <option key={l.id} value={l.key}>{l.name}</option>)}
        </select>
      </div>

      {rows.length === 0 ? <EmptyState label="Sin resultados." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13, minWidth: 620 }}>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted }}>
                <th style={{ padding: '10px 14px' }}>Socio</th>
                <th style={{ padding: '10px 14px' }}>Nivel</th>
                <th style={{ padding: '10px 14px' }}>Puntos</th>
                <th style={{ padding: '10px 14px' }}>Canjes</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 60).map((c, i) => (
                <tr key={c.id} onClick={() => navigate(`/admin/clientes/${c.id}`)} style={{ borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', cursor: 'pointer' }}>
                  <td style={{ padding: '10px 14px', color: COLORS.greenDark, fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '10px 14px', color: c.tier?.color, textTransform: 'uppercase', fontSize: 11, fontWeight: 700 }}>{c.tier?.name}</td>
                  <td style={{ padding: '10px 14px' }}>{formatNumber(c.points)}</td>
                  <td style={{ padding: '10px 14px' }}>{getRedemptionsForCustomer(c.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
