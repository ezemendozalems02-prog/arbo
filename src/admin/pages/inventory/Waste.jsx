import { useEffect, useMemo, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useInventory } from '../../../context/InventoryContext'
import { useToast } from '../../context/ToastContext'
import { WASTE_REASON_LABELS } from '../../../mock/waste'
import { UNIT_SHORT } from '../../../mock/units'
import { formatMoney, formatQty, formatDate } from '../../utils/format'
import StatCard from '../../components/StatCard'
import Panel, { EmptyState } from '../../components/Panel'
import BarChart from '../../components/BarChart'
import Button from '../../ui/Button'
import RegisterWasteModal from '../../components/inventory/RegisterWasteModal'

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function Waste() {
  useEffect(() => { document.title = 'Mermas | ARBO OS' }, [])
  const { showToast } = useToast()
  const { items, waste, purchases, registerWaste, getItemById } = useInventory()
  const [formOpen, setFormOpen] = useState(false)

  const now = useMemo(() => new Date(), [])
  const active = waste.filter(w => w.status === 'registrada')
  const totalCost = active.reduce((s, w) => s + w.cost, 0)
  const totalQty = active.reduce((s, w) => s + w.quantity, 0)

  const itemCostMap = new Map()
  for (const w of active) itemCostMap.set(w.insumoId, (itemCostMap.get(w.insumoId) ?? 0) + w.cost)
  const byItem = [...itemCostMap.entries()].sort((a, b) => b[1] - a[1])
  const topItem = byItem[0] ? getItemById(byItem[0][0]) : null

  const reasonCountMap = new Map()
  for (const w of active) reasonCountMap.set(w.reason, (reasonCountMap.get(w.reason) ?? 0) + 1)
  const byReason = [...reasonCountMap.entries()].sort((a, b) => b[1] - a[1])
  const topReason = byReason[0]

  const monthlyChart = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthlyChart.push({ label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), total: 0 })
  }
  for (const w of active) {
    const b = monthlyChart.find(x => x.year === w.createdAt.getFullYear() && x.month === w.createdAt.getMonth())
    if (b) b.total += w.cost
  }

  const purchasesTotal = purchases.filter(p => p.status === 'recibida').reduce((s, p) => s + p.total, 0)
  const wastePct = purchasesTotal > 0 ? (totalCost / purchasesTotal) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard label="Merma total" value={`${totalQty.toLocaleString('es-AR')}`} hint="unidades acumuladas" />
        <StatCard label="Costo de merma" value={formatMoney(totalCost)} />
        <StatCard label="Insumo con mayor merma" value={topItem?.name ?? '—'} />
        <StatCard label="Motivo más frecuente" value={topReason ? WASTE_REASON_LABELS[topReason[0]] : '—'} />
        <StatCard label="% sobre compras" value={`${wastePct.toFixed(1)}%`} />
      </div>

      <Panel title="Evolución mensual">
        <BarChart data={monthlyChart} />
      </Panel>

      <Panel title="Mermas registradas" action={<Button size="sm" onClick={() => setFormOpen(true)}>Registrar merma</Button>}>
        {active.length === 0 ? <EmptyState label="Todavía no se registraron mermas." /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...active].sort((a, b) => b.createdAt - a.createdAt).map((w, i) => {
              const item = getItemById(w.insumoId)
              return (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none', fontFamily: FONTS.sans, fontSize: 13 }}>
                  <div>
                    <p style={{ color: COLORS.onLight, fontWeight: 600 }}>{item?.name ?? w.insumoId}</p>
                    <p style={{ color: COLORS.onLightFaint, fontSize: 11, marginTop: 2 }}>
                      {formatQty(w.quantity, w.unit, UNIT_SHORT)} · {WASTE_REASON_LABELS[w.reason]} · {formatDate(w.createdAt)}
                    </p>
                  </div>
                  <span style={{ color: '#8A4536', fontWeight: 700 }}>{formatMoney(w.cost)}</span>
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      <RegisterWasteModal items={items} open={formOpen} onClose={() => setFormOpen(false)}
        onConfirm={(payload) => { registerWaste(payload); showToast('Merma registrada') }} />
    </div>
  )
}
