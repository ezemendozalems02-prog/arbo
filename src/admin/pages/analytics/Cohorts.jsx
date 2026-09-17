import { useEffect } from 'react'
import { COLORS, FONTS } from '../../../styles/theme'
import { buildCohortDemo } from '../../../services/customerAnalyticsService'
import { formatNumber } from '../../utils/format'
import Panel from '../../components/Panel'

// Bloque 34 — los pedidos mock solo cubren la última semana, así que no
// alcanza para medir retención mes a mes con datos reales todavía: esta
// matriz es determinística y está rotulada como demo a propósito.
export default function Cohorts() {
  useEffect(() => { document.title = 'Cohortes | ARBO OS' }, [])
  const cohorts = buildCohortDemo()
  const maxPeriods = Math.max(...cohorts.map(c => c.row.length))

  const cellColor = (pct) => {
    const alpha = 0.12 + (pct / 100) * 0.55
    return `rgba(48,77,59,${alpha.toFixed(2)})`
  }

  return (
    <div>
      <p style={{ fontFamily: FONTS.sans, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.onLightFaint, marginBottom: 18 }}>
        Datos de demostración — el historial de pedidos mock no cubre meses completos todavía.
      </p>
      <Panel title="Retención por cohorte de adquisición">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontFamily: FONTS.sans, fontSize: 12, minWidth: 560 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', color: COLORS.onLightMuted }}>Cohorte</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, textTransform: 'uppercase', color: COLORS.onLightMuted }}>Clientes</th>
                {Array.from({ length: maxPeriods }, (_, p) => (
                  <th key={p} style={{ padding: '8px 10px', fontSize: 10, textTransform: 'uppercase', color: COLORS.onLightMuted }}>Mes +{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c, i) => (
                <tr key={c.month} style={{ borderTop: i > 0 ? `1px solid ${COLORS.lineGreen}` : 'none' }}>
                  <td style={{ padding: '8px 10px', color: COLORS.greenDark, fontWeight: 600 }}>{c.month}</td>
                  <td style={{ padding: '8px 10px', color: COLORS.onLightMuted }}>{formatNumber(c.size)}</td>
                  {c.row.map(({ period, pct }) => (
                    <td key={period} style={{ padding: '8px 10px', textAlign: 'center', background: cellColor(pct), color: COLORS.greenDark, fontWeight: 600 }}>
                      {pct}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
