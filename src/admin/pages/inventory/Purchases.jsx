import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { PURCHASE_STATUSES, PURCHASE_STATUS_LABELS } from '../../../mock/purchases'
import { formatMoney, formatDate } from '../../utils/format'
import { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'
import NewPurchaseModal from '../../components/inventory/NewPurchaseModal'

const STATUS_STYLE = {
  borrador: { bg: 'rgba(12,16,20,0.08)', color: COLORS.onLightMuted },
  pendiente: { bg: 'rgba(176,138,62,0.16)', color: '#8A6A2E' },
  recibida: { bg: 'rgba(31,64,47,0.9)', color: '#F4F0E4' },
  cancelada: { bg: 'rgba(166,91,74,0.16)', color: '#8A4536' },
}

function Badge({ status }) {
  const s = STATUS_STYLE[status]
  return (
    <span style={{ fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: s.color, background: s.bg, padding: '4px 9px', borderRadius: 3 }}>
      {PURCHASE_STATUS_LABELS[status]}
    </span>
  )
}

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

export default function Purchases() {
  useEffect(() => { document.title = 'Compras | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { purchases, suppliers, items, createPurchase } = useInventory()
  const [query, setQuery] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [formOpen, setFormOpen] = useState(false)

  const supplierName = (id) => suppliers.find(s => s.id === id)?.name ?? '—'

  const q = query.trim().toLowerCase()
  const filtered = [...purchases]
    .sort((a, b) => b.date - a.date)
    .filter(p => supplierFilter === 'todos' || p.supplierId === supplierFilter)
    .filter(p => statusFilter === 'todos' || p.status === statusFilter)
    .filter(p => !q || String(p.number).includes(q) || supplierName(p.supplierId).toLowerCase().includes(q))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por número o proveedor..." />
          <select style={inputStyle} value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}>
            <option value="todos">Todos los proveedores</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select style={inputStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {PURCHASE_STATUSES.map(s => <option key={s} value={s}>{PURCHASE_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nueva compra</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState label={purchases.length === 0 ? 'Todavía no hay compras.' : 'Sin resultados para este filtro.'} />
      ) : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {filtered.map((p, i) => (
            <button key={p.id} onClick={() => navigate(`/admin/compras/${p.id}`)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, width: '100%', textAlign: 'left',
                padding: '14px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
                borderRight: 'none', borderBottom: 'none', borderLeft: 'none', background: 'none',
                cursor: 'pointer', fontFamily: FONTS.sans,
              }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>#{p.number} · {supplierName(p.supplierId)}</p>
                <p style={{ fontSize: 12, color: COLORS.onLightFaint, marginTop: 2 }}>{formatDate(p.date)} · {p.items.length} producto{p.items.length === 1 ? '' : 's'}</p>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.greenDark, flexShrink: 0 }}>{formatMoney(p.total)}</span>
              <div style={{ flexShrink: 0 }}><Badge status={p.status} /></div>
            </button>
          ))}
        </div>
      )}

      <NewPurchaseModal open={formOpen} onClose={() => setFormOpen(false)} suppliers={suppliers.filter(s => s.status === 'activo')} items={items}
        onCreate={(data) => { createPurchase(data); showToast('Compra creada') }} />
    </div>
  )
}
