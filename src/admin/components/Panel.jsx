import { SectionCard } from '../ui/Card'
import ArboEmptyState from '../ui/EmptyState'

// API histórica de los módulos (title/action/children) sobre el SectionCard
// del design system: todos los paneles existentes heredan el estilo nuevo.
export default function Panel({ title, description, action, icon, children }) {
  return (
    <SectionCard title={title} description={description} action={action} icon={icon}>
      {children}
    </SectionCard>
  )
}

export function EmptyState({ label, description, action }) {
  return <ArboEmptyState compact title={label} description={description} action={action} />
}
