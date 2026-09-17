import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { useToast } from '../../context/ToastContext'
import { TABLE_ZONES } from '../../../mock/tables'
import TableCard from '../../components/pos/TableCard'
import OpenTableModal from '../../components/pos/OpenTableModal'
import TableDetailModal from '../../components/pos/TableDetailModal'

const ZONE_LABELS = { interior: 'Interior', ventana: 'Ventana', exterior: 'Exterior' }

export default function Mesas() {
  useEffect(() => { document.title = 'Mesas | ARBO OS' }, [])
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { tables, getOrder, openTable, cancelOrder, getOrderKitchenStatus } = usePOS()
  const [selectedTableId, setSelectedTableId] = useState(null)

  const selectedTable = tables.find(t => t.id === selectedTableId) ?? null
  const selectedOrder = selectedTable?.orderId ? getOrder(selectedTable.orderId) : null

  const handleTableClick = (table) => setSelectedTableId(table.id)
  const closeModals = () => setSelectedTableId(null)

  const handleOpenTable = (partySize) => {
    openTable(selectedTable.id, { partySize })
    showToast(`Mesa ${selectedTable.number} abierta`)
    navigate(`/admin/pos?table=${selectedTable.id}`)
  }

  const handleCancelOrder = () => {
    if (!confirm('¿Cancelar la orden y liberar la mesa?')) return
    cancelOrder(selectedTable.orderId)
    showToast(`Mesa ${selectedTable.number} liberada`)
    closeModals()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries({ libre: 'Libre', ocupada: 'Ocupada', reservada: 'Reservada', pago_pendiente: 'Pago pendiente' }).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted }}>
            <span style={{
              width: 10, height: 10,
              background: key === 'libre' ? COLORS.warmWhite : key === 'ocupada' ? COLORS.greenDark : key === 'reservada' ? '#B08A3E' : '#A65B4A',
              border: key === 'libre' ? `1px solid ${COLORS.lineGreen}` : 'none',
            }} />
            {label}
          </div>
        ))}
      </div>

      {TABLE_ZONES.map(zone => (
        <div key={zone} style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: FONTS.serif, fontSize: 18, color: COLORS.greenDark, marginBottom: 14 }}>{ZONE_LABELS[zone]}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 14 }}>
            {tables.filter(t => t.zone === zone).map(table => (
              <TableCard key={table.id} table={table} onClick={() => handleTableClick(table)}
                kitchenReady={table.orderId ? getOrderKitchenStatus(table.orderId) === 'lista' : false} />
            ))}
          </div>
        </div>
      ))}

      <OpenTableModal table={selectedTable} open={!!selectedTable && (selectedTable.status === 'libre' || selectedTable.status === 'reservada')}
        onClose={closeModals} onOpenTable={handleOpenTable} />

      <TableDetailModal table={selectedTable} order={selectedOrder}
        open={!!selectedTable && (selectedTable.status === 'ocupada' || selectedTable.status === 'pago_pendiente')}
        onClose={closeModals}
        onAddProducts={() => navigate(`/admin/pos?table=${selectedTable.id}`)}
        onCancelOrder={handleCancelOrder}
        onSaleConfirmed={(sale) => { showToast(`Venta #${String(sale.number).padStart(4, '0')} registrada`); closeModals() }} />
    </div>
  )
}
