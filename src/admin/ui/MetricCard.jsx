import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { OS, TYPE } from '../styles/tokens'
import Sparkline from './Sparkline'

// delta: { value: number (porcentaje), label: 'vs ayer', invert?: bool }
// `invert` = cuando bajar es bueno (ej. merma) — cambia el tono, no la flecha.
function Delta({ value, label, invert }) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  const flat = Math.abs(value) < 0.05
  const up = value > 0
  const good = flat ? null : (invert ? !up : up)
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight
  const color = good === null ? OS.color.ink3 : good ? OS.color.success : OS.color.danger
  return (
    <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginTop: 8 }}>
      <span className="os-num" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700, color }}>
        <Icon size={14} aria-hidden="true" />
        {flat ? '0%' : `${up ? '+' : ''}${value.toFixed(1)}%`}
      </span>
      <span style={{ color: OS.color.ink3 }}>{label}</span>
    </p>
  )
}

export default function MetricCard({ icon: Icon, label, value, hint, delta, trend, tone, to, progress }) {
  const warn = tone === 'warning'
  const body = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
        <p style={TYPE.label}>{label}</p>
        {Icon && (
          <span style={{
            display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10,
            background: warn ? OS.color.warningBg : OS.color.surface3, color: warn ? OS.color.warning : OS.color.leaf,
          }}>
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px 10px' }}>
        <p className="os-num" style={{ ...TYPE.data, color: warn ? OS.color.warning : OS.color.ink }}>{value}</p>
        {trend && <Sparkline values={trend} />}
      </div>
      {progress !== undefined && (
        <div className="os-progress" style={{ marginTop: 12 }} role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${Math.min(100, progress * 100)}%` }} />
        </div>
      )}
      {delta && <Delta {...delta} />}
      {hint && <p style={{ ...TYPE.caption, marginTop: delta ? 2 : 8 }}>{hint}</p>}
    </>
  )
  const style = { display: 'block', padding: '18px 20px', textDecoration: 'none', color: 'inherit', minWidth: 0 }
  return to
    ? <Link to={to} className="os-card os-card--interactive" style={style}>{body}</Link>
    : <div className="os-card" style={style}>{body}</div>
}
