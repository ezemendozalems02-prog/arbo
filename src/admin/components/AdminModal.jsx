import { AnimatePresence, motion } from 'framer-motion'
import { COLORS, FONTS } from '../../styles/theme'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import Portal from '../../components/ui/Portal'
import { CloseIcon } from '../../components/ui/icons'

// Chrome de modal compartido por todos los diálogos del POS/Caja (elegir
// modificadores, descuento, cliente, cobrar, abrir/cerrar caja...) — evita
// repetir el overlay + Portal + lock de scroll en cada uno.
export default function AdminModal({ open, onClose, title, width = 480, children }) {
  useLockBodyScroll(open)
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,20,0.6)', zIndex: 700 }} />
            {/* Centrado por flexbox a propósito: framer-motion controla `transform` por
                completo para animar y/scale, así que un transform:translate(-50%,-50%)
                manual en el mismo elemento queda pisado y el modal se desalinea. */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 701, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
              <motion.div
                role="dialog" aria-modal="true" aria-label={title}
                initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.22 }}
                style={{
                  pointerEvents: 'auto',
                  background: COLORS.cream, width: `min(${width}px, calc(100vw - 32px))`, maxHeight: '86vh', overflowY: 'auto',
                  padding: '28px 26px', boxShadow: '0 20px 60px rgba(12,16,20,0.35)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                  <h2 style={{ fontFamily: FONTS.serif, fontSize: 24, color: COLORS.greenDark, fontWeight: 500 }}>{title}</h2>
                  <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.onLightMuted, padding: 4 }}>
                    <CloseIcon width={18} height={18} />
                  </button>
                </div>
                {children}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  )
}
