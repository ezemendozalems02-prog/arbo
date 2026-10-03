import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { OS, TYPE } from '../styles/tokens'

// Base de todas las cards del sistema (PremiumCard).
export function Card({ children, padding = 22, interactive, style, as: Tag = 'div', ...rest }) {
  return (
    <Tag className={`os-card${interactive ? ' os-card--interactive' : ''}`} style={{ padding, ...style }} {...rest}>
      {children}
    </Tag>
  )
}

// Card con encabezado: título, descripción opcional y acción a la derecha.
export function SectionCard({ title, description, action, icon: Icon, children, padding = 22, style, bodyStyle }) {
  return (
    <Card padding={0} style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', ...style }}>
      {(title || action) && (
        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: `${padding - 2}px ${padding}px 0` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {Icon && (
              <span style={{ display: 'inline-flex', width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: OS.color.surface3, color: OS.color.leaf, flexShrink: 0 }}>
                <Icon size={16} aria-hidden="true" />
              </span>
            )}
            <div style={{ minWidth: 0 }}>
              <h2 style={{ ...TYPE.heading, fontSize: 15 }}>{title}</h2>
              {description && <p style={{ ...TYPE.caption, marginTop: 2 }}>{description}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div style={{ padding: `16px ${padding}px ${padding}px`, flex: 1, ...bodyStyle }}>{children}</div>
    </Card>
  )
}

// Dato secundario compacto (compras del mes, food cost…).
export function InsightCard({ icon: Icon, label, value, hint, tone = 'leaf', to }) {
  const content = (
    <>
      {Icon && (
        <span style={{
          display: 'inline-flex', width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, flexShrink: 0,
          background: tone === 'warning' ? OS.color.warningBg : OS.color.surface3,
          color: tone === 'warning' ? OS.color.warning : OS.color.leaf,
        }}>
          <Icon size={17} aria-hidden="true" />
        </span>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={TYPE.caption}>{label}</p>
        <p className="os-num" style={{ fontSize: 17, fontWeight: 700, color: OS.color.ink, marginTop: 1 }}>{value}</p>
        {hint && <p style={{ ...TYPE.caption, fontSize: 11 }}>{hint}</p>}
      </div>
      {to && <ArrowUpRight size={15} color="var(--os-ink-3)" aria-hidden="true" />}
    </>
  )
  const style = { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', textDecoration: 'none' }
  return to
    ? <Link to={to} className="os-card os-card--interactive" style={style}>{content}</Link>
    : <div className="os-card" style={style}>{content}</div>
}

// Acción destacada (atajo a un flujo frecuente).
export function ActionCard({ icon: Icon, title, description, to, onClick }) {
  const style = { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', textDecoration: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', font: 'inherit' }
  const content = (
    <>
      {Icon && (
        <span style={{ display: 'inline-flex', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: OS.color.forest, color: OS.color.inkInverse, flexShrink: 0 }}>
          <Icon size={18} aria-hidden="true" />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: OS.color.ink }}>{title}</span>
        {description && <span style={{ display: 'block', ...TYPE.caption }}>{description}</span>}
      </span>
    </>
  )
  return to
    ? <Link to={to} className="os-card os-card--interactive" style={style}>{content}</Link>
    : <button type="button" onClick={onClick} className="os-card os-card--interactive" style={style}>{content}</button>
}
