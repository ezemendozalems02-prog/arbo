import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import Panel, { EmptyState } from '../../components/Panel'
import { getWarehousesForBranch, createWarehouse, getWarehouseStock } from '../../../services/domain/warehouseManager'
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
  padding: '10px 16px',
  background: COLORS.greenDark,
  color: COLORS.warmWhite,
  border: 'none',
  fontFamily: FONTS.sans,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: 2,
}

const btnSecondary = {
  padding: '8px 12px',
  background: 'transparent',
  color: COLORS.greenDark,
  border: `1px solid ${COLORS.lineGreen}`,
  fontFamily: FONTS.sans,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  borderRadius: 2,
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [stockList, setStockList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newWh, setNewWh] = useState({ name: '', code: '', type: 'BRANCH', branch_id: '' })
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    document.title = 'Depósitos y Almacenes | ARBO OS'
    loadInitialData()
  }, [])

  async function loadInitialData() {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data: branchData } = await supabase.from('branches').select('id, name').order('name')
      const bList = branchData || [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Trevelin (Principal)' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Esquel' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Tostaduría / Central' },
      ]
      setBranches(bList)

      const { data: whData } = await supabase.from('warehouses').select('*').order('created_at', { ascending: true })
      setWarehouses(whData || [])
    } catch (err) {
      console.error('Error loading warehouses:', err)
      setErrorMsg('No se pudieron cargar los depósitos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectWarehouse(wh) {
    setSelectedWarehouse(wh)
    try {
      const stock = await getWarehouseStock(wh.id)
      setStockList(stock)
    } catch (err) {
      console.error('Error fetching stock:', err)
      setStockList([])
    }
  }

  async function handleCreateWarehouse(e) {
    e.preventDefault()
    if (!newWh.name || !newWh.code || !newWh.branch_id) {
      alert('Completá nombre, código y sucursal.')
      return
    }

    try {
      const created = await createWarehouse({
        organization_id: '00000000-0000-0000-0000-000000000001',
        branch_id: newWh.branch_id,
        name: newWh.name,
        code: newWh.code.toUpperCase(),
        type: newWh.type,
      })
      setWarehouses(prev => [...prev, created])
      setShowModal(false)
      setNewWh({ name: '', code: '', type: 'BRANCH', branch_id: '' })
    } catch (err) {
      console.error('Error creating warehouse:', err)
      alert('Error creando depósito: ' + err.message)
    }
  }

  const filteredWarehouses = selectedBranchId
    ? warehouses.filter(w => w.branch_id === selectedBranchId)
    : warehouses

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.greenDark, margin: 0 }}>
            Depósitos & Almacenes
          </h1>
          <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, margin: '4px 0 0 0' }}>
            Aislamiento multi-sucursal y control de stock físico independiente.
          </p>
        </div>
        <button style={btnPrimary} onClick={() => setShowModal(true)}>
          + Nuevo Depósito
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          style={{ ...inputStyle, width: 'auto', minWidth: 220 }}
          value={selectedBranchId}
          onChange={e => setSelectedBranchId(e.target.value)}
        >
          <option value="">Todas las Sucursales</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Grid container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Warehouse List */}
        <Panel title="Depósitos Habilitados">
          {loading ? (
            <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted }}>Cargando depósitos...</p>
          ) : filteredWarehouses.length === 0 ? (
            <EmptyState label="No hay depósitos registrados en esta sucursal." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredWarehouses.map(wh => {
                const branchObj = branches.find(b => b.id === wh.branch_id)
                const isSelected = selectedWarehouse?.id === wh.id
                return (
                  <div
                    key={wh.id}
                    onClick={() => handleSelectWarehouse(wh)}
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
                        <span style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700, color: COLORS.greenDark }}>
                          {wh.name}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: wh.type === 'CENTRAL' ? '#3B4D3C' : '#E8ECE9',
                          color: wh.type === 'CENTRAL' ? '#FFFFFF' : COLORS.greenDark,
                        }}>
                          {wh.type}
                        </span>
                      </div>
                      <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, margin: '4px 0 0 0' }}>
                        Código: <strong>{wh.code}</strong> · Sucursal: {branchObj?.name || wh.branch_id}
                      </p>
                    </div>
                    <div>
                      <span style={{
                        fontSize: 11,
                        color: wh.is_active ? '#2E6930' : '#8A4536',
                        fontWeight: 600,
                      }}>
                        {wh.is_active ? '● Activo' : '○ Inactivo'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>

        {/* Stock Detail for Selected Warehouse */}
        <Panel title={selectedWarehouse ? `Stock: ${selectedWarehouse.name}` : 'Existencias por Depósito'}>
          {!selectedWarehouse ? (
            <EmptyState label="Seleccioná un depósito para inspeccionar sus existencias en tiempo real." />
          ) : stockList.length === 0 ? (
            <EmptyState label="Sin existencias registradas en este depósito (saldo 0)." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.lineGreen}`, textAlign: 'left', color: COLORS.onLightMuted }}>
                    <th style={{ padding: '8px 4px' }}>Insumo / Ingrediente</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Stock Físico</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {stockList.map(st => (
                    <tr key={st.ingredient_id} style={{ borderBottom: `1px solid ${COLORS.lineGreen}` }}>
                      <td style={{ padding: '8px 4px', fontWeight: 600, color: COLORS.greenDark }}>
                        {st.ingredient_name}
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>
                        {st.quantity.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', color: COLORS.onLightMuted }}>
                        {st.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* Modal New Warehouse */}
      {showModal && (
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
            maxWidth: 460,
            width: '100%',
            padding: 24,
            borderRadius: 4,
            border: `1px solid ${COLORS.lineGreen}`,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }}>
            <h2 style={{ fontFamily: FONTS.serif, fontSize: 20, color: COLORS.greenDark, marginTop: 0 }}>
              Crear Nuevo Depósito
            </h2>
            <form onSubmit={handleCreateWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.greenDark }}>
                  Nombre del Depósito
                </label>
                <input
                  style={inputStyle}
                  placeholder="Ej: Depósito Bar / Almacén Central"
                  value={newWh.name}
                  onChange={e => setNewWh({ ...newWh, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.greenDark }}>
                  Código Único (por sucursal)
                </label>
                <input
                  style={inputStyle}
                  placeholder="Ej: BAR-01, CENTRAL-01"
                  value={newWh.code}
                  onChange={e => setNewWh({ ...newWh, code: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.greenDark }}>
                  Sucursal de Radicación
                </label>
                <select
                  style={inputStyle}
                  value={newWh.branch_id}
                  onChange={e => setNewWh({ ...newWh, branch_id: e.target.value })}
                  required
                >
                  <option value="">Seleccionar Sucursal...</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600, color: COLORS.greenDark }}>
                  Tipo de Depósito
                </label>
                <select
                  style={inputStyle}
                  value={newWh.type}
                  onChange={e => setNewWh({ ...newWh, type: e.target.value })}
                >
                  <option value="BRANCH">BRANCH (Sucursal operativa)</option>
                  <option value="CENTRAL">CENTRAL (Tostaduría / Almacén primario)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" style={btnSecondary} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" style={btnPrimary}>
                  Guardar Depósito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
