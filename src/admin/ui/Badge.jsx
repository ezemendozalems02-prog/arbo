import { AlertTriangle, CheckCircle2, Circle, CircleDashed, Clock, Info, Loader, XCircle } from 'lucide-react'

// Ícono por defecto de cada tono: el estado nunca depende solo del color.
const TONE_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  neutral: Circle,
  pending: Clock,
  processing: Loader,
  completed: CheckCircle2,
}

export default function Badge({ tone = 'neutral', icon, children, title }) {
  const Icon = icon === false ? null : (icon ?? TONE_ICON[tone] ?? CircleDashed)
  return (
    <span className={`os-badge os-badge--${tone}`} title={title}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  )
}
