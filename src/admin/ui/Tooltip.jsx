import { useId, useRef, useState } from 'react'
import Portal from '../../components/ui/Portal'

// Tooltip en portal: no lo recorta el overflow del sidebar colapsado ni de
// ningún contenedor con scroll. Se abre con hover y con foco de teclado
// (focus/blur burbujean desde el elemento interactivo de adentro).
export default function Tooltip({ label, side = 'right', children, disabled, inline }) {
  const [pos, setPos] = useState(null)
  const ref = useRef(null)
  const id = useId()

  if (disabled || !label) return children

  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const gap = 10
    setPos(side === 'right'
      ? { left: r.right + gap, top: r.top + r.height / 2, transform: 'translateY(-50%)' }
      : side === 'bottom'
        ? { left: r.left + r.width / 2, top: r.bottom + gap, transform: 'translateX(-50%)' }
        : { left: r.left + r.width / 2, top: r.top - gap, transform: 'translate(-50%, -100%)' })
  }
  const hide = () => setPos(null)

  return (
    <>
      <span ref={ref} aria-describedby={pos ? id : undefined}
        onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}
        style={{ display: inline ? 'inline-flex' : 'block' }}>
        {children}
      </span>
      {pos && (
        <Portal>
          <div id={id} role="tooltip" className="os-tooltip" style={pos}>{label}</div>
        </Portal>
      )}
    </>
  )
}
