import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COLORS, FONTS } from '../../styles/theme'
import Portal from '../../components/ui/Portal'

const ToastContext = createContext(null)
let seq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message) => {
    const id = ++seq
    setToasts(t => [...t, { id, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Portal>
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 900, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <AnimatePresence>
            {toasts.map(t => (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                style={{
                  background: COLORS.greenDark, color: COLORS.cream, fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
                  padding: '12px 20px', boxShadow: '0 10px 30px rgba(12,16,20,0.3)', whiteSpace: 'nowrap',
                }}>
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Portal>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook vive junto a su Provider a propósito
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
