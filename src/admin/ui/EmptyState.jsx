import { OS, TYPE } from '../styles/tokens'
import ArboSprout from './ArboSprout'

// Estado vacío con identidad ARBO: brote + mensaje humano + acción opcional.
export default function EmptyState({ title, description, action, compact, icon: Icon }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: compact ? 6 : 10, padding: compact ? '20px 12px' : '40px 20px',
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: compact ? 44 : 60, height: compact ? 44 : 60, borderRadius: '50%', background: OS.color.surface3,
        marginBottom: 4,
      }}>
        {Icon ? <Icon size={compact ? 18 : 22} color="var(--os-leaf)" aria-hidden="true" /> : <ArboSprout size={compact ? 28 : 36} />}
      </span>
      {title && <p style={{ fontSize: compact ? 13 : 15, fontWeight: 700, color: OS.color.ink }}>{title}</p>}
      {description && <p style={{ ...TYPE.caption, maxWidth: 320 }}>{description}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}
