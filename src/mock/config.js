// Punto de anclaje temporal de todo el Mock Data de ARBO OS.
// Todos los mocks calculan "hoy", "esta semana", etc. contra esta fecha fija
// (nunca contra `new Date()`) para que los números del dashboard sean
// determinísticos: mismos datos en cada render, hoy o dentro de un año.
export const MOCK_NOW = new Date(2026, 8, 16, 20, 30, 0)

// Generador pseudoaleatorio determinístico (mulberry32). Se usa solo para
// construir los arrays de mock una vez al cargar el módulo — nunca dentro
// de un render — así el resultado es siempre el mismo.
export function createRng(seed) {
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
