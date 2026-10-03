import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { INVENTORY_CATEGORY_LABELS } from '../../../mock/inventoryCategories'
import { EmptyState } from '../../components/Panel'
import Button from '../../ui/Button'
import NewSupplierModal from '../../components/inventory/NewSupplierModal'

const inputStyle = {
  padding: '10px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none',
}

export default function Suppliers() {
  useEffect(() => { document.title = 'Proveedores | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { suppliers, createSupplier } = useInventory()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [formOpen, setFormOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...suppliers]
      .filter(s => statusFilter === 'todos' || s.status === statusFilter)
      .filter(s => !q || s.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [suppliers, query, statusFilter])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 180 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar proveedor..." />
          <select style={inputStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nuevo proveedor</Button>
      </div>

      {filtered.length === 0 ? <EmptyState label="Sin resultados." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {filtered.map((s, i) => (
            <button key={s.id} onClick={() => navigate(`/admin/proveedores/${s.id}`)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, width: '100%', textAlign: 'left',
                padding: '14px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none',
                borderRight: 'none', borderBottom: 'none', borderLeft: 'none', background: 'none',
                cursor: 'pointer', fontFamily: FONTS.sans,
              }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>{s.name}</p>
                <p style={{ fontSize: 12, color: COLORS.onLightFaint, marginTop: 2 }}>
                  {s.categories.map(c => INVENTORY_CATEGORY_LABELS[c]).join(', ')}
                </p>
              </div>
              <span style={{
                fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: s.status === 'activo' ? COLORS.green : COLORS.onLightFaint, flexShrink: 0,
              }}>
                {s.status}
              </span>
            </button>
          ))}
        </div>
      )}

      <NewSupplierModal open={formOpen} onClose={() => setFormOpen(false)}
        onCreate={(data) => { createSupplier(data); showToast(`Proveedor "${data.name}" creado`) }} />
    </div>
  )
}
