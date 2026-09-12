// Sistema visual central de ARBO PATAGONIA.
// Un solo lugar para paleta, tipografía y estilos base compartidos —
// evita repetir objetos de color/tipografía en cada componente.

export const COLORS = {
  green:      '#304D3B', // arbo-green
  greenDark:  '#1F402F', // arbo-green-dark
  greenMid:   '#3D5C46', // derivado — hovers / acentos sobre verde
  greenSoft:  'rgba(48,77,59,0.08)', // verde muy diluido sobre crema
  accent:     '#8FAE95', // verde claro botánico — acentos sobre fondos oscuros
  cream:      '#F7F1E3', // arbo-cream
  warmWhite:  '#F4F0E4', // arbo-warm-white
  black:      '#0C1014', // arbo-black

  // Texto sobre fondos oscuros (verde / negro)
  onDark:        '#F4F0E4',
  onDarkMuted:   'rgba(244,240,228,0.68)',
  onDarkFaint:   'rgba(244,240,228,0.4)',

  // Texto sobre fondos claros (crema / warm white)
  onLight:       '#1B241C',
  onLightMuted:  'rgba(12,16,20,0.62)',
  onLightFaint:  'rgba(12,16,20,0.38)',

  // Líneas / bordes
  lineOnDark:  'rgba(244,240,228,0.16)',
  lineOnLight: 'rgba(12,16,20,0.14)',
  lineGreen:   'rgba(48,77,59,0.22)',
}

export const FONTS = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'Manrope', -apple-system, sans-serif",
}

export const EASE = [0.22, 0.61, 0.36, 1]

export const CONTAINER = { maxWidth: 1360, margin: '0 auto', padding: '0 28px' }

// Eyebrow / SectionLabel text (ej. "01 / CAFÉ")
export const eyebrow = (color = COLORS.green) => ({
  fontFamily: FONTS.sans,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  color,
})

// Botones de línea, uppercase, sin aspecto "SaaS"
export function buttonStyle(variant = 'solid-dark', size = 'md') {
  const pad = size === 'sm' ? '11px 24px' : size === 'lg' ? '17px 46px' : '14px 34px'
  const base = {
    fontFamily: FONTS.sans,
    fontSize: size === 'sm' ? 10 : 11,
    fontWeight: 600,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    padding: pad,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'background 0.28s ease, color 0.28s ease, border-color 0.28s ease',
    display: 'inline-block',
    textAlign: 'center',
  }
  const variants = {
    'solid-dark':  { background: COLORS.cream, color: COLORS.greenDark, border: `1px solid ${COLORS.cream}` },
    'solid-light': { background: COLORS.greenDark, color: COLORS.cream, border: `1px solid ${COLORS.greenDark}` },
    'outline-dark':  { background: 'transparent', color: COLORS.cream, border: `1px solid rgba(244,240,228,0.5)` },
    'outline-light': { background: 'transparent', color: COLORS.greenDark, border: `1px solid rgba(31,64,47,0.45)` },
    'ghost': { background: 'transparent', color: COLORS.onDarkMuted, border: '1px solid transparent' },
  }
  return { ...base, ...variants[variant] }
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
