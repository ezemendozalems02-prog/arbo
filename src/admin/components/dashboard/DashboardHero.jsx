import { Armchair, Plus } from 'lucide-react'
import { MOCK_NOW } from '../../../mock/config'
import { useCurrentStaff } from '../../hooks/useCurrentStaff'
import { OS } from '../../styles/tokens'
import Button from '../../ui/Button'
import ArboSprout, { BranchLines } from '../../ui/ArboSprout'

function greeting(date) {
  const h = date.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// Zona superior del tablero: contexto (quién, cuándo) + el pulso del día
// + la acción principal. Compacta (~20% de la pantalla), no un banner.
export default function DashboardHero({ highlights }) {
  const { firstName: name } = useCurrentStaff()
  const date = capitalize(MOCK_NOW.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }))

  return (
    <section aria-label="Resumen del día" data-tour="dashboard-hero" style={{
      position: 'relative', overflow: 'hidden', borderRadius: OS.radius.xxl,
      background: `radial-gradient(120% 140% at 100% 0%, #24503D 0%, ${OS.color.forest} 45%, ${OS.color.deep} 100%)`,
      color: OS.color.inkInverse, padding: 'clamp(22px, 3vw, 32px)', boxShadow: OS.shadow.elevated,
    }}>
      <BranchLines color="var(--os-gold)" opacity={0.16}
        style={{ position: 'absolute', right: -30, bottom: -40, width: 'min(520px, 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ minWidth: 0, maxWidth: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <ArboSprout size={26} color="var(--os-gold)" delay={0.15} />
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: OS.color.inkInverse2 }}>{date}</p>
          </div>
          <h2 style={{ fontFamily: OS.font.display, fontSize: 'clamp(30px, 4vw, 40px)', fontWeight: 500, lineHeight: 1.08 }}>
            {greeting(MOCK_NOW)}, {name}
          </h2>
          <p style={{ fontSize: 15, color: OS.color.inkInverse2, marginTop: 6 }}>Esto es lo que está pasando en ARBO hoy.</p>

          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', margin: '18px 0 0', padding: 0 }}>
            {highlights.map(h => (
              <li key={h} className="os-num" style={{
                fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999,
                background: 'rgba(247,244,238,0.09)', border: '1px solid rgba(247,244,238,0.12)', color: OS.color.inkInverse,
              }}>{h}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button to="/admin/mesas" variant="ghost-inverse" icon={Armchair}>Ver salón</Button>
          <Button to="/admin/pos" variant="inverse" icon={Plus}>Nueva venta</Button>
        </div>
      </div>
    </section>
  )
}
