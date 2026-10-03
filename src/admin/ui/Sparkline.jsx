// Micrográfico de tendencia para MetricCard: línea + área suave, sin ejes.
export default function Sparkline({ values, width = 96, height = 32, color = 'var(--os-leaf)' }) {
  if (!values || values.length < 2 || values.every(v => v === 0)) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = width / (values.length - 1)
  const pts = values.map((v, i) => [i * step, height - 3 - ((v - min) / range) * (height - 6)])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const [lx, ly] = pts[pts.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <path d={area} style={{ fill: color, opacity: 0.1 }} />
      <path d={line} fill="none" style={{ stroke: color }} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="2.6" style={{ fill: color }} />
    </svg>
  )
}
