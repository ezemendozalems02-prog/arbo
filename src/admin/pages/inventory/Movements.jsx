import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { STOCK_MOVEMENT_TYPES, STOCK_MOVEMENT_LABELS } from '../../../mock/stockMovements'
import { UNIT_SHORT } from '../../../mock/units'
import { formatQty } from '../../utils/format'
import { EmptyState } from '../../components/Panel'

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

const TYPE_COLOR = {
  entrada: COLORS.green, devolucion: COLORS.green,
  salida: '#8A4536', merma: '#8A4536', consumo: '#8A6A2E', ajuste: COLORS.onLightMuted, transferencia: COLORS.onLightMuted,
}

export default function Movements() {
  useEffect(() => { document.title = 'Movimientos | ARBO OS' }, [])
  const navigate = useNavigate()
  const { movements, getItemById } = useInventory()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('todos')

  const q = query.trim().toLowerCase()
  const filtered = [...movements]
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter(m => typeFilter === 'todos' || m.type === typeFilter)
    .filter(m => !q || (getItemById(m.insumoId)?.name ?? '').toLowerCase().includes(q))

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por insumo..." />
        <select style={inputStyle} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {STOCK_MOVEMENT_TYPES.map(t => <option key={t} value={t}>{STOCK_MOVEMENT_LABELS[t]}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState label="Sin movimientos para este filtro." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {filtered.slice(0, 150).map((m, i) => {
            const item = getItemById(m.insumoId)
            return (
              <div key={m.id} onClick={() => item && navigate(`/admin/inventario/${item.id}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '12px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', cursor: item ? 'pointer' : 'default' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>{item?.name ?? m.insumoId}</p>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 2 }}>{m.reason} · {m.user}</p>
                </div>
                <span style={{ fontFamily: FONTS.sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TYPE_COLOR[m.type] }}>
                  {STOCK_MOVEMENT_LABELS[m.type]}
                </span>
                <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, whiteSpace: 'nowrap' }}>
                  {formatQty(m.stockBefore, m.unit, UNIT_SHORT)} → {formatQty(m.stockAfter, m.unit, UNIT_SHORT)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
