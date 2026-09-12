import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    // El valor inicial ya lo resuelve el lazy initializer de useState;
    // acá solo nos suscribimos a cambios posteriores de la media query.
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
