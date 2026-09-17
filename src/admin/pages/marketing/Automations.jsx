import { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { useCRM } from '../../../context/CRMContext'
import { useToast } from '../../context/ToastContext'
import { AUTOMATION_TRIGGER_LABELS, AUTOMATION_ACTION_LABELS } from '../../../mock/automations'
import { formatNumber, formatDate } from '../../utils/format'
import { EmptyState } from '../../components/Panel'
import Button from '../../../components/ui/Button'
import NewAutomationModal from '../../components/crm/NewAutomationModal'

// Bloque 26-29 — "ejecutar" siempre simula: calcula clientes que matchean el
// trigger/condición y lo muestra, nunca dispara un envío real.
export default function Automations() {
  useEffect(() => { document.title = 'Automatizaciones | ARBO OS' }, [])
  const { showToast } = useToast()
  const { automations, createAutomation, toggleAutomation, runAutomation } = useCRM()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <Button size="sm" onClick={() => setFormOpen(true)}>Nueva automatización</Button>
      </div>

      {automations.length === 0 ? <EmptyState label="Sin automatizaciones." /> : (
        <div style={{ background: COLORS.warmWhite, border: `1px solid ${COLORS.lineGreen}` }}>
          {automations.map((a, i) => (
            <div key={a.id} style={{ padding: '16px 18px', borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700, color: COLORS.greenDark }}>{a.name}</p>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightFaint, marginTop: 3 }}>
                    {AUTOMATION_TRIGGER_LABELS[a.trigger]}{a.condition?.days ? ` · ${a.condition.days} días` : ''} → {AUTOMATION_ACTION_LABELS[a.action]}
                  </p>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: COLORS.onLightMuted, marginTop: 3, fontStyle: 'italic' }}>"{a.message}"</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span style={{
                    fontFamily: FONTS.sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 3,
                    background: a.status === 'activa' ? 'rgba(48,77,59,0.1)' : 'rgba(31,64,47,0.1)', color: a.status === 'activa' ? '#304D3B' : COLORS.onLightMuted,
                  }}>
                    {a.status}
                  </span>
                  <Button variant="outline-light" size="sm" onClick={() => toggleAutomation(a.id)}>{a.status === 'activa' ? 'Pausar' : 'Activar'}</Button>
                  <Button size="sm" onClick={() => {
                    const run = runAutomation(a.id)
                    showToast(`Simulación: ${run.matchedCount} cliente(s) matchean`)
                  }}>Simular ejecución</Button>
                </div>
              </div>
              <p style={{ fontFamily: FONTS.sans, fontSize: 11, color: COLORS.onLightFaint, marginTop: 10 }}>
                Se ejecutó {formatNumber(a.timesTriggered)} veces{a.lastRun ? ` · última vez ${formatDate(a.lastRun)}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      <NewAutomationModal open={formOpen} onClose={() => setFormOpen(false)}
        onCreate={(data) => { createAutomation(data); showToast(`Automatización "${data.name}" creada`) }} />
    </div>
  )
}
