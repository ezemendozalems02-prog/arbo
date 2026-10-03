import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { formatMoney } from '../utils/format'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { OS } from '../styles/tokens'

// Gráfico de barras liviano en SVG inline — una sola serie en el verde de
// marca, la barra activa en Forest. Sin dependencias de charting.
function niceMax(value) {
  if (value <= 0) return 100
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

export default function BarChart({ data, height = 200, emptyLabel = 'Sin datos todavía', formatValue = formatMoney, highlightLast }) {
  const [hoverIdx, setHoverIdx] = useState(null)
  // Ancho real del contenedor: así el SVG no se estira (texto y radios se
  // mantienen proporcionados en cualquier pantalla).
  const wrapRef = useRef(null)
  const [chartWidth, setChartWidth] = useState(640)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setChartWidth(Math.max(200, entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const reduced = usePrefersReducedMotion()
  const max = niceMax(Math.max(...data.map(d => d.total), 0))
  const hasData = data.some(d => d.total > 0)

  const barWidth = Math.min(34, (chartWidth / Math.max(data.length, 1)) * 0.56)
  const baseline = height - 26

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${chartWidth} ${height}`} width="100%" height={height} role="img"
        aria-label={`Gráfico de barras: ${data.map(d => `${d.label} ${formatValue(d.total)}`).join(', ')}`}
        style={{ overflow: 'visible', display: 'block' }}>
        {[0, 0.5, 1].map(f => (
          <line key={f} x1={0} x2={chartWidth} y1={baseline - baseline * f} y2={baseline - baseline * f}
            style={{ stroke: OS.color.line }} strokeWidth={1} strokeDasharray={f === 0 ? undefined : '3 5'} />
        ))}
        {hasData && data.map((d, i) => {
          const slot = chartWidth / data.length
          const x = i * slot + (slot - barWidth) / 2
          const h = max > 0 ? (d.total / max) * baseline : 0
          const emphasized = hoverIdx === i || (hoverIdx === null && highlightLast && i === data.length - 1)
          return (
            <g key={i}
              onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
              tabIndex={0} onFocus={() => setHoverIdx(i)} onBlur={() => setHoverIdx(null)}
              style={{ cursor: 'default', outline: 'none' }}>
              <rect x={i * slot} y={0} width={slot} height={baseline} fill="transparent" />
              <motion.rect x={x} width={barWidth} rx={6}
                initial={reduced ? false : { y: baseline, height: 0 }}
                animate={{ y: baseline - Math.max(h, 2), height: Math.max(h, 2) }}
                transition={{ duration: 0.5, delay: i * 0.03, ease: [0.22, 0.61, 0.36, 1] }}
                style={{ fill: emphasized ? OS.color.forest : OS.color.leafSoft, transition: 'fill 150ms ease' }} />
              <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fontSize={11} fontWeight={emphasized ? 700 : 500}
                style={{ fill: emphasized ? OS.color.ink : OS.color.ink3, fontFamily: OS.font.ui }}>
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
      {!hasData && (
        <p style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: OS.color.ink3 }}>
          {emptyLabel}
        </p>
      )}
      {hoverIdx !== null && data[hoverIdx].total > 0 && (
        <div role="presentation" style={{
          position: 'absolute', top: 0, left: `${(hoverIdx + 0.5) / data.length * 100}%`, transform: 'translate(-50%, -110%)',
          background: OS.color.deep, color: OS.color.inkInverse, padding: '7px 11px', borderRadius: 10,
          boxShadow: OS.shadow.elevated, whiteSpace: 'nowrap', pointerEvents: 'none', textAlign: 'center',
        }}>
          <p style={{ fontSize: 11, color: OS.color.inkInverse2 }}>{data[hoverIdx].label}</p>
          <p className="os-num" style={{ fontSize: 13, fontWeight: 700 }}>{formatValue(data[hoverIdx].total)}</p>
        </div>
      )}
    </div>
  )
}
