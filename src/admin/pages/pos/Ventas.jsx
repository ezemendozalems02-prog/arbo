import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { PAYMENT_METHODS } from '../../../mock/orders'
import { EmptyState } from '../../components/Panel'
import { formatMoney, formatTime } from '../../utils/format'

const PAYMENT_LABELS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', mercado_pago: 'Mercado Pago', transferencia: 'Transferencia' }
const SALE_STATUS_LABELS = { aprobado: 'Aprobada', rechazado: 'Rechazada', cancelado: 'Cancelada' }
const SALE_STATUS_COLORS = { aprobado: { bg: 'rgba(31,64,47,0.9)', color: '#F4F0E4' }, rechazado: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536' }, cancelado: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536' } }

function SaleStatusBadge({ status }) {
  const s = SALE_STATUS_COLORS[status]
  return (
    <span style={{ fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: s.color, background: s.bg, padding: '4px 9px', borderRadius: 3 }}>
      {SALE_STATUS_LABELS[status]}
    </span>
  )
}

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

export default function Ventas() {
  useEffect(() => { document.title = 'Ventas | ARBO OS' }, [])
  const navigate = useNavigate()
  const { sales } = usePOS()
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('todos')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...sales]
      .sort((a, b) => b.createdAt - a.createdAt)
      .filter(s => methodFilter === 'todos' || s.paymentMethod === methodFilter)
      .filter(s => !q || s.customerName?.toLowerCase().includes(q) || String(s.number).includes(q) || (s.tableNumber && String(s.tableNumber).includes(q)))
  }, [sales, query, methodFilter])

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input style={{ ...inputStyle, flex: 1, minWidth: 200 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por número, mesa o cliente..." />
        <select style={inputStyle} value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
          <option value="todos">Todos los métodos</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState label={sales.length === 0 ? 'Todavía no se registraron ventas.' : 'Sin resultados para este filtro.'} />
      ) : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {filtered.map((sale, i) => (
            <button key={sale.id} onClick={() => navigate(`/admin/ventas/${sale.id}`)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, width: '100%', textAlign: 'left',
                padding: '14px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
                borderRight: 'none', borderBottom: 'none', borderLeft: 'none', background: 'none',
                cursor: 'pointer', fontFamily: FONTS.sans,
              }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>
                  #{String(sale.number).padStart(4, '0')} {sale.tableNumber ? `· Mesa ${sale.tableNumber}` : '· Mostrador'}
                </p>
                <p style={{ fontSize: 12, color: COLORS.onLightFaint, marginTop: 2 }}>
                  {sale.customerName ?? 'Sin cliente'} · {formatTime(sale.createdAt)} · {PAYMENT_LABELS[sale.paymentMethod]}
                </p>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.greenDark, flexShrink: 0 }}>{formatMoney(sale.total)}</span>
              <div style={{ flexShrink: 0 }}><SaleStatusBadge status={sale.paymentStatus} /></div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
