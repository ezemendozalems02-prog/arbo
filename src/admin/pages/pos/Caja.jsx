import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { usePOS } from '../../../context/POSContext'
import { useToast } from '../../context/ToastContext'
import StatCard from '../../components/StatCard'
import Panel, { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'
import CashMovementModal from '../../components/pos/CashMovementModal'
import CloseCashModal from '../../components/pos/CloseCashModal'
import { formatMoney, formatTime, timeAgo } from '../../utils/format'

const PAYMENT_LABELS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', mercado_pago: 'Mercado Pago', transferencia: 'Transferencia' }
const MOVEMENT_LABELS = { venta: 'Venta', ingreso: 'Ingreso', egreso: 'Egreso' }

function OpenCashCard({ onOpen, lastClosing }) {
  const [amount, setAmount] = useState('')
  return (
    <div style={{ maxWidth: 420, margin: '40px auto', textAlign: 'center' }}>
      <p style={{ fontFamily: FONTS.serif, fontSize: 26, color: COLORS.greenDark, marginBottom: 10 }}>La caja está cerrada</p>
      <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightMuted, marginBottom: 24 }}>
        Ingresá el monto inicial para abrir la caja y empezar a registrar ventas.
      </p>
      <input
        type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Monto inicial"
        style={{ width: '100%', padding: '14px 16px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, color: COLORS.onLight, fontFamily: FONTS.sans, fontSize: 16, outline: 'none', boxSizing: 'border-box', marginBottom: 16, textAlign: 'center' }} />
      <Button full disabled={!amount} onClick={() => onOpen(Number(amount))}>Abrir caja</Button>

      {lastClosing && (
        <div style={{ marginTop: 32, padding: '16px 18px', background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}`, textAlign: 'left' }}>
          <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.onLightMuted, marginBottom: 8 }}>Último cierre</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, marginBottom: 4 }}>
            <span>Esperado</span><span>{formatMoney(lastClosing.expectedCash)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, marginBottom: 4 }}>
            <span>Declarado</span><span>{formatMoney(lastClosing.declaredCash)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, fontWeight: 700, color: lastClosing.diff === 0 ? COLORS.green : '#8A4536' }}>
            <span>Diferencia</span><span>{lastClosing.diff > 0 ? `+${formatMoney(lastClosing.diff)}` : formatMoney(lastClosing.diff)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Caja() {
  useEffect(() => { document.title = 'Caja | ARBO OS' }, [])
  const { showToast } = useToast()
  const { cash, cashSummary, openCashRegister, registerCashMovement, closeCashRegister } = usePOS()
  const [movementType, setMovementType] = useState(null)
  const [closeOpen, setCloseOpen] = useState(false)

  if (cash.status !== 'abierta') {
    return (
      <OpenCashCard
        lastClosing={cash.lastClosing}
        onOpen={(amount) => { openCashRegister(amount); showToast('Caja abierta') }} />
    )
  }

  const movements = [...cash.movements].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <StatCard label="Inicial" value={formatMoney(cash.initialAmount)} />
        <StatCard label="Ventas" value={formatMoney(cashSummary.ventas)} />
        <StatCard label="Ingresos" value={formatMoney(cashSummary.ingresos)} />
        <StatCard label="Egresos" value={`-${formatMoney(cashSummary.egresos)}`} />
        <StatCard label="Efectivo esperado" value={formatMoney(cashSummary.expectedCash)} />
      </div>

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Panel title="Por método de pago">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(cashSummary.byMethod).map(([method, amount]) => (
              <div key={method} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight }}>
                <span>{PAYMENT_LABELS[method]}</span>
                <span style={{ fontWeight: 700 }}>{formatMoney(amount)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Acciones">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button onClick={() => setMovementType('ingreso')}>Registrar ingreso</Button>
            <Button variant="outline-light" onClick={() => setMovementType('egreso')}>Registrar egreso</Button>
            <Button variant="outline-light" onClick={() => setCloseOpen(true)}>Cerrar caja</Button>
          </div>
        </Panel>
      </div>

      <Panel title="Movimientos">
        {movements.length === 0 ? <EmptyState label="Todavía no hay movimientos registrados." /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {movements.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none' }}>
                <div>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLight, fontWeight: 600 }}>{m.concept}</p>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 2 }}>
                    {MOVEMENT_LABELS[m.type]} · {formatTime(m.createdAt)} · {timeAgo(m.createdAt, new Date())}
                  </p>
                </div>
                <span style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700, color: m.type === 'egreso' ? '#8A4536' : COLORS.greenDark }}>
                  {m.type === 'egreso' ? '-' : '+'}{formatMoney(m.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <CashMovementModal type={movementType} open={!!movementType} onClose={() => setMovementType(null)}
        onConfirm={(mov) => { registerCashMovement(mov); setMovementType(null); showToast('Movimiento registrado') }} />
      <CloseCashModal expectedCash={cashSummary.expectedCash} open={closeOpen} onClose={() => setCloseOpen(false)}
        onConfirm={(declared) => { closeCashRegister(declared); setCloseOpen(false); showToast('Caja cerrada') }} />
    </div>
  )
}
