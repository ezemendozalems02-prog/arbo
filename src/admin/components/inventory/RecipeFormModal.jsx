import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { PRODUCTS } from '../../../mock/products'
import { MENU_CATEGORIES } from '../../../data/menu'
import { PREPARADO_CATEGORY } from '../../../mock/recipes'
import { UNITS_OF_MEASURE, UNIT_LABELS } from '../../../mock/units'
import { calcRecipeCost, calcFoodCostPct } from '../../../services/recipeCostService'
import { formatMoney } from '../../utils/format'
import AdminModal from '../AdminModal'
import Button from '../../ui/Button'

const inputStyle = {
  width: '100%', padding: '11px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none', boxSizing: 'border-box',
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }
const CATEGORY_OPTIONS = [...MENU_CATEGORIES, { key: PREPARADO_CATEGORY, label: 'Preparados' }]

let rowSeq = 0
const emptyRow = () => ({ rid: `row-${++rowSeq}`, kind: 'insumo', refId: '', quantity: '', unit: 'gramo' })

// BLOQUE 10/11/13 — crear/editar receta con ingredientes dinámicos (insumo
// o receta compuesta) y costeo en vivo mientras se completa el formulario.
export default function RecipeFormModal({ open, onClose, onSave, items, recipes, initialRecipe }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryKey, setCategoryKey] = useState(CATEGORY_OPTIONS[0].key)
  const [productId, setProductId] = useState('')
  const [yieldQty, setYieldQty] = useState('1')
  const [yieldUnit, setYieldUnit] = useState('porcion')
  const [rows, setRows] = useState([emptyRow()])

  useEffect(() => {
    if (!open) return
    if (initialRecipe) {
      setName(initialRecipe.name); setDescription(initialRecipe.description ?? ''); setCategoryKey(initialRecipe.categoryKey)
      setProductId(initialRecipe.productId ?? ''); setYieldQty(String(initialRecipe.yield.qty)); setYieldUnit(initialRecipe.yield.unit)
      setRows(initialRecipe.ingredients.length ? initialRecipe.ingredients.map(i => ({ rid: `row-${++rowSeq}`, kind: i.kind, refId: i.refId, quantity: String(i.quantity), unit: i.unit })) : [emptyRow()])
    } else {
      setName(''); setDescription(''); setCategoryKey(CATEGORY_OPTIONS[0].key); setProductId('')
      setYieldQty('1'); setYieldUnit('porcion'); setRows([emptyRow()])
    }
  }, [open, initialRecipe])

  const getInsumo = (id) => items.find(i => i.id === id) ?? null
  const getRecipe = (id) => (initialRecipe?.id === id ? null : recipes.find(r => r.id === id)) ?? null // no permitir que se referencie a sí misma

  const validRows = rows.filter(r => r.refId && Number(r.quantity) > 0)
  const valid = name.trim().length > 0 && Number(yieldQty) > 0 && validRows.length > 0

  const draftRecipe = {
    id: initialRecipe?.id ?? '__draft__',
    yield: { qty: Number(yieldQty) || 1, unit: yieldUnit },
    ingredients: validRows.map(r => ({ kind: r.kind, refId: r.refId, quantity: Number(r.quantity), unit: r.unit })),
  }
  const preview = calcRecipeCost(draftRecipe, { getInsumo, getRecipe })
  const product = PRODUCTS.find(p => p.id === productId)
  const foodCostPct = product ? calcFoodCostPct(preview.costPerPortion, product.price) : 0

  const updateRow = (rid, patch) => setRows(rs => rs.map(r => r.rid === rid ? { ...r, ...patch } : r))
  const addRow = () => setRows(rs => [...rs, emptyRow()])
  const removeRow = (rid) => setRows(rs => rs.filter(r => r.rid !== rid))

  const submit = () => {
    if (!valid) return
    onSave({
      name: name.trim(), description: description.trim(), categoryKey, productId: productId || null,
      yield: { qty: Number(yieldQty), unit: yieldUnit }, ingredients: draftRecipe.ingredients,
    })
  }

  // Nunca ofrecer la propia receta que se está editando como su ingrediente
  // (evitaría un ciclo A usa A).
  const recipeOptions = recipes.filter(r => r.id !== initialRecipe?.id)

  return (
    <AdminModal open={open} onClose={onClose} title={initialRecipe ? 'Editar receta' : 'Nueva receta'} width={560}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Hamburguesa ARBO" autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Categoría</label>
          <select style={inputStyle} value={categoryKey} onChange={e => setCategoryKey(e.target.value)}>
            {CATEGORY_OPTIONS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <label style={labelStyle}>Descripción</label>
      <input style={{ ...inputStyle, marginBottom: 12 }} value={description} onChange={e => setDescription(e.target.value)} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
        <div>
          <label style={labelStyle}>Producto asociado</label>
          <select style={inputStyle} value={productId} onChange={e => setProductId(e.target.value)}>
            <option value="">Ninguno (preparado)</option>
            {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Rinde</label>
          <input style={inputStyle} type="number" min={0} value={yieldQty} onChange={e => setYieldQty(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Unidad</label>
          <select style={inputStyle} value={yieldUnit} onChange={e => setYieldUnit(e.target.value)}>
            {UNITS_OF_MEASURE.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
          </select>
        </div>
      </div>

      <label style={labelStyle}>Ingredientes</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {rows.map(row => (
          <div key={row.rid} style={{ display: 'grid', gridTemplateColumns: '80px 2fr 80px 90px 28px', gap: 6, alignItems: 'center' }}>
            <select style={inputStyle} value={row.kind} onChange={e => updateRow(row.rid, { kind: e.target.value, refId: '' })}>
              <option value="insumo">Insumo</option>
              <option value="recipe">Receta</option>
            </select>
            <select style={inputStyle} value={row.refId} onChange={e => updateRow(row.rid, { refId: e.target.value })}>
              <option value="">Seleccionar...</option>
              {row.kind === 'insumo'
                ? items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)
                : recipeOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input style={inputStyle} type="number" min={0} value={row.quantity} onChange={e => updateRow(row.rid, { quantity: e.target.value })} placeholder="Cant." />
            <select style={inputStyle} value={row.unit} onChange={e => updateRow(row.rid, { unit: e.target.value })}>
              {UNITS_OF_MEASURE.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
            </select>
            <button onClick={() => removeRow(row.rid)} aria-label="Quitar ingrediente"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.onLightFaint, fontSize: 16 }}>×</button>
          </div>
        ))}
      </div>
      <button onClick={addRow} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, padding: 0, marginBottom: 18, textDecoration: 'underline' }}>
        + Agregar ingrediente
      </button>

      <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, paddingTop: 14, marginBottom: 18, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightMuted, textTransform: 'uppercase' }}>Costo total</p>
          <p style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.greenDark }}>{formatMoney(preview.ingredientsCost)}</p>
        </div>
        <div>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightMuted, textTransform: 'uppercase' }}>Costo por porción</p>
          <p style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.greenDark }}>{formatMoney(preview.costPerPortion)}</p>
        </div>
        {product && (
          <div>
            <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightMuted, textTransform: 'uppercase' }}>Food cost</p>
            <p style={{ fontFamily: FONTS.serif, fontSize: 20, color: foodCostPct > 35 ? '#8A4536' : COLORS.greenDark }}>{foodCostPct.toFixed(1)}%</p>
          </div>
        )}
      </div>

      <Button full disabled={!valid} onClick={submit}>{initialRecipe ? 'Guardar cambios' : 'Crear receta'}</Button>
    </AdminModal>
  )
}
