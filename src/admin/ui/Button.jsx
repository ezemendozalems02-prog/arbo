import { Link } from 'react-router-dom'

// Los módulos existentes usaban el Button del sitio público con sus nombres
// de variante; se mapean a la jerarquía del admin para no tener que tocar
// cada llamada.
const LEGACY_VARIANTS = {
  'solid-dark': 'primary',
  'solid-light': 'primary',
  'outline-light': 'secondary',
  'outline-dark': 'secondary',
}

export default function Button({
  children, variant = 'primary', size = 'md', full, icon: Icon, iconRight: IconRight, loading,
  to, href, target, rel, onClick, type = 'button', disabled, ariaLabel, className = '', style,
}) {
  const v = LEGACY_VARIANTS[variant] ?? variant
  const cls = [
    'os-btn', `os-btn--${v}`,
    size !== 'md' && `os-btn--${size}`,
    full && 'os-btn--full',
    !children && Icon && 'os-btn--icon',
    className,
  ].filter(Boolean).join(' ')

  const content = (
    <>
      {loading ? <span className="os-spinner" aria-hidden="true" /> : Icon && <Icon aria-hidden="true" />}
      {children}
      {IconRight && !loading && <IconRight aria-hidden="true" />}
    </>
  )

  if (to && !disabled) {
    return <Link to={to} className={cls} style={style} aria-label={ariaLabel} onClick={onClick}>{content}</Link>
  }
  if (href && !disabled) {
    return <a href={href} target={target} rel={rel} className={cls} style={style} aria-label={ariaLabel}>{content}</a>
  }
  return (
    <button type={type} className={cls} style={style} onClick={onClick} disabled={disabled || loading}
      aria-label={ariaLabel} aria-busy={loading || undefined}>
      {content}
    </button>
  )
}
