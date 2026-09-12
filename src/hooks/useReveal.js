import { useEffect, useRef, useState } from 'react'

// Reveal-on-scroll compartido — reemplaza los FadeUp/FadeIn duplicados
// que existían copiados en cada página.
export function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(node)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible]
}
