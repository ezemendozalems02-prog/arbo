import { useEffect } from 'react'

// Bloquea el scroll del body mientras un overlay (drawer, modal, menú
// fullscreen) está abierto — evita que el fondo se mueva "raro" detrás,
// sobre todo en mobile.
export function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [active])
}
