import { Link } from 'react-router-dom'
import { buttonStyle } from '../../styles/theme'

// Botón de marca: línea fina, uppercase, letter-spacing — nunca "SaaS".
// Usa <Link> real para navegación interna y <button>/<a> reales para acciones,
// evitando divs clickeables (accesibilidad).
export default function Button({
  children, variant = 'solid-dark', size = 'md', to, href, onClick,
  type = 'button', disabled, full, style: ex = {}, target, rel, ariaLabel,
}) {
  const base = { ...buttonStyle(variant, size), width: full ? '100%' : undefined, opacity: disabled ? 0.5 : 1, ...ex }
  const hoverVariant = {
    'solid-dark':  { background: '#EDE4CC' },
    'solid-light': { background: '#274A36' },
    'outline-dark':  { background: 'rgba(244,240,228,0.1)', borderColor: '#F4F0E4' },
    'outline-light': { background: 'rgba(31,64,47,0.06)', borderColor: '#1F402F' },
    'ghost': { color: '#F4F0E4' },
  }[variant] || {}

  const handlers = {
    onMouseEnter: e => Object.assign(e.currentTarget.style, hoverVariant),
    onMouseLeave: e => Object.assign(e.currentTarget.style, base),
  }

  if (to) {
    return (
      <Link to={to} aria-label={ariaLabel} style={{ textDecoration: 'none', ...base }} {...handlers}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} target={target} rel={rel} aria-label={ariaLabel} style={{ textDecoration: 'none', ...base }} {...handlers}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} style={base} {...handlers}>
      {children}
    </button>
  )
}
