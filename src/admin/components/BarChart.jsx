import { useState } from 'react'
import { COLORS, FONTS } from '../../styles/theme'
import { formatMoney } from '../utils/format'

// Gráfico de barras liviano en SVG inline — una sola serie (secuencial, un
// solo tono verde), sin dependencias externas. Pensado para widgets chicos
// de dashboard, no para reemplazar una librería de charting completa.
function niceMax(value) {
  if (value <= 0) return 100
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

export default function BarChart({ data, height = 180, emptyLabel = 'Sin datos todavía', formatValue = formatMoney }) {
  const [hoverIdx, setHoverIdx] = useState(null)
  const max = niceMax(Math.max(...data.map(d => d.total), 0))
  const hasData = data.some(d => d.total > 0)

  const barGap = 6
  const chartWidth = 640
  const barWidth = Math.min(24, chartWidth / data.length - barGap)
  const baseline = height - 24

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${chartWidth} ${height}`} width="100%" height={height} role="img" aria-label="Gráfico de barras" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={0} x2={chartWidth} y1={baseline - baseline * f} y2={baseline - baseline * f}
            stroke={COLORS.lineOnLight} strokeWidth={1} />
        ))}
        {hasData && data.map((d, i) => {
          const slot = chartWidth / data.length
          const x = i * slot + (slot - barWidth) / 2
          const h = max > 0 ? (d.total / max) * baseline : 0
          const active = hoverIdx === i
          return (
            <g key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              tabIndex={0}
              onFocus={() => setHoverIdx(i)}
              onBlur={() => setHoverIdx(null)}
              style={{ cursor: 'pointer' }}>
              <title>{`${d.label}: ${formatValue(d.total)}`}</title>
              <rect x={x} y={baseline - h} width={barWidth} height={Math.max(h, 1)} rx={4}
                fill={active ? COLORS.greenDark : COLORS.green} />
              <rect x={x} y={baseline} width={barWidth} height={1} fill="transparent" />
              <text x={x + barWidth / 2} y={height - 4} textAnchor="middle"
                fontFamily={FONTS.sans} fontSize={9} fill={COLORS.onLightMuted}>
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
      {!hasData && (
        <p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.sans, fontSize: 13, color: COLORS.onLightFaint }}>
          {emptyLabel}
        </p>
      )}
      {hoverIdx !== null && data[hoverIdx].total > 0 && (
        <div style={{
          position: 'absolute', top: -6, left: `${(hoverIdx + 0.5) / data.length * 100}%`, transform: 'translate(-50%, -100%)',
          background: COLORS.greenDark, color: COLORS.cream, fontFamily: FONTS.sans, fontSize: 12, fontWeight: 600,
          padding: '5px 10px', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {formatValue(data[hoverIdx].total)}
        </div>
      )}
    </div>
  )
}
