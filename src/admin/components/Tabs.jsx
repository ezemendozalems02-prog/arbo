// Pestañas de módulo (perfil 360 del cliente y donde haga falta).
export default function Tabs({ options, active, onChange }) {
  return (
    <div className="os-tabs" role="tablist">
      {options.map(t => (
        <button key={t.key} type="button" role="tab" className="os-tab"
          aria-selected={active === t.key} onClick={() => onChange(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
