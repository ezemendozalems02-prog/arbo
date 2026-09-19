import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import Panel, { EmptyState } from '../../components/Panel'
import {
  createStockTransfer,
  dispatchStockTransfer,
  receiveStockTransfer,
  cancelStockTransfer,
  getStockTransferWithItems,
} from '../../../services/domain/stockTransferManager'
import { supabase } from '../../../lib/supabase'

const inputStyle = {
  padding: '10px 12px',
  background: COLORS.warmWhite,
  border: `1px solid ${COLORS.lineGreen}`,
  color: COLORS.onLight,
  fontFamily: FONTS.sans,
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const btnPrimary = {
  padding: '8px 14px',
  background: COLORS.greenDark,
  color: COLORS.warmWhite,
  border: 'none',
  fontFamily: FONTS.sans,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: 2,
}

const btnDanger = {
  padding: '8px 14px',
  background: '#8A4536',
  color: '#FFFFFF',
  border: 'none',
  fontFamily: FONTS.sans,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: 2,
}

const btnSecondary = {
  padding: '8px 14px',
  background: 'transparent',
  color: COLORS.greenDark,
  border: `1px solid ${COLORS.lineGreen}`,
  fontFamily: FONTS.sans,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: 2,
}

const STATUS_STYLE = {
  DRAFT: { bg: '#E8ECE9', text: COLORS.greenDark, label: 'Borrador' },
  DISPATCHED: { bg: '#FFF2D6', text: '#8A6A2E', label: 'En Tránsito' },
  RECEIVED: { bg: '#E2F0D9', text: '#2E6930', label: 'Recibido' },
  CANCELLED: { bg: '#FCE4D6', text: '#8A4536', label: 'Cancelado' },
}

export default function StockTransfers() {
  const [transfers, setTransfers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)

  // New Transfer State
  const [newTransfer, setNewTransfer] = useState({
    origin_warehouse_id: '',
    destination_warehouse_id: '',
    notes: '',
    items: [{ ingredient_id: '', quantity: 1, unit: 'kg' }],
  })

  // Receive State
  const [receiveQuantities, setReceiveQuantities] = useState({})

  useEffect(() => {
    document.title = 'Transferencias de Stock | ARBO OS'
    loadInitialData()
  }, [])

  async function loadInitialData() {
    setLoading(true)
    try {
      const { data: whData } = await supabase.from('warehouses').select('*').order('name')
      setWarehouses(whData || [])

      const { data: ingData } = await supabase.from('ingredients').select('id, name, unit').order('name')
      setIngredients(ingData || [])

      const { data: trData } = await supabase
        .from('stock_transfers')
        .select('*')
        .order('created_at', { ascending: false })
      setTransfers(trData || [])
    } catch (err) {
      console.error('Error loading transfer initial data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectTransfer(transfer) {
    try {
      const full = await getStockTransferWithItems(transfer.id)
      setSelectedTransfer(full)
    } catch (err) {
      console.error('Error fetching transfer details:', err)
      setSelectedTransfer(transfer)
    }
  }

  function handleAddItemRow() {
    setNewTransfer(prev => ({
      ...prev,
      items: [...prev.items, { ingredient_id: '', quantity: 1, unit: 'kg' }],
    }))
  }

  function handleRemoveItemRow(index) {
    setNewTransfer(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  function handleItemRowChange(index, field, value) {
    const updated = [...newTransfer.items]
    updated[index][field] = value
    if (field === 'ingredient_id') {
      const found = ingredients.find(ing => ing.id === value)
      if (found) updated[index].unit = found.unit
    }
    setNewTransfer(prev => ({ ...prev, items: updated }))
  }

  async function handleCreateTransfer(e) {
    e.preventDefault()
    if (!newTransfer.origin_warehouse_id || !newTransfer.destination_warehouse_id) {
      alert('Seleccioná depósito origen y destino.')
      return
    }
    if (newTransfer.origin_warehouse_id === newTransfer.destination_warehouse_id) {
      alert('El depósito de origen y destino no pueden ser el mismo.')
      return
    }
    const validItems = newTransfer.items.filter(it => it.ingredient_id && Number(it.quantity) > 0)
    if (validItems.length === 0) {
      alert('Debés incluir al menos un insumo con cantidad válida.')
      return
    }

    try {
      const created = await createStockTransfer({
        organization_id: '00000000-0000-0000-0000-000000000001',
        origin_warehouse_id: newTransfer.origin_warehouse_id,
        destination_warehouse_id: newTransfer.destination_warehouse_id,
        items: validItems.map(it => ({
          ingredient_id: it.ingredient_id,
          quantity: Number(it.quantity),
          unit: it.unit,
        })),
        notes: newTransfer.notes,
        created_by: '00000000-0000-0000-0000-000000000002',
      })

      setTransfers(prev => [created, ...prev])
      setShowCreateModal(false)
      setNewTransfer({
        origin_warehouse_id: '',
        destination_warehouse_id: '',
        notes: '',
        items: [{ ingredient_id: '', quantity: 1, unit: 'kg' }],
      })
      handleSelectTransfer(created)
    } catch (err) {
      console.error('Error creating transfer:', err)
      alert('Error creando transferencia: ' + err.message)
    }
  }

  async function handleDispatch(transferId) {
    if (!confirm('¿Confirmar despacho de mercadería? Se descontará del stock de origen y congelará el costo snapshot.')) {
      return
    }
    try {
      const dispatched = await dispatchStockTransfer({
        transfer_id: transferId,
        actor_id: '00000000-0000-0000-0000-000000000002',
      })
      setTransfers(prev => prev.map(t => (t.id === transferId ? dispatched : t)))
      handleSelectTransfer(dispatched)
      alert('Transferencia despachada con éxito.')
    } catch (err) {
      console.error('Error dispatching:', err)
      alert('Error al despachar: ' + err.message)
    }
  }

  function openReceiveDialog() {
    if (!selectedTransfer) return
    const initial = {}
    ;(selectedTransfer.items || []).forEach(it => {
      initial[it.id] = it.quantity_sent || it.quantity
    })
    setReceiveQuantities(initial)
    setShowReceiveModal(true)
  }

  async function handleConfirmReceive() {
    if (!confirm('¿Confirmar recepción de mercadería en destino? Se actualizarán existencias y PPP promedio ponderado.')) {
      return
    }
    try {
      const itemsPayload = Object.entries(receiveQuantities).map(([item_id, qty]) => ({
        item_id,
        quantity_received: Number(qty),
      }))

      const received = await receiveStockTransfer({
        transfer_id: selectedTransfer.id,
        actor_id: '00000000-0000-0000-0000-000000000002',
        received_items: itemsPayload,
      })

      setTransfers(prev => prev.map(t => (t.id === selectedTransfer.id ? received : t)))
      setShowReceiveModal(false)
      handleSelectTransfer(received)
      alert('Transferencia recibida e ingresada a stock con éxito.')
    } catch (err) {
      console.error('Error receiving transfer:', err)
      alert('Error en recepción: ' + err.message)
    }
  }

  async function handleCancel(transferId) {
    const reason = prompt('Motivo de cancelación:')
    if (!reason) return
    try {
      const cancelled = await cancelStockTransfer({
        transfer_id: transferId,
        actor_id: '00000000-0000-0000-0000-000000000002',
        reason,
      })
      setTransfers(prev => prev.map(t => (t.id === transferId ? cancelled : t)))
      handleSelectTransfer(cancelled)
      alert('Transferencia cancelada.')
    } catch (err) {
      console.error('Error cancelling:', err)
      alert('Error al cancelar: ' + err.message)
    }
  }

  const filteredTransfers = statusFilter === 'ALL'
    ? transfers
    : transfers.filter(t => t.status === statusFilter)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.greenDark, margin: 0 }}>
            Transferencias de Mercadería
          </h1>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, margin: '4px 0 0 0' }}>
            Remitos internos, trazabilidad de tránsitos, control de mermas y recalculo de PPP.
          </p>
        </div>
        <button style={btnPrimary} onClick={() => setShowCreateModal(true)}>
          + Nueva Transferencia
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {['ALL', 'DRAFT', 'DISPATCHED', 'RECEIVED', 'CANCELLED'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '6px 14px',
              fontFamily: FONTS.sans,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${statusFilter === st ? COLORS.greenDark : COLORS.lineGreen}`,
              background: statusFilter === st ? COLORS.greenDark : COLORS.warmWhite,
              color: statusFilter === st ? '#FFFFFF' : COLORS.greenDark,
              borderRadius: 2,
            }}
          >
            {st === 'ALL' ? 'Todas' : STATUS_STYLE[st]?.label || st}
          </button>
        ))}
      </div>

      {/* Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Transfers List */}
        <Panel title="Listado de Transferencias">
          {loading ? (
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>Cargando transferencias...</p>
          ) : filteredTransfers.length === 0 ? (
            <EmptyState label="No se registraron transferencias para este filtro." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredTransfers.map(tr => {
                const isSelected = selectedTransfer?.id === tr.id
                const originWh = warehouses.find(w => w.id === tr.origin_warehouse_id)
                const destWh = warehouses.find(w => w.id === tr.destination_warehouse_id)
                const stConf = STATUS_STYLE[tr.status] || STATUS_STYLE.DRAFT

                return (
                  <div
                    key={tr.id}
                    onClick={() => handleSelectTransfer(tr)}
                    style={{
                      padding: 14,
                      border: `1px solid ${isSelected ? COLORS.greenDark : COLORS.lineGreen}`,
                      background: isSelected ? '#F2F6F3' : COLORS.warmWhite,
                      cursor: 'pointer',
                      borderRadius: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>
                          {tr.transfer_number}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: stConf.bg,
                          color: stConf.text,
                        }}>
                          {stConf.label}
                        </span>
                      </div>
                      <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, margin: '4px 0 0 0' }}>
                        {originWh?.name || 'Origen'} → {destWh?.name || 'Destino'}
                      </p>
                      <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, margin: '2px 0 0 0' }}>
                        Creado: {new Date(tr.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>

        {/* Transfer Detail View */}
        <Panel title={selectedTransfer ? `Detalle: ${selectedTransfer.transfer_number}` : 'Detalle de Transferencia'}>
          {!selectedTransfer ? (
            <EmptyState label="Seleccioná una transferencia para ver sus insumos y acciones." />
          ) : (
            <div>
              {/* Status Header and Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 3,
                    background: STATUS_STYLE[selectedTransfer.status]?.bg,
                    color: STATUS_STYLE[selectedTransfer.status]?.text,
                  }}>
                    {STATUS_STYLE[selectedTransfer.status]?.label}
                  </span>
                  {selectedTransfer.notes && (
                    <p style={{ fontFamily: FONTS.sans, fontSize: 12, fontStyle: 'italic', color: COLORS.onLightMuted, marginTop: 6 }}>
                      Nota: &ldquo;{selectedTransfer.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Lifecycle action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedTransfer.status === 'DRAFT' && (
                    <>
                      <button style={btnPrimary} onClick={() => handleDispatch(selectedTransfer.id)}>
                        Despachar Mercadería
                      </button>
                      <button style={btnDanger} onClick={() => handleCancel(selectedTransfer.id)}>
                        Cancelar
                      </button>
                    </>
                  )}
                  {selectedTransfer.status === 'DISPATCHED' && (
                    <>
                      <button style={btnPrimary} onClick={openReceiveDialog}>
                        Recibir en Destino
                      </button>
                      <button style={btnDanger} onClick={() => handleCancel(selectedTransfer.id)}>
                        Cancelar Tránsito
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <h3 style={{ fontFamily: FONTS.serif, fontSize: 15, color: COLORS.greenDark, marginBottom: 8 }}>
                Insumos Transferidos
              </h3>
              <div style={{ overflowX: 'auto', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.lineGreen}`, textAlign: 'left', color: COLORS.onLightMuted }}>
                      <th style={{ padding: '6px 4px' }}>Insumo</th>
                      <th style={{ padding: '6px 4px', textAlign: 'right' }}>Despachado</th>
                      <th style={{ padding: '6px 4px', textAlign: 'right' }}>Recibido</th>
                      <th style={{ padding: '6px 4px', textAlign: 'right' }}>Costo Unit. Snapshot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTransfer.items || []).map(it => {
                      const ingName = it.ingredient?.name || ingredients.find(ing => ing.id === it.ingredient_id)?.name || it.ingredient_id
                      const isDiscrepancy = it.quantity_received != null && it.quantity_received < it.quantity_sent
                      return (
                        <tr key={it.id} style={{ borderBottom: `1px solid ${COLORS.lineGreen}` }}>
                          <td style={{ padding: '8px 4px', fontWeight: 600, color: COLORS.greenDark }}>
                            {ingName}
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                            {it.quantity_sent ?? it.quantity} {it.unit}
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: isDiscrepancy ? '#8A4536' : 'inherit', fontWeight: isDiscrepancy ? 700 : 400 }}>
                            {it.quantity_received != null ? `${it.quantity_received} ${it.unit}` : '—'}
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: COLORS.onLightMuted }}>
                            {it.unit_cost_snapshot != null ? `$${Number(it.unit_cost_snapshot).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : 'Pendiente despacho'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Timeline / Audit info */}
              <div style={{ background: '#F8FAF9', padding: 12, borderRadius: 4, fontSize: 12, fontFamily: FONTS.sans, color: COLORS.onLightMuted }}>
                <p style={{ margin: '2px 0' }}>• Creado: {new Date(selectedTransfer.created_at).toLocaleString('es-AR')}</p>
                {selectedTransfer.dispatched_at && (
                  <p style={{ margin: '2px 0' }}>• Despachado: {new Date(selectedTransfer.dispatched_at).toLocaleString('es-AR')}</p>
                )}
                {selectedTransfer.received_at && (
                  <p style={{ margin: '2px 0' }}>• Recibido: {new Date(selectedTransfer.received_at).toLocaleString('es-AR')}</p>
                )}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Modal: Create Transfer */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}>
          <div style={{
            background: COLORS.warmWhite,
            maxWidth: 600,
            width: '100%',
            padding: 24,
            borderRadius: 4,
            border: `1px solid ${COLORS.lineGreen}`,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.greenDark, marginTop: 0 }}>
              Nueva Transferencia de Stock
            </h2>
            <form onSubmit={handleCreateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.greenDark }}>
                    Depósito Origen
                  </label>
                  <select
                    style={inputStyle}
                    value={newTransfer.origin_warehouse_id}
                    onChange={e => setNewTransfer({ ...newTransfer, origin_warehouse_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar Origen...</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.greenDark }}>
                    Depósito Destino
                  </label>
                  <select
                    style={inputStyle}
                    value={newTransfer.destination_warehouse_id}
                    onChange={e => setNewTransfer({ ...newTransfer, destination_warehouse_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar Destino...</option>
                    {warehouses
                      .filter(w => w.id !== newTransfer.origin_warehouse_id)
                      .map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.greenDark }}>
                  Notas / Observaciones
                </label>
                <input
                  style={inputStyle}
                  placeholder="Ej: Pedido semanal de café tostado para Trevelin"
                  value={newTransfer.notes}
                  onChange={e => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                />
              </div>

              {/* Items Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.greenDark }}>
                    Insumos a Transferir
                  </label>
                  <button type="button" style={btnSecondary} onClick={handleAddItemRow}>
                    + Agregar Insumo
                  </button>
                </div>

                {newTransfer.items.map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <select
                      style={{ ...inputStyle, flex: 2 }}
                      value={row.ingredient_id}
                      onChange={e => handleItemRowChange(idx, 'ingredient_id', e.target.value)}
                      required
                    >
                      <option value="">Seleccionar Insumo...</option>
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      style={{ ...inputStyle, width: 100 }}
                      placeholder="Cant."
                      value={row.quantity}
                      onChange={e => handleItemRowChange(idx, 'quantity', e.target.value)}
                      required
                    />

                    <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, width: 30 }}>
                      {row.unit}
                    </span>

                    {newTransfer.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        style={{ border: 'none', background: 'transparent', color: '#8A4536', cursor: 'pointer', fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <button type="button" style={btnSecondary} onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" style={btnPrimary}>
                  Crear Transferencia (Borrador)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receive Transfer */}
      {showReceiveModal && selectedTransfer && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}>
          <div style={{
            background: COLORS.warmWhite,
            maxWidth: 520,
            width: '100%',
            padding: 24,
            borderRadius: 4,
            border: `1px solid ${COLORS.lineGreen}`,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }}>
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.greenDark, marginTop: 0 }}>
              Recepción de Mercadería: {selectedTransfer.transfer_number}
            </h2>
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>
              Ingresá la cantidad física recibida. Cualquier faltante se imputará automáticamente como <strong>Merma en transporte</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0' }}>
              {(selectedTransfer.items || []).map(it => {
                const ingName = it.ingredient?.name || ingredients.find(ing => ing.id === it.ingredient_id)?.name || it.ingredient_id
                const qtySent = it.quantity_sent || it.quantity
                const qtyReceived = receiveQuantities[it.id] ?? qtySent
                const diff = Number(qtySent) - Number(qtyReceived)

                return (
                  <div key={it.id} style={{ padding: 10, background: '#F8FAF9', borderRadius: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: COLORS.greenDark }}>
                        {ingName}
                      </span>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted }}>
                        Despachado: {qtySent} {it.unit}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted }}>
                        Recibido:
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={qtySent}
                        style={{ ...inputStyle, width: 120 }}
                        value={qtyReceived}
                        onChange={e => setReceiveQuantities({ ...receiveQuantities, [it.id]: e.target.value })}
                      />
                      <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted }}>
                        {it.unit}
                      </span>
                      {diff > 0 && (
                        <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: '#8A4536', fontWeight: 700, marginLeft: 'auto' }}>
                          Faltante: {diff.toFixed(2)} {it.unit} (Merma)
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button type="button" style={btnSecondary} onClick={() => setShowReceiveModal(false)}>
                Cancelar
              </button>
              <button type="button" style={btnPrimary} onClick={handleConfirmReceive}>
                Confirmar Ingreso a Depósito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
