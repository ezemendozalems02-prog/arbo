// Barra de progreso fina (no barras gigantes): niveles ARBO Club, ocupación…
export default function Progress({ value, max = 1, label, color }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="os-progress" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}
