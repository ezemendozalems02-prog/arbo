import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import Portal from '../../components/ui/Portal'
import { OS } from '../styles/tokens'

const ToastContext = createContext(null)
let seq = 0

const TONES = {
  success: { Icon: CheckCircle2, color: 'var(--os-leaf-soft)' },
  info: { Icon: Info, color: '#A9C8DA' },
  warning: { Icon: AlertTriangle, color: '#E7C98A' },
  danger: { Icon: XCircle, color: '#EBAEA3' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // Compatible con la API anterior: showToast('Mensaje'). Opcional:
  // showToast('Reserva creada', { description: 'Mesa 8 asignada.', tone: 'success' })
  const showToast = useCallback((message, { description, tone = 'success', duration = 2800 } = {}) => {
    const id = ++seq
    setToasts(t => [...t, { id, message, description, tone }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Portal>
        <div className="arbo-os" aria-live="polite" style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 900,
          display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', background: 'transparent',
          width: 'min(420px, calc(100vw - 32px))', pointerEvents: 'none',
        }}>
          <AnimatePresence>
            {toasts.map(t => {
              const { Icon, color } = TONES[t.tone] ?? TONES.success
              return (
                <motion.div key={t.id} layout role="status"
                  initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', boxSizing: 'border-box',
                    background: OS.color.deep, color: OS.color.inkInverse, padding: '12px 16px',
                    borderRadius: 14, boxShadow: OS.shadow.floating, pointerEvents: 'auto',
                  }}>
                  <Icon size={18} color={color} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{t.message}</p>
                    {t.description && <p style={{ fontSize: 12, color: OS.color.inkInverse2, marginTop: 2 }}>{t.description}</p>}
                  </div>
                </motion.div>
              )
            })}
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
