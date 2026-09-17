import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { INVENTORY_CATEGORIES } from '../../../mock/inventoryCategories'
import { UNIT_SHORT } from '../../../mock/units'
import { formatMoney } from '../../utils/format'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'

const inputStyle = {
  width: 100, padding: '8px 10px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none', textAlign: 'right',
}

// BLOQUE 31 — inventario físico: contar stock real por categoría,
// compararlo contra el sistema y, al confirmar, generar los ajustes.
export default function PhysicalInventory() {
  useEffect(() => { document.title = 'Inventario físico | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { items, createPhysicalInventory } = useInventory()
  const [categoryKey, setCategoryKey] = useState('')
  const [counts, setCounts] = useState({})

  const categoryItems = items.filter(i => i.categoryKey === categoryKey)

  const setCount = (insumoId, value) => setCounts(c => ({ ...c, [insumoId]: value }))

  const rows = categoryItems.map(item => {
    const raw = counts[item.id]
    const countedQty = raw === undefined || raw === '' ? item.currentStock : Number(raw)
    const diff = countedQty - item.currentStock
    return { item, countedQty, diff, valueDiff: diff * item.avgCost }
  })
  const totalValueDiff = rows.reduce((s, r) => s + r.valueDiff, 0)
  const changedCount = rows.filter(r => r.diff !== 0).length

  const confirm = () => {
    const result = createPhysicalInventory({ categoryKey, counts: rows.map(r => ({ insumoId: r.item.id, countedQty: r.countedQty })) })
    showToast(`Inventario físico registrado · ${changedCount} ajuste${changedCount === 1 ? '' : 's'}`)
    setCounts({})
    navigate(`/admin/inventario`)
    return result
  }

  return (
    <div>
      <button onClick={() => navigate('/admin/inventario')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, marginBottom: 18, padding: 0 }}>
        ← Volver a Inventario
      </button>

      <Panel title="Inventario físico">
        <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 10 }}>Categoría a contar</p>
        <select
          style={{ padding: '11px 14px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, fontFamily: FONTS.sans, fontSize: 13, marginBottom: 20, width: '100%', maxWidth: 320 }}
          value={categoryKey} onChange={e => { setCategoryKey(e.target.value); setCounts({}) }}>
          <option value="">Seleccionar categoría...</option>
          {INVENTORY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>

        {!categoryKey ? (
          <EmptyState label="Elegí una categoría para empezar el conteo." />
        ) : categoryItems.length === 0 ? (
          <EmptyState label="No hay insumos en esta categoría." />
        ) : (
          <>
            <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, marginBottom: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 8, padding: '10px 14px', fontFamily: FONTS.sans, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightMuted, borderBottom: `1px solid ${COLORS.lineGreen}` }}>
                <span>Insumo</span><span style={{ textAlign: 'right' }}>Sistema</span><span style={{ textAlign: 'right' }}>Físico</span><span style={{ textAlign: 'right' }}>Diferencia</span><span style={{ textAlign: 'right' }}>Valor dif.</span>
              </div>
              {rows.map(({ item, countedQty, diff, valueDiff }, i) => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 8, alignItems: 'center', padding: '10px 14px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none' }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>{item.name}</span>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, textAlign: 'right' }}>{item.currentStock} {UNIT_SHORT[item.unit]}</span>
                  <input style={inputStyle} type="number" min={0} value={countedQty}
                    onChange={e => setCount(item.id, e.target.value)} />
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, textAlign: 'right', color: diff === 0 ? COLORS.onLightFaint : diff > 0 ? COLORS.green : '#8A4536' }}>
                    {diff > 0 ? '+' : ''}{diff.toLocaleString('es-AR')}
                  </span>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, textAlign: 'right', color: valueDiff === 0 ? COLORS.onLightFaint : valueDiff > 0 ? COLORS.green : '#8A4536' }}>
                    {valueDiff === 0 ? '—' : formatMoney(valueDiff)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
                {changedCount} insumo{changedCount === 1 ? '' : 's'} con diferencia · valor total {formatMoney(totalValueDiff)}
              </p>
              <Button disabled={changedCount === 0} onClick={confirm}>Confirmar y generar ajustes</Button>
            </div>
          </>
        )}
      </Panel>
    </div>
  )
}
