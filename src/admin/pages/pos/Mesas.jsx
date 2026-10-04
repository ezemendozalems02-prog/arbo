import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { usePOS } from '../../../context/POSContext'
import { useToast } from '../../context/ToastContext'
import { calcOrderTotals } from '../../../services/salesCalculations'
import { TABLE_STATUS_LABELS } from '../../../mock/tables'
import { ZONES } from '../../config/floorPlan'
import { STATUS_ORDER, TABLE_STATUS_STYLE } from '../../components/pos/tableStyles'
import FloorMap from '../../components/pos/FloorMap'
import OpenTableModal from '../../components/pos/OpenTableModal'
import TableDetailModal from '../../components/pos/TableDetailModal'
import { OS } from '../../styles/tokens'

// Reloj de la pantalla para los minutos de ocupación (se refresca cada 30 s).
function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export default function Mesas() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { tables, getOrder, openTable, cancelOrder, getOrderKitchenStatus } = usePOS()
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [zone, setZone] = useState('all')
  const now = useNow()

  const selectedTable = tables.find(t => t.id === selectedTableId) ?? null
  const selectedOrder = selectedTable?.orderId ? getOrder(selectedTable.orderId) : null

  const handleTableClick = (table) => setSelectedTableId(table.id)
  const closeModals = () => setSelectedTableId(null)

  const handleOpenTable = (partySize) => {
    openTable(selectedTable.id, { partySize })
    showToast(`Mesa ${selectedTable.number} abierta`, { description: `${partySize} ${partySize === 1 ? 'persona' : 'personas'}. Cargá el pedido en el POS.` })
    navigate(`/admin/pos?table=${selectedTable.id}`)
  }

  const handleCancelOrder = () => {
    if (!confirm('¿Cancelar la orden y liberar la mesa?')) return
    cancelOrder(selectedTable.orderId)
    showToast(`Mesa ${selectedTable.number} liberada`)
    closeModals()
  }

  const getOrderInfo = (table) => {
    const order = table.orderId ? getOrder(table.orderId) : null
    return {
      order,
      total: order ? calcOrderTotals(order).total : 0,
      kitchenReady: table.orderId ? getOrderKitchenStatus(table.orderId) === 'lista' : false,
    }
  }

  // Resumen del salón (sobre la zona elegida).
  const inScope = zone === 'all' ? tables : tables.filter(t => t.zone === zone)
  const counts = Object.fromEntries(STATUS_ORDER.map(s => [s, inScope.filter(t => t.status === s).length]))
  const busy = inScope.filter(t => t.status === 'ocupada' || t.status === 'pago_pendiente')
  const seated = busy.reduce((s, t) => s + (getOrder(t.orderId)?.partySize ?? t.capacity), 0)
  const capacity = inScope.reduce((s, t) => s + t.capacity, 0)
  const occupancy = inScope.length ? Math.round((busy.length / inScope.length) * 100) : 0

  const zoneTabs = [
    { key: 'all', label: 'Todo el salón', free: tables.filter(t => t.status === 'libre').length },
    ...ZONES.map(z => ({ key: z.key, label: z.label, free: tables.filter(t => t.zone === z.key && t.status === 'libre').length })),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div className="os-segmented" role="group" aria-label="Zona del salón" style={{ flexWrap: 'wrap' }}>
          {zoneTabs.map(t => (
            <button key={t.key} type="button" aria-pressed={zone === t.key} onClick={() => setZone(t.key)} style={{ height: 34, padding: '0 14px' }}>
              {t.label} <span className="os-num" style={{ marginLeft: 4, color: 'var(--os-success)', fontWeight: 800 }}>{t.free}</span>
            </button>
          ))}
        </div>
        <p className="os-num" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: OS.color.ink2 }}>
          <Users size={15} aria-hidden="true" color="var(--os-leaf)" />
          <strong style={{ color: OS.color.ink }}>{seated}</strong> de {capacity} lugares · <strong style={{ color: OS.color.ink }}>{occupancy}%</strong> de ocupación
        </p>
      </div>

      {/* Leyenda + conteo: color, ícono y texto juntos */}
      <ul aria-label="Estado de las mesas" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
        {STATUS_ORDER.map(s => {
          const st = TABLE_STATUS_STYLE[s]
          return (
            <li key={s} className="os-num" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 12px 0 6px', borderRadius: 999,
              background: OS.color.surface, border: `1px solid ${OS.color.line}`, fontSize: 13, color: OS.color.ink2,
            }}>
              <span aria-hidden="true" style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center', background: st.bg, color: st.fg }}>
                <st.Icon size={13} />
              </span>
              {TABLE_STATUS_LABELS[s]} <strong style={{ color: OS.color.ink }}>{counts[s]}</strong>
            </li>
          )
        })}
      </ul>

      <FloorMap tables={tables} activeZone={zone} now={now} getOrderInfo={getOrderInfo} onSelect={handleTableClick} />

      <p style={{ fontSize: 12, color: OS.color.ink3, textAlign: 'center' }}>
        Tocá una mesa para abrirla, ver su pedido o cobrar.
      </p>

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
