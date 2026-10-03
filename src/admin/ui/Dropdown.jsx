import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OS } from '../styles/tokens'

// Popover anclado a un disparador: cierra con click afuera, Escape o al
// elegir una opción. `trigger` recibe { open, toggle, ref-friendly props }.
export default function Dropdown({ trigger, children, width = 300, align = 'right', label }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      {trigger({ open, toggle: () => setOpen(o => !o), 'aria-expanded': open, 'aria-haspopup': 'dialog' })}
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', [align]: 0, width: `min(${width}px, calc(100vw - 24px))`,
              background: OS.color.surface, border: `1px solid ${OS.color.line}`, borderRadius: OS.radius.lg,
              boxShadow: OS.shadow.elevated, zIndex: 600, padding: 6, transformOrigin: `top ${align}`,
            }}
            onClick={(e) => { if (e.target.closest('[data-close-dropdown]')) setOpen(false) }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
