import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { INVENTORY_CATEGORIES } from '../../../mock/inventoryCategories'
import { UNITS_OF_MEASURE, UNIT_LABELS } from '../../../mock/units'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '12px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 14,
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

// BLOQUE 4/44 — crear insumo, con validaciones básicas (nada negativo, no
// se puede guardar sin nombre/categoría/proveedor).
export default function NewInsumoModal({ open, onClose, onCreate, suppliers }) {
  const [name, setName] = useState('')
  const [categoryKey, setCategoryKey] = useState(INVENTORY_CATEGORIES[0].key)
  const [unit, setUnit] = useState('kilogramo')
  const [stockMin, setStockMin] = useState('')
  const [stockMax, setStockMax] = useState('')
  const [currentStock, setCurrentStock] = useState('')
  const [cost, setCost] = useState('')
  const [primarySupplierId, setPrimarySupplierId] = useState(suppliers[0]?.id ?? '')

  const reset = () => { setName(''); setCategoryKey(INVENTORY_CATEGORIES[0].key); setUnit('kilogramo'); setStockMin(''); setStockMax(''); setCurrentStock(''); setCost(''); setPrimarySupplierId(suppliers[0]?.id ?? '') }
  const close = () => { reset(); onClose() }

  const valid = name.trim().length > 0 && primarySupplierId && Number(stockMin) >= 0 && Number(stockMax) >= 0 && Number(currentStock) >= 0 && Number(cost) >= 0

  const submit = () => {
    if (!valid) return
    onCreate({
      name: name.trim(), categoryKey, unit,
      stockMin: Number(stockMin) || 0, stockMax: Number(stockMax) || 0, currentStock: Number(currentStock) || 0,
      cost: Number(cost) || 0, primarySupplierId, code: `${categoryKey.slice(0, 3).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
    })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Nuevo insumo" width={440}>
      <label style={labelStyle}>Nombre</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Queso provolone" autoFocus />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Categoría</label>
          <select style={inputStyle} value={categoryKey} onChange={e => setCategoryKey(e.target.value)}>
            {INVENTORY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Unidad de stock</label>
          <select style={inputStyle} value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS_OF_MEASURE.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Mínimo</label>
          <input style={inputStyle} type="number" min={0} value={stockMin} onChange={e => setStockMin(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Máximo</label>
          <input style={inputStyle} type="number" min={0} value={stockMax} onChange={e => setStockMax(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Stock inicial</label>
          <input style={inputStyle} type="number" min={0} value={currentStock} onChange={e => setCurrentStock(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Costo actual</label>
          <input style={inputStyle} type="number" min={0} value={cost} onChange={e => setCost(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Proveedor principal</label>
          <select style={inputStyle} value={primarySupplierId} onChange={e => setPrimarySupplierId(e.target.value)}>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <Button full disabled={!valid} onClick={submit}>Crear insumo</Button>
    </AdminModal>
  )
}
