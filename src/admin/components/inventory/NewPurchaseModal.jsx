import { useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { UNITS_OF_MEASURE, UNIT_LABELS } from '../../../mock/units'
import { TAX_RATE } from '../../../mock/purchases'
import { resolvePurchaseLine } from '../../../services/purchaseService'
import { formatMoney } from '../../utils/format'
import AdminModal from '../AdminModal'
import Button from '../../../components/ui/Button'

const inputStyle = {
  width: '100%', padding: '11px 12px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 13, outline: 'none', boxSizing: 'border-box',
}
const labelStyle = { fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8, display: 'block' }

let rowSeq = 0
const emptyRow = (insumoId, unit) => ({ rid: `prow-${++rowSeq}`, insumoId: insumoId ?? '', quantity: '', unit: unit ?? '', unitsToStock: '1', unitPrice: '' })

// BLOQUE 6/21 — crear compra. Si la unidad elegida para la línea no es la
// unidad de stock del insumo (ej. "caja" en vez de "kg"), se pide el
// factor `unitsToStock` para poder convertir al recibirla.
export default function NewPurchaseModal({ open, onClose, onCreate, suppliers, items }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '')
  const [notes, setNotes] = useState('')
  const [rows, setRows] = useState([emptyRow()])

  const reset = () => { setSupplierId(suppliers[0]?.id ?? ''); setNotes(''); setRows([emptyRow()]) }
  const close = () => { reset(); onClose() }

  const updateRow = (rid, patch) => setRows(rs => rs.map(r => {
    if (r.rid !== rid) return r
    const next = { ...r, ...patch }
    if (patch.insumoId) {
      const insumo = items.find(i => i.id === patch.insumoId)
      if (insumo && !next.unit) next.unit = insumo.unit
    }
    return next
  }))
  const addRow = () => setRows(rs => [...rs, emptyRow()])
  const removeRow = (rid) => setRows(rs => rs.filter(r => r.rid !== rid))

  const enrichedRows = rows.map(r => {
    const insumo = items.find(i => i.id === r.insumoId)
    const quantity = Number(r.quantity) || 0
    const unitPrice = Number(r.unitPrice) || 0
    const subtotal = Math.round(quantity * unitPrice)
    const needsFactor = insumo && r.unit && r.unit !== insumo.unit
    return { ...r, insumo, quantity, unitPrice, subtotal, needsFactor }
  })

  const validRows = enrichedRows.filter(r => r.insumo && r.quantity > 0 && r.unitPrice >= 0)
  const subtotal = validRows.reduce((s, r) => s + r.subtotal, 0)
  const taxAmount = Math.round(subtotal * TAX_RATE / 100)
  const total = subtotal + taxAmount
  const valid = supplierId && validRows.length > 0

  const submit = () => {
    if (!valid) return
    const purchaseItems = validRows.map(r => ({
      insumoId: r.insumoId, quantity: r.quantity, unit: r.unit, unitsToStock: Number(r.unitsToStock) || 1,
      unitPrice: r.unitPrice, subtotal: r.subtotal,
    }))
    onCreate({ supplierId, items: purchaseItems, subtotal, taxAmount, total, notes: notes.trim(), status: 'pendiente' })
    close()
  }

  return (
    <AdminModal open={open} onClose={close} title="Nueva compra" width={620}>
      <label style={labelStyle}>Proveedor</label>
      <select style={{ ...inputStyle, marginBottom: 16 }} value={supplierId} onChange={e => setSupplierId(e.target.value)}>
        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <label style={labelStyle}>Productos</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {enrichedRows.map(row => (
          <div key={row.rid}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 70px 90px 100px 28px', gap: 6, alignItems: 'center' }}>
              <select style={inputStyle} value={row.insumoId} onChange={e => updateRow(row.rid, { insumoId: e.target.value })}>
                <option value="">Seleccionar insumo...</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <input style={inputStyle} type="number" min={0} value={row.quantity} onChange={e => updateRow(row.rid, { quantity: e.target.value })} placeholder="Cant." />
              <select style={inputStyle} value={row.unit} onChange={e => updateRow(row.rid, { unit: e.target.value })}>
                {UNITS_OF_MEASURE.map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
              </select>
              <input style={inputStyle} type="number" min={0} value={row.unitPrice} onChange={e => updateRow(row.rid, { unitPrice: e.target.value })} placeholder="Precio unit." />
              <button onClick={() => removeRow(row.rid)} aria-label="Quitar producto" style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.onLightFaint, fontSize: 16 }}>×</button>
            </div>
            {row.needsFactor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, marginLeft: 4 }}>
                <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightMuted }}>
                  1 {row.unit} equivale a
                </span>
                <input style={{ ...inputStyle, width: 70, padding: '6px 8px' }} type="number" min={0} value={row.unitsToStock} onChange={e => updateRow(row.rid, { unitsToStock: e.target.value })} />
                <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightMuted }}>{row.insumo.unit} de stock</span>
              </div>
            )}
            {row.insumo && row.quantity > 0 && row.unitPrice > 0 && (
              <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 2, marginLeft: 4 }}>
                Ingresa {resolvePurchaseLine({ ...row, unitsToStock: Number(row.unitsToStock) || 1 }, row.insumo).stockQty.toLocaleString('es-AR')} {row.insumo.unit} de stock · subtotal {formatMoney(row.subtotal)}
              </p>
            )}
          </div>
        ))}
      </div>
      <button onClick={addRow} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 12, color: COLORS.green, padding: 0, marginBottom: 18, textDecoration: 'underline' }}>
        + Agregar producto
      </button>

      <label style={labelStyle}>Observaciones</label>
      <input style={{ ...inputStyle, marginBottom: 16 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Opcional" />

      <div style={{ borderTop: `1px solid ${COLORS.lineGreen}`, paddingTop: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 4 }}>
          <span>Subtotal</span><span>{formatMoney(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 4 }}>
          <span>IVA ({TAX_RATE}%)</span><span>{formatMoney(taxAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.serif, fontSize: 22, color: COLORS.greenDark, fontWeight: 600, marginTop: 6 }}>
          <span>Total</span><span>{formatMoney(total)}</span>
        </div>
      </div>

      <Button full disabled={!valid} onClick={submit}>Crear compra</Button>
    </AdminModal>
  )
}
