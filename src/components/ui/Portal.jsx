import { createPortal } from 'react-dom'

// Renderiza fuera del árbol de la página (directo a <body>). Evita el bug
// clásico de overlays "fixed" que quedan tapados por elementos animados
// con Framer Motion (whileInView crea su propio compositing layer y puede
// pintarse por encima de un backdrop fixed que está en otro punto del DOM).
export default function Portal({ children }) {
  return createPortal(children, document.body)
}
