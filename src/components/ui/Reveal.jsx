import { motion } from 'framer-motion'
import { useReveal } from '../../hooks/useReveal'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { EASE } from '../../styles/theme'

// Reveal-on-scroll genérico: reemplaza los FadeUp/FadeIn que estaban
// duplicados en cada página del proyecto anterior.
export default function Reveal({ children, dir = 'up', delay = 0, duration = 0.75, style = {}, as = 'div' }) {
  const [ref, visible] = useReveal(0.1)
  const reduced = usePrefersReducedMotion()
  const Tag = motion[as] || motion.div

  if (reduced) {
    return <Tag ref={ref} style={style}>{children}</Tag>
  }

  const distance = 40
  const from = {
    opacity: 0,
    y: dir === 'up' ? distance : 0,
    x: dir === 'left' ? -distance : dir === 'right' ? distance : 0,
  }

  return (
    <Tag
      ref={ref}
      initial={from}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : from}
      transition={{ duration, delay, ease: EASE }}
      style={style}
    >
      {children}
    </Tag>
  )
}
