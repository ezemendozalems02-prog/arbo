import { useId } from 'react'

// Campo de formulario con label/hint/error asociados por id (accesibilidad).
// Uso: <Field label="Nombre" hint="…">{(p) => <Input {...p} />}</Field>
export function Field({ label, hint, error, required, children }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className="os-field">
      {label && <label className="os-label" htmlFor={id}>{label}{required && ' *'}</label>}
      {children({ id, 'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined, 'aria-invalid': error ? true : undefined, required })}
      {hint && !error && <p id={hintId} className="os-hint">{hint}</p>}
      {error && <p id={errorId} className="os-error" role="alert">{error}</p>}
    </div>
  )
}

export function Input(props) {
  return <input className="os-input" {...props} />
}

export function Select({ children, ...props }) {
  return <select className="os-select" {...props}>{children}</select>
}

export function Textarea(props) {
  return <textarea className="os-textarea" {...props} />
}
