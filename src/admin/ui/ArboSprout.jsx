import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

// Microanimación característica de ARBO: un brote que se dibuja con trazo
// fino y abre dos hojas. Se usa en momentos puntuales (dashboard, estados
// vacíos, éxito, onboarding) — nunca en loop.
export default function ArboSprout({ size = 40, color = 'var(--os-leaf)', delay = 0, animate = true, strokeWidth = 1.4 }) {
  const reduced = usePrefersReducedMotion()
  const play = animate && !reduced
  const draw = (extra = 0) => play
    ? { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 0.7, delay: delay + extra, ease: [0.22, 0.61, 0.36, 1] } }
    : {}

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path d="M24 42V20" {...draw()} />
      <motion.path d="M24 30c-7 0-12-5-12-12 7 0 12 5 12 12Z" {...draw(0.35)} />
      <motion.path d="M24 24c0-7 5-12 12-12 0 7-5 12-12 12Z" {...draw(0.5)} />
      <motion.path d="M18 42h12" {...draw(0.1)} />
    </svg>
  )
}

// Rama de línea fina para fondos (hero del dashboard, onboarding). Estática:
// es textura, no animación.
export function BranchLines({ style, color = 'currentColor', opacity = 0.14 }) {
  return (
    <svg viewBox="0 0 420 220" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" style={{ opacity, ...style }}>
      <path d="M8 200C90 170 150 120 220 104c60-14 120-6 192-40" />
      <path d="M120 150c-4-22 6-42 26-52M120 150c18-12 40-14 58-4" />
      <path d="M220 104c-8-24-2-48 18-62M220 104c20-14 46-16 66-6" />
      <path d="M318 74c-2-18 8-34 24-42M318 74c14-8 32-8 46 0" />
      <path d="M60 182c-10-14-10-30 0-42M60 182c14-6 30-4 40 6" />
    </svg>
  )
}
