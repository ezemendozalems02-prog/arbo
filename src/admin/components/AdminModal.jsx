import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import Portal from '../../components/ui/Portal'
import { OS, TYPE } from '../styles/tokens'

// Chrome de diálogo compartido por todos los modales del admin (cobrar,
// descuento, alta de cliente, ajuste de stock…). Misma API de siempre;
// suma `description`, cierre con Escape y foco inicial dentro del diálogo.
export default function AdminModal({ open, onClose, title, description, width = 480, children }) {
  useLockBodyScroll(open)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prevFocus = document.activeElement
    dialogRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (prevFocus instanceof HTMLElement) prevFocus.focus()
    }
  }, [open, onClose])

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="arbo-os" style={{ background: 'transparent' }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={onClose}
              style={{ position: 'fixed', inset: 0, background: OS.color.overlay, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 700 }} />
            {/* Centrado por flexbox a propósito: framer-motion controla `transform` por
                completo para animar y/scale, así que un transform:translate(-50%,-50%)
                manual en el mismo elemento queda pisado y el modal se desalinea. */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 701, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
              <motion.div
                ref={dialogRef} tabIndex={-1}
                role="dialog" aria-modal="true" aria-label={title}
                initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                style={{
                  pointerEvents: 'auto', outline: 'none',
                  background: OS.color.surface, width: `min(${width}px, calc(100vw - 32px))`, maxHeight: '88vh', overflowY: 'auto',
                  padding: '26px 26px 24px', borderRadius: OS.radius.xl, boxShadow: OS.shadow.floating,
                  border: `1px solid ${OS.color.line}`,
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                  <div>
                    <h2 style={{ ...TYPE.title, fontSize: 24 }}>{title}</h2>
                    {description && <p style={{ ...TYPE.caption, marginTop: 4 }}>{description}</p>}
                  </div>
                  <button type="button" onClick={onClose} aria-label="Cerrar" className="os-icon-btn" style={{ marginTop: -4, marginRight: -6 }}>
                    <X />
                  </button>
                </div>
                {children}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  )
}
